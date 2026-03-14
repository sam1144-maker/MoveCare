import { Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVitalsSocket } from '../hooks/useVitalsSocket';
import { PatientCard } from './DoctorDashboard';

export default function PatientsPage() {
  const { patients } = useVitalsSocket();
  const navigate = useNavigate();

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Patient Directory</h1>
            <p className="text-sm text-gray-500">Live overview of all monitored patients</p>
          </div>
        </div>
      </header>

      {patients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => handlePatientClick(patient.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-green-200">
          <Activity className="w-10 h-10 text-green-300 mb-4 animate-pulse" />
          <p className="text-gray-500 font-medium">Connecting to live vitals stream...</p>
        </div>
      )}
    </div>
  );
}
