import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';

const mockProducts = [
  { id: '1', name: 'Widget Pro', slug: 'widget-pro', price: '29.99', categoryId: 'cat-1', vendorId: 'v-1', images: [], createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Gadget Mini', slug: 'gadget-mini', price: '49.99', categoryId: 'cat-1', vendorId: 'v-2', images: [], createdAt: new Date(), updatedAt: new Date() },
];

describe('Product Search (e2e)', () => {
  let app: INestApplication;
  const mockProductService = {
    findAll: jest.fn().mockResolvedValue({ data: mockProducts, total: 2, page: 1, limit: 20, totalPages: 1 }),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/products returns product list', async () => {
    const res = await request(app.getHttpServer()).get('/api/products').expect(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it('GET /api/products?search=widget calls service with search param', async () => {
    await request(app.getHttpServer()).get('/api/products?search=widget').expect(200);
    expect(mockProductService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'widget' }),
    );
  });

  it('GET /api/products?minPrice=10&maxPrice=100 calls service with price filters', async () => {
    await request(app.getHttpServer()).get('/api/products?minPrice=10&maxPrice=100').expect(200);
    expect(mockProductService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: '10', maxPrice: '100' }),
    );
  });

  it('GET /api/products?page=abc returns 400 for invalid pagination', async () => {
    await request(app.getHttpServer()).get('/api/products?page=abc').expect(400);
  });
});
