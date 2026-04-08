import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { ReviewEntity } from './review.entity';
import { UserPurchasedProductEntity } from './user-purchased-product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { ReviewResponseDto, ReviewStatsDto } from './dto/review-response.dto';

export interface PaginatedReviews {
  data: ReviewResponseDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  stats: ReviewStatsDto;
}

@Injectable()
export class ReviewService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  // ─── Public ──────────────────────────────────────────────────────────────────

  async listByProduct(productId: string, query: ReviewListQueryDto): Promise<PaginatedReviews> {
    const { page = 1, limit = 20 } = query;
    const repo = this.dataSource.getRepository(ReviewEntity);

    const [reviews, total] = await repo.findAndCount({
      where: { productId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const stats = await this.getStats(productId);

    return {
      data: reviews.map(this.toDto),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats,
    };
  }

  async getStats(productId: string): Promise<ReviewStatsDto> {
    const raw = await this.dataSource
      .getRepository(ReviewEntity)
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .addSelect('r.rating', 'rating')
      .where('r.productId = :productId', { productId })
      .groupBy('r.rating')
      .getRawMany<{ avg: string; count: string; rating: number }>();

    if (!raw.length) return { avgRating: 0, reviewCount: 0, distribution: {} };

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalCount = 0;
    let weightedSum = 0;

    for (const row of raw) {
      const count = parseInt(row.count, 10);
      distribution[row.rating] = count;
      totalCount += count;
      weightedSum += row.rating * count;
    }

    return {
      avgRating: totalCount ? Math.round((weightedSum / totalCount) * 10) / 10 : 0,
      reviewCount: totalCount,
      distribution,
    };
  }

  // ─── Customer ─────────────────────────────────────────────────────────────────

  async create(productId: string, userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const repo = this.dataSource.getRepository(ReviewEntity);
    const purchasedRepo = this.dataSource.getRepository(UserPurchasedProductEntity);

    // 1. Verify purchase
    const purchased = await purchasedRepo.findOne({
      where: { userId, productId, orderId: dto.orderId },
    });
    if (!purchased) {
      throw new BadRequestException('You can only review products from completed orders');
    }

    // 2. Prevent duplicate review per order
    const existing = await repo.findOne({ where: { userId, productId, orderId: dto.orderId } });
    if (existing) {
      throw new ConflictException('You have already reviewed this product for this order');
    }

    const review = repo.create({ productId, userId, orderId: dto.orderId, rating: dto.rating, comment: dto.comment });
    await repo.save(review);
    return this.toDto(review);
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const repo = this.dataSource.getRepository(ReviewEntity);
    const review = await repo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('Not your review');

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;
    await repo.save(review);
    return this.toDto(review);
  }

  async remove(reviewId: string, userId: string, userRole: string): Promise<void> {
    const repo = this.dataSource.getRepository(ReviewEntity);
    const review = await repo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (userRole !== 'ADMIN' && review.userId !== userId) {
      throw new ForbiddenException('Not your review');
    }
    await repo.remove(review);
  }

  // ─── Internal (called by Kafka consumer) ──────────────────────────────────────

  async recordPurchase(userId: string, productId: string, orderId: string): Promise<void> {
    const repo = this.dataSource.getRepository(UserPurchasedProductEntity);
    const existing = await repo.findOne({ where: { userId, productId } });
    if (!existing) {
      await repo.save(repo.create({ userId, productId, orderId }));
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private toDto(r: ReviewEntity): ReviewResponseDto {
    return {
      id: r.id,
      productId: r.productId,
      userId: r.userId,
      orderId: r.orderId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
