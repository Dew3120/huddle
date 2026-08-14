'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { authApi, saveSession } from '@/lib/api';

interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm({
  onSwitchToSignup,
}: {
  onSwitchToSignup: () => void;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);

    try {
      const session = await authApi.login(
        data.email,
        data.password,
      );

      saveSession(session, data.remember);
      toast.success(
        `Welcome back, ${session.user.name}!`,
      );
      router.push('/kanban-board');
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to sign in',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slide-up">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Email address
          </label>

          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@yourteam.com"
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.email
                ? 'border-red-400 focus:ring-red-300'
                : 'border-border focus:border-primary'
            }`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message:
                  'Enter a valid email address',
              },
            })}
          />

          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="login-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="current-password"
              placeholder="Your password"
              className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.password
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-border focus:border-primary'
              }`}
              {...register('password', {
                required: 'Password is required',
              })}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            {...register('remember')}
          />

          <label
            htmlFor="remember"
            className="cursor-pointer text-sm text-muted-foreground"
          >
            Remember me for 30 days
          </label>
        </div>

        {errors.root && (
          <p className="text-sm text-red-500">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
              />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}