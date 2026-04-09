import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RolesGuard, Roles, UserRole } from '@saganet/common';
import { VendorApplicationService } from './vendor-application.service';
import { CreateVendorApplicationDto } from './dto/create-vendor-application.dto';
import { VendorApplicationListQueryDto } from './dto/vendor-application-list-query.dto';
import { RejectVendorApplicationDto } from './dto/review-vendor-application.dto';

const ALLOWED_DOC_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// ─── Customer endpoints ────────────────────────────────────────────────────────

@ApiTags('Vendor Application')
@ApiBearerAuth('access-token')
@Controller('auth/vendor-application')
export class VendorApplicationController {
  constructor(private readonly service: VendorApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a vendor application (customer only)' })
  create(@Req() req: Request, @Body() dto: CreateVendorApplicationDto) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.create(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get own vendor application status' })
  getOwn(@Req() req: Request) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.getOwn(userId);
  }

  @Post('documents/:field')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload a document for pending application' })
  @ApiParam({ name: 'field', enum: ['identityDocument', 'taxDocument', 'signatureCircular'] })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_DOC_MIME.includes(file.mimetype)) {
          cb(new BadRequestException('Only JPEG, PNG, WebP or PDF files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadDocument(
    @Req() req: Request,
    @Param('field') field: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const allowed = ['identityDocument', 'taxDocument', 'signatureCircular'] as const;
    if (!allowed.includes(field as typeof allowed[number])) {
      throw new BadRequestException(`Invalid document field: ${field}`);
    }
    const userId = req.headers['x-user-id'] as string;
    return this.service.uploadDocument(
      userId,
      field as 'identityDocument' | 'taxDocument' | 'signatureCircular',
      file,
    );
  }
}

// ─── Admin endpoints ───────────────────────────────────────────────────────────

@ApiTags('Admin: Vendor Applications')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('auth/admin/vendor-applications')
export class AdminVendorApplicationController {
  constructor(private readonly service: VendorApplicationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all vendor applications (admin)' })
  @ApiOkResponse()
  listAll(@Query() query: VendorApplicationListQueryDto) {
    return this.service.listAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get vendor application details (admin)' })
  @ApiOkResponse()
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve vendor application — user becomes VENDOR (admin)' })
  @ApiOkResponse()
  approve(@Param('id') id: string, @Req() req: Request) {
    const actorId = req.headers['x-user-id'] as string;
    return this.service.approve(id, actorId);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject vendor application (admin)' })
  @ApiOkResponse()
  reject(
    @Param('id') id: string,
    @Body() dto: RejectVendorApplicationDto,
    @Req() req: Request,
  ) {
    const actorId = req.headers['x-user-id'] as string;
    return this.service.reject(id, actorId, dto);
  }
}
