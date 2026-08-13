'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Check, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

const DEMO_CREDENTIALS = [
  { name: 'Kai Reyes', email: 'kai@huddle.dev', password: 'Huddle2026!' },
  { name: 'Sana Lim', email: 'sana@huddle.dev', password: 'Huddle2026!' },
  { name: 'Arjun Patel', email: 'arjun@huddle.dev', password: 'Huddle2026!' },
];

export default function LoginForm({
  onSwitchToSignup,
}: {
  onSwitchToSignup: () => void;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginValues>({ defaultValues: { remember: false } });

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const autofill = (cred: (typeof DEMO_CREDENTIALS)[0]) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
  };

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    const valid = DEMO_CREDENTIALS.find(
      (cred) => cred.email === data.email && cred.password === data.password,
    );

    if (!valid) {
      setLoading(false);
      setError('email', {
        message: 'Invalid credentials - use the demo accounts below to sign in',
      });
      return;
    }

    toast.success(`Welcome back, ${valid.name}!`);
    router.push('/kanban-board');
  };

  return (
    <div className="slide-up">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="login-email"
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@yourteam.com"
            className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
              errors.email
                ? 'border-red-400 focus:ring-red-300'
                : 'border-border focus:border-primary'
            }`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1.5">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="login-password"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                errors.password
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-border focus:border-primary'
              }`}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1.5">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-border accent-primary"
            {...register('remember')}
          />
          <label
            htmlFor="remember"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ minHeight: '42px' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-primary font-medium hover:underline"
        >
          Sign up
        </button>
      </p>

      <div className="mt-8 border border-border rounded-xl p-4 bg-muted/40">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Demo accounts - click to autofill
        </p>
        <div className="space-y-2">
          {DEMO_CREDENTIALS.map((cred) => (
            <div
              key={`demo-${cred.email}`}
              className="flex items-center justify-between gap-2 bg-white rounded-lg border border-border px-3 py-2 hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => autofill(cred)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {cred.name
                    .split(' ')
                    .map((name) => name[0])
                    .join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {cred.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cred.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopy(cred.email, `email-${cred.email}`);
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Copy email for ${cred.name}`}
                >
                  {copiedField === `email-${cred.email}` ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors font-medium">
                  Use
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}