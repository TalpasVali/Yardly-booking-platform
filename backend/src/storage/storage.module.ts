import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FieldsService } from 'src/fields/fields.service';

@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
