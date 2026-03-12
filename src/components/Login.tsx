import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, Code2, Sparkles, Shield, Zap, Globe } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-purple-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

      <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Branding & Value Prop */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Next-Gen Collaboration</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl font-black text-white tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-purple-500">
              DevSync
            </h1>
            <p className="text-purple-200/60 text-xl font-light leading-relaxed max-w-md">
              The futuristic workspace where code meets collaboration. Build, debug, and deploy with your team in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-bold text-white">Real-time Sync</h3>
              <p className="text-xs text-purple-300/50">Zero latency collaborative editing.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Secure by Default</h3>
              <p className="text-xs text-purple-300/50">Enterprise-grade security rules.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-purple-900/20 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex justify-center">
                <div className="p-5 bg-purple-500/10 rounded-2xl border border-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Code2 className="w-12 h-12 text-purple-400" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-purple-300/50 text-sm">Sign in to access your projects</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={onLogin}
                  className="group w-full flex items-center justify-center gap-3 bg-white text-purple-950 font-bold py-4 px-8 rounded-xl hover:bg-purple-50 transition-all shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] active:scale-[0.98]"
                >
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Continue with Google
                </button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-purple-500 font-bold tracking-widest">Trusted By Teams</span></div>
                </div>

                <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                  <Globe className="w-6 h-6 text-white" />
                  <Zap className="w-6 h-6 text-white" />
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
          </div>
          
          <p className="mt-8 text-center text-purple-400/30 text-xs">
            By continuing, you agree to DevSync's Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
