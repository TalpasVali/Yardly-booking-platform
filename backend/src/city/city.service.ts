import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City, CityDocument } from './schemas/city.schemas';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CityService {
  constructor(@InjectModel(City.name) private cityModel: Model<CityDocument>) {}

  findAll() {
    return this.cityModel.find({ isActive: true }).exec();
  }

  findById(id: string) {
    return this.cityModel.findById(id).exec();
  }

  create(dto: CreateCityDto) {
    const city = new this.cityModel(dto);
    return city.save();
  }

  update(id: string, dto: UpdateCityDto) {
    return this.cityModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  remove(id: string) {
    return this.cityModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }
}
