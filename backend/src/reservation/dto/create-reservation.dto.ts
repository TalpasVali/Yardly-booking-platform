import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class CreateReservationDto {
  @IsMongoId()
  field: string;

  @IsMongoId()
  user: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string; // ex: "18:00"

  @IsString()
  @IsNotEmpty()
  duration: string; // ex: "2h30"

  @IsBoolean()
  @IsOptional()
  isEvent?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecurrent?: boolean;
}
