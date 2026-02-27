import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { authAPI, jobsAPI } from '../lib/api';
import JobCard from '../components/JobCard';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Briefcase, FileText, Settings, LogOut, CheckCircle, Clock, Target, IndianRupee, Wrench, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Profile() {
    const { user, updateUser, logout, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', phone: '', location: '', bio: '',
        skills: '', experience: '', education: '',
        // Job Preferences
        jpDesiredJobTitle: '', jpJobType: '', jpPreferredLocation: '',
        jpExperienceLevel: '', jpExpectedSalary: '', jpSkills: '', jpIndustry: '',
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) navigate('/sign-in');
        if (user) {
            const jp = user.jobPreferences || {};
            setForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || '',
                skills: user.skills?.join(', ') || '',
                experience: user.experience || '',
                education: user.education || '',
                jpDesiredJobTitle: jp.desiredJobTitle || '',
                jpJobType: jp.jobType || '',
                jpPreferredLocation: jp.preferredLocation || '',
                jpExperienceLevel: jp.experienceLevel || '',
                jpExpectedSalary: jp.expectedSalary || '',
                jpSkills: jp.skills?.join(', ') || '',
                jpIndustry: jp.industry || '',
            });
            if (user.role === 'jobseeker') fetchApplications();
        }
    }, [user, authLoading]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { employerAPI } = await import('../lib/api'); // Reusing application fetcher
            const res = await employerAPI.myApplications();
            setApplications(res.data.applications);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const data = {
                name: form.name, phone: form.phone, location: form.location,
                bio: form.bio, experience: form.experience, education: form.education,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                jobPreferences: {
                    desiredJobTitle: form.jpDesiredJobTitle,
                    jobType: form.jpJobType,
                    preferredLocation: form.jpPreferredLocation,
                    experienceLevel: form.jpExperienceLevel,
                    expectedSalary: form.jpExpectedSalary,
                    skills: form.jpSkills.split(',').map(s => s.trim()).filter(Boolean),
                    industry: form.jpIndustry,
                },
            };
            const res = await authAPI.updateProfile(data);
            updateUser(res.data.user);
            toast.success('Profile updated successfully!');
            setActiveTab('profile');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    if (authLoading || !user) return <div className="max-w-4xl mx-auto py-20 px-4"><div className="skeleton h-64 rounded-3xl" /></div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 fade-up">
            <div className="grid md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    <div className="glass-card p-6 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-blue-100 mx-auto mb-4">
                            {user.name?.[0].toUpperCase()}
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{user.name}</h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none bg-slate-50 py-1.5 px-3 rounded-full inline-block">
                            {user.role} Account
                        </p>
                    </div>

                    <nav className="glass-card p-2 space-y-1">
                        {[
                            { id: 'profile', label: 'My Profile', icon: User },
                            { id: 'applications', label: 'Applications', icon: FileText, hidden: user.role !== 'jobseeker' },
                            { id: 'settings', label: 'Edit Profile', icon: Settings },
                        ].filter(t => !t.hidden).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="glass-card p-8">
                                <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                                    <User size={20} className="text-blue-600" /> About Me
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500"><Mail size={18} /></div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Email Address</p>
                                                <p className="text-sm font-bold text-slate-800">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-violet-500"><Phone size={18} /></div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Phone</p>
                                                <p className="text-sm font-bold text-slate-800">{user.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-amber-500"><MapPin size={18} /></div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Location</p>
                                                <p className="text-sm font-bold text-slate-800">{user.location || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-green-500"><Briefcase size={18} /></div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Role</p>
                                                <p className="text-sm font-bold text-slate-800 capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {user.bio && (
                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{user.bio}</p>
                                    </div>
                                )}
                            </div>

                            {user.role === 'jobseeker' && (
                                <div className="glass-card p-8">
                                    <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                                        <FileText size={20} className="text-blue-600" /> Education & Experience
                                    </h3>
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">Skills & Tools</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills?.length > 0 ? user.skills.map(s => (
                                                    <span key={s} className="badge badge-blue py-1.5 px-4 font-bold">{s}</span>
                                                )) : <p className="text-xs font-bold text-slate-300 italic">No skills added yet</p>}
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">Work Experience</h4>
                                                <p className="text-sm font-bold text-slate-700">{user.experience || 'Not listed'}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">Educational Background</h4>
                                                <p className="text-sm font-bold text-slate-700">{user.education || 'Not listed'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Job Preferences Card */}
                            {user.role === 'jobseeker' && user.jobPreferences && (
                                <div className="glass-card p-8">
                                    <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                                        <Target size={20} className="text-violet-600" /> Job Preferences
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {user.jobPreferences.desiredJobTitle && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500"><Target size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Desired Role</p>
                                                    <p className="text-sm font-bold text-slate-800">{user.jobPreferences.desiredJobTitle}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user.jobPreferences.jobType && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500"><Briefcase size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Job Type</p>
                                                    <p className="text-sm font-bold text-slate-800 capitalize">{user.jobPreferences.jobType}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user.jobPreferences.preferredLocation && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500"><MapPin size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Preferred Location</p>
                                                    <p className="text-sm font-bold text-slate-800">{user.jobPreferences.preferredLocation}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user.jobPreferences.experienceLevel && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Clock size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Experience Level</p>
                                                    <p className="text-sm font-bold text-slate-800 capitalize">{user.jobPreferences.experienceLevel}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user.jobPreferences.expectedSalary && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><IndianRupee size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Expected Salary</p>
                                                    <p className="text-sm font-bold text-slate-800">{user.jobPreferences.expectedSalary}</p>
                                                </div>
                                            </div>
                                        )}
                                        {user.jobPreferences.industry && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500"><Building2 size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Preferred Industry</p>
                                                    <p className="text-sm font-bold text-slate-800">{user.jobPreferences.industry}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {user.jobPreferences.skills?.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Wrench size={12} /> Preferred Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {user.jobPreferences.skills.map(s => (
                                                    <span key={s} className="badge badge-blue py-1.5 px-4 font-bold">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold text-slate-900">Applied Jobs</h3>
                                <span className="badge badge-gray font-bold">{applications.length} Total</span>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="glass-card p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-xl font-extrabold text-slate-800">No applications yet</p>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Start your career journey by applying to jobs</p>
                                    <button onClick={() => navigate('/search')} className="btn-primary mt-8 text-xs px-8 py-3 uppercase tracking-widest font-extrabold">Find Jobs</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map(app => (
                                        <div key={app._id} className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/jobs/${app.jobId?._id}`} className="text-lg font-extrabold text-slate-900 hover:text-blue-600 block truncate">
                                                    {app.jobId?.title || 'Job Unavailable'}
                                                </Link>
                                                <p className="text-sm font-bold text-slate-500 mt-0.5">{app.jobId?.company}</p>
                                                <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} /> Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className={`badge ${app.status === 'hired' ? 'badge-green' :
                                                    app.status === 'rejected' ? 'badge-red' :
                                                        app.status === 'shortlisted' ? 'badge-blue' :
                                                            'badge-yellow'
                                                    } uppercase tracking-[0.1em] text-[10px] py-1.5 px-4 font-extrabold shadow-sm`}>
                                                    {app.status}
                                                </span>
                                                {app.status === 'pending' && <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Under Review</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                                <Settings size={20} className="text-blue-600" /> Edit Profile Details
                            </h3>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field font-semibold" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Primary Phone</label>
                                        <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field font-semibold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Location City</label>
                                        <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field font-semibold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Professional Email</label>
                                        <input type="email" value={form.email} className="input-field font-semibold bg-slate-50 cursor-not-allowed text-slate-400" disabled />
                                        <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">Email cannot be changed</p>
                                    </div>
                                </div>

                                {user.role === 'jobseeker' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Professional Summary</label>
                                            <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field font-semibold resize-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Skills (comma separated)</label>
                                            <input type="text" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Python..." className="input-field font-semibold" />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Experience Summary</label>
                                                <textarea rows={4} value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="input-field font-semibold resize-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Education Details</label>
                                                <textarea rows={4} value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className="input-field font-semibold resize-none" />
                                            </div>
                                        </div>
                                        {/* Job Preferences Section */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Target size={14} className="text-violet-500" /> Job Preferences
                                            </h4>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Desired Job Title</label>
                                                    <input type="text" value={form.jpDesiredJobTitle} onChange={e => setForm({ ...form, jpDesiredJobTitle: e.target.value })} placeholder="e.g. Frontend Developer" className="input-field font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Job Type</label>
                                                    <select value={form.jpJobType} onChange={e => setForm({ ...form, jpJobType: e.target.value })} className="input-field font-semibold">
                                                        <option value="">Select type</option>
                                                        <option value="full-time">Full-time</option>
                                                        <option value="part-time">Part-time</option>
                                                        <option value="contract">Contract</option>
                                                        <option value="internship">Internship</option>
                                                        <option value="freelance">Freelance</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Preferred Location</label>
                                                    <input type="text" value={form.jpPreferredLocation} onChange={e => setForm({ ...form, jpPreferredLocation: e.target.value })} placeholder="e.g. Mumbai, Remote" className="input-field font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Experience Level</label>
                                                    <select value={form.jpExperienceLevel} onChange={e => setForm({ ...form, jpExperienceLevel: e.target.value })} className="input-field font-semibold">
                                                        <option value="">Select level</option>
                                                        <option value="fresher">Fresher</option>
                                                        <option value="1-3 years">1-3 Years</option>
                                                        <option value="3-5 years">3-5 Years</option>
                                                        <option value="5-10 years">5-10 Years</option>
                                                        <option value="10+ years">10+ Years</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Expected Salary</label>
                                                    <input type="text" value={form.jpExpectedSalary} onChange={e => setForm({ ...form, jpExpectedSalary: e.target.value })} placeholder="e.g. ₹5-8 LPA" className="input-field font-semibold" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Preferred Industry</label>
                                                    <select value={form.jpIndustry} onChange={e => setForm({ ...form, jpIndustry: e.target.value })} className="input-field font-semibold">
                                                        <option value="">Select industry</option>
                                                        <option value="Information Technology">Information Technology</option>
                                                        <option value="Finance & Banking">Finance & Banking</option>
                                                        <option value="Healthcare">Healthcare</option>
                                                        <option value="Education">Education</option>
                                                        <option value="E-Commerce">E-Commerce</option>
                                                        <option value="Manufacturing">Manufacturing</option>
                                                        <option value="Marketing & Advertising">Marketing & Advertising</option>
                                                        <option value="Consulting">Consulting</option>
                                                        <option value="Real Estate">Real Estate</option>
                                                        <option value="Media & Entertainment">Media & Entertainment</option>
                                                        <option value="Logistics">Logistics</option>
                                                        <option value="Government">Government</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Preferred Skills (comma separated)</label>
                                                <input type="text" value={form.jpSkills} onChange={e => setForm({ ...form, jpSkills: e.target.value })} placeholder="React, Python, SQL..." className="input-field font-semibold" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 flex gap-4">
                                    <button type="submit" disabled={updating} className="btn-primary px-10 py-3.5 text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-blue-100 min-w-[160px]">
                                        {updating ? 'SAVING...' : 'SAVE CHANGES'}
                                    </button>
                                    <button type="button" onClick={() => setActiveTab('profile')} className="btn-secondary px-10 py-3.5 text-xs font-extrabold uppercase tracking-widest border-slate-200">
                                        CANCEL
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
