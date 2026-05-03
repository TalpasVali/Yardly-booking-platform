import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FieldsModule } from './fields/fields.module';
import { ReservationsModule } from './reservation/reservations.module';
import { SportsModule } from './sports/sports.module';
import { CityModule } from './city/city.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/yardly'),
    UsersModule,
    AuthModule,
    FieldsModule,
    ReservationsModule,
    SportsModule,
    CityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
