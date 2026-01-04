import { login, googleLoginWithCode, getGoogleLoginUrl } from '@/api';
import { logos } from '@/assets';
import { Button, HelmetWrapper, Input, toast } from '@/components';
import { useAuthStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Brain, Eye, EyeOff, Shield, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleGoogleCallback(code);
    }
  }, [searchParams]);

  const handleGoogleCallback = async (code: string) => {
    setIsGoogleLoading(true);
    try {
      const redirectUri = window.location.origin + '/login';
      const response = await googleLoginWithCode(code, redirectUri);
      await setAuth(response);
      toast({
        title: 'Success',
        description: response.is_new_user 
          ? 'Welcome! Your account has been created.' 
          : 'You have successfully logged in',
      });
      navigate('/vectix/dashboard');
    } catch (error: any) {
      toast({
        title: 'Google Login Failed',
        description: error?.response?.data?.detail || error.message || 'Failed to authenticate with Google',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async data => {
      await setAuth(data);
      toast({
        title: 'Success',
        description: 'You have successfully logged in',
      });
      navigate('/vectix/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Login Failed',
        description: error?.response?.data?.detail || error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const redirectUri = window.location.origin + '/login';
      const { url } = await getGoogleLoginUrl(redirectUri);
      window.location.href = url;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || error.message || 'Failed to initiate Google login',
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({ username, password });
  };

  return (
    <HelmetWrapper title="Login | VectiX">
      {/* Full screen container with premium gradient */}
      <div className="w-[96vw] h-[92vh] max-w-7xl flex bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-3xl mx-auto shadow-2xl border border-gray-700/50">
        
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center p-8 px-16 bg-black/40 backdrop-blur-xl max-w-1/2 rounded-l-3xl relative overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/40 rounded-full animate-ping delay-1000"></div>
            <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-60 left-1/3 w-1 h-1 bg-green-400/40 rounded-full animate-ping delay-700"></div>
          </div>

          <div className="w-full relative z-10">
            
            {/* Enhanced Header */}
            <div className="mb-12 text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <img src={logos.short.dark} alt="logo" className='h-14 w-14 drop-shadow-lg' />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    VectiX
                  </h1>
                  <div className="flex items-center gap-1 mt-1">
                    <Brain className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium">AI-Powered</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Access your AI dashboard and unlock insights</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Enhanced LDAP ID Field */}
              <div className="space-y-3">
                <label className="text-white text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Username
                </label>
                <div className="relative group">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-12 px-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                    autoComplete="ldapid"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-3">
                <label className="text-white text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Password
                </label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Enter your password"
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-gray-700/50"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Sign In Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 text-white font-semibold rounded-xl text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-[0.98] group"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                    Access Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Enhanced Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/40 text-gray-400 font-medium">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || mutation.isPending}
                  className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
                </Button>
              </div>
            </div>

            {/* Enhanced Create Account */}
            <div className="text-center mt-8">
              <span className="text-gray-400 text-sm">New to our platform? </span>
              <a 
                href="/signup" 
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
              >
                Signup
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced AI-focused Info Cards */}
        <div className="bg-black backdrop-blur-xl p-8 flex-1 rounded-r-3xl relative overflow-hidden">
          
          {/* AI-themed animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-16 left-16 w-32 h-32 border border-primary/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 border border-blue-400/20 rounded-full animate-ping duration-3000"></div>
            <div className="absolute top-1/2 right-16 w-16 h-16 border border-purple-400/30 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-24 right-1/3 w-20 h-20 border border-green-400/20 rounded-full animate-ping delay-2000 duration-4000"></div>
            <div className="absolute bottom-1/3 left-24 w-12 h-12 border border-yellow-400/20 rounded-full animate-pulse delay-500"></div>
            
            {/* Neural network lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              <defs>
                <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d="M100,150 Q300,100 500,200 T800,150"
                stroke="url(#neural-gradient)"
                strokeWidth="1"
                fill="none"
                className="animate-pulse"
              />
              <path
                d="M150,300 Q350,250 550,350 T850,300"
                stroke="url(#neural-gradient)"
                strokeWidth="1"
                fill="none"
                className="animate-pulse delay-1000"
              />
            </svg>
          </div>

          <div className="flex-1 bg-primary p-8 flex items-center justify-center relative overflow-hidden rounded-2xl min-h-full shadow-2xl">

             <div className="absolute top-0 right-0 z-20">
              <div className="w-30 h-30 bg-black rounded-bl-3xl"></div>
              <div className="absolute top-0 left-0 w-5 h-30 bg-primary rounded-tr-3xl"></div>
              <div className="absolute left-0 bottom-0 w-30 h-5 bg-primary rounded-tr-3xl"></div>
            </div>
            
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-12 left-12 w-28 h-28 border border-white rounded-full animate-spin duration-[20s]"></div>
              <div className="absolute bottom-24 right-24 w-20 h-20 border border-white rounded-full animate-spin duration-[15s] direction-reverse"></div>
              <div className="absolute top-1/2 right-12 w-14 h-14 border border-white rounded-full animate-spin duration-[25s]"></div>
              <div className="absolute top-20 right-1/3 w-16 h-16 border border-white rounded-full animate-spin duration-[18s] direction-reverse"></div>
              <div className="absolute bottom-1/3 left-20 w-10 h-10 border border-white rounded-full animate-spin duration-[22s]"></div>
            </div>

            <div className="relative z-10 w-full space-y-8">
              
              {/* Enhanced Main Card */}
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      AI-Powered Analytics
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white/80 text-sm font-medium">Live Insights</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-white/90 mb-8">
                  <p className="text-lg leading-relaxed">
                    "VectiX has transformed how we analyze data. The insights are incredibly accurate and save us hours of manual work every day."
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      SJ
                    </div>
                    <div>
                      <p className="text-white font-semibold">Sarah Johnson</p>
                      <p className="text-white/80 text-sm">Head of Analytics • TechCorp</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition-all duration-200 backdrop-blur-sm">
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <button className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition-all duration-200 backdrop-blur-sm">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Bottom Cards Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Stats Card */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">AI Performance</h3>
                        <p className="text-white/70 text-sm">Real-time metrics</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">98.7%</div>
                      <div className="text-green-400 text-xs font-medium">+12.3%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-white font-semibold text-sm">2.4K+</div>
                      <div className="text-white/60 text-xs">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-white font-semibold text-sm">15.2M</div>
                      <div className="text-white/60 text-xs">AI Queries</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Star className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-white font-semibold text-sm">4.9</div>
                      <div className="text-white/60 text-xs">AI Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default LoginPage;
