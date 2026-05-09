import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { resetPassword } from '../api/auth';
import Logo from '../components/Logo';
import { resetPasswordSchema } from '../validators/auth.validator';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; otp?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = resetPasswordSchema.safeParse({ email, otp, password });
    if (!result.success) {
      const newErrors: { password?: string; otp?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === 'password' || err.path[0] === 'otp') {
          newErrors[err.path[0] as keyof typeof newErrors] = err.message;
        }
      });
      setFieldErrors(newErrors);
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ password: "Passwords do not match" });
      return;
    }

    setFieldErrors({});

    setIsLoading(true);
    setError(null);
    try {
      await resetPassword({ email, otp, password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: "Password reset successful! Please log in with your new password." } });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo className="w-14 h-14" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter the 6-digit OTP sent to your email and choose a new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Password Reset!</h3>
              <p className="text-slate-600 mb-6">
                Your password has been successfully updated.
              </p>
              <div className="animate-pulse text-indigo-600 font-medium">Redirecting to login...</div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`block w-full px-3 py-3 border ${fieldErrors.otp ? 'border-red-300 ring-red-100' : 'border-slate-200 ring-indigo-50'} rounded-xl text-center text-2xl font-bold tracking-[0.5em] text-slate-900 focus:outline-none focus:ring-4 focus:border-indigo-500 transition-all`}
                  placeholder="000000"
                />
                {fieldErrors.otp && (
                  <p className="mt-1 text-sm text-red-600 text-center">{fieldErrors.otp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${fieldErrors.password ? 'border-red-300 ring-red-100' : 'border-slate-200 ring-indigo-50'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:border-indigo-500 transition-all sm:text-sm`}
                    placeholder="••••••••"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  disabled={isLoading || otp.length !== 6 || !password}
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <Link
              to="/forgot-password"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
