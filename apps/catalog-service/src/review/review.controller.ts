import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles, CurrentUserId, CurrentUserRole } from '@saganet/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@ApiTags('reviews')
@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ─── Public ─────────────────────────────────────────────────────────────────

  @Get('products/:productId/reviews')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List reviews for a product' })
  @ApiOkResponse({ description: 'Paginated reviews + stats' })
  listByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: ReviewListQueryDto,
  ) {
    return this.reviewService.listByProduct(productId, query);
  }

  @Get('products/:productId/reviews/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rating stats for a product' })
  @ApiOkResponse({ description: 'Average rating + distribution' })
  getStats(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewService.getStats(productId);
  }

  // ─── Customer ────────────────────────────────────────────────────────────────

  @Post('products/:productId/reviews')
  @Roles('CUSTOMER')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a review (must have purchased the product)' })
  @ApiCreatedResponse({ type: ReviewResponseDto })
  @ApiForbiddenResponse({ description: 'Not a verified purchase' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUserId() userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(productId, userId, dto);
  }

  @Patch('reviews/:id')
  @Roles('CUSTOMER', 'ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update own review' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, userId, dto);
  }

  @Delete('reviews/:id')
  @Roles('CUSTOMER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete own review (ADMIN can delete any)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    return this.reviewService.remove(id, userId, userRole);
  }
}
