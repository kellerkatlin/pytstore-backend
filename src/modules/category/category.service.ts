import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { created, ok, paginated } from 'src/common/helpers/response.helper';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly select = {
    id: true,
    name: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };

  private async getById(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.isDeleted) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name, isDeleted: false },
    });

    if (existing && !existing.isDeleted) {
      throw new ConflictException('La categoría ya existe');
    }
    if (existing && existing.isDeleted) {
      throw new ConflictException(
        'La categoría ya fue eliminada anteriormente',
      );
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
      },
      select: this.select,
    });

    return created(category, 'Categoría creada correctamente');
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
      this.prisma.category.findMany({
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
      this.prisma.category.count({
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
      'Listado de categorías obtenido correctamente',
    );
  }

  async findOne(id: number) {
    const category = await this.getById(id);

    return ok(
      {
        id: category.id,
        name: category.name,
        status: category.status,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      'Categoría obtenida correctamente',
    );
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.getById(id);

    if (dto.name && dto.name !== category.name) {
      const nameExists = await this.prisma.category.findUnique({
        where: { name: dto.name },
      });

      if (nameExists && !nameExists.isDeleted) {
        throw new ConflictException('El nuevo nombre ya está en uso');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
      },
      select: this.select,
    });

    return ok(updatedCategory, 'Categoría actualizada correctamente');
  }

  async remove(id: number) {
    await this.getById(id);

    await this.prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok(null, 'Categoría eliminada correctamente');
  }
}
