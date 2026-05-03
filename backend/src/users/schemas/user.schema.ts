import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    username: string;

    @Prop({ default: 'user', enum: ['user', 'admin', 'manager'] })
    role: string;

    @Prop()
    phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);