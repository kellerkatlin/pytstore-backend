import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsNumber()
  @IsPositive({ message: 'El monto debe ser un número positivo' })
  @Min(0.1, { message: 'El monto debe ser mayor a 0' })
  amount: number;
}
