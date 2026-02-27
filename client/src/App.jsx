import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for better performance
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Profile = lazy(() => import('./pages/Profile'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const PostJob = lazy(() => import('./pages/PostJob'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/post-job" element={<PostJob />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<div className="py-20 text-center">Page Not Found</div>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
