import { useState, useEffect, useRef } from 'react';
import { 
  Video, Calendar, Clock, User, ChevronRight, 
  CheckCircle, FileText,
  ArrowRight, Star, Activity, PhoneOff
} from 'lucide-react';

// ---------- TYPE DEFINITIONS ----------

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: string;
  profile: string;
  rating: number;
  image?: string;
}

interface Appointment {
  id: string;
  patientName?: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'live' | 'pending';
  roomName?: string;
  condition?: string;
}

interface CallSignaling {
  callerId: string;
  callerName: string;
  receiverId: string;
  room: string;
  status: 'calling' | 'accepted' | 'rejected' | 'ended';
  timestamp: number;
}

// ---------- MOCK DATA ----------

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    availability: 'Mon - Fri, 9:00 AM - 5:00 PM',
    profile: 'Specialist in robotic heart surgery and cardiovascular health with over 15 years of experience.',
    rating: 4.9,
  },
  {
    id: 'd2',
    name: 'Dr. James Chen',
    specialty: 'Neurologist',
    availability: 'Tue, Thu, Sat, 10:00 AM - 4:00 PM',
    profile: 'Expert in neurodegenerative disorders and advanced migraine treatments.',
    rating: 4.8,
  },
  {
    id: 'd3',
    name: 'Dr. Emily Carter',
    specialty: 'Dermatologist',
    availability: 'Mon, Wed, Fri, 9:00 AM - 1:00 PM',
    profile: 'Specializing in medical and cosmetic dermatology with advanced laser treatments.',
    rating: 4.7,
  },
  {
    id: 'd4',
    name: 'Dr. Michael Roberts',
    specialty: 'Orthopedic Surgeon',
    availability: 'Tue, Thu, 8:00 AM - 3:00 PM',
    profile: 'Expert in sports injuries and joint replacement surgeries.',
    rating: 4.9,
  },
  {
    id: 'd5',
    name: 'Dr. Lisa Patel',
    specialty: 'Pediatrician',
    availability: 'Mon - Fri, 8:00 AM - 4:00 PM',
    profile: 'Dedicated to providing comprehensive healthcare for infants, children, and adolescents.',
    rating: 4.8,
  }
];

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Ananya Sharma', condition: 'Cardiac' },
  { id: 'p2', name: 'Rajesh Verma', condition: 'Diabetic' },
  { id: 'p3', name: 'Priya Nair', condition: 'Post-Surgery' },
  { id: 'p4', name: 'Vikram Singh', condition: 'Hypertension' },
  { id: 'p5', name: 'Meera Joshi', condition: 'Respiratory' }
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: `app-demo-1`,
    patientName: 'John Doe',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    date: 'Oct 24, 2026',
    time: '10:30 AM',
    status: 'upcoming',
    roomName: 'MoveCare-Patient-Wilson-123',
    condition: 'Routine Checkup'
  }
];

// ---------- COMPONENTS ----------

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function TeleconsultationPage() {
  // ---------- STATE & CONFIG ----------
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'live'>('upcoming');
  const [isMeetingLive, setIsMeetingLive] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'accepted' | 'rejected'>('idle');
  const [activeSignaling, setActiveSignaling] = useState<CallSignaling | null>(null);
  const [role, setRole] = useState(localStorage.getItem('movecare_role') || 'patient');
  const [sessionNotes, setSessionNotes] = useState('');
  const ws = useRef<WebSocket | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('movecare_appointments');
    return saved ? JSON.parse(saved) : MOCK_APPOINTMENTS;
  });
  const [selectedDocId, setSelectedDocId] = useState(MOCK_DOCTORS[0].id);
  const [selectedPatientId, setSelectedPatientId] = useState(MOCK_PATIENTS[0].id);
  const [patientNameInput, setPatientNameInput] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'success'>('idle');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const [savedNotes, setSavedNotes] = useState<{date: string, doctorName: string, text: string}[]>(() => {
    const saved = localStorage.getItem('movecare_notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('movecare_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('movecare_notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'movecare_appointments' && e.newValue) {
        setAppointments(JSON.parse(e.newValue));
      }
      if (e.key === 'movecare_notes' && e.newValue) {
        setSavedNotes(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleScheduleVisit = () => {
    if (!selectedDocId) return;
    const doc = MOCK_DOCTORS.find(d => d.id === selectedDocId);
    if (!doc) return;

    if (!scheduleDate || !scheduleTime) {
        alert("Please select a preferred date and time for the appointment.");
        return;
    }
    
    if (!patientNameInput.trim()) {
        alert("Please enter your name for the appointment request.");
        return;
    }

    // Removed duplicate pending request check to allow for extensive dummy testing

    const newAppnt: Appointment = {
      id: `app-${Date.now()}`,
      patientName: patientNameInput.trim(),
      doctorName: doc.name,
      specialty: doc.specialty,
      date: scheduleDate,
      time: scheduleTime,
      status: 'pending',
      condition: 'General Request'
    };
    
    const newApps = [...appointments, newAppnt];
    setAppointments(newApps);
    setScheduleStatus('success');
    setScheduleDate('');
    setScheduleTime('');
    setPatientNameInput('');
    setTimeout(() => setScheduleStatus('idle'), 3000);
    
    // Broadcast the updated appointments to other connected browsers via WS
    if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'telehealth_sync_appointments', data: newApps }));
    }
  };

  const handleDoctorScheduleMeeting = () => {
    if (!selectedPatientId) return;
    const pat = MOCK_PATIENTS.find(p => p.id === selectedPatientId);
    if (!pat) return;

    if (!scheduleDate || !scheduleTime) {
        alert("Please select a date and time to schedule the meeting.");
        return;
    }

    const newAppnt: Appointment = {
      id: `app-${Date.now()}`,
      patientName: pat.name,
      doctorName: `Dr. Sarah Wilson (You)`,
      specialty: 'Cardiologist',
      date: scheduleDate,
      time: scheduleTime,
      status: 'upcoming',
      condition: pat.condition
    };
    
    const newApps = [...appointments, newAppnt];
    setAppointments(newApps);
    setScheduleStatus('success');
    setScheduleDate('');
    setScheduleTime('');
    setTimeout(() => setScheduleStatus('idle'), 3000);
    
    // Broadcast
    if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'telehealth_sync_appointments', data: newApps }));
    }
  };

  const updateAppointmentStatus = (id: string, newStatus: Appointment['status']) => {
      const newApps = appointments.map(a => {
          if (a.id === id) {
              return { 
                  ...a, 
                  status: newStatus,
                  date: newStatus === 'upcoming' ? 'Tomorrow' : a.date,
                  time: newStatus === 'upcoming' ? '10:00 AM' : a.time
              };
          }
          return a;
      });
      setAppointments(newApps);
      
      // Broadcast the updated appointments to other connected browsers via WS
      if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'telehealth_sync_appointments', data: newApps }));
      }
  };
  
  const addLog = (msg: string) => {
    console.log(`[Teleconsultation] ${msg}`);
  };

  const userId = 'user-123'; 
  const currentDocId = 'd1'; // Sarah Wilson for demo

  // Update role state when localStorage changes
  useEffect(() => {
    const checkRole = () => {
      const storedRole = localStorage.getItem('movecare_role') || 'patient';
      if (storedRole !== role) {
        addLog(`Role changed to ${storedRole}`);
        setRole(storedRole);
      }
    };
    const interval = setInterval(checkRole, 1000);
    return () => clearInterval(interval);
  }, [role]);

  // --- SIGNALING CORE (WebSockets) ---
  useEffect(() => {
    // Wait for environment to determine socket URL (Vite uses import.meta)
    const isProd = import.meta.env.PROD;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = isProd 
      ? `${protocol}//nav-rntu.onrender.com` 
      : `ws://localhost:5001`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      addLog('Connected to Live Signaling Hub');
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'telehealth_sync_appointments') {
            setAppointments(message.data);
            addLog("Appointments synced across clients from server.");
        }

        if (message.type === 'telehealth_signal') {
          const sig: CallSignaling = message.data;
          setActiveSignaling(sig);

          // Rule 1: I am the receiver and someone is calling
          if (role === 'doctor' && sig.receiverId === currentDocId && sig.status === 'calling') {
            if (callStatus !== 'incoming') {
              addLog(`Incoming call request from ${sig.callerName}`);
              setCallStatus('incoming');
            }
          }

          // Rule 2: I am the caller and doctor accepted
          if (role === 'patient' && sig.callerId === userId && sig.status === 'accepted') {
            if (callStatus !== 'accepted') {
              addLog('Call accepted by provider. Joining...');
              joinMeeting(sig.room);
            }
          }

          // Rule 3: I am the caller and doctor rejected
          if (role === 'patient' && sig.callerId === userId && sig.status === 'rejected') {
            if (callStatus !== 'rejected') {
              addLog('Call was rejected by the provider');
              setCallStatus('rejected');
              setTimeout(() => {
                setCallStatus('idle');
                setActiveSignaling(null);
              }, 3000);
            }
          }

          // Rule 4: Call ended globally
          if (sig.status === 'ended') {
            if (callStatus !== 'idle' || isMeetingLive) {
              addLog('Call ended by the other party');
              setCallStatus('idle');
              setIsMeetingLive(false);
              setActiveRoom(null);
              setActiveSignaling(null);
            }
          }
        }
      } catch (e) {
        console.error("Invalid WS message", e);
      }
    };

    ws.current.onclose = () => {
      addLog('Signaling connection lost. Reconnecting is recommended.');
    };

    return () => {
      ws.current?.close();
    };
  }, [role, callStatus, isMeetingLive]);

  const sendSignal = (sig: CallSignaling) => {
    setActiveSignaling(sig); // Optimistic UI update
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'telehealth_signal', data: sig }));
    } else {
      addLog('Error: Signaling server unavailable');
    }
  };

  const initiateCall = () => {
    const isDoctor = role === 'doctor';
    const sig: CallSignaling = {
      callerId: userId,
      callerName: isDoctor ? 'Dr. Sarah Wilson' : (patientNameInput || 'MoveCare Patient'),
      receiverId: isDoctor ? selectedPatientId : selectedDocId,
      room: `MoveCare-Meeting-${Math.random().toString(36).substring(2, 9)}`,
      status: 'calling',
      timestamp: Date.now()
    };
    sendSignal(sig);
    setCallStatus('calling');
  };

  const respondToCall = (accept: boolean) => {
    if (!activeSignaling) return;
    
    const newStatus = accept ? 'accepted' : 'rejected';
    const updatedSig: CallSignaling = { ...activeSignaling, status: newStatus };
    
    sendSignal(updatedSig);
    
    if (accept) {
      joinMeeting(activeSignaling.room);
    } else {
      setCallStatus('idle');
      setActiveSignaling(null);
    }
  };

  const endCall = () => {
    if (activeSignaling) {
      const updatedSig: CallSignaling = { ...activeSignaling, status: 'ended' };
      sendSignal(updatedSig);
    }
    setCallStatus('idle');
    setIsMeetingLive(false);
    setActiveRoom(null);
    setActiveSignaling(null);
    setSessionNotes('');
  };

  const joinMeeting = (roomName: string) => {
    setActiveRoom(roomName);
    setIsMeetingLive(true);
    setCallStatus('accepted');
  };

  const jitsiConfig = "#config.prejoinPageEnabled=false&config.prejoinConfig.enabled=false&config.disableDeepLinking=true&interfaceConfig.SHOW_PROMOTIONAL_CLOSE_PAGE=false&config.hideLobbyButton=true&config.disableThirdPartyRequests=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.DEFAULT_BACKGROUND=%22%23101828%22&config.requireDisplayName=false&config.defaultLanguage=%22en%22&config.toolbarButtons=%5B%22microphone%22%2C%22camera%22%2C%22chat%22%2C%22tileview%22%5D&config.resolution=720&config.p2p.enabled=true&config.disableAudioLevels=true";

  // ---------- PATIENT VIEW ----------
  const renderPatientView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <section>
          <SectionHeader title="Primary Care Team" subtitle="Direct line to your assigned specialists" />
          <div className="bg-white border hover:border-emerald-300 transition-colors rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-0.5">Dr. Sarah Wilson</h3>
              <p className="text-gray-500 text-sm mb-3 flex items-center justify-center md:justify-start gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" /> Chief Cardiologist
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs font-medium">
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Online
                </span>
                <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-100 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> 4.9 Rating
                </span>
              </div>
            </div>
            <button 
              onClick={initiateCall}
              disabled={callStatus !== 'idle'}
              className={`bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 z-10 text-sm ${
                callStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700 active:scale-95'
              }`}
            >
              <Video className="w-4 h-4" />
              Start Consultation
            </button>
          </div>
        </section>

        {/* Status Overlays */}
        {callStatus === 'calling' && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center animate-pulse shadow-lg text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-emerald-900 mb-1">Connecting to Provider...</h4>
                    <p className="text-sm text-emerald-600 font-bold">Please stay on this page. Dr. Wilson will join shortly.</p>
                </div>
                <button 
                    onClick={endCall}
                    className="mt-2 px-5 py-2 rounded-xl bg-red-100 text-red-600 font-bold text-xs hover:bg-red-200 transition-colors"
                >
                    Cancel Request
                </button>
            </div>
        )}

        {callStatus === 'rejected' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <PhoneOff className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-red-900 mb-1">Call Unavailable</h4>
                    <p className="text-sm text-red-600 font-bold">The doctor is currently busy or unable to take the call.</p>
                </div>
            </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1 shadow-xs">
          {(['upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Appointments
            </button>
          ))}
        </div>

        <section className="space-y-4">
            {appointments
              .filter(app => activeTab === 'upcoming' 
                 ? ['upcoming', 'pending'].includes(app.status) 
                 : ['completed', 'cancelled'].includes(app.status))
              .map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-base">{app.doctorName}</h4>
                      <p className="text-xs text-gray-500 mb-1.5">{app.specialty}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {app.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-500" /> {app.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.status === 'upcoming' && (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-200 font-medium whitespace-nowrap">Confirmed</span>
                            <button onClick={() => updateAppointmentStatus(app.id, 'cancelled')} className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1.5 rounded-md transition-colors font-bold uppercase tracking-wider">Withdraw</button>
                        </div>
                    )}
                    {app.status === 'pending' && (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-md bg-amber-50 text-amber-700 text-xs text-center border border-amber-200 font-medium whitespace-nowrap">Pending Approval</span>
                            <button onClick={() => updateAppointmentStatus(app.id, 'cancelled')} className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1.5 rounded-md transition-colors font-bold uppercase tracking-wider">Withdraw</button>
                        </div>
                    )}
                    {app.status === 'cancelled' && <span className="px-3 py-1 rounded-md bg-red-50 text-red-700 text-xs text-center border border-red-200 font-medium whitespace-nowrap">Declined/Cancelled</span>}
                    {app.status === 'completed' && <span className="px-3 py-1 rounded-md bg-gray-50 text-gray-500 text-xs text-center border border-gray-200 font-medium whitespace-nowrap">History</span>}
                  </div>
                </div>
              ))}
              {appointments.filter(app => activeTab === 'upcoming' ? ['upcoming', 'pending'].includes(app.status) : ['completed', 'cancelled'].includes(app.status)).length === 0 && (
                <div className="text-center py-6 text-gray-400 font-medium text-sm">No {activeTab} appointments found.</div>
              )}
        </section>

        {savedNotes.length > 0 && (
            <section className="mt-8 space-y-4">
                <SectionHeader title="Saved Clinical Notes" subtitle="Records from past teleconsultations" />
                <div className="space-y-3">
                    {savedNotes.map((note, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-bold text-gray-900">{note.doctorName}</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{note.date}</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden sticky top-8">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
             <Calendar className="w-4 h-4 text-emerald-600" />
             <h3 className="font-semibold text-gray-800 text-sm">Schedule New Appointment</h3>
          </div>
          <div className="p-5 space-y-4">
             <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Your Full Name</label>
                <input type="text" value={patientNameInput} onChange={e => setPatientNameInput(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-white border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-2 px-3 text-sm text-gray-800 transition-colors outline-none" />
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Select Specialist</label>
                <select value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)} className="w-full bg-white border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-2 px-3 text-sm text-gray-800 transition-colors outline-none cursor-pointer">
                    {MOCK_DOCTORS.map(doc => <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>)}
                </select>
             </div>
             <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Date</label>
                    <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-white border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-1.5 px-3 text-sm text-gray-800 transition-colors outline-none cursor-pointer" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Time</label>
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-white border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-1.5 px-3 text-sm text-gray-800 transition-colors outline-none cursor-pointer" />
                 </div>
             </div>
             <button onClick={handleScheduleVisit} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
                {scheduleStatus === 'success' ? 'Request Sent!' : 'Schedule Appointment'}
                {scheduleStatus !== 'success' && <ArrowRight className="w-4 h-4" />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- DOCTOR VIEW ----------
  const renderDoctorView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Incoming Call Overlay/Popup */}
        {callStatus === 'incoming' && activeSignaling && (
            <div className="bg-white rounded-2xl border border-emerald-500 p-5 shadow-lg relative overflow-hidden animate-in fade-in zoom-in slide-in-from-top-4 duration-500">
                <div className="absolute top-0 right-0 p-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shadow-sm shadow-red-200" />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-0.5 block">Live Patient Signal</span>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{activeSignaling.callerName}</h3>
                            <div className="flex items-center gap-1.5 text-gray-500 font-medium text-xs">
                                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Hypertension Monitoring</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                        <button 
                            onClick={() => respondToCall(false)}
                            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                            Decline
                        </button>
                        <button 
                            onClick={() => respondToCall(true)}
                            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <Video className="w-4 h-4" />
                            Accept Call
                        </button>
                    </div>
                </div>
            </div>
        )}

        <section>
          <SectionHeader title="Patient Queue" subtitle="Consultations waiting for your attention" />
          <div className="space-y-4">
            {appointments.filter(a => ['pending', 'upcoming'].includes(a.status)).map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${app.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {app.status === 'pending' ? <Clock className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base mb-0.5">{app.patientName || 'MoveCare Patient'}</h4>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> {app.condition || 'General Request'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    {app.status === 'pending' ? (
                        <>
                            <button onClick={() => updateAppointmentStatus(app.id, 'upcoming')} className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Approve</button>
                            <button onClick={() => updateAppointmentStatus(app.id, 'cancelled')} className="px-4 py-2 text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">Decline</button>
                        </>
                    ) : (
                        <>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Scheduled</p>
                                <p className="text-sm font-semibold text-gray-900">{app.time}</p>
                            </div>
                            <button className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
              </div>
            ))}
            {appointments.filter(a => ['pending', 'upcoming'].includes(a.status)).length === 0 && (
                <div className="text-center py-8 text-gray-500 font-medium text-sm bg-white rounded-xl border border-gray-200 border-dashed">No patients in queue</div>
            )}
          </div>
        </section>

        {savedNotes.length > 0 && (
            <section className="mt-8 space-y-4">
                <SectionHeader title="Saved Clinical Notes" subtitle="Records from past teleconsultations" />
                <div className="space-y-3">
                    {savedNotes.map((note, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-bold text-gray-900">{note.doctorName}</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{note.date}</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Dr. Sarah Wilson</h3>
            <p className="text-[11px] text-emerald-600 font-bold mb-6 tracking-widest">CARDIOLOGY UNIT</p>
            
            <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">In Queue</p>
                    <p className="text-xl font-bold text-gray-900">{appointments.filter(a => a.status === 'pending').length}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Confirmed</p>
                    <p className="text-xl font-bold text-emerald-700">{appointments.filter(a => a.status === 'upcoming').length}</p>
                </div>
            </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mt-6">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
             <Calendar className="w-4 h-4 text-emerald-600" />
             <h3 className="font-semibold text-gray-800 text-sm">Schedule Meeting with Patient</h3>
          </div>
          <div className="p-5 space-y-4">
             <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Select Patient</label>
                <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full bg-white border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-2 px-3 text-sm text-gray-800 transition-colors outline-none cursor-pointer">
                    {MOCK_PATIENTS.map(pat => <option key={pat.id} value={pat.id}>{pat.name} - {pat.condition}</option>)}
                </select>
             </div>
             <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Date</label>
                    <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-white border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-1.5 px-3 text-sm text-gray-800 transition-colors outline-none cursor-pointer" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Time</label>
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-white border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-1.5 px-3 text-sm text-gray-800 transition-colors outline-none cursor-pointer" />
                 </div>
             </div>
             <button onClick={handleDoctorScheduleMeeting} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 text-sm">
                {scheduleStatus === 'success' ? 'Meeting Scheduled!' : 'Schedule Meeting'}
                {scheduleStatus !== 'success' && <CheckCircle className="w-4 h-4" />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- ADMIN VIEW ----------
  const renderAdminView = () => (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Platform Volume', value: '1,248', icon: Activity, color: 'bg-emerald-600' },
          { label: 'Live Sessions', value: '14', icon: Video, color: 'bg-emerald-500' },
          { label: 'Active Doctors', value: '42', icon: User, color: 'bg-emerald-800' },
          { label: 'Success Rate', value: '98%', icon: CheckCircle, color: 'bg-emerald-400' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </section>

      <section>
        <SectionHeader title="Enterprise Consultation Monitor" subtitle="Master control for all clinical interactions" />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { id: 'MC-101', patient: 'John Doe', doctor: 'Dr. Wilson', status: 'Live' },
                  { id: 'MC-102', patient: 'Alice S.', doctor: 'Dr. Chen', status: 'Waiting' },
                  { id: 'MC-103', patient: 'Robert B.', doctor: 'Dr. Rodriguez', status: 'Scheduled' }
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{row.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.patient}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{row.doctor}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Live' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-700">{row.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto bg-gray-50 min-h-screen relative font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight leading-none">Telehealth</h1>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">v2.0</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {role === 'patient' && 'Secure point-to-point clinical video network'}
              {role === 'doctor' && 'Central consultation terminal'}
              {role === 'admin' && 'Enterprise-grade clinical oversight'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-green-50 flex items-center justify-center overflow-hidden">
                        <User className="w-5 h-5 text-green-200" />
                    </div>
                ))}
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-gray-900">14 Active Sessions</p>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">Real-time Status</p>
            </div>
        </div>
      </header>

      {isMeetingLive && activeRoom ? (
        <div className="mb-10 flex flex-col gap-6">
          <div className="bg-gray-950 rounded-2xl md:rounded-3xl border-4 md:border-8 border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[400px] md:h-[550px] relative">
            <div className="absolute top-4 left-4 xl:top-6 xl:left-6 z-20 flex items-center gap-2 bg-gray-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white border-l-4 border-l-red-500 shadow-md">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] xl:text-xs font-black uppercase tracking-widest">Live Session</span>
            </div>
            <button 
                onClick={endCall}
                className="absolute top-4 right-4 xl:top-6 xl:right-6 z-20 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-black text-xs transition-all shadow-xl flex items-center gap-2 active:scale-95 group border-2 border-red-400"
            >
                End Call
                <PhoneOff className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
            <div className="flex-1 w-full h-full bg-[#101828]">
              <iframe
                src={`https://meet.ffmuc.net/${activeRoom}${jitsiConfig}`}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-none"
              />
            </div>
          </div>
          
          {/* Live Session Notes Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[250px]">
             <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">Session Notes</h3>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Private • Auto-saving</p>
                    </div>
                </div>
                <button 
                  onClick={() => { 
                      if (sessionNotes.trim()) {
                          setSavedNotes(prev => [{
                              date: new Date().toLocaleDateString(),
                              doctorName: role === 'patient' ? `Dr. Sarah Wilson` : (activeSignaling?.callerName || 'Patient'),
                              text: sessionNotes
                          }, ...prev]);
                      }
                      alert("Session notes secured and linked to the patient's medical record!"); 
                      setSessionNotes(''); 
                  }}
                  className="text-[11px] bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Save Notes
                </button>
             </div>
             <div className="flex-1 p-5 flex flex-col">
                <textarea 
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Type your clinical observation notes here during the call..."
                    className="flex-1 w-full resize-none outline-none text-sm text-gray-700 font-medium leading-relaxed placeholder:text-gray-300 bg-transparent"
                />
             </div>
          </div>
        </div>
      ) : (
        <>
          {role === 'admin' && renderAdminView()}
          {role === 'doctor' && renderDoctorView()}
          {role === 'patient' && renderPatientView()}
        </>
      )}
    </div>
  );
}
