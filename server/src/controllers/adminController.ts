import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Record from '../models/Record';

/**
 * GET /api/admin/patients
 * List all users with role 'patient' including their embedded caregiver info
 */
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.status(200).json({ success: true, count: patients.length, patients });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/doctors
 * List all users with role 'doctor'
 */
export const getAllDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/analytics
 * Aggregate stats from across the system
 */
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalRecords = await Record.countDocuments();

    // Stats by Report Type
    const reportTypeStats = await Record.aggregate([
      { $group: { _id: '$reportType', count: { $sum: 1 } } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRecords = await Record.find({ createdAt: { $gte: sevenDaysAgo } })
      .limit(5)
      .sort({ createdAt: -1 })
      .populate('patientId', 'fullName');

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalRecords,
        reportTypeStats,
        recentActivity: recentRecords
      }
    });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
