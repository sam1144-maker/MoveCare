import DoctorDashboard from './DoctorDashboard';
import type { Patient, Alert, EscalationEvent } from './DoctorDashboard';

interface AdminDashboardProps {
  patients: Patient[];
  alerts: Alert[];
  escalations: EscalationEvent[];
  onPatientClick?: (patientId: string) => void;
}

export default function AdminDashboard({
  patients,
  alerts,
  escalations,
  onPatientClick,
}: AdminDashboardProps) {
  return (
    <div>
      {/* Admin reuses the same monitoring interface */}
      <DoctorDashboard
        patients={patients}
        alerts={alerts}
        escalations={escalations}
        onPatientClick={onPatientClick}
      />
    </div>
  );
}
