import { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, Pause, RotateCcw, Award, CheckCircle, Wind, Camera, BoxSelect, AlertTriangle, ShieldCheck, CameraOff } from 'lucide-react';

// MediaPipe Pose is loaded globally from CDN in index.html
declare const Pose: any;

export default function ExerciseGamesPage() {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [phase, setPhase] = useState<'Ready' | 'Inhale' | 'Hold' | 'Exhale' | 'Complete'>('Ready');

  // --- Tab State ---
  const [activeTab, setActiveTab] = useState<'breathing' | 'posture'>('breathing');

  // --- Posture Check State ---
  const [cameraActive, setCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const poseRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const currentStatusRef = useRef<'Good' | 'Warning'>('Good');
  
  const [postureStatus, setPostureStatus] = useState<'Good' | 'Warning'>('Good');
  const [postureTimer, setPostureTimer] = useState(0);
  const [postureScore, setPostureScore] = useState(100);
  const [postureSessionActive, setPostureSessionActive] = useState(false);

  // --- Breathing Logic ---
  useEffect(() => {
    setTimeLeft(duration * 60);
    setPhase('Ready');
    setIsActive(false);
  }, [duration]);

  // Main timer countdown logic
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setPhase('Complete');
      setCompletedSessions((prev) => prev + 1);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Breathing cycle logic based on elapsed seconds.
  // We use a 10s cycle: 4s Inhale, 2s Hold, 4s Exhale
  useEffect(() => {
    if (!isActive) return;
    const elapsed = (duration * 60) - timeLeft;
    const cycleTime = elapsed % 10;
    
    if (cycleTime < 4) {
      setPhase('Inhale');
    } else if (cycleTime < 6) {
      setPhase('Hold');
    } else {
      setPhase('Exhale');
    }
  }, [isActive, timeLeft, duration]);

  const toggleTimer = () => {
    if (phase === 'Complete') {
      setTimeLeft(duration * 60);
      setPhase('Ready');
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setPhase('Ready');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Determine circle style properties based on the current breathing phase.
  const getCircleStyles = () => {
    if (phase === 'Inhale') return { transform: 'scale(1.5)', transition: 'transform 4s ease-in-out' };
    if (phase === 'Hold') return { transform: 'scale(1.5)', transition: 'transform 2s linear' };
    if (phase === 'Exhale') return { transform: 'scale(1)', transition: 'transform 4s ease-in-out' };
    if (phase === 'Complete') return { transform: 'scale(1)', transition: 'transform 1s ease-in-out' };
    return { transform: 'scale(1)', transition: 'transform 1s ease-in-out' };
  };

  const getPhaseText = () => {
    if (phase === 'Ready') return 'Ready to start';
    if (phase === 'Inhale') return 'Breathe In...';
    if (phase === 'Hold') return 'Hold...';
    if (phase === 'Exhale') return 'Breathe Out...';
    if (phase === 'Complete') return 'Session Complete!';
    return '';
  };
  
  // --- Posture Check Logic ---
  const startCamera = async () => {
    try {
      setIsModelLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      // Initialize MediaPipe Pose from CDN global
      if (!poseRef.current) {
        poseRef.current = new Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        poseRef.current.setOptions({
          modelComplexity: 0,       // Lite = fastest
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        poseRef.current.onResults((results: any) => {
          if (!results.poseLandmarks) return;
          const lm = results.poseLandmarks;
          // Landmark 11 = left shoulder, 12 = right shoulder
          const ls = lm[11];
          const rs = lm[12];
          if (ls && rs && ls.visibility > 0.5 && rs.visibility > 0.5) {
            const dy = ls.y - rs.y;
            const dx = ls.x - rs.x;
            const slope = Math.abs(dy / (dx === 0 ? 0.001 : dx));
            // slope > 0.18 = noticeable shoulder tilt
            const newStatus = slope > 0.18 ? 'Warning' : 'Good';
            if (currentStatusRef.current !== newStatus) {
              currentStatusRef.current = newStatus;
              setPostureStatus(newStatus);
            }
          }
        });
      }

      // Kick off a per-frame send loop
      const sendFrame = async () => {
        if (videoRef.current && poseRef.current && videoRef.current.readyState >= 2) {
          await poseRef.current.send({ image: videoRef.current });
        }
        animFrameRef.current = requestAnimationFrame(sendFrame);
      };
      animFrameRef.current = requestAnimationFrame(sendFrame);

      setIsModelLoading(false);
      setCameraActive(true);
      setPostureSessionActive(true);
      setPostureTimer(0);
      setPostureScore(100);
      setPostureStatus('Good');
      currentStatusRef.current = 'Good';
    } catch (err) {
      console.error('Camera or MediaPipe init failed', err);
      alert('Please allow camera access to use the Posture Check module.');
      setIsModelLoading(false);
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(animFrameRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setPostureSessionActive(false);
  };

  // Score & Streak Timer (1-second tick)
  useEffect(() => {
    let interval: any;
    if (cameraActive && postureSessionActive) {
      interval = setInterval(() => {
        if (currentStatusRef.current === 'Warning') {
          setPostureScore(prev => Math.max(0, prev - 2));
          setPostureTimer(0);
        } else {
          setPostureTimer(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cameraActive, postureSessionActive]);

  useEffect(() => {
      // Cleanup camera on unmount or tab switch
      if (activeTab !== 'posture') {
          stopCamera();
      }
  }, [activeTab]);

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto bg-slate-50 min-h-screen font-sans">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm shrink-0">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight leading-none">Exercise Games</h1>
            <p className="text-sm text-gray-500 font-medium">Interactive wellness and recovery activities</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit">
        <button
            onClick={() => setActiveTab('breathing')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'breathing' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
            <Wind className="w-4 h-4" />
            Guided Breathing
        </button>
        <button
            onClick={() => setActiveTab('posture')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'posture' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
        >
            <BoxSelect className="w-4 h-4" />
            Posture Check
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Breathing Exercise Card */}
          {activeTab === 'breathing' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px] relative">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">Guided Breathing</h3>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Relaxation Module</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-50 overflow-hidden">
                <h2 className={`text-3xl font-bold mb-12 z-10 transition-colors duration-500 ${phase === 'Inhale' ? 'text-blue-600' : phase === 'Exhale' ? 'text-emerald-600' : phase === 'Hold' ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {getPhaseText()}
                </h2>
                
                <div className="relative flex items-center justify-center w-64 h-64 mb-8">
                    {/* Background pulsing ripples */}
                    {isActive && phase !== 'Hold' && (
                        <>
                            <div className="absolute inset-0 bg-blue-200/30 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                            <div className="absolute inset-4 bg-blue-300/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                        </>
                    )}
                    
                    {/* Main breathing circle */}
                    <div 
                        className="w-32 h-32 rounded-full absolute flex items-center justify-center z-10 shadow-lg border-4 border-white"
                        style={{
                            ...getCircleStyles(),
                            background: phase === 'Inhale' 
                                ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' 
                                : phase === 'Exhale' || phase === 'Complete'
                                ? 'linear-gradient(135deg, #10b981, #34d399)'
                                : 'linear-gradient(135deg, #6366f1, #818cf8)'
                        }}
                    >
                        {phase === 'Ready' && <Wind className="w-10 h-10 text-white shadow-sm opacity-90" />}
                        {phase === 'Complete' && <CheckCircle className="w-10 h-10 text-white shadow-sm" />}
                        {phase !== 'Ready' && phase !== 'Complete' && <Wind className="w-10 h-10 text-white shadow-sm opacity-60" />}
                    </div>
                </div>
                
                {phase === 'Complete' && (
                    <div className="absolute bottom-10 animate-in fade-in slide-in-from-bottom-4">
                        <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Great job! Take a moment to rest.
                        </span>
                    </div>
                )}
            </div>
            
            <div className="px-5 py-4 border-t border-gray-100 bg-white flex justify-center gap-4">
                <button
                    onClick={toggleTimer}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm active:scale-95"
                >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isActive ? 'Pause Session' : phase === 'Complete' ? 'Start Over' : 'Start Session'}
                </button>
                <button
                    onClick={resetTimer}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors text-sm"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
            </div>
          </div>
          )}

          {/* Posture Check Card */}
          {activeTab === 'posture' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px] relative">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                  <BoxSelect className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">AI Posture Monitor</h3>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Spinal Alignment</p>
                </div>
              </div>
              
              {cameraActive && (
                 <div className={`text-sm font-semibold px-3 py-1.5 rounded-lg border shadow-xs flex items-center gap-2 ${postureStatus === 'Good' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${postureStatus === 'Good' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {postureStatus === 'Good' ? 'Good Posture' : 'Adjust Position!'}
                 </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-100 overflow-hidden">
                {!cameraActive ? (
                    <div className="text-center p-6">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                            <Camera className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Camera Disabled</h2>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">Start the camera to enable real-time posture tracking and alignment feedback.</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-black">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-full h-full object-cover mirror-mode origin-center"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        
                        {/* Overlay alignment guides */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8">
                            {/* Head bounding box */}
                            <div className={`w-32 h-40 border-2 border-dashed rounded-3xl transition-colors duration-300 ${postureStatus === 'Good' ? 'border-emerald-400/70' : 'border-red-500 animate-pulse'}`} />
                            {/* Shoulders line */}
                            <div className={`w-64 h-8 border-b-2 border-dashed transition-colors duration-300 mt-2 ${postureStatus === 'Good' ? 'border-emerald-400/50' : 'border-red-500/80'}`} />
                        </div>

                        {/* Status Warning Overlay */}
                        {postureStatus === 'Warning' && (
                             <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                                <AlertTriangle className="w-5 h-5" />
                                Please sit up straight!
                             </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="px-5 py-4 border-t border-gray-100 bg-white flex justify-center gap-4">
                {!cameraActive ? (
                    <button
                        onClick={startCamera}
                        disabled={isModelLoading}
                        className={`flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm transition-all text-sm ${isModelLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'}`}
                    >
                        {isModelLoading ? <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <Camera className="w-4 h-4" />}
                        {isModelLoading ? 'Loading AI Model...' : 'Enable Camera & Start'}
                    </button>
                ) : (
                    <button
                        onClick={stopCamera}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-all text-sm active:scale-95"
                    >
                        <CameraOff className="w-4 h-4" />
                        End Session
                    </button>
                )}
            </div>
          </div>
          )}
        </div>

        {/* Global Sidebar Stats based on active tab */}
        <div className="space-y-6">
          {activeTab === 'breathing' && (
             <>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-inner">
                        <Award className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Session Progress</h3>
                    <p className="text-xs text-gray-500 font-medium mb-6">Completed relaxation sets</p>
                    <div className="text-5xl font-black text-gray-800 mb-2">{completedSessions}</div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Total Exercises</p>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm">Timer Settings</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-600 block mb-2">Duration per session</label>
                            <div className="flex bg-slate-50 p-1 border border-gray-200 rounded-lg shadow-inner">
                                {[1, 3, 5].map((mins) => (
                                    <button
                                        key={mins}
                                        onClick={() => setDuration(mins)}
                                        disabled={isActive}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                            duration === mins 
                                                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100/50' 
                                                : 'text-gray-500 hover:bg-gray-100 disabled:opacity-50'
                                        }`}
                                    >
                                        {mins} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
             </>
          )}

          {activeTab === 'posture' && (
             <>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-center p-6">
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-inner transition-colors duration-500 ${postureStatus === 'Good' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                       {postureStatus === 'Good' ? <ShieldCheck className="w-8 h-8 text-emerald-500" /> : <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />}
                   </div>
                   <h3 className="font-semibold text-gray-900 text-lg mb-1">Live Score</h3>
                   <p className="text-xs text-gray-500 font-medium mb-4">Current session accuracy</p>
                   <div className={`text-5xl font-black mb-2 transition-colors ${postureScore > 80 ? 'text-gray-800' : 'text-red-500'}`}>
                       {postureScore}%
                   </div>
                   
                   <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Good Posture Streak</p>
                        <div className="text-2xl font-bold text-indigo-600">{formatTime(postureTimer)}</div>
                   </div>
               </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm">Ideal Posture Guide</h3>
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex items-start gap-3">
                           <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-indigo-600" /></div>
                           <p className="text-sm text-gray-600 font-medium leading-relaxed">Keep your back straight and shoulders relaxed against your chair.</p>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-indigo-600" /></div>
                           <p className="text-sm text-gray-600 font-medium leading-relaxed">Position your screen at eye level to prevent neck strain.</p>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-indigo-600" /></div>
                           <p className="text-sm text-gray-600 font-medium leading-relaxed">Ensure both feet are flat on the floor or on a footrest.</p>
                        </div>
                    </div>
                </div>
             </>
          )}

        </div>
      </div>
    </div>
  );
}
