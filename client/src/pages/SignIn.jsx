import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI, API_BASE_URL } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Briefcase, LogIn } from 'lucide-react';

export default function SignIn() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await authAPI.login(data);
            login(res.data.token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'employer') navigate('/employer/dashboard');
            else navigate('/profile');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-20 bg-slate-50 fade-up">
            <div className="glass-card p-10 w-full max-w-md shadow-2xl shadow-blue-50">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-6">
                        <div className="bg-blue-600 text-white rounded-xl p-2 shadow-lg shadow-blue-200">
                            <Briefcase size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-slate-900">Job<span className="text-blue-600">Hai</span></span>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-slate-900 leading-none">Welcome Back</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3">Sign in to your professional account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Professional Email</label>
                        <input type="email" placeholder="name@company.com"
                            {...register('email', { required: 'Professional email is required' })}
                            className="input-field text-base font-semibold" />
                        {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide mt-2 px-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Secret Password</label>
                            <Link to="/forgot-password" size="sm" className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-wider">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                                {...register('password', { required: 'Password is required' })}
                                className="input-field pr-12 text-base font-semibold" />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide mt-2 px-1">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm font-extrabold uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <><LogIn size={18} /> SIGN IN NOW</>
                        )}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-extrabold tracking-[0.2em] text-slate-300">
                        <span className="bg-white px-4">Secure OAuth</span>
                    </div>
                </div>

                <a href={`${API_BASE_URL}/auth/google`}
                    className="btn-secondary w-full py-3.5 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all border-slate-200">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    G-Authentication
                </a>

                <p className="text-center text-xs font-bold text-slate-400 mt-10 uppercase tracking-widest">
                    New to JobHai?{' '}
                    <Link to="/sign-up" className="text-blue-600 hover:underline">Join Now</Link>
                </p>
            </div>
        </div>
    );
}
