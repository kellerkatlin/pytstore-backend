import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReferralCode(name: string): Promise<string> {
    const normalize = (text: string) =>
      text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    const base = normalize(name);
    let code = base;
    let suffix = 1;

    while (
      await this.prisma.user.findUnique({
        where: { referralCode: code },
      })
    ) {
      code = `${base}-${suffix++}`;
    }

    return code;
  }
}
