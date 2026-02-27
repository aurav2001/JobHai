import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Plus, X, Download, Briefcase, User, Mail, Phone, MapPin } from 'lucide-react';

const emptyResume = {
    name: '', email: '', phone: '', location: '', summary: '',
    experience: [{ title: '', company: '', from: '', to: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    skills: [],
    links: { linkedin: '', github: '', portfolio: '' },
};

export default function ResumeBuilder() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [resume, setResume] = useState(emptyResume);
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) navigate('/sign-in');
        const saved = localStorage.getItem('jh_resume');
        if (saved) {
            try { setResume(JSON.parse(saved)); } catch { }
        } else if (user) {
            setResume(r => ({ ...r, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
        }
    }, [user, authLoading]);

    const save = (updated) => { setResume(updated); localStorage.setItem('jh_resume', JSON.stringify(updated)); };
    const set = (field, value) => save({ ...resume, [field]: value });

    const addExperience = () => save({ ...resume, experience: [...resume.experience, { title: '', company: '', from: '', to: '', description: '' }] });
    const updateExperience = (i, field, value) => { const exp = [...resume.experience]; exp[i] = { ...exp[i], [field]: value }; save({ ...resume, experience: exp }); };
    const removeExperience = (i) => save({ ...resume, experience: resume.experience.filter((_, idx) => idx !== i) });

    const addEducation = () => save({ ...resume, education: [...resume.education, { degree: '', institution: '', year: '' }] });
    const updateEducation = (i, field, value) => { const edu = [...resume.education]; edu[i] = { ...edu[i], [field]: value }; save({ ...resume, education: edu }); };
    const removeEducation = (i) => save({ ...resume, education: resume.education.filter((_, idx) => idx !== i) });

    const addSkill = () => { if (skillInput.trim()) { save({ ...resume, skills: [...resume.skills, skillInput.trim()] }); setSkillInput(''); } };

    const handlePrint = () => {
        const w = window.open('', '_blank');
        w.document.write(`
      <html><head><title>${resume.name || 'Resume'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
        body { padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; }
        h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #2563eb; border-bottom: 2px solid #dbeafe; padding-bottom: 4px; margin: 20px 0 12px; }
        .contact { color: #64748b; font-size: 13px; margin-bottom: 16px; }
        .contact span { margin-right: 12px; }
        .summary { color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 8px; }
        .entry { margin-bottom: 14px; }
        .entry-header { display: flex; justify-content: space-between; }
        .entry-title { font-weight: 600; font-size: 15px; }
        .entry-sub { color: #64748b; font-size: 13px; }
        .entry-desc { color: #475569; font-size: 13px; line-height: 1.5; margin-top: 4px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill { background: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .links { color: #2563eb; font-size: 13px; }
        .links a { margin-right: 16px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>${resume.name}</h1>
      <div class="contact">
        ${resume.email ? `<span>📧 ${resume.email}</span>` : ''}
        ${resume.phone ? `<span>📱 ${resume.phone}</span>` : ''}
        ${resume.location ? `<span>📍 ${resume.location}</span>` : ''}
      </div>
      ${resume.summary ? `<h2>Summary</h2><p class="summary">${resume.summary}</p>` : ''}
      ${resume.experience.length ? `<h2>Experience</h2>${resume.experience.map(e => `
        <div class="entry"><div class="entry-header"><span class="entry-title">${e.title}</span><span class="entry-sub">${e.from}${e.to ? ' – ' + e.to : ''}</span></div>
        <div class="entry-sub">${e.company}</div>${e.description ? `<div class="entry-desc">${e.description}</div>` : ''}</div>`).join('')}` : ''}
      ${resume.education.length ? `<h2>Education</h2>${resume.education.map(e => `
        <div class="entry"><div class="entry-header"><span class="entry-title">${e.degree}</span><span class="entry-sub">${e.year}</span></div>
        <div class="entry-sub">${e.institution}</div></div>`).join('')}` : ''}
      ${resume.skills.length ? `<h2>Skills</h2><div class="skills">${resume.skills.map(s => `<span class="skill">${s}</span>`).join('')}</div>` : ''}
      ${(resume.links?.linkedin || resume.links?.github || resume.links?.portfolio) ? `<h2>Links</h2><div class="links">
        ${resume.links.linkedin ? `<a href="${resume.links.linkedin}">LinkedIn</a>` : ''}
        ${resume.links.github ? `<a href="${resume.links.github}">GitHub</a>` : ''}
        ${resume.links.portfolio ? `<a href="${resume.links.portfolio}">Portfolio</a>` : ''}
      </div>` : ''}
      </body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); }, 400);
    };

    if (authLoading) return <div className="max-w-4xl mx-auto py-20 px-4"><div className="skeleton h-64 rounded-3xl" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 fade-up">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Resume Builder</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Construct your professional narrative</p>
                </div>
                <button onClick={handlePrint} className="btn-primary flex items-center gap-2 py-4 px-8 text-sm font-extrabold uppercase tracking-widest shadow-xl shadow-blue-100">
                    <Download size={20} strokeWidth={3} /> PDF
                </button>
            </div>

            <div className="space-y-10">
                {/* Personal Info */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                        <User size={20} className="text-blue-600" /> Identity
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6 font-bold">
                        <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Full Name *</label>
                            <input value={resume.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" className="input-field" />
                        </div>
                        <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Professional Email *</label>
                            <input type="email" value={resume.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="input-field" />
                        </div>
                        <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Phone Contact</label>
                            <input value={resume.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className="input-field" />
                        </div>
                        <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Location City</label>
                            <input value={resume.location} onChange={e => set('location', e.target.value)} placeholder="Mumbai, India" className="input-field" />
                        </div>
                        <div className="sm:col-span-2"><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Executive Summary</label>
                            <textarea rows={3} value={resume.summary} onChange={e => set('summary', e.target.value)}
                                placeholder="A compelling overview of your career and skills…" className="input-field resize-none leading-relaxed" />
                        </div>
                    </div>
                </div>

                {/* Experience */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <Briefcase size={20} className="text-violet-600" /> Career History
                        </h2>
                        <button onClick={addExperience} className="text-xs font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1"><Plus size={16} /> ADD POSITION</button>
                    </div>
                    <div className="space-y-6">
                        {resume.experience.map((exp, i) => (
                            <div key={i} className="relative bg-slate-50 border border-slate-100 rounded-[24px] p-6 lg:p-8">
                                <button onClick={() => removeExperience(i)} className="absolute top-6 right-6 p-2 bg-white text-slate-300 hover:text-red-500 rounded-xl hover:shadow-sm transition-all"><X size={18} /></button>
                                <div className="grid sm:grid-cols-2 gap-6 font-bold">
                                    <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Designation</label>
                                        <input value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} placeholder="Role title" className="input-field text-sm" />
                                    </div>
                                    <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Organization</label>
                                        <input value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} placeholder="Company" className="input-field text-sm" />
                                    </div>
                                    <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">From</label>
                                        <input value={exp.from} onChange={e => updateExperience(i, 'from', e.target.value)} placeholder="Month Year" className="input-field text-sm" />
                                    </div>
                                    <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">To</label>
                                        <input value={exp.to} onChange={e => updateExperience(i, 'to', e.target.value)} placeholder="Present" className="input-field text-sm" />
                                    </div>
                                    <div className="sm:col-span-2"><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Key Responsibilities</label>
                                        <textarea rows={3} value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)}
                                            placeholder="Highlights of your tenure..." className="input-field text-sm resize-none" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            Academic Background
                        </h2>
                        <button onClick={addEducation} className="text-xs font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1"><Plus size={16} /> ADD DEGREE</button>
                    </div>
                    <div className="space-y-6">
                        {resume.education.map((edu, i) => (
                            <div key={i} className="relative bg-slate-50 border border-slate-100 rounded-[24px] p-6 font-bold">
                                <button onClick={() => removeEducation(i)} className="absolute top-6 right-6 p-2 bg-white text-slate-300 hover:text-red-500 rounded-xl hover:shadow-sm transition-all"><X size={18} /></button>
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Degree</label>
                                        <input value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="CS, B.Tech" className="input-field text-sm" />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Institute</label>
                                        <input value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} placeholder="College / Uni" className="input-field text-sm" />
                                    </div>
                                    <div><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Passing Year</label>
                                        <input value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} placeholder="2022" className="input-field text-sm" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                        Skillsets & Tools
                    </h2>
                    <div className="flex gap-2 mb-6">
                        <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            placeholder="e.g. React, Node.js, UI/UX..." className="input-field text-sm font-bold flex-1" />
                        <button onClick={addSkill} className="btn-secondary py-2 px-6 shadow-sm"><Plus size={20} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {resume.skills.map((s, i) => (
                            <span key={i} className="badge badge-blue flex items-center gap-3 pl-4 pr-3 py-2 font-bold shadow-sm">{s}
                                <button onClick={() => save({ ...resume, skills: resume.skills.filter((_, idx) => idx !== i) })} className="p-0.5 bg-blue-100 rounded-md text-blue-600 hover:bg-blue-200"><X size={10} /></button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div className="glass-card p-8 font-bold">
                    <h2 className="text-lg font-extrabold text-slate-900 mb-8">Professional Links</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {['linkedin', 'github', 'portfolio'].map(field => (
                            <div key={field}><label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">{field}</label>
                                <input value={resume.links?.[field] || ''} onChange={e => save({ ...resume, links: { ...resume.links, [field]: e.target.value } })} placeholder={`https://${field}.com/...`} className="input-field text-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
