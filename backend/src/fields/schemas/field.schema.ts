import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FieldDocument = Field & Document;

@Schema({ timestamps: true })
export class Field {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Sport', required: true })
  sport: Types.ObjectId;

  @Prop({ required: true })
  address: string;

  @Prop()
  locationUrl?: string;

  @Prop()
  description: string;

  @Prop({ required: false })
  capacity: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'City' })
  city: Types.ObjectId;

  @Prop({ required: true })
  pricePerHour: number;

  @Prop({
    type: [
      {
        day: { type: String },
        from: { type: String },
        to: { type: String },
      },
    ],
    default: [],
  })
  schedule: { day: string; from: string; to: string }[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  facilities: string[];

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ type: String, default: '' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  manager: Types.ObjectId;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
