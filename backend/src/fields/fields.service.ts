import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Field, FieldDocument } from './schemas/field.schema';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FieldsService {
  constructor(
    @InjectModel(Field.name) private fieldModel: Model<FieldDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private storageService: StorageService,
  ) {}

  async create(
    createFieldDto: CreateFieldDto,
    files: Express.Multer.File[],
  ): Promise<Field> {
    const manager = await this.userModel.findById(createFieldDto.manager);
    if (!manager || manager.role !== 'manager') {
      throw new BadRequestException(
        'Selected manager does not exist or is not a manager!',
      );
    }

    const images = await Promise.all(
      files.map((file) => this.storageService.upload(file, 'fields')),
    );

    const field = new this.fieldModel({ ...createFieldDto, images });
    return field.save();
  }

  async findAll(): Promise<Field[]> {
    return this.fieldModel.find().populate('manager', 'username email').exec();
  }

  async findOne(id: string): Promise<Field> {
    const field = await this.fieldModel
      .findById(id)
      .populate('manager', 'username email')
      .exec();
    if (!field) throw new NotFoundException('Field not found');
    return field;
  }

  async update(
    id: string,
    updateFieldDto: UpdateFieldDto,
    files: Express.Multer.File[],
  ): Promise<Field> {
    if (updateFieldDto.manager) {
      const manager = await this.userModel.findById(updateFieldDto.manager);
      if (!manager || manager.role !== 'manager') {
        throw new BadRequestException(
          'Selected manager does not exist or is not a manager!',
        );
      }
    }

    const dataToUpdate: any = { ...updateFieldDto };

    if (files.length) {
      dataToUpdate.images = await Promise.all(
        files.map((file) => this.storageService.upload(file, 'fields')),
      );
    }

    const field = await this.fieldModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .populate('manager', 'username email')
      .exec();

    if (!field) throw new NotFoundException('Field not found');
    return field;
  }

  async remove(id: string): Promise<void> {
    const result = await this.fieldModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Field not found');
  }
}
