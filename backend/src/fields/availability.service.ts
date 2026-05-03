import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Field, FieldDocument } from './schemas/field.schema';
import {
  Reservation,
  ReservationDocument,
} from '../reservation/schemas/reservation.schema';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Field.name) private fieldModel: Model<FieldDocument>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
  ) {}

  async checkAndUpdateFieldStatus(fieldId: string, date: Date) {
    const field = await this.fieldModel.findById(fieldId);
    if (!field) throw new Error('Field not found');

    const dayOfWeek = date
      .toLocaleDateString('ro-RO', { weekday: 'long' })
      .toLowerCase();

    const daySchedule = field.schedule.find(
      (s) => s.day.toLowerCase() === dayOfWeek,
    );

    if (!daySchedule) {
      field.status = 'unavailable';
      await field.save();
      return { fieldId, status: 'unavailable', reason: 'Closed that day' };
    }

    const from = daySchedule.from.split(':').map(Number);
    const to = daySchedule.to.split(':').map(Number);

    const openMinutes = from[0] * 60 + from[1];
    const closeMinutes = to[0] * 60 + to[1];
    const totalAvailableMinutes = closeMinutes - openMinutes;

    // Ia toate rezervările din ziua respectivă
    const dateStr = date.toISOString().split('T')[0];
    const reservations = await this.reservationModel.find({
      field: field._id,
      date: dateStr,
    });

    // Calculează minutele rezervate
    let reservedMinutes = 0;

    for (const res of reservations) {
      for (const slot of res.slots) {
        const slotFrom = this.toMinutes(slot.from);
        const slotTo = this.toMinutes(slot.to);
        reservedMinutes += slotTo - slotFrom;
      }
    }

    const usageRatio = reservedMinutes / totalAvailableMinutes;

    let newStatus = 'available';

    if (usageRatio >= 1) {
      newStatus = 'full';
    } else if (usageRatio >= 0.7) {
      newStatus = 'limited';
    }

    if (field.status !== newStatus) {
      field.status = newStatus;
      await field.save();
    }
    console.log(`Field ${fieldId} status updated to ${newStatus}`);

    return {
      fieldId,
      status: newStatus,
      reservedMinutes,
      totalAvailableMinutes,
      usage: (usageRatio * 100).toFixed(2) + '%',
    };
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
