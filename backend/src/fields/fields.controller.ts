import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

const multerOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async create(
    @Body() createFieldDto: CreateFieldDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (typeof createFieldDto.schedule === 'string') {
      createFieldDto.schedule = JSON.parse(createFieldDto.schedule);
    }
    if (typeof createFieldDto.facilities === 'string') {
      createFieldDto.facilities = JSON.parse(createFieldDto.facilities);
    }

    // StorageService se ocupă de upload — controllerul nu mai știe de Cloudinary
    return this.fieldsService.create(createFieldDto, files ?? []);
  }

  @Get()
  findAll() {
    return this.fieldsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async update(
    @Param('id') id: string,
    @Body() updateFieldDto: UpdateFieldDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.fieldsService.update(id, updateFieldDto, files ?? []);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldsService.remove(id);
  }
}
