import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Groq from 'groq-sdk';
import Record from '../models/Record';

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// POST /api/records/extract-image
export const extractImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { image } = req.body;
    if (!image) { res.status(400).json({ message: 'Image is required' }); return; }

    let finalImageUrl = image;
    if (!image.startsWith('data:')) {
      finalImageUrl = `data:image/jpeg;base64,${image}`;
    }

    const completion = await getGroq().chat.completions.create({
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a medical report extraction AI. Analyze this medical report image and extract all medical parameters/values found in it.

Return ONLY a valid JSON object with this exact structure, no extra text:
{
  "reportType": "the type of report e.g. Blood Test, Diabetes Report etc.",
  "parameters": [
    { "fieldName": "Human readable name", "key": "camelCase_key", "value": "the value", "unit": "unit", "normalRange": "normal range if shown" }
  ]
}

Extract every parameter visible in the report. If a normal range is shown, include it. If not, leave normalRange as empty string.`
          },
          { type: 'image_url', image_url: { url: finalImageUrl } }
        ]
      }],
      model: 'llama-3.2-11b-vision-preview',
      temperature: 0.2,
      max_tokens: 2048
    });

    const raw = completion.choices[0]?.message?.content || '';

    // Try to extract JSON from the response
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      parsed = null;
    }

    if (!parsed || !parsed.parameters) {
      res.status(200).json({ success: false, raw, message: 'Could not extract structured data. Raw response returned.' });
      return;
    }

    res.status(200).json({ success: true, reportType: parsed.reportType, parameters: parsed.parameters });
  } catch (error: any) {
    console.error('Extract image error:', error);
    res.status(500).json({ message: 'Failed to extract data from image', error: error.message });
  }
};

// POST /api/records/generate-form
export const generateForm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportType } = req.body;
    if (!reportType) { res.status(400).json({ message: 'Report type is required' }); return; }

    const completion = await getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a medical form generator. Return ONLY valid JSON arrays, no extra text.' },
        {
          role: 'user',
          content: `Generate form fields for a "${reportType}" medical report. Return a JSON array with common parameters for this report type. Each field should have:
- fieldName: human readable label
- key: camelCase identifier
- unit: measurement unit
- normalRange: typical normal range as a string
- inputType: "number" or "text"
- required: boolean

Return 6-10 most common parameters for this report type. ONLY return the JSON array, no other text.`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1024
    });

    const raw = completion.choices[0]?.message?.content || '';
    let fields;
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      fields = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      fields = null;
    }

    if (!fields) {
      res.status(200).json({ success: false, raw, message: 'Could not generate form fields.' });
      return;
    }

    res.status(200).json({ success: true, fields });
  } catch (error: any) {
    console.error('Generate form error:', error);
    res.status(500).json({ message: 'Failed to generate form', error: error.message });
  }
};

// POST /api/records/save
export const saveRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.id;
    const { reportType, source, parameters, imageBase64, notes } = req.body;

    if (!reportType || !source || !parameters) {
      res.status(400).json({ message: 'reportType, source, and parameters are required.' });
      return;
    }

    const record = await Record.create({
      patientId,
      reportType,
      source,
      parameters,
      imageBase64: imageBase64 || undefined,
      notes: notes || undefined,
    });

    res.status(201).json({ message: 'Record saved.', record });
  } catch (error: any) {
    console.error('Save record error:', error);
    res.status(500).json({ message: 'Failed to save record', error: error.message });
  }
};

// GET /api/records/:patientId
export const getRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const records = await Record.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json({ records });
  } catch (error: any) {
    console.error('Get records error:', error);
    res.status(500).json({ message: 'Failed to fetch records', error: error.message });
  }
};

// GET /api/records/all — for doctor view (all patients' records with patient info)
export const getAllRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await Record.find()
      .populate('patientId', 'fullName age email')
      .sort({ createdAt: -1 });
    res.status(200).json({ records });
  } catch (error: any) {
    console.error('Get all records error:', error);
    res.status(500).json({ message: 'Failed to fetch all records', error: error.message });
  }
};
