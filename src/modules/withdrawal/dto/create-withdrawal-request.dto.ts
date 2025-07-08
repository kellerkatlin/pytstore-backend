import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsNumber()
  @IsPositive({ message: 'El monto debe ser un número positivo' })
  @Min(5, { message: 'El monto debe ser mayor a S/.5' })
  amount: number;
}
