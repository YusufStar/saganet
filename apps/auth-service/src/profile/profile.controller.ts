import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('profile')
@ApiBearerAuth('access-token')
@Controller('auth/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse()
  getProfile(@Req() req: Request) {
    const userId = req.headers['x-user-id'] as string;
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update display name' })
  @ApiOkResponse()
  updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const userId = req.headers['x-user-id'] as string;
    return this.profileService.updateProfile(userId, dto);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload profile avatar (JPEG/PNG/WebP, max 5 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const userId = req.headers['x-user-id'] as string;
    return this.profileService.uploadAvatar(userId, file);
  }
}
