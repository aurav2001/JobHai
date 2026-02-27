import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
import {
    MapPin, Clock, DollarSign, Building2, Phone, Mail, Share2,
    CheckCircle, ExternalLink, Users, Calendar, Briefcase, Code, Award, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeLabels = { fulltime: 'Full Time', parttime: 'Part Time', wfh: 'Work from Home', contract: 'Contract', internship: 'Internship' };
const typeColors = { fulltime: 'badge-blue', parttime: 'badge-purple', wfh: 'badge-green', contract: 'badge-yellow', internship: 'badge-blue' };

const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return null;
    const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
    return `${fmt(salary.min)} – ${fmt(salary.max)} / year`;
};

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [job, setJob] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const res = await jobsAPI.getById(id);
            setJob(res.data.job);
            setHasApplied(res.data.hasApplied);
        } catch {
            navigate('/search');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return navigate('/sign-in');
        if (user.role !== 'jobseeker') return toast.error('Only job seekers can apply');

        setApplying(true);
        try {
            const formData = new FormData();
            formData.append('jobId', id);
            if (coverLetter) formData.append('coverLetter', coverLetter);
            if (resumeFile) formData.append('resume', resumeFile);

            await jobsAPI.apply(formData);
            setHasApplied(true);
            setShowApplyForm(false);
            toast.success('Application submitted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        } catch { }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="skeleton h-48 rounded-3xl" />
                    <div className="skeleton h-96 rounded-3xl" />
                </div>
                <div className="skeleton h-72 rounded-3xl" />
            </div>
        </div>
    );

    if (!job) return null;

    const salary = formatSalary(job.salary);
    const employer = job.postedBy;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 fade-up">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Job Header */}
                    <div className="glass-card p-8 group">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                                {employer?.companyLogo ? (
                                    <img src={employer.companyLogo} alt="" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <Building2 size={32} className="text-slate-200" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`badge ${typeColors[job.type] || 'badge-gray'} uppercase tracking-widest text-[10px]`}>
                                        {typeLabels[job.type] || job.type}
                                    </span>
                                    {job.category && (
                                        <span className="badge badge-gray uppercase tracking-widest text-[10px]">{job.category}</span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                                    {job.title}
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <p className="text-lg font-bold text-slate-500">{employer?.companyName || job.company}</p>
                                    {employer?.companyWebsite && (
                                        <a href={employer.companyWebsite} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-blue-600 hover:underline">
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50 text-sm font-semibold text-slate-600">
                            {job.location && <div className="flex items-center gap-3"><MapPin size={18} className="text-blue-500" /> {job.location}</div>}
                            {salary && <div className="flex items-center gap-3 text-green-700 font-extrabold"><DollarSign size={18} /> {salary}</div>}
                            {job.experience && <div className="flex items-center gap-3"><Briefcase size={18} className="text-violet-500" /> {job.experience.min}–{job.experience.max} Years Experience</div>}
                            {job.openings && <div className="flex items-center gap-3"><Users size={18} className="text-amber-600" /> {job.openings} Opening{job.openings > 1 ? 's' : ''}</div>}
                            {job.deadline && <div className="flex items-center gap-3 text-red-600"><Calendar size={18} /> Apply by {new Date(job.deadline).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>}
                            <div className="flex items-center gap-3 text-slate-400 font-medium"><Clock size={18} /> Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-600 rounded-full"></span> Job Description
                        </h2>
                        <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-medium">{job.description}</div>
                    </div>

                    {/* Requirements */}
                    {job.requirements?.length > 0 && (
                        <div className="glass-card p-8">
                            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                                <Award size={20} className="text-blue-500" /> Key Requirements
                            </h2>
                            <ul className="space-y-4">
                                {job.requirements.map((r, i) => (
                                    <li key={i} className="flex items-start gap-3 text-base text-slate-700 font-medium">
                                        <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" /> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Skills */}
                    {job.skills?.length > 0 && (
                        <div className="glass-card p-8">
                            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                                <Code size={20} className="text-violet-500" /> Skills & Expertise
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {job.skills.map(s => (
                                    <span key={s} className="badge badge-blue py-2 px-5 text-sm font-bold shadow-sm">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hiring Insights */}
                    <div className="glass-card p-8">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                            Hiring Insights
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-bold">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Applicants</p>
                                <p className="text-slate-900 text-lg">{job.applicantCount || 0}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Views</p>
                                <p className="text-slate-900 text-lg">{job.views || 0}</p>
                            </div>
                            {job.education && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:col-span-2 lg:col-span-1">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Education</p>
                                    <p className="text-slate-900 text-lg line-clamp-1">{job.education}</p>
                                </div>
                            )}
                            {employer?.industry && (
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Industry</p>
                                    <p className="text-slate-900 text-lg truncate">{employer.industry}</p>
                                </div>
                            )}
                        </div>

                        {job.recruiterContact?.name && (
                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Hiring Manager</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                                        {job.recruiterContact.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-base font-extrabold text-slate-800">{job.recruiterContact.name}</p>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                                            {job.recruiterContact.phone && (
                                                <a href={`tel:${job.recruiterContact.phone}`} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                                    <Phone size={14} /> {job.recruiterContact.phone}
                                                </a>
                                            )}
                                            {job.recruiterContact.email && (
                                                <a href={`mailto:${job.recruiterContact.email}`} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                                    <Mail size={14} /> {job.recruiterContact.email}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Apply Card */}
                    <div className="glass-card p-6 sticky top-24 shadow-2xl shadow-blue-50">
                        {hasApplied ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-500" />
                                </div>
                                <p className="text-xl font-extrabold text-slate-900 leading-none">Already Applied</p>
                                <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">Check your dashboard for updates</p>
                                <Link to="/profile" className="btn-secondary w-full py-3 text-xs font-bold mt-6 block uppercase tracking-widest">View Status</Link>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => isAuthenticated ? setShowApplyForm(true) : navigate('/sign-in')}
                                    className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-extrabold shadow-xl shadow-blue-200">
                                    APPLY FOR JOB
                                </button>
                                {!isAuthenticated && (
                                    <p className="text-[10px] uppercase font-bold text-slate-400 text-center mt-4 tracking-wider">
                                        Must be <Link to="/sign-in" className="text-blue-600 hover:underline">logged in</Link> as Job Seeker
                                    </p>
                                )}
                            </>
                        )}
                        <button onClick={handleShare}
                            className="btn-secondary w-full py-3 text-sm mt-3 flex items-center justify-center gap-2 font-bold uppercase tracking-wider">
                            <Share2 size={16} /> Share Posting
                        </button>
                    </div>

                    {/* Company Card */}
                    {employer && (
                        <div className="glass-card p-6">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">About the Company</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                                    {employer.companyLogo ? (
                                        <img src={employer.companyLogo} alt="" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Building2 size={24} className="text-slate-200" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-base font-extrabold text-slate-800 leading-tight">{employer.companyName}</p>
                                    {employer.industry && <p className="text-xs font-bold text-blue-600 mt-0.5">{employer.industry}</p>}
                                </div>
                            </div>
                            {employer.companyDescription && (
                                <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-4">{employer.companyDescription}</p>
                            )}
                            {employer.companySize && (
                                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    <Users size={14} className="text-slate-300" /> {employer.companySize} Employees
                                </div>
                            )}
                            <Link to={`/search?q=${employer.companyName}`} className="btn-secondary w-full py-2.5 text-[10px] font-bold mt-6 block text-center uppercase tracking-widest">
                                More from this Company
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Modal */}
            {showApplyForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowApplyForm(false)} />
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-xl border border-slate-100 relative z-10 animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowApplyForm(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Apply for Role</h2>
                        <p className="text-slate-400 font-semibold mb-8">{job.title} at {job.company}</p>

                        <form onSubmit={handleApply} className="space-y-6">
                            <div>
                                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Upload Custom Resume</label>
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer group relative">
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 text-slate-400 group-hover:text-blue-600 transition-colors">
                                            <ExternalLink size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">{resumeFile ? resumeFile.name : 'Choose file or drag & drop'}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-1">PDF, DOC, DOCX up to 5MB</p>
                                    </div>
                                </div>
                                {user?.resumeUrl && !resumeFile && (
                                    <p className="text-xs font-bold text-green-600 mt-4 flex items-center gap-2 bg-green-50 py-2 px-4 rounded-xl">
                                        <CheckCircle size={14} /> System will use your profile resume
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Cover Letter <span className="text-slate-300">(Optional)</span></label>
                                <textarea rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                                    placeholder="Tell the hiring manager why you're interested and what value you bring..."
                                    className="input-field text-base font-medium resize-none" />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button type="submit" disabled={applying} className="btn-primary flex-1 py-4 text-sm font-extrabold uppercase tracking-widest shadow-xl shadow-blue-200">
                                    {applying ? 'SUBMITTING...' : 'SEND APPLICATION'}
                                </button>
                                <button type="button" onClick={() => setShowApplyForm(false)} className="btn-secondary flex-1 py-4 text-sm font-bold uppercase tracking-widest">
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
