import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { CategoryEntity } from './category.entity';

interface SeedCategory {
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
}

const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: "Women's Fashion",
    slug: 'women',
    children: [
      { name: 'Dresses', slug: 'women-dresses' },
      { name: 'Tops & Blouses', slug: 'women-tops' },
      { name: 'Pants & Leggings', slug: 'women-pants' },
      { name: 'Jackets & Coats', slug: 'women-jackets' },
      { name: 'Skirts', slug: 'women-skirts' },
      { name: 'Shoes', slug: 'women-shoes' },
      { name: 'Bags & Accessories', slug: 'women-bags' },
    ],
  },
  {
    name: "Men's Fashion",
    slug: 'men',
    children: [
      { name: 'T-Shirts & Polo', slug: 'men-tshirts' },
      { name: 'Shirts', slug: 'men-shirts' },
      { name: 'Pants & Jeans', slug: 'men-pants' },
      { name: 'Jackets & Coats', slug: 'men-jackets' },
      { name: 'Shoes', slug: 'men-shoes' },
      { name: 'Watches & Accessories', slug: 'men-accessories' },
    ],
  },
  {
    name: "Kids",
    slug: 'kids',
    children: [
      { name: "Baby (0-2 yrs)", slug: 'kids-baby' },
      { name: "Girls' Clothing", slug: 'kids-girls' },
      { name: "Boys' Clothing", slug: 'kids-boys' },
      { name: "Kids' Shoes", slug: 'kids-shoes' },
      { name: 'Toys & Games', slug: 'kids-toys' },
    ],
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    children: [
      { name: 'Furniture', slug: 'home-furniture' },
      { name: 'Kitchen & Dining', slug: 'home-kitchen' },
      { name: 'Bedding', slug: 'home-bedding' },
      { name: 'Decoration', slug: 'home-decoration' },
      { name: 'Lighting', slug: 'home-lighting' },
    ],
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    children: [
      { name: 'Smartphones', slug: 'electronics-phones' },
      { name: 'Laptops & Computers', slug: 'electronics-computers' },
      { name: 'Tablets', slug: 'electronics-tablets' },
      { name: 'TV & Audio', slug: 'electronics-tv-audio' },
      { name: 'Cameras', slug: 'electronics-cameras' },
      { name: 'Accessories', slug: 'electronics-accessories' },
    ],
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty',
    children: [
      { name: 'Makeup', slug: 'beauty-makeup' },
      { name: 'Skincare', slug: 'beauty-skincare' },
      { name: 'Haircare', slug: 'beauty-haircare' },
      { name: 'Fragrances', slug: 'beauty-fragrances' },
    ],
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports',
    children: [
      { name: 'Sportswear', slug: 'sports-clothing' },
      { name: 'Fitness Equipment', slug: 'sports-fitness' },
      { name: 'Outdoor Gear', slug: 'sports-outdoor' },
      { name: 'Nutrition', slug: 'sports-nutrition' },
    ],
  },
  {
    name: 'Books & Media',
    slug: 'books-media',
    children: [
      { name: 'Books', slug: 'books' },
      { name: 'Music', slug: 'media-music' },
      { name: 'Movies & TV', slug: 'media-movies' },
    ],
  },
];

@Injectable()
export class CategorySeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategorySeeder.name);

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    const repo = this.dataSource.getRepository(CategoryEntity);

    const count = await repo.count();
    if (count > 0) return;

    this.logger.log('Seeding categories...');

    for (const seed of SEED_CATEGORIES) {
      const parent = repo.create({ name: seed.name, slug: seed.slug });
      const savedParent = await repo.save(parent);

      if (seed.children?.length) {
        const children = seed.children.map((child) =>
          repo.create({ name: child.name, slug: child.slug, parentId: savedParent.id }),
        );
        await repo.save(children);
      }
    }

    this.logger.log(`Seeded ${SEED_CATEGORIES.length} root categories.`);
  }
}
