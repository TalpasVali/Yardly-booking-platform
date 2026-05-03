import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldsController } from './fields.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Field, FieldSchema } from './schemas/field.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AvailabilityService } from './availability.service';
import {
  Reservation,
  ReservationSchema,
} from 'src/reservation/schemas/reservation.schema';
import { AuthModule } from 'src/auth/auth.module';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Field.name, schema: FieldSchema },
      { name: User.name, schema: UserSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    AuthModule,
  ],
  controllers: [FieldsController],
  providers: [FieldsService, AvailabilityService, StorageService],
  exports: [FieldsService, AvailabilityService],
})
export class FieldsModule {}
