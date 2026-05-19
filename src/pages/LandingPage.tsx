import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, TrendingUp, Users, Zap } from 'lucide-react';
import api from '../api/axios';
import Logo from '../components/Logo';
import { API_PATHS } from '../constants/apiPaths';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        navigate('/home');
        return;
      }

      try {
        const response = await api.post(API_PATHS.AUTH.REFRESH_TOKEN);
        const { accessToken } = response.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          navigate('/home');
        }
      } catch (error) {
        console.log("No active session found");
      }
    };

    checkAuth();
  }, [navigate]);
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home">
              <Logo className="w-10 h-10" />
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#popular" className="hover:text-indigo-600 transition-colors">Popular</a>
              <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Sign In</Link>
              <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100">
            <Zap className="w-3 h-3" />
            <span>Launch your blog in seconds</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Where your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">stories</span> find <br className="hidden md:block" /> their perfect home.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
            BroBlog is the modern publishing platform for creative thinkers. Share your insights, grow your audience, and build a beautiful home for your writing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              Start Writing Now <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-all shadow-sm">
              Explore Community
            </button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full -z-10"></div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop"
                alt="Dashboard Preview"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to thrive</h2>
            <p className="text-slate-600">Powerful tools for creators who want to make an impact.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Rich Editor", description: "Write with a clean, distraction-free editor that supports markdown and media." },
              { icon: TrendingUp, title: "Analytics", description: "Deep insights into your readers' behavior and post performance." },
              { icon: Users, title: "Community", description: "Connect with other writers and build a loyal following for your work." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md group">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <feature.icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo className="w-8 h-8" />
          <p className="text-sm text-slate-500">© 2024 BroBlog. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
