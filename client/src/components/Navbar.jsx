import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
    Menu, X, Briefcase, User, LogOut, LayoutDashboard,
    Settings, ChevronDown, UserPlus, LogIn
} from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const navLinks = [
        { href: '/search', label: 'Find Jobs' },
        { href: '/resume-builder', label: 'Resume Builder' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 text-white rounded-xl p-1.5 shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                                <Briefcase size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">
                                Job<span className="text-blue-600">Hai</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {user?.role === 'employer' && (
                                <Link to="/employer/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-semibold text-slate-600 hover:text-blue-600">
                                    Employer Hub
                                </Link>
                            )}
                            {(user?.role === 'employer' || user?.role === 'admin') && (
                                <Link to="/employer/post-job" className="inline-flex items-center px-1 pt-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                                    Post a Job
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex md:items-center md:gap-4">
                        {!isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link to="/sign-in" className="btn-secondary py-2 px-5 flex items-center gap-2">
                                    <LogIn size={16} /> Login
                                </Link>
                                <Link to="/sign-up" className="btn-primary py-2 px-5 flex items-center gap-2">
                                    <UserPlus size={16} /> Sign Up
                                </Link>
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            getInitials(user.name)
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[-1]" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-56 glass-card py-2 shadow-xl border-slate-200 animate-in fade-in slide-in-from-top-2">
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                                                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{user.email}</p>
                                            </div>
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                <User size={16} /> My Profile
                                            </Link>
                                            {(user.role === 'employer' || user.role === 'admin') && (
                                                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/employer/dashboard'} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                    <LayoutDashboard size={16} /> Dashboard
                                                </Link>
                                            )}
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {menuOpen && (
                <div className="md:hidden glass-card mx-4 mb-4 border-slate-200 shadow-xl animate-in slide-in-from-top-4">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block px-3 py-3 rounded-xl text-base font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-slate-100 px-4">
                        {!isAuthenticated ? (
                            <div className="flex flex-col gap-3">
                                <Link to="/sign-in" onClick={() => setMenuOpen(false)} className="btn-secondary w-full text-center py-3">Login</Link>
                                <Link to="/sign-up" onClick={() => setMenuOpen(false)} className="btn-primary w-full text-center py-3">Sign Up</Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                                    {getInitials(user.name)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                                <button onClick={handleLogout} className="ml-auto p-2 text-red-500">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
