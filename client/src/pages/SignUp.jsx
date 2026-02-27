import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Briefcase, UserPlus, ArrowRight, ArrowLeft, Target, MapPin, Clock, IndianRupee, Wrench, Building2 } from 'lucide-react';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const EXP_LEVELS = ['fresher', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const INDUSTRIES = [
    'Information Technology', 'Finance & Banking', 'Healthcare', 'Education',
    'E-Commerce', 'Manufacturing', 'Marketing & Advertising', 'Consulting',
    'Real Estate', 'Media & Entertainment', 'Logistics', 'Government', 'Other'
];

export default function SignUp() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm({
        defaultValues: { role: 'jobseeker' }
    });

    const role = watch('role');
    const totalSteps = role === 'jobseeker' ? 2 : 1;

    const handleNext = async () => {
        const isValid = await trigger(['name', 'email', 'password', ...(role === 'employer' ? ['companyName'] : [])]);
        if (isValid) {
            if (role === 'jobseeker') {
                setStep(2);
            }
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                companyName: data.companyName,
            };

            // Attach job preferences for jobseekers
            if (data.role === 'jobseeker') {
                payload.jobPreferences = {
                    desiredJobTitle: data.desiredJobTitle || '',
                    jobType: data.jobType || '',
                    preferredLocation: data.preferredLocation || '',
                    experienceLevel: data.experienceLevel || '',
                    expectedSalary: data.expectedSalary || '',
                    skills: data.prefSkills ? data.prefSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
                    industry: data.industry || '',
                };
            }

            const res = await authAPI.signup(payload);
            login(res.data.token, res.data.user);
            toast.success(`Account created! Welcome, ${res.data.user.name.split(' ')[0]}!`);
            if (data.role === 'employer') navigate('/employer/dashboard');
            else navigate('/profile');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-20 bg-slate-50 fade-up">
            <div className="glass-card p-10 w-full max-w-lg shadow-2xl shadow-blue-50">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-6">
                        <div className="bg-blue-600 text-white rounded-xl p-2 shadow-lg shadow-blue-200">
                            <Briefcase size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-slate-900">Job<span className="text-blue-600">Hai</span></span>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-slate-900 leading-none">
                        {step === 1 ? 'Join the Network' : 'Job Preferences'}
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3">
                        {step === 1 ? 'Create your professional profile today' : 'Tell us what you\'re looking for'}
                    </p>
                </div>

                {/* Step indicator */}
                {role === 'jobseeker' && (
                    <div className="flex items-center gap-3 mb-8">
                        {[1, 2].map(s => (
                            <div key={s} className="flex-1 flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${s <= step ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                                    {s}
                                </div>
                                <div className={`flex-1 h-1 rounded-full transition-all ${s < step ? 'bg-blue-600' : s === step ? 'bg-blue-200' : 'bg-slate-100'}`} />
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* ── STEP 1: Basic Info ───────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-4">Account Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${role === 'jobseeker' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                            <input type="radio" value="jobseeker" {...register('role')} className="hidden" />
                                            <span className={`text-sm font-extrabold ${role === 'jobseeker' ? 'text-blue-600' : 'text-slate-500'}`}>Job Seeker</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">I want to find works</span>
                                        </label>
                                        <label className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${role === 'employer' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                            <input type="radio" value="employer" {...register('role')} className="hidden" />
                                            <span className={`text-sm font-extrabold ${role === 'employer' ? 'text-blue-600' : 'text-slate-500'}`}>Employer</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">I want to hire talent</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Full Name</label>
                                    <input type="text" placeholder="John Doe"
                                        {...register('name', { required: 'Name is required' })}
                                        className="input-field text-base font-semibold" />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide mt-2 px-1">{errors.name.message}</p>}
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Email Address</label>
                                    <input type="email" placeholder="john@example.com"
                                        {...register('email', { required: 'Email is required' })}
                                        className="input-field text-base font-semibold" />
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide mt-2 px-1">{errors.email.message}</p>}
                                </div>

                                {role === 'employer' && (
                                    <div className="col-span-2">
                                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Company Name</label>
                                        <input type="text" placeholder="Acme Inc."
                                            {...register('companyName', { required: role === 'employer' ? 'Company name is required' : false })}
                                            className="input-field text-base font-semibold" />
                                        {errors.companyName && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide mt-2 px-1">{errors.companyName.message}</p>}
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Strong Password</label>
                                    <div className="relative">
                                        <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 chars' } })}
                                            className="input-field pr-12 text-base font-semibold" />
                                        <button type="button" onClick={() => setShowPass(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide mt-2 px-1">{errors.password.message}</p>}
                                </div>
                            </div>

                            {role === 'jobseeker' ? (
                                <button type="button" onClick={handleNext}
                                    className="btn-primary w-full py-4 text-sm font-extrabold uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                                    <span>NEXT — JOB PREFERENCES</span> <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button type="submit" disabled={loading}
                                    className="btn-primary w-full py-4 text-sm font-extrabold uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <><UserPlus size={18} /> CREATE ACCOUNT</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── STEP 2: Job Preferences (Jobseeker only) ───── */}
                    {step === 2 && role === 'jobseeker' && (
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                    <Target size={14} className="text-blue-500" /> Desired Job Title / Role
                                </label>
                                <input type="text" placeholder="e.g. Frontend Developer, Data Analyst"
                                    {...register('desiredJobTitle')}
                                    className="input-field text-base font-semibold" />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                        <Briefcase size={14} className="text-violet-500" /> Job Type
                                    </label>
                                    <select {...register('jobType')} className="input-field text-sm font-semibold">
                                        <option value="">Select type</option>
                                        {JOB_TYPES.map(t => (
                                            <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                        <Clock size={14} className="text-amber-500" /> Experience Level
                                    </label>
                                    <select {...register('experienceLevel')} className="input-field text-sm font-semibold">
                                        <option value="">Select level</option>
                                        {EXP_LEVELS.map(l => (
                                            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                        <MapPin size={14} className="text-green-500" /> Preferred Location
                                    </label>
                                    <input type="text" placeholder="e.g. Mumbai, Remote, Bangalore"
                                        {...register('preferredLocation')}
                                        className="input-field text-sm font-semibold" />
                                </div>
                                <div>
                                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                        <IndianRupee size={14} className="text-emerald-500" /> Expected Salary
                                    </label>
                                    <input type="text" placeholder="e.g. ₹5-8 LPA"
                                        {...register('expectedSalary')}
                                        className="input-field text-sm font-semibold" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                    <Wrench size={14} className="text-rose-500" /> Key Skills
                                </label>
                                <input type="text" placeholder="e.g. React, Python, SQL (comma separated)"
                                    {...register('prefSkills')}
                                    className="input-field text-sm font-semibold" />
                                <p className="text-[9px] font-bold text-slate-300 mt-1.5 uppercase tracking-wider px-1">Separate skills with commas</p>
                            </div>

                            <div>
                                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                    <Building2 size={14} className="text-sky-500" /> Preferred Industry
                                </label>
                                <select {...register('industry')} className="input-field text-sm font-semibold">
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map(i => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(1)}
                                    className="btn-secondary flex-1 py-4 text-sm font-extrabold uppercase tracking-widest border-slate-200 flex items-center justify-center gap-2">
                                    <ArrowLeft size={18} /> BACK
                                </button>
                                <button type="submit" disabled={loading}
                                    className="btn-primary flex-[2] py-4 text-sm font-extrabold uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <><UserPlus size={18} /> CREATE ACCOUNT</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <p className="text-center text-xs font-bold text-slate-400 mt-10 uppercase tracking-widest">
                    Already have an account?{' '}
                    <Link to="/sign-in" className="text-blue-600 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
