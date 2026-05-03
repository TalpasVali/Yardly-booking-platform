const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoUri = 'mongodb://localhost:27017/yardly';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin', 'manager'] },
    phone: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seed() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Sterge userii existenti cu aceste email-uri pentru a evita conflictele de unicitate
        const emails = ['user@yardly.ro', 'admin@yardly.ro', 'manager@yardly.ro'];
        await User.deleteMany({ email: { $in: emails } });
        console.log('Cleaned up existing test users');

        const users = [
            {
                email: 'user@yardly.ro',
                password: 'Password123!',
                username: 'RegularUser',
                role: 'user',
                phone: '0711111111'
            },
            {
                email: 'admin@yardly.ro',
                password: 'Password123!',
                username: 'AdminUser',
                role: 'admin',
                phone: '0722222222'
            },
            {
                email: 'manager@yardly.ro',
                password: 'Password123!',
                username: 'ManagerUser',
                role: 'manager',
                phone: '0733333333'
            }
        ];

        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                ...userData,
                password: hashedPassword
            });
            await user.save();
            console.log(`Created user: ${userData.email} with role: ${userData.role}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
