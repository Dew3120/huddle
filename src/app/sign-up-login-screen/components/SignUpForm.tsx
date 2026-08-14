'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { authApi, saveSession } from '@/lib/api';

interface SignUpValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function SignUpForm({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<SignUpValues>();

  const onSubmit = async (data: SignUpValues) => {
    setLoading(true);

    try {
      const session = await authApi.register(
        data.fullName,
        data.email,
        data.password,
      );

      saveSession(session);

      toast.success(
        'Account created! Welcome to Huddle.',
      );
      router.push('/kanban-board');
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to create account',
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
            htmlFor="signup-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Full name
          </label>

          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Kai Reyes"
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors.fullName
                ? 'border-red-400 focus:ring-red-300'
                : 'border-border focus:border-primary'
            }`}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message:
                  'Name must be at least 2 characters',
              },
            })}
          />

          {errors.fullName && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Work email
          </label>

          <input
            id="signup-email"
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
            htmlFor="signup-password"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Password
          </label>

          <p className="mb-1.5 text-xs text-muted-foreground">
            At least 8 characters with one uppercase letter
          </p>

          <div className="relative">
            <input
              id="signup-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              placeholder="Create a strong password"
              className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.password
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-border focus:border-primary'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message:
                    'Password must be at least 8 characters',
                },
                pattern: {
                  value: /[A-Z]/,
                  message:
                    'Include at least one uppercase letter',
                },
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

        <div>
          <label
            htmlFor="signup-confirm"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="signup-confirm"
              type={
                showConfirm
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.confirmPassword
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-border focus:border-primary'
              }`}
              {...register('confirmPassword', {
                required:
                  'Please confirm your password',
                validate: (value) =>
                  value === getValues('password') ||
                  'Passwords do not match',
              })}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirm(
                  (value) => !value,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirm
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showConfirm ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-border accent-primary"
            {...register('terms', {
              required:
                'You must accept the terms to continue',
            })}
          />

          <div>
            <label
              htmlFor="terms"
              className="cursor-pointer text-sm text-muted-foreground"
            >
              I agree to the{' '}
              <a
                href="#"
                className="text-primary hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
            </label>

            {errors.terms && (
              <p className="mt-1 text-xs text-red-500">
                {errors.terms.message}
              </p>
            )}
          </div>
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
              <span>Creating account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-primary hover:underline"
        >
          Log in
        </button>
      </p>
    </div>
  );
}