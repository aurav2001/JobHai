import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { employerAPI, jobsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, X, Save, ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';

const categories = ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Education', 'Sales', 'Engineering', 'Design', 'HR', 'Operations'];

export default function PostJob() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [reqInput, setReqInput] = useState('');

    const [form, setForm] = useState({
        title: '', description: '', company: '', location: '', type: 'fulltime',
        category: 'Technology', salary: { min: 0, max: 0 }, requirements: [], skills: [],
        experience: { min: 0, max: 5 }, education: '', openings: 1,
        deadline: '', recruiterContact: { name: '', phone: '', email: '' },
    });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || (user?.role !== 'employer' && user?.role !== 'admin'))) {
            navigate('/sign-in');
        }
        if (user && !form.company) setForm(f => ({ ...f, company: user.companyName || '' }));
        if (editId) fetchJob(editId);
    }, [user, authLoading]);

    const fetchJob = async (id) => {
        setLoading(true);
        try {
            const res = await jobsAPI.getById(id);
            const j = res.data.job;
            setForm({
                title: j.title, description: j.description, company: j.company,
                location: j.location, type: j.type, category: j.category,
                salary: j.salary || { min: 0, max: 0 }, requirements: j.requirements || [],
                skills: j.skills || [], experience: j.experience || { min: 0, max: 5 },
                education: j.education || '', openings: j.openings || 1,
                deadline: j.deadline ? j.deadline.split('T')[0] : '',
                recruiterContact: j.recruiterContact || { name: '', phone: '', email: '' },
            });
        } catch { toast.error('Failed to load job'); }
        finally { setLoading(false); }
    };

    const addItem = (field, value, setter) => {
        if (!value.trim()) return;
        setForm(f => ({ ...f, [field]: [...(f[field] || []), value.trim()] }));
        setter('');
    };

    const removeItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await employerAPI.updateJob(editId, form);
                toast.success('Job details updated!');
            } else {
                await employerAPI.createJob(form);
                toast.success('Job posted successfully!');
            }
            navigate('/employer/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save job');
        } finally { setSaving(false); }
    };

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    if (authLoading || loading) return <div className="max-w-3xl mx-auto py-20 px-4"><div className="skeleton h-64 rounded-3xl" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 fade-up">
            <div className="mb-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-[0.2em] mb-4 hover:gap-3 transition-all">
                    <ArrowLeft size={16} /> GO BACK
                </button>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{editId ? 'Refine Job Details' : 'Broadcast a New Role'}</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Fill accurately to attract premium talent</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Core Info */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-600" /> Core Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Job Designation *</label>
                            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Product Designer" className="input-field font-semibold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Hiring Organization *</label>
                            <input required value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company Name" className="input-field font-semibold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Primary Location *</label>
                            <input required value={form.location} onChange={e => set('location', e.target.value)} placeholder="City / Remote" className="input-field font-semibold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Employment Type *</label>
                            <select required value={form.type} onChange={e => set('type', e.target.value)} className="input-field font-bold">
                                {[['fulltime', 'Full Time'], ['parttime', 'Part Time'], ['wfh', 'Work from Home'], ['contract', 'Contract'], ['internship', 'Internship']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Job Category *</label>
                            <select required value={form.category} onChange={e => set('category', e.target.value)} className="input-field font-bold">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Total Openings</label>
                            <input type="number" min={1} value={form.openings} onChange={e => set('openings', parseInt(e.target.value))} className="input-field font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Application Window Ends</label>
                            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="input-field font-bold uppercase text-xs" />
                        </div>
                    </div>
                </div>

                {/* Perks & Experience */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                        <DollarSign size={20} className="text-green-600" /> Perks & Experience
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6 font-bold">
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Expected Min CTC (₹ LPA)</label>
                            <input type="number" value={form.salary.min} onChange={e => setForm(f => ({ ...f, salary: { ...f.salary, min: parseInt(e.target.value) } }))} placeholder="600000" className="input-field" />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Expected Max CTC (₹ LPA)</label>
                            <input type="number" value={form.salary.max} onChange={e => setForm(f => ({ ...f, salary: { ...f.salary, max: parseInt(e.target.value) } }))} placeholder="1200000" className="input-field" />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Min Tenure (Years)</label>
                            <input type="number" min={0} value={form.experience.min} onChange={e => setForm(f => ({ ...f, experience: { ...f.experience, min: parseInt(e.target.value) } }))} className="input-field" />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Max Tenure (Years)</label>
                            <input type="number" min={0} value={form.experience.max} onChange={e => setForm(f => ({ ...f, experience: { ...f.experience, max: parseInt(e.target.value) } }))} className="input-field" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Academic Requirement</label>
                            <input value={form.education} onChange={e => set('education', e.target.value)} placeholder="Minimum Degree Requirement" className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Narrative */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                        <FileText size={20} className="text-violet-600" /> Detailed Narrative *
                    </h2>
                    <textarea required rows={10} value={form.description} onChange={e => set('description', e.target.value)}
                        placeholder="Explain the day-to-day, reporting structure, and why talented people should join..." className="input-field resize-none font-medium text-slate-700 leading-relaxed" />
                </div>

                {/* Skills & Must-Haves */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-card p-8">
                        <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex justify-between items-center">
                            Tech Stack <span className="text-[10px] text-slate-400 uppercase tracking-widest">Added: {form.skills.length}</span>
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('skills', skillInput, setSkillInput))}
                                placeholder="e.g. Next.js" className="input-field text-sm font-semibold flex-1" />
                            <button type="button" onClick={() => addItem('skills', skillInput, setSkillInput)} className="btn-secondary py-2 px-4 shadow-sm"><Plus size={18} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.skills.map((s, i) => (
                                <span key={i} className="badge badge-blue flex items-center gap-2 pl-3 pr-2 py-1.5 font-bold shadow-sm">{s}
                                    <button type="button" onClick={() => removeItem('skills', i)} className="p-0.5 bg-blue-100 rounded-md text-blue-600 hover:bg-blue-200"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8">
                        <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex justify-between items-center">
                            Must-Haves <span className="text-[10px] text-slate-400 uppercase tracking-widest">Points: {form.requirements.length}</span>
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <input value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', reqInput, setReqInput))}
                                placeholder="e.g. Available immediately" className="input-field text-sm font-semibold flex-1" />
                            <button type="button" onClick={() => addItem('requirements', reqInput, setReqInput)} className="btn-secondary py-2 px-4 shadow-sm"><Plus size={18} /></button>
                        </div>
                        <ul className="space-y-2">
                            {form.requirements.map((r, i) => (
                                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" /> {r}
                                    <button type="button" onClick={() => removeItem('requirements', i)} className="ml-auto p-1 bg-white border border-slate-100 rounded-lg text-slate-300 hover:text-red-500 hover:border-red-100 transition-all">
                                        <X size={12} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact info */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                        Hiring Lead Contact <span className="text-[10px] text-slate-400 lowercase italic ml-2">visible to applicants</span>
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6 font-bold">
                        {['name', 'phone', 'email'].map(f => (
                            <div key={f}><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">{f}</label>
                                <input value={form.recruiterContact[f]} onChange={e => setForm(fr => ({ ...fr, recruiterContact: { ...fr.recruiterContact, [f]: e.target.value } }))} className="input-field text-sm" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={saving} className="btn-primary flex-1 items-center justify-center gap-2 px-10 py-5 text-sm font-extrabold uppercase tracking-[0.2em] shadow-2xl shadow-blue-100">
                        {saving ? 'PROCESSING...' : editId ? 'SAVE DEFINITION' : 'PUBLISH POSTING'}
                    </button>
                    <button type="button" onClick={() => navigate('/employer/dashboard')} className="btn-secondary px-10 py-5 text-sm font-extrabold uppercase tracking-widest border-slate-200">CANCEL</button>
                </div>
            </form>
        </div>
    );
}
