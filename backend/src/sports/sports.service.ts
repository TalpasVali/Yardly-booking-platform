import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sport, SportDocument } from './entities/sport.entity';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';

@Injectable()
export class SportsService {
  constructor(
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
  ) {}

  create(dto: CreateSportDto, icon?: string) {
    const newSport = new this.sportModel({
      ...dto,
      icon: icon || dto.icon,
    });
    return newSport.save();
  }

  findAll() {
    return this.sportModel.find().exec();
  }

  findOne(id: string) {
    return this.sportModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateSportDto, icon?: string) {
    const updateData = {
      ...dto,
      ...(icon && { icon }),
    };
    return this.sportModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async remove(id: string) {
    const deleted = await this.sportModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Sport not found');
    return { message: 'Sport deleted successfully' };
  }
}
