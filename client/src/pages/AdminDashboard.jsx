import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { adminAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
    Users, Briefcase, FileText, CheckCircle, Clock,
    Search, ShieldCheck, Activity,
    TrendingUp, Trash2, ShieldAlert,
    BarChart3, UserCheck, UserX, ExternalLink,
    AlertCircle, Plus
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ role: '', isActive: '', isApproved: '' });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
            navigate('/sign-in');
        } else if (user) {
            handleInitialFetch();
        }
    }, [user, authLoading]);

    const handleInitialFetch = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchActivities()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await adminAPI.getStats();
            setStats(res.data.stats);
        } catch { toast.error('Failed to load stats'); }
    };

    const fetchActivities = async () => {
        try {
            const res = await adminAPI.getActivity();
            setActivities(res.data.activities);
        } catch { toast.error('Failed to load activities'); }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { search: searchQuery };
            if (filters.role) params.role = filters.role;
            if (filters.isActive) params.isActive = filters.isActive;
            const res = await adminAPI.getUsers(params);
            setUsers(res.data.users);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = { search: searchQuery };
            if (filters.isApproved) params.isApproved = filters.isApproved;
            const res = await adminAPI.getJobs(params);
            setJobs(res.data.jobs);
        } catch { toast.error('Failed to load jobs'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'jobs') fetchJobs();
    }, [activeTab, filters]);

    // Real-time search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'jobs') fetchJobs();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'jobs') fetchJobs();
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            await adminAPI.updateUser(userId, { isActive: !currentStatus });
            toast.success(`User ${currentStatus ? 'Blocked' : 'Unblocked'}`);
            fetchUsers();
            fetchActivities();
        } catch { toast.error('Action failed'); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await adminAPI.deleteUser(id);
            toast.success('User deleted');
            fetchUsers();
            fetchStats();
            fetchActivities();
        } catch { toast.error('Failed to delete user'); }
    };

    const handleApproveJob = async (id, isApproved) => {
        try {
            await adminAPI.approveJob(id, { isApproved, isActive: isApproved });
            toast.success(isApproved ? 'Job Approved & Live' : 'Job Rejected');
            fetchJobs();
            fetchStats();
            fetchActivities();
        } catch { toast.error('Action failed'); }
    };

    const handleDeleteJob = async (id) => {
        if (!confirm('Delete this job posting permanently?')) return;
        try {
            await adminAPI.deleteJob(id);
            toast.success('Job deleted');
            fetchJobs();
            fetchStats();
            fetchActivities();
        } catch { toast.error('Failed to delete job'); }
    };

    if (authLoading || (loading && activeTab === 'overview' && !stats)) {
        return (
            <div className="max-w-7xl mx-auto py-20 px-4">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 w-48 bg-slate-200 rounded-lg"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-3xl"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 fade-up">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Admin Console <ShieldCheck size={32} className="text-blue-600" />
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-3 bg-slate-100 inline-block px-3 py-1 rounded-full">
                        Platform Management & Analytics
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-[22px] shadow-inner">
                    {[
                        { id: 'overview', label: 'Stats', icon: BarChart3, count: '' },
                        { id: 'users', label: 'Users', icon: Users, count: stats?.totalUsers || 0 },
                        { id: 'jobs', label: 'Jobs', icon: Briefcase, count: stats?.totalJobs || 0 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {tab.count !== '' && <span className="ml-1 opacity-50">({tab.count})</span>}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'overview' && stats && (
                <div className="space-y-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Users', value: stats.totalUsers, sub: `${stats.employers} Employers`, icon: Users, color: 'blue', tab: 'users' },
                            { label: 'Active Jobs', value: stats.totalJobs, sub: 'Live Postings', icon: Briefcase, color: 'indigo', tab: 'jobs' },
                            { label: 'Applications', value: stats.totalApplications, sub: 'All-time', icon: FileText, color: 'amber' },
                            { label: 'Growth', value: stats.recentUsers, sub: 'Last 7 days', icon: TrendingUp, color: 'emerald' },
                        ].map(s => (
                            <div
                                key={s.label}
                                onClick={() => s.tab && setActiveTab(s.tab)}
                                className={`glass-card p-8 group transition-all ${s.tab ? 'cursor-pointer hover:border-blue-400' : 'hover:border-slate-200'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <s.icon size={22} />
                                </div>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{s.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500">{s.sub}</span>
                                    <Activity size={12} className="text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Activity Feed */}
                        <div className="lg:col-span-2 glass-card p-10">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    Recent Activity <Clock size={20} className="text-blue-600" />
                                </h2>
                                <button onClick={fetchActivities} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Refresh</button>
                            </div>

                            <div className="space-y-6">
                                {activities.length > 0 ? activities.map((act, i) => (
                                    <div key={i} className="flex items-start gap-5 p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all">
                                        <div className={`mt-1 p-2.5 rounded-xl ${act.type === 'user' ? 'bg-blue-50 text-blue-600' :
                                            act.type === 'job' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {act.type === 'user' ? <Users size={16} /> : act.type === 'job' ? <Briefcase size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{act.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                                <Clock size={10} /> {formatDistanceToNow(new Date(act.time))} ago
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 font-bold text-slate-300">No recent activity</div>
                                )}
                            </div>
                        </div>

                        {/* Quick Insights */}
                        <div className="space-y-8">
                            <div className="glass-card p-10 bg-slate-900 text-white border-0 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <h2 className="text-lg font-black tracking-tight mb-8">System Health</h2>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Database Status', status: 'Optimal', color: 'emerald' },
                                        { label: 'API Latency', status: '24ms', color: 'blue' },
                                        { label: 'Storage Used', status: '12%', color: 'amber' },
                                    ].map(i => (
                                        <div key={i.label} className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{i.label}</span>
                                            <span className={`text-[10px] font-black uppercase text-${i.color}-400`}>{i.status}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10 pt-8 border-t border-white/10">
                                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">View Logs</button>
                                </div>
                            </div>

                            <div className="glass-card p-8 bg-blue-50 border-blue-100">
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4">Pro Tip</h3>
                                <p className="text-xs text-blue-700 leading-relaxed font-bold">You can moderate jobs and manage users directly from the dedicated tabs. Banning a user will immediately revoke their access.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'users' || activeTab === 'jobs') && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Search ${activeTab}...`}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[22px] text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                />
                            </div>

                            {activeTab === 'users' && (
                                <select
                                    className="px-4 py-4 bg-white border border-slate-200 rounded-[22px] text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                    value={filters.role}
                                    onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}
                                >
                                    <option value="">All Roles</option>
                                    <option value="jobseeker">Jobseekers</option>
                                    <option value="employer">Employers</option>
                                    <option value="admin">Admins</option>
                                </select>
                            )}

                            {activeTab === 'jobs' && (
                                <select
                                    className="px-4 py-4 bg-white border border-slate-200 rounded-[22px] text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                    value={filters.isApproved}
                                    onChange={(e) => setFilters(f => ({ ...f, isApproved: e.target.value }))}
                                >
                                    <option value="">All Status</option>
                                    <option value="true">Approved</option>
                                    <option value="false">Pending</option>
                                </select>
                            )}
                            <button type="submit" className="px-8 bg-slate-100 text-slate-800 rounded-[22px] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">Filter</button>
                        </form>

                        <button
                            type="button"
                            onClick={() => navigate(activeTab === 'jobs' ? '/employer/post-job' : '/sign-up')}
                            className="px-8 bg-blue-600 text-white rounded-[22px] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={16} strokeWidth={3} /> {activeTab === 'jobs' ? 'Add Job' : 'Add User'}
                        </button>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                        <th className="px-8 py-6">{activeTab === 'users' ? 'Member Details' : 'Job / Company'}</th>
                                        <th className="px-8 py-6">{activeTab === 'users' ? 'Role & Status' : 'Approval Status'}</th>
                                        <th className="px-8 py-6">{activeTab === 'users' ? 'Joined' : 'Posted By'}</th>
                                        <th className="px-8 py-6 text-right">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeTab === 'users' ? users.map(u => (
                                        <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100 shadow-sm">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{u.name}</p>
                                                        <p className="text-[11px] text-slate-400 font-bold tracking-tight">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`badge ${u.role === 'employer' ? 'badge-violet' : u.role === 'admin' ? 'badge-red' : 'badge-blue'} text-[9px] font-black uppercase tracking-widest`}>
                                                        {u.role}
                                                    </span>
                                                    {!u.isActive && <span className="flex items-center gap-1 text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md"><ShieldAlert size={10} /> Blocked</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{new Date(u.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                                        className={`p-2.5 rounded-xl transition-all ${u.isActive ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                        title={u.isActive ? 'Block User' : 'Unblock User'}
                                                    >
                                                        {u.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u._id)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" title="Delete User">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : jobs.map(j => (
                                        <tr key={j._id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{j.title}</p>
                                                <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{j.company}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`badge ${j.isApproved ? 'badge-green' : 'badge-yellow'} text-[9px] font-black uppercase tracking-widest`}>
                                                    {j.isApproved ? 'Live & Approved' : 'Pending Review'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{j.postedBy?.name || 'Recruiter'}</p>
                                                <p className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-widest">{formatDistanceToNow(new Date(j.createdAt))} ago</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => window.open(`/jobs/${j._id}`, '_blank')} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all" title="Preview Job">
                                                        <ExternalLink size={18} />
                                                    </button>
                                                    {!j.isApproved ? (
                                                        <button onClick={() => handleApproveJob(j._id, true)} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all" title="Approve">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleApproveJob(j._id, false)} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all" title="Revoke Approval">
                                                            <AlertCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteJob(j._id)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" title="Delete Forever">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(activeTab === 'users' ? users : jobs).length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold">No results found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
