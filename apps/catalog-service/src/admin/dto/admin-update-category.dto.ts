import { PartialType } from '@nestjs/swagger';
import { AdminCreateCategoryDto } from './admin-create-category.dto';

export class AdminUpdateCategoryDto extends PartialType(AdminCreateCategoryDto) {}
