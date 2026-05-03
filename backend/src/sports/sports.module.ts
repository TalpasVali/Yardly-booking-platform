import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SportsService } from './sports.service';
import { SportsController } from './sports.controller';
import { Sport, SportSchema } from './entities/sport.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sport.name, schema: SportSchema }]),
    AuthModule,
  ],
  controllers: [SportsController],
  providers: [SportsService],
  exports: [SportsService],
})
export class SportsModule {}
