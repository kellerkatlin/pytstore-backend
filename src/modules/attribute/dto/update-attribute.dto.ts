import { IsOptional, IsString } from 'class-validator';

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;
}
