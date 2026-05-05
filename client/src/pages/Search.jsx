import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import JobCard from '../components/JobCard';
import { Search as SearchIcon, SlidersHorizontal, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const jobTypes = [
    { value: 'fulltime', label: 'Full Time' },
    { value: 'parttime', label: 'Part Time' },
    { value: 'wfh', label: 'Work from Home' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
];

const categories = ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Education', 'Sales', 'Engineering', 'Design', 'HR', 'Operations'];

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Filter states initialized from URL
    const [q, setQ] = useState(searchParams.get('q') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
    const [maxSalary, setMaxSalary] = useState(searchParams.get('maxSalary') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

    // Sync state with URL when URL changes (e.g. back button)
    useEffect(() => {
        setQ(searchParams.get('q') || '');
        setLocation(searchParams.get('location') || '');
        setType(searchParams.get('type') || '');
        setCategory(searchParams.get('category') || '');
        setMinSalary(searchParams.get('minSalary') || '');
        setMaxSalary(searchParams.get('maxSalary') || '');
        setSort(searchParams.get('sort') || 'latest');
        setPage(parseInt(searchParams.get('page')) || 1);
    }, [searchParams]);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { 
                page: searchParams.get('page') || 1, 
                limit: 20, 
                sort: searchParams.get('sort') || 'latest' 
            };
            
            const q_param = searchParams.get('q');
            const loc_param = searchParams.get('location');
            const type_param = searchParams.get('type');
            const cat_param = searchParams.get('category');
            const min_param = searchParams.get('minSalary');
            const max_param = searchParams.get('maxSalary');

            if (q_param) params.q = q_param;
            if (loc_param) params.location = loc_param;
            if (type_param) params.type = type_param;
            if (cat_param) params.category = cat_param;
            if (min_param) params.minSalary = min_param;
            if (max_param) params.maxSalary = max_param;

            const res = await jobsAPI.search(params);
            setJobs(res.data.jobs || []);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Search API Error:', err);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const updateFilters = (newFilters) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        params.set('page', '1'); // Reset to page 1 on filter change
        setSearchParams(params);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters({ q, location });
    };

    const handleReset = () => {
        setQ('');
        setLocation('');
        setType('');
        setCategory('');
        setMinSalary('');
        setMaxSalary('');
        setSearchParams({});
    };

    const FilterSidebarContent = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Job Type</h3>
                <div className="space-y-3">
                    {jobTypes.map(t => (
                        <label key={t.value} className="flex items-center gap-3 text-sm font-semibold text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                            <input type="radio" name="type" value={t.value} checked={type === t.value}
                                onChange={() => updateFilters({ type: t.value })} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                            {t.label}
                        </label>
                    ))}
                    {type && (
                        <button onClick={() => updateFilters({ type: '' })} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider mt-2">Clear</button>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Category</h3>
                <div className="space-y-1.5">
                    {categories.map(c => (
                        <button key={c} onClick={() => updateFilters({ category: category === c ? '' : c })}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${category === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Salary Range (₹ LPA)</h3>
                <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={minSalary} onChange={e => setMinSalary(e.target.value)}
                        className="input-field text-sm py-2.5 flex-1 font-semibold" />
                    <input type="number" placeholder="Max" value={maxSalary} onChange={e => setMaxSalary(e.target.value)}
                        className="input-field text-sm py-2.5 flex-1 font-semibold" />
                </div>
                <button onClick={() => updateFilters({ minSalary, maxSalary })} 
                    className="btn-primary w-full text-xs py-2.5 mt-4 shadow-md shadow-blue-50">Apply Salary</button>
            </div>

            <div className="pt-4">
                <button onClick={handleReset}
                    className="btn-secondary w-full text-xs py-3 font-bold flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> RESET ALL
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 fade-up">
            {/* Search bar */}
            <form onSubmit={handleSearch}
                className="bg-white border border-slate-200 rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row gap-3 mb-10">
                <div className="flex items-center gap-3 flex-1 px-3">
                    <SearchIcon size={18} className="text-slate-400" />
                    <input type="text" placeholder="Job title, skills or company..." value={q} onChange={e => setQ(e.target.value)}
                        className="bg-transparent flex-1 outline-none text-slate-800 placeholder-slate-400 text-sm font-semibold" />
                </div>
                <div className="hidden sm:block w-px bg-slate-200 my-1" />
                <div className="flex items-center gap-3 flex-1 px-3">
                    <span className="text-slate-400 font-bold">📍</span>
                    <input type="text" placeholder="Location..." value={location} onChange={e => setLocation(e.target.value)}
                        className="bg-transparent flex-1 outline-none text-slate-800 placeholder-slate-400 text-sm font-semibold" />
                </div>
                <button type="submit" className="btn-primary text-sm px-8 py-3 rounded-xl shadow-lg shadow-blue-100">Find Jobs</button>
            </form>

            <div className="flex gap-8">
                {/* Sidebar — desktop */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="glass-card p-6 sticky top-24">
                        <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                            <SlidersHorizontal size={18} className="text-blue-600" /> Filters
                        </h2>
                        <FilterSidebarContent />
                    </div>
                </aside>

                {/* Results */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 leading-none">
                                {loading ? 'Searching...' : `${pagination?.total || 0} Jobs Found`}
                            </h1>
                            {searchParams.get('q') && <p className="text-sm font-semibold text-slate-400 mt-2">Results for "<span className="text-blue-600">{searchParams.get('q')}</span>"</p>}
                        </div>
                        <div className="flex items-center gap-3">
                            <select value={sort} onChange={e => updateFilters({ sort: e.target.value })}
                                className="input-field text-sm py-2 w-auto pr-10 font-bold border-slate-200 shadow-sm">
                                <option value="latest">Sort: Newest First</option>
                                <option value="salary_high">Salary: High to Low</option>
                                <option value="salary_low">Salary: Low to High</option>
                            </select>
                            <button onClick={() => setFiltersOpen(true)}
                                className="lg:hidden btn-secondary text-sm py-2 px-4 flex items-center gap-2 font-bold">
                                <SlidersHorizontal size={14} /> Filters
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-24 glass-card">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SearchIcon size={32} className="text-slate-300" />
                            </div>
                            <p className="text-xl font-extrabold text-slate-800">No matching jobs found</p>
                            <p className="text-slate-400 font-medium mt-2 max-w-xs mx-auto">Try adjusting your filters or search keywords to find more opportunities.</p>
                            <button onClick={handleReset}
                                className="btn-secondary mt-8 text-sm font-bold">Clear All Filters</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map(job => <JobCard key={job._id} job={job} />)}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12 bg-white border border-slate-200 rounded-2xl p-3 inline-flex mx-auto shadow-sm">
                            <button onClick={() => updateFilters({ page: page - 1 })} disabled={!pagination.hasPrevPage}
                                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-bold text-slate-700">Page {pagination.page} of {pagination.totalPages}</span>
                            <button onClick={() => updateFilters({ page: page + 1 })} disabled={!pagination.hasNextPage}
                                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile filter drawer */}
            {filtersOpen && (
                <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
                    <div className="bg-slate-900/60 backdrop-blur-sm flex-1" onClick={() => setFiltersOpen(false)} />
                    <div className="bg-white w-80 p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                            <h2 className="text-xl font-extrabold text-slate-900">Filters</h2>
                            <button onClick={() => setFiltersOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800">
                                <X size={20} />
                            </button>
                        </div>
                        <FilterSidebarContent />
                    </div>
                </div>
            )}
        </div>
    );
}
