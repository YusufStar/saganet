import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { VendorProductController } from '../vendor-product.controller';
import { ProductService } from '../../product/product.service';
import { ImageUploadService } from '../image-upload.service';
import { ProductStatus } from '../../product/product-status.enum';

const mockProductDto = {
  id: 'product-uuid',
  vendorId: 'vendor-uuid',
  name: 'Test Product',
  description: 'A test product',
  slug: 'test-product-abc',
  price: '99.99',
  categoryId: 'category-uuid',
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductService = {
  createForVendor: jest.fn().mockResolvedValue(mockProductDto),
  findAllForVendor: jest.fn().mockResolvedValue({ data: [mockProductDto], total: 1, page: 1, limit: 20, totalPages: 1 }),
  updateForVendor: jest.fn().mockResolvedValue(mockProductDto),
  softDeleteForVendor: jest.fn().mockResolvedValue(undefined),
};

const mockImageUploadService = {
  uploadProductImage: jest.fn(),
};

describe('VendorProductController', () => {
  let controller: VendorProductController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: ImageUploadService, useValue: mockImageUploadService },
      ],
    }).compile();

    controller = module.get<VendorProductController>(VendorProductController);
  });

  describe('POST /vendor/products', () => {
    it('sets vendorId from x-user-id header', async () => {
      const req = { headers: { 'x-user-id': 'vendor-uuid' } } as any;
      const dto = { name: 'Test Product', price: '99.99', categoryId: 'category-uuid' };

      await controller.create(req, dto as any);

      expect(mockProductService.createForVendor).toHaveBeenCalledWith('vendor-uuid', dto);
    });
  });

  describe('DELETE /vendor/products/:id', () => {
    it('returns 403 for wrong vendor', async () => {
      mockProductService.softDeleteForVendor.mockRejectedValueOnce(
        new ForbiddenException('Not your product'),
      );

      const req = { headers: { 'x-user-id': 'wrong-vendor' } } as any;

      await expect(controller.remove(req, 'product-uuid')).rejects.toThrow(ForbiddenException);
    });
  });
});
