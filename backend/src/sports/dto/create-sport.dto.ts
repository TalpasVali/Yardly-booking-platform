import { IsString, IsOptional } from 'class-validator';

export class CreateSportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
