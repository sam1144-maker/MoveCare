export default function DashboardPage() {
  const role = localStorage.getItem('movecare_role') || 'Unknown Role';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back to MoveCare. ({role})</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-48">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4 text-primary-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
          <p className="text-sm text-slate-500 mt-1">Placeholder widget for quick application links.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-48 lg:col-span-2">
           <h3 className="text-xl font-semibold text-slate-800 mb-2">Platform Overview</h3>
           <p className="text-slate-500 text-sm">Widgets and analytics will populate here based on user permissions.</p>
        </div>
      </div>
    </div>
  );
}
