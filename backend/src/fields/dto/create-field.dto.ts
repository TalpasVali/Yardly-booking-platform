import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleDto {
  @IsString() day: string;
  @IsString() from: string;
  @IsString() to: string;
}

export class CreateFieldDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sport: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  locationUrl?: string;

  @IsNumber()
  pricePerHour: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedule: ScheduleDto[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  facilities?: string[];

  @IsMongoId()
  manager: string;
}
