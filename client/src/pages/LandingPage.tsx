import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Users, 
  Star, 
  CheckCircle2, 
  UserPlus, 
  BrainCircuit, 
  Search, 
  TrendingUp, 
  FileText,
  BriefcaseMedical,
  Stethoscope,
  HeartPulse,
  Bot,
  MessageCircle
} from 'lucide-react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-slate-50">
      
      {/* SECTION 2: Hero */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50 rounded-bl-[100px] -z-10 opacity-70"></div>
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-secondary-100 rounded-full blur-3xl -z-10 opacity-60"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-medium text-sm mb-6 border border-primary-200">
                <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                <span>AI-Powered Remote Health Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Recover Faster with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent">Intelligent Care</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-xl">
                Experience the future of healthcare. Connect with top doctors, track your daily progress, and let our AI monitor your health to prevent complications.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login?tab=register&role=patient" className="inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-full shadow-lg text-white bg-primary-600 hover:bg-primary-700 transition-all hover:scale-105">
                  Book a Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login?tab=register&role=doctor" className="inline-flex justify-center items-center px-6 py-3.5 border-2 border-slate-200 text-base font-semibold rounded-full text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all">
                  Join as Doctor
                </Link>
              </div>
            </div>

            {/* Right Content - Illustration/Stats Card */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-primary-50 rounded-[40px] transform rotate-3 scale-105 -z-10"></div>
              
              <div className="bg-white rounded-[40px] shadow-xl p-8 border border-slate-100 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-bl-full opacity-50"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Recovery Status</h3>
                    <p className="text-sm text-slate-500">Patient: John Doe</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                    <TrendingUp className="w-3 h-3 mr-1" /> On Track
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Stat 1 */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Pain Level</p>
                      <div className="flex justify-between items-baseline">
                        <p className="text-xl font-bold text-slate-900">3<span className="text-sm text-slate-500 font-normal">/10</span></p>
                        <p className="text-xs text-green-600 font-medium flex items-center">
                          ↓ 2 points
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <HeartPulse className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="text-xs text-slate-500 font-medium">Health Status</p>
                        <p className="text-xs font-bold text-primary-600">Stable</p>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-primary-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alert Badge */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start animate-float">
                    <ShieldCheck className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold block mb-0.5">AI Alert</span>
                      Excellent adherence to medication this week. Keep it up!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION 3: Trusted By / Stats Bar */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="text-center px-4">
              <div className="flex justify-center items-center text-primary-600 mb-2">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">500+</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Patients Treated</p>
            </div>
            <div className="text-center px-4">
              <div className="flex justify-center items-center text-primary-600 mb-2">
                <Stethoscope className="w-6 h-6" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">50+</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Doctors Onboard</p>
            </div>
            <div className="text-center px-4">
              <div className="flex justify-center items-center text-primary-600 mb-2">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">92%</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Recovery Rate</p>
            </div>
            <div className="text-center px-4">
              <div className="flex justify-center items-center text-amber-400 mb-2">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">4.8</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              A simple, intuitive four-step process to get you on the path to full recovery from the comfort of your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10"></div>
            
            {/* Step 1 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform">
                <FileText className="w-10 h-10 text-primary-600" />
              </div>
              <div className="absolute top-0 right-1/4 -mr-4 bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-slate-50">1</div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Register</h3>
              <p className="text-slate-600 text-center text-sm">Share your condition, medical history, and current pain levels securely.</p>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform">
                <UserPlus className="w-10 h-10 text-primary-600" />
              </div>
              <div className="absolute top-0 right-1/4 -mr-4 bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-slate-50">2</div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Get Matched</h3>
              <p className="text-slate-600 text-center text-sm">Our algorithm pairs you with the perfect specialized doctor for your needs.</p>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform">
                <Activity className="w-10 h-10 text-primary-600" />
              </div>
              <div className="absolute top-0 right-1/4 -mr-4 bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-slate-50">3</div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Log Progress</h3>
              <p className="text-slate-600 text-center text-sm">Follow your prescribed treatment and log your daily metrics easily.</p>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform">
                <BrainCircuit className="w-10 h-10 text-primary-600" />
              </div>
              <div className="absolute top-0 right-1/4 -mr-4 bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-slate-50">4</div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">AI Monitoring</h3>
              <p className="text-slate-600 text-center text-sm">Our AI analyzes data, alerts your doctor, and adapts your plan dynamically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Who Can Benefit */}
      <section className="py-24 bg-white" id="for-patients">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Built for Everyone in the Loop</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Whether searching for care or providing it, MoveCare streamlines the entire health cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* For Patients */}
            <div className="bg-slate-50 rounded-[2rem] p-8 sm:p-12 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary-100 rounded-br-full opacity-50 -z-10"></div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                <span className="bg-primary-100 text-primary-700 p-2 rounded-xl mr-3">
                  <UserPlus className="w-6 h-6" />
                </span>
                For Patients
              </h3>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Working Professionals</h4>
                    <p className="mt-1 text-slate-600 text-sm">Recover from desk-related strain without disrupting your busy schedule.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Post-Surgery Recovery</h4>
                    <p className="mt-1 text-slate-600 text-sm">Careful, monitored rehabilitation directly from your living room.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Elderly Care</h4>
                    <p className="mt-1 text-slate-600 text-sm">Improve mobility and strength gently without stressful clinic visits.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Doctors */}
            <div className="bg-primary-50 rounded-[2rem] p-8 sm:p-12 border border-primary-100 relative overflow-hidden" id="for-doctors">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-tl-full opacity-50 -z-10"></div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                <span className="bg-white text-primary-600 p-2 rounded-xl mr-3 shadow-sm border border-primary-100">
                  <BriefcaseMedical className="w-6 h-6" />
                </span>
                For Doctors & Specialists
              </h3>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Clinic-Based Practitioners</h4>
                    <p className="mt-1 text-slate-700 text-sm">Extend your reach and monitor patients effectively between in-person visits.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Freelancers</h4>
                    <p className="mt-1 text-slate-700 text-sm">Build an independent digital practice with ready-to-use professional tools.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Complex Medical Cases</h4>
                    <p className="mt-1 text-slate-700 text-sm">Leverage detailed telemetry and AI insights for chronic illness or post-op cases.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: AI Features Highlight */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary-900 rounded-full blur-[150px] opacity-40 mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 text-primary-400 font-medium text-sm mb-4 border border-slate-700">
              <BrainCircuit className="w-4 h-4" />
              <span>Smart Technology</span>
            </div>
            <h2 className="text-3xl font-extrabold sm:text-4xl text-white">Your AI Co-Pilot</h2>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Our proprietary AI models analyze patient data securely to provide unparalleled insights to healthcare professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Anomaly Detection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatically identifies unexpected variations in vitals or symptom scores, alerting doctors immediately before issues compound.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 hover:bg-slate-800 transition-colors transform md:-translate-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Recovery Risk Score</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Predictive modeling generates a dynamic risk score for every patient, helping practitioners prioritize outreach to those who need it most.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Patient Summaries</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Saves hours of charting. AI synthesizes weekly progress logs into concise, professional summaries ready for clinician review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6.5: AI Chatbot CTA */}
      <section className="py-20 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex mt-2 items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-6 shadow-lg shadow-primary-500/30">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                Talk to Our AI Health Assistant
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Get instant answers about your symptoms, medications, general health queries and more — available 24/7 to support your journey.
              </p>
              
              <Link 
                to="/chatbot" 
                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-primary-600 hover:bg-primary-500 transition-all hover:scale-105 group"
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Chat Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Content - Mock UI */}
            <div className="lg:w-1/2 w-full max-w-md">
              <div className="bg-slate-50 rounded-2xl shadow-xl overflow-hidden border border-slate-200 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                
                {/* Mock Header */}
                <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-50">
                      <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-slate-900">HealthAI</p>
                    <p className="text-[10px] text-slate-500 font-medium">Online</p>
                  </div>
                </div>

                {/* Mock Messages */}
                <div className="p-4 space-y-4 bg-slate-50 h-64 overflow-hidden relative">
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-50 to-transparent"></div>
                  
                  {/* User Msg */}
                  <div className="flex justify-end">
                    <div className="bg-primary-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                      I've had a mild fever for 2 days now.
                    </div>
                  </div>

                  {/* Bot Msg */}
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mr-2 mt-1 -ml-1">
                      <Bot className="w-3 h-3 text-primary-600" />
                    </div>
                    <div className="bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] shadow-sm leading-relaxed">
                      A mild fever can be common, but it's important to monitor it. Stay hydrated and rest. Since it's been 2 days, I'll flag this for your doctor. 
                    </div>
                  </div>
                  
                   {/* User Msg 2 */}
                   <div className="flex justify-end">
                    <div className="bg-primary-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                      Should I take any medication?
                    </div>
                  </div>

                </div>

                {/* Mock Input */}
                <div className="bg-white p-3 border-t border-slate-200 flex items-center">
                  <div className="flex-1 bg-slate-100 rounded-full h-9 flex items-center px-4">
                    <span className="text-xs text-slate-400">Type your message...</span>
                  </div>
                  <div className="w-9 h-9 ml-2 bg-primary-600 rounded-full flex items-center justify-center text-white">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7: Testimonials */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Stories of Recovery</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "I was struggling to schedule appointments after work. MoveCare matched me with Dr. Sarah, who monitored my symptoms daily. The AI alerts actually caught a vital change before I even noticed."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full mr-4 flex items-center justify-center font-bold text-slate-500">ML</div>
                <div>
                  <h4 className="font-bold text-slate-900">Marcus L.</h4>
                  <p className="text-xs text-slate-500">Chronic Illness Patient</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "As a working mom recovering from surgery, leaving the house was impossible. This platform let me do my post-op checkups on my own time while still feeling completely supported by my specialist."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full mr-4 flex items-center justify-center font-bold text-slate-500">EK</div>
                <div>
                  <h4 className="font-bold text-slate-900">Elena K.</h4>
                  <p className="text-xs text-slate-500">Post-Surgery</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-600 italic mb-6">
                  "I use MoveCare to manage my 40+ private clients. The AI summaries save me nearly 5 hours a week in charting, and I can intervene exactly when a patient flags risky symptoms."
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full mr-4 flex items-center justify-center font-bold">DT</div>
                <div>
                  <h4 className="font-bold text-slate-900">Dr. David T.</h4>
                  <p className="text-xs text-slate-500">General Practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA Banner */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-primary-600 transform -skew-y-2 origin-top-left -z-10 mt-12 mb-12"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-primary-600 py-16 rounded-3xl shadow-xl border border-primary-500 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -m-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -m-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6 relative z-10">
            Start Your Recovery Journey Today
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of patients recovering smarter, and practitioners delivering better care.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link to="/login?tab=register&role=patient" className="px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-primary-700 bg-white hover:bg-slate-50 hover:scale-105 transition-all">
              Book a Session
            </Link>
            <Link to="/login?tab=register&role=doctor" className="px-8 py-4 border-2 border-white text-lg font-bold rounded-full text-white bg-transparent hover:bg-white/10 transition-all">
              Join as Doctor
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
