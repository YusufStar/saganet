import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DATA_SOURCE } from '@saganet/db';
import { UserAddressEntity } from '../users/user-address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

const MAX_ADDRESSES_PER_USER = 5;

@Injectable()
export class AddressService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  private get repo(): Repository<UserAddressEntity> {
    return this.dataSource.getRepository(UserAddressEntity);
  }

  async findAll(userId: string): Promise<UserAddressEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateAddressDto): Promise<UserAddressEntity> {
    const count = await this.repo.count({ where: { userId } });
    if (count >= MAX_ADDRESSES_PER_USER) {
      throw new BadRequestException(`Maximum ${MAX_ADDRESSES_PER_USER} addresses allowed`);
    }

    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }

    const address = this.repo.create({
      userId,
      label: dto.label,
      fullName: dto.fullName,
      phone: dto.phone,
      street: dto.street,
      district: dto.district,
      city: dto.city,
      postalCode: dto.postalCode,
      country: dto.country ?? 'Türkiye',
      isDefault: dto.isDefault ?? false,
    });

    return this.repo.save(address);
  }

  async update(id: string, userId: string, dto: UpdateAddressDto): Promise<UserAddressEntity> {
    const address = await this.findOwned(id, userId);

    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.repo.save(address);
  }

  async setDefault(id: string, userId: string): Promise<UserAddressEntity> {
    const address = await this.findOwned(id, userId);
    await this.repo.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.repo.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOwned(id, userId);
    await this.repo.remove(address);
  }

  private async findOwned(id: string, userId: string): Promise<UserAddressEntity> {
    const address = await this.repo.findOne({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Not your address');
    return address;
  }
}
