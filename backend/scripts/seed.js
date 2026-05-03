const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/yardly';

// ─── Scheme ─────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'manager'] },
  phone: String,
}, { timestamps: true });

const SportSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
});

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
  address: { type: String, required: true },
  locationUrl: String,
  description: String,
  capacity: Number,
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  pricePerHour: { type: Number, required: true },
  schedule: [{ day: String, from: String, to: String }],
  images: [String],
  facilities: [String],
  averageRating: { type: Number, default: 0 },
  status: { type: String, default: 'available' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const ReservationSchema = new mongoose.Schema({
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  isEvent: { type: Boolean, default: false },
  isRecurrent: { type: Boolean, default: false },
  slots: [{ from: String, to: String, _id: false }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Sport = mongoose.model('Sport', SportSchema);
const City = mongoose.model('City', CitySchema);
const Field = mongoose.model('Field', FieldSchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);

// ─── Helper ──────────────────────────────────────────────────────────────────

function generateSlots(startTime, durationMinutes) {
  const [h, m] = startTime.split(':').map(Number);
  const start = h * 60 + m;
  const slots = [];
  for (let i = 0; i < durationMinutes; i += 30) {
    const from = start + i;
    const to = from + 30;
    const fmt = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
    slots.push({ from: fmt(from), to: fmt(to) });
  }
  return slots;
}

function parseDuration(d) {
  const match = d.match(/(\d+)h(30)?/);
  if (!match) return 60;
  return parseInt(match[1]) * 60 + (match[2] ? 30 : 0);
}

// ─── Date seed ───────────────────────────────────────────────────────────────

// Zile în română (cum le folosește moment.js cu locale ro)
const SCHEDULE_ALL = [
  { day: 'luni', from: '08:00', to: '22:00' },
  { day: 'marți', from: '08:00', to: '22:00' },
  { day: 'miercuri', from: '08:00', to: '22:00' },
  { day: 'joi', from: '08:00', to: '22:00' },
  { day: 'vineri', from: '08:00', to: '23:00' },
  { day: 'sâmbătă', from: '07:00', to: '23:00' },
  { day: 'duminică', from: '09:00', to: '21:00' },
];

const SCHEDULE_WEEKDAYS = [
  { day: 'luni', from: '10:00', to: '21:00' },
  { day: 'marți', from: '10:00', to: '21:00' },
  { day: 'miercuri', from: '10:00', to: '21:00' },
  { day: 'joi', from: '10:00', to: '21:00' },
  { day: 'vineri', from: '10:00', to: '22:00' },
];

const SCHEDULE_WEEKEND = [
  { day: 'sâmbătă', from: '08:00', to: '22:00' },
  { day: 'duminică', from: '08:00', to: '20:00' },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectat la MongoDB');

  // Curăță colecțiile
  await Promise.all([
    User.deleteMany({}),
    Sport.deleteMany({}),
    City.deleteMany({}),
    Field.deleteMany({}),
    Reservation.deleteMany({}),
  ]);
  console.log('🗑️  Colecții curățate');

  // ── 1. Useri ──────────────────────────────────────────────────────────────
  const hash = (p) => bcrypt.hash(p, 10);

  const [admin, manager1, manager2, manager3, user1, user2, user3] = await User.insertMany([
    { email: 'admin@yardly.ro',     username: 'Admin Yardly',   password: await hash('Admin123!'),   role: 'admin',   phone: '0700000000' },
    { email: 'manager1@yardly.ro',  username: 'Popescu Andrei', password: await hash('Manager123!'), role: 'manager', phone: '0711111111' },
    { email: 'manager2@yardly.ro',  username: 'Ionescu Maria',  password: await hash('Manager123!'), role: 'manager', phone: '0722222222' },
    { email: 'manager3@yardly.ro',  username: 'Gheorghe Dan',   password: await hash('Manager123!'), role: 'manager', phone: '0733333333' },
    { email: 'user1@yardly.ro',     username: 'Alex Moldovan',  password: await hash('User123!'),    role: 'user',    phone: '0744444444' },
    { email: 'user2@yardly.ro',     username: 'Ioana Popa',     password: await hash('User123!'),    role: 'user',    phone: '0755555555' },
    { email: 'user3@yardly.ro',     username: 'Mihai Stan',     password: await hash('User123!'),    role: 'user',    phone: '0766666666' },
  ]);
  console.log(`👥 Useri creați: ${7}`);

  // ── 2. Sporturi ───────────────────────────────────────────────────────────
  const [fotbal, tenis, baschet, volei, padel, badminton] = await Sport.insertMany([
    { name: 'Fotbal',    icon: 'sports_soccer'     },
    { name: 'Tenis',     icon: 'sports_tennis'     },
    { name: 'Baschet',   icon: 'sports_basketball' },
    { name: 'Volei',     icon: 'sports_volleyball' },
    { name: 'Padel',     icon: 'sports_baseball'   },
    { name: 'Badminton', icon: 'sports_badminton'  },
  ]);
  console.log(`🏅 Sporturi create: ${6}`);

  // ── 3. Orașe ──────────────────────────────────────────────────────────────
  const [bucuresti, cluj, timisoara, iasi, brasov, constanta] = await City.insertMany([
    { name: 'București',    country: 'România', isActive: true },
    { name: 'Cluj-Napoca',  country: 'România', isActive: true },
    { name: 'Timișoara',    country: 'România', isActive: true },
    { name: 'Iași',         country: 'România', isActive: true },
    { name: 'Brașov',       country: 'România', isActive: true },
    { name: 'Constanța',    country: 'România', isActive: true },
  ]);
  console.log(`🏙️  Orașe create: ${6}`);

  // ── 4. Terenuri ───────────────────────────────────────────────────────────
  const fields = await Field.insertMany([
    // ─ București ─
    {
      name: 'Terenul Central Berceni',
      sport: fotbal._id,
      address: 'Str. Luica 22, București',
      locationUrl: 'https://maps.google.com/?q=Berceni+Bucuresti',
      description: 'Teren de fotbal cu gazon sintetic 5x5, iluminat nocturn și vestiar modern.',
      capacity: 10,
      city: bucuresti._id,
      pricePerHour: 120,
      schedule: SCHEDULE_ALL,
      images: [
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662040/yardly/fields/hu7sfh8qcyvq7apar8gu.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662044/yardly/fields/v0jgrhfjbhbd4htvi27f.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662047/yardly/fields/omrjnbbevugbewgts4y4.jpg',
      ],
      facilities: ['Vestiar', 'Duș', 'Parcare', 'Iluminat nocturn', 'Bar'],
      averageRating: 4.5,
      status: 'available',
      manager: manager1._id,
    },
    {
      name: 'Tenis Club Floreasca',
      sport: tenis._id,
      address: 'Calea Floreasca 88, București',
      locationUrl: 'https://maps.google.com/?q=Floreasca+Tenis+Bucuresti',
      description: 'Teren de tenis cu suprafață de zgură. Rachetă și mingi disponibile la recepție.',
      capacity: 4,
      city: bucuresti._id,
      pricePerHour: 80,
      schedule: SCHEDULE_ALL,
      images: [
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662052/yardly/fields/zfyc2pttlpmp7d4pwlu6.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662053/yardly/fields/okymkuy0a5ufwoopbqku.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662057/yardly/fields/rkqcz4dvaeido8u0urmq.jpg',
      ],
      facilities: ['Vestiar', 'Parcare', 'Închiriere echipament'],
      averageRating: 4.2,
      status: 'available',
      manager: manager1._id,
    },
    {
      name: 'Arena Padel Pipera',
      sport: padel._id,
      address: 'Bd. Pipera 1C, București',
      locationUrl: 'https://maps.google.com/?q=Pipera+Padel',
      description: 'Două terenuri de padel indoor, climatizate. Închiriere rachete disponibilă.',
      capacity: 4,
      city: bucuresti._id,
      pricePerHour: 100,
      schedule: SCHEDULE_ALL,
      images: [
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662070/yardly/fields/yobgbm5dfwawa4hr13tx.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662073/yardly/fields/tdlczpkw7rguze1jpecs.jpg',
      ],
      facilities: ['Climatizare', 'Vestiare', 'Cafenea', 'Parcare', 'Închiriere echipament'],
      averageRating: 4.8,
      status: 'available',
      manager: manager2._id,
    },

    // ─ Cluj-Napoca ─
    {
      name: 'Cluj Sport Arena - Fotbal',
      sport: fotbal._id,
      address: 'Str. Fabricii 8, Cluj-Napoca',
      locationUrl: 'https://maps.google.com/?q=Cluj+Napoca+Fotbal',
      description: 'Teren fotbal 6x6 cu gazon artificial ultima generație.',
      capacity: 12,
      city: cluj._id,
      pricePerHour: 100,
      schedule: SCHEDULE_ALL,
      images: [
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662077/yardly/fields/tmdsuhnirepv8hvwaii0.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662080/yardly/fields/s3btb2vuwhppewbtnfd8.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662081/yardly/fields/qem4m56dzumtigu99m2w.jpg',
      ],
      facilities: ['Vestiar', 'Duș', 'Iluminat nocturn', 'Tribună'],
      averageRating: 4.3,
      status: 'available',
      manager: manager2._id,
    },
    {
      name: 'Baschet Indoor Cluj',
      sport: baschet._id,
      address: 'Str. Horea 14, Cluj-Napoca',
      locationUrl: 'https://maps.google.com/?q=Cluj+Napoca+Baschet',
      description: 'Sală de baschet indoor cu parchet profesional și sistem de aer condiționat.',
      capacity: 10,
      city: cluj._id,
      pricePerHour: 90,
      schedule: SCHEDULE_WEEKDAYS,
      images: [
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662086/yardly/fields/g0haaafv3mcmiw8ifnta.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662088/yardly/fields/h6uenmhohn6gsfe50v1u.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662090/yardly/fields/dfhtfjv3i0uqr3afjzks.jpg',
      ],
      facilities: ['Aer condiționat', 'Vestiar', 'Duș', 'Parcare'],
      averageRating: 4.6,
      status: 'available',
      manager: manager3._id,
    },

    // ─ Timișoara ─
    {
      name: 'Timișoara Volei Club',
      sport: volei._id,
      address: 'Bd. Republicii 9, Timișoara',
      locationUrl: 'https://maps.google.com/?q=Timisoara+Volei',
      description: 'Teren de volei cu plasă profesională, interior și exterior.',
      capacity: 12,
      city: timisoara._id,
      pricePerHour: 70,
      schedule: SCHEDULE_WEEKEND,
      images: [
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662102/yardly/fields/xauodjqhyus0fe1k17z2.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662105/yardly/fields/ahqo4suoagearhptjaoa.jpg',
      ],
      facilities: ['Vestiar', 'Parcare', 'Tribună'],
      averageRating: 4.0,
      status: 'available',
      manager: manager3._id,
    },

    // ─ Brașov ─
    {
      name: 'Brașov Badminton Hall',
      sport: badminton._id,
      address: 'Str. Lungă 33, Brașov',
      locationUrl: 'https://maps.google.com/?q=Brasov+Badminton',
      description: 'Sală modernă cu 3 terenuri de badminton. Navete disponibile pentru închiriat.',
      capacity: 4,
      city: brasov._id,
      pricePerHour: 60,
      schedule: SCHEDULE_ALL,
      images: [
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662114/yardly/fields/w8b475lolptqmk9kksdz.jpg',
        'https://res.cloudinary.com/dbursx7n8/image/upload/v1775662117/yardly/fields/ylhvfh1ct6mxd1mm9cxt.jpg',
      ],
      facilities: ['Climatizare', 'Vestiar', 'Duș', 'Închiriere echipament'],
      averageRating: 4.4,
      status: 'available',
      manager: manager1._id,
    },
  ]);
  console.log(`🏟️  Terenuri create: ${fields.length}`);

  // ── 5. Rezervări ─────────────────────────────────────────────────────────
  // Folosim date fixe în viitor față de 2026-03-28
  const rezervari = [
    // Teren Central Berceni - luni 30 mar
    { field: fields[0]._id, user: user1._id, date: '2026-03-30', time: '10:00', duration: '1h30' },
    { field: fields[0]._id, user: user2._id, date: '2026-03-30', time: '12:00', duration: '1h' },
    { field: fields[0]._id, user: user3._id, date: '2026-03-30', time: '18:00', duration: '2h' },
    // Tenis Floreasca - marți 31 mar
    { field: fields[1]._id, user: user1._id, date: '2026-03-31', time: '09:00', duration: '1h' },
    { field: fields[1]._id, user: user2._id, date: '2026-03-31', time: '14:00', duration: '1h30' },
    // Padel Pipera - miercuri 1 apr
    { field: fields[2]._id, user: user3._id, date: '2026-04-01', time: '11:00', duration: '1h30' },
    { field: fields[2]._id, user: user1._id, date: '2026-04-01', time: '16:00', duration: '1h' },
    // Cluj Fotbal - joi 2 apr
    { field: fields[3]._id, user: user2._id, date: '2026-04-02', time: '19:00', duration: '1h' },
    // Baschet Cluj - vineri 3 apr
    { field: fields[4]._id, user: user3._id, date: '2026-04-03', time: '17:00', duration: '2h' },
    // Badminton Brasov - sâmbătă 4 apr
    { field: fields[6]._id, user: user1._id, date: '2026-04-04', time: '10:00', duration: '1h' },
    { field: fields[6]._id, user: user2._id, date: '2026-04-04', time: '13:00', duration: '1h30' },
  ];

  const reservationDocs = rezervari.map(r => ({
    ...r,
    slots: generateSlots(r.time, parseDuration(r.duration)),
    isEvent: false,
    isRecurrent: false,
  }));

  await Reservation.insertMany(reservationDocs);
  console.log(`📅 Rezervări create: ${reservationDocs.length}`);

  // ── Sumar ─────────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅  SEED COMPLET');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Conturi disponibile:\n');
  console.log('  ADMIN');
  console.log('    email:    admin@yardly.ro');
  console.log('    parola:   Admin123!');
  console.log('\n  MANAGERI (parola: Manager123!)');
  console.log('    manager1@yardly.ro  — Popescu Andrei');
  console.log('    manager2@yardly.ro  — Ionescu Maria');
  console.log('    manager3@yardly.ro  — Gheorghe Dan');
  console.log('\n  USERI (parola: User123!)');
  console.log('    user1@yardly.ro  — Alex Moldovan');
  console.log('    user2@yardly.ro  — Ioana Popa');
  console.log('    user3@yardly.ro  — Mihai Stan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Eroare seed:', err);
  process.exit(1);
});
