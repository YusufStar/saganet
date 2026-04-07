import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { InventoryService } from './inventory.service';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':productId')
  @ApiOperation({ summary: 'Get inventory for a product' })
  @ApiResponse({ status: 200, type: InventoryResponseDto })
  findOne(@Param('productId') productId: string): Promise<InventoryResponseDto> {
    return this.inventoryService.findByProductId(productId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all inventory (admin)' })
  @ApiResponse({ status: 200, type: [InventoryResponseDto] })
  findAll(): Promise<InventoryResponseDto[]> {
    return this.inventoryService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set stock level for a product (admin)' })
  @ApiResponse({ status: 201, type: InventoryResponseDto })
  upsert(@Body() dto: UpsertInventoryDto): Promise<InventoryResponseDto> {
    return this.inventoryService.upsert(dto);
  }

  @Patch(':productId/adjust')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Adjust stock by delta (admin)' })
  @ApiResponse({ status: 200, type: InventoryResponseDto })
  adjust(
    @Param('productId') productId: string,
    @Body() dto: AdjustInventoryDto,
  ): Promise<InventoryResponseDto> {
    return this.inventoryService.adjust(productId, dto);
  }
}
