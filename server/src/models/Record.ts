import mongoose from 'mongoose';

const parameterSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String, default: '' },
  normalRange: { type: String, default: '' },
}, { _id: false });

const recordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, required: true },
  source: { type: String, enum: ['image_upload', 'manual_form'], required: true },
  parameters: [parameterSchema],
  imageBase64: { type: String }, // stored only for image uploads
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Record', recordSchema);
