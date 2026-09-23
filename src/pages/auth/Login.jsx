import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiLock,
  FiMail,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiKey,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { DEMO_CREDENTIALS } from '../../data/mockAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // If already authenticated, redirect to /dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Administrative email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError('Please enter a valid format email (e.g. admin@tutoron.in).');
      return;
    }

    if (!password) {
      setFormError('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate authenticating against security gate
      await new Promise((res) => setTimeout(res, 500));
      await login(email, password, rememberMe);
      toast.success(
        'Access Granted',
        'Welcome to TutorOn India Super Admin Control Center.'
      );
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please check your credentials.');
      toast.error('Authentication Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setFormError('');
    toast.info('Demo Credentials Applied', 'Ready to sign in as Super Admin.');
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Missing Email', 'Please provide your registered administrative email.');
      return;
    }
    setShowForgotPassword(false);
    toast.success(
      'Recovery Instructions Sent',
      `Super Admin password reset protocol has been dispatched to ${forgotEmail}.`
    );
    setForgotEmail('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 selection:bg-[#123B66] selection:text-white">
      {/* Left Column: Visual Identity & Brand Canvas */}
      <div className="lg:w-1/2 bg-[#0B1F3A] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#1D4ED8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#123B66]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0B1F3A] flex items-center justify-center font-geist font-black text-xl shadow-lg">
              T
            </div>
            <div>
              <span className="font-geist font-bold text-xl tracking-tight text-white">
                TutorOn <span className="text-[#1D4ED8]">INDIA</span>
              </span>
              <p className="text-[11px] text-slate-300 font-mono tracking-wider uppercase">
                Enterprise EdTech Governance
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Value Proposition & Security Architecture */}
        <div className="relative z-10 my-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs border border-white/10">
            <FiShield className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Multi-Tier Security & Verification System</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-geist tracking-tight leading-tight text-white">
            Super Admin Control Center for India's Premier Tutoring Network.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Manage teacher certifications, orchestrate batch enrollments, oversee student safety, and govern contact disclosure workflows with enterprise compliance.
          </p>

          {/* Key pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FiCheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                <span>Teacher Verification SOP</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Rigorous degree, KYC, and credential audit pipelines.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FiLock className="text-[#1D4ED8] w-4 h-4 shrink-0" />
                <span>Protected Contact Disclosure</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero spam policy via admin-approved connection requests.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Version & Security Notice */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
          <span>TutorOn India Central Engine</span>
          <span className="font-mono text-[11px]">Phase 1 Architecture · Ready</span>
        </div>
      </div>

      {/* Right Column: Authentication Form Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-7">
          {/* Header & Role Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                TutorOn India
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#123B66]/10 text-[#0B1F3A] border border-[#123B66]/20">
                <FiShield className="w-3 h-3 text-[#123B66]" />
                Super Admin Access
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-geist text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in with your authorized administrator credentials to manage platform operations.
            </p>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <FiKey className="w-4 h-4 text-[#123B66] shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-800">Quick Test:</span>{' '}
                <span className="font-mono text-slate-600">admin@tutoron.in</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-[#123B66] hover:text-[#0B1F3A] hover:underline whitespace-nowrap cursor-pointer px-2 py-1 rounded bg-white border border-blue-200 shadow-2xs"
            >
              Fill Demo
            </button>
          </div>

          {/* Error alert banner */}
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-danger font-medium animate-slide-in">
              {formError}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4.5">
            <Input
              label="Administrative Email"
              type="email"
              required
              autoFocus
              placeholder="e.g. admin@tutoron.in"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError('');
              }}
              leftIcon={<FiMail className="w-4 h-4" />}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your administrative password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError('');
                }}
                leftIcon={<FiLock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#123B66] focus:ring-[#123B66] cursor-pointer"
                />
                <span>Remember this terminal</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="font-medium text-[#123B66] hover:text-[#0B1F3A] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<FiArrowRight className="w-4 h-4" />}
              className="mt-2"
            >
              Sign In to Super Admin
            </Button>
          </form>

          {/* Compliance & Security Guarantee */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authorized access only. All actions within the TutorOn India Super Admin portal are recorded in compliance with data protection policies.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        title="Reset Super Admin Password"
        description="Enter your registered administrative email to receive encrypted recovery instructions."
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowForgotPassword(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleForgotPasswordSubmit}
            >
              Send Reset Link
            </Button>
          </>
        }
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-1">
          <Input
            label="Registered Admin Email"
            type="email"
            required
            autoFocus
            placeholder="admin@tutoron.in"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            leftIcon={<FiMail className="w-4 h-4" />}
            helperText="A time-limited security authorization token will be dispatched."
          />
        </form>
      </Modal>
    </div>
  );
}

export default Login;
