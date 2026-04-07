import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/decorators/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new order (starts saga)' })
  @ApiHeader({ name: 'x-idempotency-key', required: false, description: 'Idempotency key to prevent duplicate orders' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<OrderResponseDto> {
    const userId = req.headers['x-user-id'] as string;
    const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;
    return this.orderService.createOrder(userId, dto, idempotencyKey);
  }

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({ summary: 'List orders (own for CUSTOMER/VENDOR, all for ADMIN)' })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query() query: OrderListQueryDto,
    @Req() req: Request,
  ) {
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    return this.orderService.findAll(userId, role, query);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<OrderResponseDto> {
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    return this.orderService.findOne(id, userId, role);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel an order (PENDING or CONFIRMED only)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async cancel(@Param('id') id: string, @Req() req: Request): Promise<OrderResponseDto> {
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    return this.orderService.cancelOrder(id, userId, role);
  }
}
