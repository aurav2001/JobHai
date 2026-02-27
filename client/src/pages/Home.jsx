import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, MapPin, ArrowRight, Briefcase, Users, Building2, Star, CheckCircle } from 'lucide-react';

const categories = [
    { label: 'Technology', icon: '💻', count: '12,400+' },
    { label: 'Marketing', icon: '📢', count: '3,200+' },
    { label: 'Finance', icon: '💰', count: '4,800+' },
    { label: 'Healthcare', icon: '🏥', count: '5,100+' },
    { label: 'Education', icon: '📚', count: '2,600+' },
    { label: 'Sales', icon: '🤝', count: '6,900+' },
    { label: 'Engineering', icon: '⚙️', count: '7,300+' },
    { label: 'Design', icon: '🎨', count: '2,100+' },
];

const stats = [
    { value: '2.5M+', label: 'Active Jobs', icon: Briefcase },
    { value: '8M+', label: 'Job Seekers', icon: Users },
    { value: '80K+', label: 'Companies', icon: Building2 },
    { value: '1.2M+', label: 'Placements', icon: Star },
];

const howItWorks = [
    { step: '01', title: 'Create Profile', desc: 'Sign up and build your professional profile with skills, experience, and resume.' },
    { step: '02', title: 'Search & Apply', desc: 'Find relevant jobs using smart filters. Apply with one click using your profile.' },
    { step: '03', title: 'Get Hired', desc: 'Connect with recruiters, attend interviews, and begin your dream career.' },
];

export default function Home() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (keyword) params.set('q', keyword);
        if (location) params.set('location', location);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="fade-up">
            {/* Hero */}
            <section className="hero-gradient py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-1.5 rounded-full mb-6 font-semibold">
                        <CheckCircle size={14} /> India's #1 Job Portal · 2.5M+ Live Jobs
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
                        Find Your <span className="gradient-text">Dream Job</span><br />
                        in India
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 font-medium">
                        Connect with top employers. Discover opportunities across every industry, location, and experience level.
                    </p>

                    {/* Search bar */}
                    <form onSubmit={handleSearch}
                        className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
                        <div className="flex items-center gap-2.5 flex-1 px-3">
                            <SearchIcon size={18} className="text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Job title, skills, or company..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                className="flex-1 outline-none text-slate-800 text-sm placeholder-slate-400 bg-transparent font-medium"
                            />
                        </div>
                        <div className="hidden sm:block w-px bg-slate-200 my-2" />
                        <div className="flex items-center gap-2.5 flex-1 px-3">
                            <MapPin size={18} className="text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="City, state, or 'Remote'"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className="flex-1 outline-none text-slate-800 text-sm placeholder-slate-400 bg-transparent font-medium"
                            />
                        </div>
                        <button type="submit" className="btn-primary px-8 py-3 text-sm rounded-xl whitespace-nowrap">
                            Search Jobs
                        </button>
                    </form>

                    <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm text-slate-400 font-bold uppercase tracking-wider">
                        <span>Trending:</span>
                        {['React Developer', 'Data Analyst', 'Product Manager', 'Nurse', 'Sales Executive'].map(t => (
                            <button key={t} onClick={() => { setKeyword(t); }}
                                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4">{t}</button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-white border-y border-slate-200 py-12">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map(s => (
                        <div key={s.label} className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3">
                                <s.icon size={22} />
                            </div>
                            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Browse By Category</h2>
                        <p className="text-slate-500 font-medium">Find jobs in your field of expertise</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {categories.map(cat => (
                            <Link key={cat.label} to={`/search?category=${cat.label}`}
                                className="glass-card p-6 flex flex-col items-center text-center hover:border-blue-300 hover:shadow-xl transition-all group cursor-pointer">
                                <span className="text-3xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-wide">{cat.label}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{cat.count} jobs</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-white border-y border-slate-200 py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">How It Works</h2>
                        <p className="text-slate-500 font-medium">Get hired in 3 simple steps</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {howItWorks.map((step, i) => (
                            <div key={step.step} className="text-center relative">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-2xl font-extrabold mb-6 shadow-xl shadow-blue-200">
                                    {step.step}
                                </div>
                                {i < howItWorks.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-[65%] w-[35%] h-px border-t-2 border-dashed border-blue-200" />
                                )}
                                <h3 className="font-bold text-slate-900 text-lg mb-3 uppercase tracking-wide">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl shadow-blue-200 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 relative z-10">Hiring? Post a Job Today</h2>
                        <p className="text-blue-100 mb-10 max-w-lg mx-auto font-medium text-lg relative z-10">
                            Reach over 8 million active job seekers. Post jobs, manage applications, and find your next great hire — all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                            <Link to="/sign-up"
                                className="bg-white text-blue-600 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                                Post a Job Free
                            </Link>
                            <Link to="/sign-up"
                                className="bg-white/10 hover:bg-white/20 border-2 border-white/30 px-10 py-4 rounded-xl transition-colors font-bold flex items-center gap-2 justify-center backdrop-blur-sm">
                                Learn More <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
