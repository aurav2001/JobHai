import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function JobCard({ job }) {
    const formatSalary = (salary) => {
        if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
        const fmt = (n) => {
            if (n === 0) return '0';
            if (n < 1000) return `₹${n}L`;
            if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
            return `₹${(n / 1000).toFixed(0)}K`;
        };
        return `${fmt(salary.min)} – ${fmt(salary.max)} / yr`;
    };

    const typeLabels = {
        fulltime: 'Full Time',
        parttime: 'Part Time',
        wfh: 'Work from Home',
        contract: 'Contract',
        internship: 'Internship'
    };

    const typeColors = {
        fulltime: 'badge-blue',
        parttime: 'badge-purple',
        wfh: 'badge-green',
        contract: 'badge-yellow',
        internship: 'badge-blue'
    };

    return (
        <Link to={`/jobs/${job._id}`} className="block group">
            <div className="glass-card p-5 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                        {job.postedBy?.companyLogo ? (
                            <img src={job.postedBy.companyLogo} alt="" className="w-full h-full object-contain p-2" />
                        ) : (
                            <Building2 size={24} className="text-slate-300" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                    {job.title}
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 mt-0.5">
                                    {job.postedBy?.companyName || job.company}
                                </p>
                            </div>
                            <span className={`badge ${typeColors[job.type] || 'badge-gray'} text-[10px]`}>
                                {typeLabels[job.type] || job.type}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 mt-4 text-[13px] text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-blue-500" /> {job.location}
                            </div>
                            <div className="flex items-center gap-2 text-green-700 font-bold">
                                <DollarSign size={14} /> {formatSalary(job.salary)}
                            </div>
                            <div className="flex items-center gap-2 hidden sm:flex">
                                <Briefcase size={14} className="text-violet-500" /> {job.experience?.min}–{job.experience?.max} yrs
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1.5">
                                {(job.skills || []).slice(0, 3).map(skill => (
                                    <span key={skill} className="badge badge-gray text-[10px] py-1 px-2.5">{skill}</span>
                                ))}
                                {job.skills?.length > 3 && (
                                    <span className="text-[10px] font-bold text-slate-400 self-center">+{job.skills.length - 3}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                View Deal <ArrowRight size={14} />
                            </div>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> Posted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'recently'}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
