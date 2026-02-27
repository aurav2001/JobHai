import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="bg-blue-600 text-white rounded-xl p-1.5">
                                <Briefcase size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">JobHai</span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            India's fastest growing job portal. Connecting millions of blue-collar and white-collar professionals with top employers.
                        </p>
                        <div className="flex space-x-4">
                            {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                                <button key={i} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                    <Icon size={16} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6">For Candidates</h3>
                        <ul className="space-y-4 text-sm">
                            {['Browse Jobs', 'Categories', 'Resume Builder', 'Job Alerts', 'Applied Jobs'].map(l => (
                                <li key={l}><Link to="/search" className="hover:text-blue-400 transition-colors uppercase tracking-wide text-xs font-semibold">{l}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6">For Employers</h3>
                        <ul className="space-y-4 text-sm">
                            {['Post a Job', 'Hire Talent', 'Employer Branding', 'Pricing'].map(l => (
                                <li key={l}><Link to="/sign-up" className="hover:text-blue-400 transition-colors uppercase tracking-wide text-xs font-semibold">{l}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Support</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3"><Mail size={16} className="text-blue-500" /> support@jobhai.com</li>
                            <li className="flex items-center gap-3"><Phone size={16} className="text-blue-500" /> +91 98765 43210</li>
                            <li className="flex items-center gap-3"><MapPin size={16} className="text-blue-500" /> Bengaluru, India</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
                    <p>© {new Date().getFullYear()} JobHai Site. All rights reserved.</p>
                    <div className="flex gap-8">
                        <button className="hover:text-slate-300">Privacy Policy</button>
                        <button className="hover:text-slate-300">Terms of Service</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
