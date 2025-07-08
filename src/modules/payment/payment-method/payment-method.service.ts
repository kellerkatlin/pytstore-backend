import { Injectable } from '@nestjs/common';
import { ok } from 'src/common/helpers/response.helper';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const result = await this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return ok(result, 'Listado de metodos de pago');
  }
}
