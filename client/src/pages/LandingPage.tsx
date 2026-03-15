import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Activity, ShieldCheck, Users, HeartPulse,
  BrainCircuit, FileText, Bot, MessageCircle, Bell,
  Smartphone, Eye, UserPlus, Clock, Zap
} from 'lucide-react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  return (
    <div className="w-full overflow-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-50/40 via-green-50/30 to-white">
        {/* Organic shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] bg-green-50 rounded-full blur-[80px] opacity-80" />
        <div className="absolute top-[20%] left-[40%] w-[200px] h-[200px] bg-yellow-50 rounded-full blur-[60px] opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left — 7 cols */}
            <div className={`lg:col-span-7 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white text-emerald-700 font-semibold text-xs mb-8 border border-emerald-200 shadow-sm tracking-wide uppercase">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Remote Health Monitoring Platform</span>
              </div>

              <h1 className="text-[3.5rem] lg:text-[4.5rem] font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
                Healthcare that
                <br />
                <span className="relative">
                  <span className="text-emerald-600">never sleeps.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C50 3 100 2 150 5C200 8 250 4 298 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed font-light">
                Real-time vitals. AI diagnostics. WhatsApp alerts to caregivers.
                One platform connecting patients, doctors, and families.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link to="/login?tab=register&role=patient" className="group inline-flex items-center px-8 py-4 text-[15px] font-bold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20">
                  Get Started Free
                  <ArrowRight className="ml-2.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login?tab=register&role=doctor" className="inline-flex items-center px-8 py-4 text-[15px] font-bold rounded-2xl text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                  I'm a Doctor
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>HIPAA-ready</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>2s refresh rate</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>24/7 AI assistant</span>
                </div>
              </div>
            </div>

            {/* Right — 5 cols: Floating vitals card */}
            <div className={`lg:col-span-5 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="relative">
                {/* Shadow card behind */}
                <div className="absolute inset-4 bg-emerald-200/40 rounded-[32px] blur-xl" />

                <div className="relative bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 p-7 border border-slate-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Live Monitor</p>
                      <h3 className="text-lg font-bold text-slate-900">Ananya Sharma</h3>
                      <p className="text-sm text-slate-500">34 yrs · Cardiac</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Stable
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Heart Rate</span>
                      </div>
                      <p className="text-3xl font-black text-slate-900">72</p>
                      <p className="text-xs text-slate-400 mt-0.5">bpm</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">SpO₂</span>
                      </div>
                      <p className="text-3xl font-black text-slate-900">98</p>
                      <p className="text-xs text-slate-400 mt-0.5">%</p>
                    </div>
                  </div>

                  {/* Alert strip */}
                  <div className="bg-amber-50 rounded-xl p-3.5 flex items-start gap-2.5 border border-amber-100">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Escalation Active</p>
                      <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">Caregiver gets a WhatsApp alert within 4 seconds if vitals go critical.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURES — BENTO GRID ─── */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-xl mb-16">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Platform Overview</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Everything you need for remote health monitoring.
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* BIG CARD — Real-time Vitals (spans 2 cols) */}
            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                  <HeartPulse className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Real-Time Vitals Monitoring</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-6">
                  Heart rate, SpO₂, body temperature, and motion tracking stream live via WebSocket — updating every 2 seconds on the doctor's dashboard.
                </p>
                <div className="flex gap-8 text-sm">
                  <div><p className="text-3xl font-black text-white">2s</p><p className="text-slate-500 mt-1">Refresh rate</p></div>
                  <div><p className="text-3xl font-black text-white">4</p><p className="text-slate-500 mt-1">Vital signs</p></div>
                  <div><p className="text-3xl font-black text-white">6</p><p className="text-slate-500 mt-1">Patients live</p></div>
                </div>
              </div>
            </div>

            {/* WhatsApp Alerts */}
            <div className="bg-emerald-600 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-5">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">WhatsApp Alerts</h3>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Critical vitals automatically trigger a WhatsApp message to the caregiver via Twilio — with formatted vital readings and action steps.
                </p>
              </div>
            </div>

            {/* AI Chatbot */}
            <div className="bg-[#f8faf8] rounded-3xl p-8 border border-slate-100 group hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-5">
                <Bot className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Health Chatbot</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Describe symptoms in Hindi or English. Upload report photos. Get step-by-step diagnosis — available 24/7.
              </p>
            </div>

            {/* Health Records */}
            <div className="bg-[#f8faf8] rounded-3xl p-8 border border-slate-100 group hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Records</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload a report photo → AI extracts every parameter. Or let AI generate a form for manual entry. Trend graphs track values over time.
              </p>
            </div>

            {/* Caregiver Management */}
            <div className="bg-[#f8faf8] rounded-3xl p-8 border border-slate-100 group hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Caregiver System</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Patients assign a caregiver — spouse, parent, nurse — with phone and availability. Doctors see it on every patient card.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── ESCALATION CHAIN ─── */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Escalation Protocol</p>
            <h2 className="text-4xl font-black text-white tracking-tight">When seconds matter.</h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
              MoveCare detects critical anomalies and auto-escalates through a timed chain.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-px bg-gradient-to-r from-red-500/50 via-yellow-500/50 via-emerald-500/50 to-blue-500/50" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { time: '0s', icon: Activity, title: 'Anomaly Detected', desc: 'SpO₂ < 90% and HR > 130 bpm detected simultaneously.', accent: 'bg-red-500', glow: 'shadow-red-500/20', dot: 'bg-red-400' },
                { time: '1s', icon: Smartphone, title: 'Patient Pinged', desc: 'Vibration and alert sent to patient\'s wearable device.', accent: 'bg-yellow-500', glow: 'shadow-yellow-500/20', dot: 'bg-yellow-400' },
                { time: '4s', icon: MessageCircle, title: 'Caregiver Alerted', desc: 'WhatsApp message with vitals sent to assigned caregiver.', accent: 'bg-emerald-500', glow: 'shadow-emerald-500/20', dot: 'bg-emerald-400' },
                { time: '12s', icon: ShieldCheck, title: 'Doctor Notified', desc: 'Priority notification pushed to the doctor\'s dashboard.', accent: 'bg-blue-500', glow: 'shadow-blue-500/20', dot: 'bg-blue-400' },
              ].map((step, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className={`w-10 h-10 rounded-full ${step.accent} mx-auto lg:mx-0 mb-5 flex items-center justify-center shadow-lg ${step.glow}`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-2xl font-black text-white mb-1 tabular-nums`}>{step.time}</p>
                  <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Getting Started</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Four steps. That's it.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-slate-200 rounded-3xl overflow-hidden border border-slate-200">
            {[
              { icon: UserPlus, title: 'Sign Up', desc: 'Create a patient or doctor account. Secure cloud storage.', num: '01' },
              { icon: Activity, title: 'Connect', desc: 'Vitals stream in real-time via WebSocket to your dashboard.', num: '02' },
              { icon: BrainCircuit, title: 'AI Analyzes', desc: 'Chatbot diagnoses symptoms. AI extracts reports and generates forms.', num: '03' },
              { icon: Bell, title: 'Stay Protected', desc: 'Critical events trigger auto-escalation: patient → caregiver → doctor.', num: '04' },
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 text-center group">
                <p className="text-5xl font-black text-slate-100 mb-4 group-hover:text-emerald-100 transition-colors">{step.num}</p>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                  <step.icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI CHATBOT ─── */}
      <section className="py-24 bg-[#fafdf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Mock Chat */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 max-w-md mx-auto">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-slate-900">HealthAI</p>
                    <p className="text-[11px] text-emerald-600 font-medium">Online</p>
                  </div>
                </div>

                <div className="p-5 space-y-4 bg-slate-50/50 min-h-[280px]">
                  <div className="flex justify-end">
                    <div className="bg-slate-900 text-white text-[13px] rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm">
                      मुझे बुखार और बदन दर्द है
                    </div>
                  </div>
                  <div className="flex justify-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] shadow-sm leading-relaxed">
                      I understand you have fever and body ache. How long have you had this fever?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-slate-900 text-white text-[13px] rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-sm">
                      2 days, worse at night
                    </div>
                  </div>
                  <div className="flex justify-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="bg-white border border-slate-200 text-slate-700 text-[13px] rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] shadow-sm leading-relaxed">
                       Do you have any other symptoms like cough, cold, or headache?
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 border-t border-slate-100 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-xl h-10 flex items-center px-4">
                    <span className="text-xs text-slate-400">Type your symptoms...</span>
                  </div>
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-slate-800 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">AI Assistant</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                Your personal health assistant, in any language.
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
                Describe symptoms in Hindi, English, or any language. Upload a medical report photo and HealthAI extracts and explains every value. Available 24/7.
              </p>
              <div className="space-y-4">
                {[
                  'Step-by-step symptom diagnosis — one question at a time',
                  'Medical report image extraction and plain-language explanation',
                  'Multilingual support — works in Hindi, English, and more',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/login" className="group inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Try HealthAI
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FOR PATIENTS & DOCTORS ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Patients */}
            <div className="bg-[#fafdf9] rounded-3xl p-8 sm:p-10 border border-emerald-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Patients</h3>
              </div>
              <div className="space-y-5">
                {[
                  { t: 'See your vitals live', d: 'Heart rate, SpO₂, temperature — updating in real time.' },
                  { t: 'Assign a caregiver', d: 'Family member or nurse gets WhatsApp alerts when you need help.' },
                  { t: 'Upload or enter records', d: 'Snap a report photo → AI extracts numbers. Or fill an AI-generated form.' },
                  { t: 'Chat with HealthAI', d: 'Symptoms in any language. Step-by-step diagnosis and advice.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-md bg-emerald-200/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.t}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctors */}
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">For Doctors</h3>
              </div>
              <div className="space-y-5">
                {[
                  { t: 'Live patient grid', d: 'All patients at once with real-time vitals and status indicators.' },
                  { t: 'Alert & escalation timeline', d: 'Every alert and escalation event streams in real-time.' },
                  { t: 'View all patient records', d: 'Search, filter, and review every report with trend graphs.' },
                  { t: 'See caregiver info', d: 'Caregiver name, relationship, and contact on every patient card.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.t}</h4>
                      <p className="text-sm text-slate-400 mt-0.5">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-[#fafdf9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
            Start monitoring today.
          </h2>
          <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
            Join MoveCare — the platform that watches over your health so you don't have to worry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login?tab=register&role=patient" className="group px-8 py-4 text-base font-bold rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 inline-flex items-center justify-center">
              Sign Up as Patient
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login?tab=register&role=doctor" className="px-8 py-4 text-base font-bold rounded-2xl border-2 border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all inline-flex items-center justify-center">
              Join as Doctor
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
