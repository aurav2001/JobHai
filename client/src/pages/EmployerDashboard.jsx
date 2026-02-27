import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { employerAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
    Briefcase, Users, FileText, Plus, Search,
    TrendingUp, Clock, ChevronRight, MoreVertical,
    Edit, Trash2, Eye, MapPin, DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function EmployerDashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({ totalActive: 0, totalApplications: 0, newApplications: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'employer' && user?.role !== 'admin')) {
            navigate('/sign-in');
        } else if (user) {
            fetchData();
        }
    }, [user, authLoading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await employerAPI.listJobs();
            const jobList = res.data.jobs;
            setJobs(jobList);

            const totalApps = jobList.reduce((acc, j) => acc + (j.applicantCount || 0), 0);
            setStats({
                totalActive: jobList.filter(j => j.status === 'active').length,
                totalApplications: totalApps,
                newApplications: jobList.reduce((acc, j) => acc + (j.newApplicantCount || 0), 0)
            });
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Delete this job posting? This action cannot be undone.')) return;
        try {
            await employerAPI.deleteJob(id);
            toast.success('Job deleted');
            fetchData();
        } catch { toast.error('Failed to delete job'); }
    };

    const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (authLoading || loading) return <div className="max-w-7xl mx-auto py-20 px-4"><div className="skeleton h-64 rounded-3xl" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employer Hub</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your job postings and applications</p>
                </div>
                <Link to="/employer/post-job" className="btn-primary py-4 px-8 flex items-center justify-center gap-3 text-sm font-extrabold shadow-xl shadow-blue-100 uppercase tracking-widest">
                    <Plus size={20} strokeWidth={3} /> POST NEW JOB
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-6 border-l-4 border-blue-600">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase size={24} /></div>
                        <TrendingUp size={16} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{stats.totalActive}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Postings</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-violet-600">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl"><Users size={24} /></div>
                        <p className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">+{stats.newApplications} New</p>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{stats.totalApplications}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Applicants</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-600">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp size={24} /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">84%</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Response Rate</p>
                </div>
            </div>

            {/* Job List */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
                        Your Job Postings <span className="badge badge-gray text-[10px]">{jobs.length}</span>
                    </h2>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search your jobs..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input-field pl-12 py-2.5 text-sm font-semibold border-slate-200"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                <th className="px-6 py-4">Job Info</th>
                                <th className="px-6 py-4">Applicants</th>
                                <th className="px-6 py-4">Posted Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 rotate-12">
                                            <Briefcase size={32} />
                                        </div>
                                        <p className="text-slate-800 font-extrabold text-lg">No jobs found</p>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Get started by posting your first role</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map(job => (
                                    <tr key={job._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="min-w-[200px]">
                                                <p className="text-sm font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{job.title}</p>
                                                <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-slate-400">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                                    <span className="flex items-center gap-1 text-green-600"><DollarSign size={12} /> ₹{(job.salary?.min / 100000).toFixed(1)}L–{(job.salary?.max / 100000).toFixed(1)}L</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-extrabold text-slate-800">{job.applicantCount || 0}</div>
                                                {job.newApplicantCount > 0 && (
                                                    <span className="bg-green-100 text-green-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full">NEW</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Clock size={14} className="text-slate-300" />
                                                {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-gray'} text-[9px] py-1 px-3 font-extrabold uppercase tracking-widest`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/employer/post-job?edit=${job._id}`} className="p-2 border border-slate-100 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all shadow-blue-50">
                                                    <Edit size={16} />
                                                </Link>
                                                <Link to={`/jobs/${job._id}`} className="p-2 border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm transition-all shadow-blue-50">
                                                    <Eye size={16} />
                                                </Link>
                                                <button onClick={() => handleDeleteJob(job._id)} className="p-2 border border-slate-100 rounded-xl text-slate-500 hover:text-red-500 hover:bg-white hover:shadow-sm transition-all shadow-blue-50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
