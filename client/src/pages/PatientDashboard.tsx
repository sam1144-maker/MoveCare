import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Heart, Calendar, TrendingUp, Sparkles } from 'lucide-react';

export default function PatientDashboard() {
  const cards = [
    {
      to: '/chatbot',
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-200',
      icon: Sparkles,
      title: 'Talk to HealthAI',
      desc: 'Describe your symptoms and get an instant AI diagnosis.',
      isLink: true,
    },
    {
      to: '/records',
      gradient: '',
      shadow: '',
      icon: FileText,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50',
      title: 'My Records',
      desc: 'View transcripts and past consultations.',
      isLink: true,
    },
    {
      to: '',
      gradient: '',
      shadow: '',
      icon: Heart,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50',
      title: 'Health Overview',
      desc: 'Track your vitals and wellness metrics.',
      isLink: false,
    },
    {
      to: '',
      gradient: '',
      shadow: '',
      icon: Calendar,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      title: 'Appointments',
      desc: 'No upcoming appointments scheduled.',
      isLink: false,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-200">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back!</h1>
            <p className="text-sm text-slate-500">Here's an overview of your health journey.</p>
          </div>
        </div>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <div
              className={`group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between h-52
                transition-all duration-300 hover:-translate-y-0.5
                ${card.gradient 
                  ? `bg-gradient-to-br ${card.gradient} text-white shadow-lg ${card.shadow} hover:shadow-xl` 
                  : 'bg-white border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
            >
              {/* Decorative elements for gradient cards */}
              {card.gradient && (
                <>
                  <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                  <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/5" />
                </>
              )}

              <div className="relative z-10">
                {card.gradient ? (
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                )}
              </div>

              <div className="relative z-10">
                <h3 className={`text-lg font-bold ${card.gradient ? '' : 'text-slate-900'}`}>{card.title}</h3>
                <p className={`text-sm mt-1 ${card.gradient ? 'text-white/80' : 'text-slate-500'}`}>{card.desc}</p>
              </div>

              {/* Hover arrow for linked cards */}
              {card.isLink && (
                <div className={`absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  ${card.gradient ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <MessageSquare className={`w-4 h-4 ${card.gradient ? 'text-white' : 'text-slate-500'}`} />
                </div>
              )}
            </div>
          );

          return card.isLink ? (
            <Link key={card.title} to={card.to!}>{inner}</Link>
          ) : (
            <div key={card.title}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
