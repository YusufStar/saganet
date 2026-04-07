import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from '../category/category.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { AdminCreateCategoryDto } from './dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';
import { CategoryResponseDto } from '../category/dto/category-response.dto';

@ApiTags('Admin — Categories')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  create(@Body() dto: AdminCreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.createCategory(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Category not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Category not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }
}
