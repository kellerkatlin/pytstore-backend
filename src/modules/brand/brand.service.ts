import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly select = {
    id: true,
    name: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };

  private async getById(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand || brand.isDeleted) {
      throw new NotFoundException('Marca no encontrada');
    }

    return brand;
  }

  async create(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({
      where: { name: dto.name },
    });

    if (existing && !existing.isDeleted) {
      throw new ConflictException('La marca ya existe');
    }
    if (existing && existing.isDeleted) {
      throw new ConflictException('La marca ya fue eliminada anteriormente');
    }

    const brand = await this.prisma.brand.create({
      data: {
        name: dto.name,
      },
      select: this.select,
    });

    return created(brand, 'Marca creada correctamente');
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'id',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        where: {
          isDeleted: false,
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        select: this.select,
      }),
      this.prisma.brand.count({
        where: {
          isDeleted: false,
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return paginated(
      data,
      { total, page, lastPage: Math.ceil(total / limit) },
      'Listado de marcas obtenido correctamente',
    );
  }

  async findOne(id: number) {
    const brand = await this.getById(id);

    return ok(
      {
        id: brand.id,
        name: brand.name,
        status: brand.status,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      },
      'Marca obtenida correctamente',
    );
  }

  async update(id: number, dto: UpdateBrandDto) {
    const brand = await this.getById(id);

    if (dto.name && dto.name !== brand.name) {
      const nameExists = await this.prisma.brand.findUnique({
        where: { name: dto.name },
      });

      if (nameExists && !nameExists.isDeleted) {
        throw new ConflictException('El nuevo nombre ya está en uso');
      }
    }

    const updatedBrand = await this.prisma.brand.update({
      where: { id },
      data: {
        name: dto.name,
        status: dto.status,
      },
      select: this.select,
    });

    return ok(updatedBrand, 'Marca actualizada correctamente');
  }

  async remove(id: number) {
    await this.getById(id);

    await this.prisma.brand.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok(null, 'Marca eliminada correctamente');
  }
}
