export default function RecordsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Records</h1>
        <p className="text-slate-500 mt-2">View and manage your health records and transcripts.</p>
      </header>

      <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-300">No Records Found</h2>
            <p className="text-slate-400 mt-2">This section is currently empty.</p>
        </div>
      </div>
    </div>
  );
}
