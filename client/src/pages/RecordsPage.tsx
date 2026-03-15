import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, PlusCircle, X, AlertTriangle, Clock, ChevronDown, ChevronUp, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { API_BASE, apiFetch } from '../config';

const API = `${API_BASE}/api/records`;

interface Parameter {
  fieldName: string;
  key: string;
  value: string;
  unit: string;
  normalRange: string;
}

interface RecordEntry {
  _id: string;
  reportType: string;
  source: 'image_upload' | 'manual_form';
  parameters: Parameter[];
  imageBase64?: string;
  createdAt: string;
}

interface FormField {
  fieldName: string;
  key: string;
  unit: string;
  normalRange: string;
  inputType: string;
  required: boolean;
}

const REPORT_TYPES = [
  'Blood Test', 'Diabetes Report', 'Blood Pressure Log',
  'Kidney Function Test', 'Liver Function Test', 'Thyroid Report', 'General Checkup'
];

// Helper: get user id from JWT
function getUserId(): string {
  const token = localStorage.getItem('movecare_token');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch { return ''; }
}



// ---------- MAIN ----------

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Image upload state
  const [showImageConfirm, setShowImageConfirm] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{ reportType: string; parameters: Parameter[] } | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>('');

  // Manual form state
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generatingForm, setGeneratingForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Timeline expand
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fullImageId, setFullImageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const patientId = getUserId();

  // Fetch records on load
  useEffect(() => {
    if (!patientId) return;
    apiFetch(`${API}/${patientId}`)
      .then(r => r.json())
      .then(data => { setRecords(data.records || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [patientId]);

  // ---------- IMAGE UPLOAD ----------

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setExtracting(true);
      setShowImageConfirm(true);

      try {
        const res = await apiFetch(`${API}/extract-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        });
        const data = await res.json();
        if (data.success) {
          setExtractedData({ reportType: data.reportType, parameters: data.parameters });
        } else {
          setExtractedData(null);
        }
      } catch {
        setExtractedData(null);
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImageSave = async () => {
    if (!extractedData) return;
    setSaving(true);
    try {
      const res = await apiFetch(`${API}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: extractedData.reportType,
          source: 'image_upload',
          parameters: extractedData.parameters,
          imageBase64: uploadedImage,
        })
      });
      const data = await res.json();
      if (data.record) setRecords(prev => [data.record, ...prev]);
      setShowImageConfirm(false);
      setExtractedData(null);
      setUploadedImage('');
    } catch {} finally { setSaving(false); }
  };

  // ---------- MANUAL FORM ----------

  const handleReportTypeSelect = async (type: string) => {
    setSelectedReportType(type);
    setGeneratingForm(true);
    setFormFields([]);
    setFormValues({});

    try {
      const res = await apiFetch(`${API}/generate-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: type })
      });
      const data = await res.json();
      if (data.success && data.fields) {
        setFormFields(data.fields);
        const vals: Record<string, string> = {};
        data.fields.forEach((f: FormField) => { vals[f.key] = ''; });
        setFormValues(vals);
      }
    } catch {} finally { setGeneratingForm(false); }
  };

  const submitManualForm = async () => {
    const parameters: Parameter[] = formFields
      .filter(f => formValues[f.key]?.trim())
      .map(f => ({
        fieldName: f.fieldName,
        key: f.key,
        value: formValues[f.key],
        unit: f.unit,
        normalRange: f.normalRange,
      }));

    if (parameters.length === 0) return;
    setSaving(true);

    try {
      const res = await apiFetch(`${API}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: selectedReportType, source: 'manual_form', parameters })
      });
      const data = await res.json();
      if (data.record) setRecords(prev => [data.record, ...prev]);
      setShowManualModal(false);
      setSelectedReportType('');
      setFormFields([]);
      setFormValues({});
    } catch {} finally { setSaving(false); }
  };

  // ---------- TREND DATA ----------

  const getTrendData = () => {
    const paramMap: Record<string, { fieldName: string; unit: string; normalRange: string; points: { date: string; value: number }[] }> = {};

    [...records].reverse().forEach(r => {
      const date = new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      r.parameters.forEach(p => {
        const numVal = parseFloat(p.value);
        if (isNaN(numVal)) return;
        if (!paramMap[p.key]) {
          paramMap[p.key] = { fieldName: p.fieldName, unit: p.unit, normalRange: p.normalRange, points: [] };
        }
        paramMap[p.key].points.push({ date, value: numVal });
      });
    });

    return Object.entries(paramMap).filter(([, v]) => v.points.length > 1);
  };

  const parseRange = (range: string): { min: number; max: number } | null => {
    const match = range.match(/([\d.]+)\s*[-–to]+\s*([\d.]+)/);
    if (match) return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
    return null;
  };

  const trends = getTrendData();

  // ---------- RENDER ----------

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Health Records</h1>
            <p className="text-sm text-gray-500">Upload reports or add manual health data</p>
          </div>
        </div>
      </header>

      {/* ===== TOP SECTION: Action Buttons ===== */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageSelect} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all text-sm"
        >
          <Upload className="w-5 h-5" />
          Upload Report Image
        </button>
        <button
          onClick={() => setShowManualModal(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-white border-2 border-green-300 text-green-700 font-bold rounded-xl hover:bg-green-50 hover:border-green-400 transition-all text-sm shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Add Manual Record
        </button>
      </div>

      {/* ===== IMAGE EXTRACTION CONFIRMATION ===== */}
      {showImageConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowImageConfirm(false); setExtractedData(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-green-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Extracted Report Data
              </h2>
              <button onClick={() => { setShowImageConfirm(false); setExtractedData(null); }} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {extracting ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Analyzing report with AI...</p>
                </div>
              ) : extractedData ? (
                <>
                  <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                    <span className="text-sm font-bold text-green-800">Report Type: {extractedData.reportType}</span>
                  </div>
                  {uploadedImage && (
                    <div className="mb-4">
                      <img src={uploadedImage} alt="Report" className="h-32 rounded-xl border border-gray-200 object-contain" />
                    </div>
                  )}
                  <div className="space-y-2 mb-6">
                    {extractedData.parameters.map((p, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm">
                        <span className="font-semibold text-gray-700">{p.fieldName}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{p.value} {p.unit}</span>
                          {p.normalRange && <span className="text-xs text-gray-400">Normal: {p.normalRange}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={confirmImageSave} disabled={saving}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-200 hover:shadow-xl transition-all disabled:opacity-50">
                    {saving ? 'Saving...' : 'Confirm & Save Record'}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Could not extract data from this image.</p>
                  <p className="text-sm text-gray-400 mt-1">Please try a clearer photo of the report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MANUAL FORM MODAL ===== */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowManualModal(false); setSelectedReportType(''); setFormFields([]); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-green-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-600" />
                {selectedReportType || 'Add Manual Record'}
              </h2>
              <button onClick={() => { setShowManualModal(false); setSelectedReportType(''); setFormFields([]); }} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {!selectedReportType ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-3">Select the type of report:</p>
                  {REPORT_TYPES.map(type => (
                    <button key={type} onClick={() => handleReportTypeSelect(type)}
                      className="w-full text-left px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-sm font-semibold text-gray-700">
                      {type}
                    </button>
                  ))}
                </div>
              ) : generatingForm ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Generating form with AI...</p>
                </div>
              ) : formFields.length > 0 ? (
                <div className="space-y-4">
                  {formFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {field.fieldName}
                        {field.unit && <span className="text-gray-400 font-normal ml-1">({field.unit})</span>}
                        {field.required && <span className="text-red-400 ml-0.5">*</span>}
                      </label>
                      {field.normalRange && <p className="text-xs text-gray-400 mb-1">Normal: {field.normalRange}</p>}
                      <input
                        type={field.inputType === 'number' ? 'number' : 'text'}
                        step="any"
                        value={formValues[field.key] || ''}
                        onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
                        placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                      />
                    </div>
                  ))}
                  <button onClick={submitManualForm} disabled={saving}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-200 hover:shadow-xl transition-all disabled:opacity-50 mt-2">
                    {saving ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No form fields generated. Try again.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MIDDLE SECTION: Trend Graphs ===== */}
      {trends.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Health Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {trends.map(([key, data]) => {
              const range = parseRange(data.normalRange);
              return (
                <div key={key} className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-1">{data.fieldName}</h3>
                  <p className="text-xs text-gray-400 mb-3">{data.unit}{data.normalRange ? ` · Normal: ${data.normalRange}` : ''}</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={data.points}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #d1fae5' }} />
                      {range && (
                        <>
                          <ReferenceLine y={range.min} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Min', fill: '#16a34a', fontSize: 10 }} />
                          <ReferenceLine y={range.max} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Max', fill: '#16a34a', fontSize: 10 }} />
                        </>
                      )}
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== BOTTOM SECTION: Log History Timeline ===== */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600" />
          Record History
        </h2>

        {loading ? (
          <div className="flex flex-col items-center py-16 bg-white rounded-2xl border border-green-200">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-16 bg-white rounded-2xl border border-green-200">
            <FileText className="w-12 h-12 text-green-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-300">No Records Yet</h3>
            <p className="text-sm text-gray-400 mt-1">Upload a report image or add a manual record to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => {
              const isExpanded = expandedId === record._id;
              const date = new Date(record.createdAt);
              const keyParams = record.parameters.slice(0, 3);

              return (
                <div key={record._id} className="bg-white rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all shadow-sm">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : record._id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      {record.source === 'image_upload' ? <ImageIcon className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{record.reportType}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${record.source === 'image_upload' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {record.source === 'image_upload' ? 'Image Upload' : 'Manual Entry'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-gray-300">·</span>
                        {keyParams.map((p, i) => (
                          <span key={i} className="font-medium text-gray-500">{p.fieldName}: <strong className="text-gray-700">{p.value}{p.unit ? ` ${p.unit}` : ''}</strong></span>
                        ))}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-green-100">
                      {record.imageBase64 && (
                        <div className="mb-4 mt-3">
                          <img
                            src={record.imageBase64}
                            alt="Report"
                            className="h-24 rounded-xl border border-gray-200 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setFullImageId(record._id)}
                          />
                        </div>
                      )}
                      <div className="space-y-2 mt-3">
                        {record.parameters.map((p, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-green-50 rounded-xl text-sm">
                            <span className="font-semibold text-gray-700">{p.fieldName}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900">{p.value} {p.unit}</span>
                              {p.normalRange && <span className="text-xs text-gray-400">Normal: {p.normalRange}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Full Image Viewer */}
      {fullImageId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setFullImageId(null)}>
          <div className="relative max-w-3xl max-h-[90vh]">
            <button onClick={() => setFullImageId(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <img src={records.find(r => r._id === fullImageId)?.imageBase64 || ''} alt="Full Report" className="max-h-[85vh] rounded-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
