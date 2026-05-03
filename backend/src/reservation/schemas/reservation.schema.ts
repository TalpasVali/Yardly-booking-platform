import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

// ✅ Tip clar pentru sloturi
export interface Slot {
  from: string;
  to: string;
}

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'Field', required: true })
  field: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string; // "18:00"

  @Prop({ required: true })
  duration: string; // "2h30"

  @Prop({ default: false })
  isEvent: boolean;

  @Prop({ default: false })
  isRecurrent: boolean;

  @Prop({
    type: [{ from: String, to: String }],
    default: [],
    _id: false,
  })
  slots: Slot[];
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
