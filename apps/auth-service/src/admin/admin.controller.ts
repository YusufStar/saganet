import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RolesGuard, Roles, UserRole } from '@saganet/common';
import { AdminService } from './admin.service';
import { AdminUserListQueryDto } from './dto/admin-user-list-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Admin: Users')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('auth/admin/users')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiOkResponse()
  listUsers(@Query() query: AdminUserListQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user details (admin)' })
  @ApiOkResponse()
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role (admin)' })
  @ApiOkResponse()
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: Request,
  ) {
    const actorId = req.headers['x-user-id'] as string;
    return this.adminService.updateRole(id, dto, actorId);
  }

  @Post(':id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ban a user (admin)' })
  @ApiOkResponse()
  banUser(@Param('id') id: string, @Req() req: Request) {
    const actorId = req.headers['x-user-id'] as string;
    return this.adminService.banUser(id, actorId);
  }

  @Post(':id/unban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unban a user (admin)' })
  @ApiOkResponse()
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }
}
