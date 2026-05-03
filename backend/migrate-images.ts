/**
 * migrate-images.ts
 *
 * Migrează imaginile locale din ./uploads/ pe Cloudinary
 * și actualizează documentele Field din MongoDB cu noile URL-uri.
 *
 * Rulare: npx ts-node migrate-images.ts
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Validare variabile de mediu ─────────────────────────────────────────────

const REQUIRED_ENV = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌  Variabila de mediu lipsă: ${key}`);
    process.exit(1);
  }
}

// ─── Cloudinary config ────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Mongoose Schema (minimal, doar câmpurile necesare) ──────────────────────

const FieldSchema = new mongoose.Schema(
  { images: { type: [String], default: [] } },
  { strict: false, collection: 'fields' },
);

const FieldModel = mongoose.model('Field', FieldSchema);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Rezolvă path-ul absolut al fișierului local dintr-un URL de tipul /uploads/... */
function resolveLocalPath(imageUrl: string): string | null {
  // Acceptă: /uploads/foo.jpg  |  uploads/foo.jpg  |  http://localhost:PORT/uploads/foo.jpg
  const match = imageUrl.match(/uploads[\\/](.+)$/);
  if (!match) return null;
  return path.join(__dirname, 'uploads', match[1]);
}

/** Verifică dacă un string este deja URL Cloudinary */
function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com');
}

/** Verifică dacă un string pare un path local /uploads/... */
function isLocalPath(url: string): boolean {
  return /uploads[\\/]/i.test(url) && !isCloudinaryUrl(url);
}

/** Uploadează un fișier local pe Cloudinary și returnează secure_url */
async function uploadToCloudinary(localPath: string): Promise<string> {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: 'yardly/fields',
    resource_type: 'image',
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
  return result.secure_url;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║      Migrare imagini → Cloudinary        ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // 1. Conectare MongoDB
  console.log('🔌  Conectare la MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅  MongoDB conectat.\n');

  // 2. Găsim toate Field-urile cu cel puțin o imagine locală
  const fields = await FieldModel.find({
    images: { $elemMatch: { $regex: /uploads\//i, $not: /cloudinary\.com/i } },
  }).lean();

  if (fields.length === 0) {
    console.log('ℹ️   Nu există documente cu imagini locale de migrat.');
    await mongoose.disconnect();
    return;
  }

  console.log(`📋  Found ${fields.length} Field(s) cu imagini locale.\n`);

  // ─── Contoare ───────────────────────────────────────────────────────────────
  let totalImages    = 0;
  let migratedImages = 0;
  let skippedImages  = 0;  // deja pe Cloudinary
  let failedImages   = 0;

  const failedList: { fieldId: string; image: string; reason: string }[] = [];

  // 3. Procesare Field cu Field
  for (const field of fields) {
    const fieldId    = (field._id as mongoose.Types.ObjectId).toString();
    const fieldName  = (field as any).name ?? fieldId;
    const images: string[] = field.images ?? [];

    console.log(`📁  Field: "${fieldName}" (${fieldId})`);
    console.log(`    Imagini: ${images.length}`);

    const newImages: string[] = [];
    let fieldMigrated = 0;

    for (const img of images) {
      totalImages++;

      // Deja pe Cloudinary → păstrăm
      if (isCloudinaryUrl(img)) {
        console.log(`    ⏭️   Skip (deja Cloudinary): ${img.slice(-50)}`);
        newImages.push(img);
        skippedImages++;
        continue;
      }

      // Nu pare un path local → păstrăm neatins
      if (!isLocalPath(img)) {
        console.log(`    ⚠️   Skip (format necunoscut): ${img}`);
        newImages.push(img);
        skippedImages++;
        continue;
      }

      const localPath = resolveLocalPath(img);
      if (!localPath || !fs.existsSync(localPath)) {
        console.log(`    ❌  Fișier negăsit pe disk: ${localPath ?? img}`);
        newImages.push(img); // păstrăm url-ul vechi ca fallback
        failedImages++;
        failedList.push({ fieldId, image: img, reason: 'Fișier negăsit pe disk' });
        continue;
      }

      try {
        process.stdout.write(`    ⬆️   Upload: ${path.basename(localPath)} ... `);
        const secureUrl = await uploadToCloudinary(localPath);
        console.log(`OK`);
        newImages.push(secureUrl);
        migratedImages++;
        fieldMigrated++;
      } catch (err: any) {
        console.log(`EROARE`);
        console.log(`       ${err.message}`);
        newImages.push(img); // fallback la url-ul vechi
        failedImages++;
        failedList.push({ fieldId, image: img, reason: err.message });
      }
    }

    // 4. Actualizăm documentul în MongoDB dacă s-a schimbat ceva
    if (fieldMigrated > 0) {
      await FieldModel.updateOne(
        { _id: field._id },
        { $set: { images: newImages } },
      );
      console.log(`    💾  Document actualizat în MongoDB (${fieldMigrated} imagini migrate).\n`);
    } else {
      console.log(`    ℹ️   Nicio modificare pentru acest document.\n`);
    }
  }

  // ─── Sumar final ────────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════╗');
  console.log('║               SUMAR FINAL                ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Fields procesate : ${String(fields.length).padEnd(20)}║`);
  console.log(`║  Total imagini    : ${String(totalImages).padEnd(20)}║`);
  console.log(`║  ✅  Migrate      : ${String(migratedImages).padEnd(20)}║`);
  console.log(`║  ⏭️   Skip        : ${String(skippedImages).padEnd(20)}║`);
  console.log(`║  ❌  Eșuate       : ${String(failedImages).padEnd(20)}║`);
  console.log('╚══════════════════════════════════════════╝');

  if (failedList.length > 0) {
    console.log('\n⚠️   Imagini care au eșuat:');
    for (const f of failedList) {
      console.log(`   Field ${f.fieldId} | ${f.image}`);
      console.log(`   Motiv: ${f.reason}`);
    }
  }

  await mongoose.disconnect();
  console.log('\n🔌  MongoDB deconectat. Gata!\n');
}

migrate().catch((err) => {
  console.error('💥  Eroare neașteptată:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
