import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
  Slot,
} from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Field, FieldDocument } from 'src/fields/schemas/field.schema';
import * as moment from 'moment';
import { AvailabilityService } from 'src/fields/availability.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Field.name)
    private fieldsModel: Model<FieldDocument>,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const fieldDoc = await this.fieldsModel.findById(dto.field).lean();
    if (!fieldDoc) throw new NotFoundException('Terenul nu există!');

    const dayName = moment(dto.date).locale('ro').format('dddd').toLowerCase();

    const daySchedule = fieldDoc.schedule.find(
      (s) => s.day.toLowerCase() === dayName,
    );

    if (!daySchedule) {
      throw new BadRequestException('Terenul este închis în ziua selectată');
    }

    const startMinutes = this.toMinutes(dto.time);
    const endMinutes = startMinutes + this.parseDuration(dto.duration);
    const scheduleStart = this.toMinutes(daySchedule.from);
    const scheduleEnd = this.toMinutes(daySchedule.to);

    if (startMinutes < scheduleStart || endMinutes > scheduleEnd) {
      throw new BadRequestException(
        'Rezervarea nu respectă programul terenului',
      );
    }

    const slots = this.generateSlots(dto.time, dto.duration);

    const exists = await this.reservationModel.findOne({
      field: new Types.ObjectId(dto.field),
      date: dto.date,
      'slots.from': { $in: slots.map((s) => s.from) },
    });

    if (exists) {
      throw new BadRequestException(
        'Există deja o rezervare pe acest interval',
      );
    }

    const reservation = new this.reservationModel({
      ...dto,
      user: new Types.ObjectId(dto.user),
      field: new Types.ObjectId(dto.field),
      slots,
    });

    await reservation.save();

    await this.availabilityService.checkAndUpdateFieldStatus(
      dto.field,
      new Date(dto.date),
    );
    return reservation;
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationModel.find().populate('field').populate('user');
  }

  async findByUser(userId: string): Promise<Reservation[]> {
    return this.reservationModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('field')
      .sort({ date: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Reservation> {
    const res = await this.reservationModel.findById(id);
    if (!res) throw new NotFoundException('Nu am găsit rezervarea');
    return res;
  }

  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const res = await this.reservationModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!res) throw new NotFoundException('Nu am găsit rezervarea');
    return res;
  }

  async remove(id: string): Promise<void> {
    const res = await this.reservationModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Nu am găsit rezervarea');

    await this.availabilityService.checkAndUpdateFieldStatus(
      res.field.toString(),
      new Date(res.date),
    );
  }

  async getAvailableSlots(
    fieldId: string,
    date: string,
    duration: string,
  ): Promise<Slot[]> {
    if (!Types.ObjectId.isValid(fieldId)) {
      throw new BadRequestException('ID de teren invalid');
    }

    const field = await this.fieldsModel.findById(fieldId).lean();
    if (!field) throw new NotFoundException('Teren inexistent');

    const dayName = moment(date).locale('ro').format('dddd').toLowerCase();

    const daySchedule = field.schedule.find(
      (s) => s.day.toLowerCase() === dayName,
    );
    if (!daySchedule) {
      return [];
    }

    const totalDuration = this.parseDuration(duration);

    const reservations = await this.reservationModel.find({
      field: new Types.ObjectId(fieldId),
      date,
    });

    const reservedSlots = reservations.flatMap((r) => r.slots);

    const availableSlots: Slot[] = [];

    const [openHour, openMin] = daySchedule.from.split(':').map(Number);
    const [closeHour, closeMin] = daySchedule.to.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    for (
      let start = openMinutes;
      start + totalDuration <= closeMinutes;
      start += 30
    ) {
      const slot = {
        from: this.formatTime(start),
        to: this.formatTime(start + totalDuration),
      };

      const overlaps = reservedSlots.some(
        (res) => !(res.to <= slot.from || res.from >= slot.to),
      );

      if (!overlaps) {
        availableSlots.push(slot);
      }
    }
    return availableSlots;
  }

  private generateSlots(startTime: string, duration: string): Slot[] {
    const slotLength = 30;
    const totalMinutes = this.parseDuration(duration);

    const [startHour, startMin] = startTime.split(':').map(Number);
    const start = startHour * 60 + startMin;

    const slots: Slot[] = [];
    for (let i = 0; i < totalMinutes; i += slotLength) {
      const from = start + i;
      const to = from + slotLength;
      slots.push({
        from: this.formatTime(from),
        to: this.formatTime(to),
      });
    }
    return slots;
  }

  private parseDuration(d: string): number {
    const match = d.match(/(\d+)h(30)?/);
    if (!match) throw new BadRequestException('Durată invalidă');
    const h = parseInt(match[1], 10);
    const m = match[2] ? 30 : 0;
    return h * 60 + m;
  }

  private formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
