import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

// Save or Update Caregiver
export const saveCaregiver = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { fullName, relationship, phone, email, city, availableHours } = req.body;

    if (!fullName || !relationship || !phone) {
      res.status(400).json({ message: 'Name, relationship, and phone are required.' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { caregiver: { fullName, relationship, phone, email, city, availableHours } },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({ message: 'Caregiver saved successfully.', caregiver: user.caregiver });
  } catch (error: any) {
    console.error('Save caregiver error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Caregiver for logged-in patient
export const getMyCaregiver = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('caregiver');
    res.status(200).json({ caregiver: user?.caregiver || null });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Caregiver for a specific patient (for doctors)
export const getPatientCaregiver = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const user = await User.findById(patientId).select('caregiver');
    res.status(200).json({ caregiver: user?.caregiver || null });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
