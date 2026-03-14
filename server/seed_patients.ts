import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  specialization: { type: String },
  experience: { type: String },
  license: { type: String },
  age: { type: String },
  caregiver: {
    fullName: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String },
    city: { type: String },
    availableHours: { type: String },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const SIMULATED_PATIENTS = [
  { fullName: 'Ananya Sharma', email: 'ananya.sharma@movecare.in', age: '34' },
  { fullName: 'Rajesh Verma', email: 'rajesh.verma@movecare.in', age: '58' },
  { fullName: 'Priya Nair', email: 'priya.nair@movecare.in', age: '45' },
  { fullName: 'Vikram Singh', email: 'vikram.singh@movecare.in', age: '62' },
  { fullName: 'Meera Joshi', email: 'meera.joshi@movecare.in', age: '29' },
  { fullName: 'Arjun Patel', email: 'arjun.patel@movecare.in', age: '71' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('movecare123', salt);

    for (const patient of SIMULATED_PATIENTS) {
      const existing = await User.findOne({ email: patient.email });
      if (existing) {
        console.log(`✓ ${patient.fullName} already exists, skipping.`);
        continue;
      }

      await User.create({
        fullName: patient.fullName,
        email: patient.email,
        password: hashedPassword,
        role: 'patient',
        age: patient.age,
      });
      console.log(`✅ Registered: ${patient.fullName} (${patient.email})`);
    }

    console.log('\nAll simulated patients registered! Password for all: movecare123');
    await mongoose.disconnect();
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
