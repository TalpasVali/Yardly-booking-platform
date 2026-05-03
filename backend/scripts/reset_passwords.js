const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetPasswords() {
    await mongoose.connect('mongodb://localhost:27017/yardly');

    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', UserSchema, 'users');

    const hash = await bcrypt.hash('Password123!', 10);

    const emails = ['admin@yardly.ro', 'manager1@yardly.ro', 'manager2@yardly.ro', 'manager3@yardly.ro', 'user1@yardly.ro', 'user2@yardly.ro', 'user3@yardly.ro'];

    for (const email of emails) {
        const result = await User.updateOne({ email }, { $set: { password: hash } });
        console.log(`${email}: modified=${result.modifiedCount}`);
    }

    console.log('Done!');
    process.exit(0);
}

resetPasswords().catch(err => { console.error(err); process.exit(1); });
