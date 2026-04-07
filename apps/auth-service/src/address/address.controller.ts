import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('addresses')
@ApiBearerAuth('access-token')
@Controller('auth/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "List user's saved addresses" })
  @ApiOkResponse()
  findAll(@Req() req: Request) {
    return this.addressService.findAll(req.headers['x-user-id'] as string);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new address (max 5 per user)' })
  @ApiCreatedResponse()
  create(@Req() req: Request, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.headers['x-user-id'] as string, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an address' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(id, req.headers['x-user-id'] as string, dto);
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set address as default shipping address' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  setDefault(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.setDefault(id, req.headers['x-user-id'] as string);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an address' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.remove(id, req.headers['x-user-id'] as string);
  }
}
