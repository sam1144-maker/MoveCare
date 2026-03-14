import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  // Optional medical fields can go here later
  specialization: { type: String },
  experience: { type: String },
  license: { type: String },
  age: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
