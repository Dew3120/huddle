'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import AppLogo from '@/components/ui/AppLogo';

export default function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-primary flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <AppLogo size={36} className="text-white" />
          <span className="font-semibold text-xl text-white tracking-tight">Huddle</span>
        </div>

        <div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Your team&apos;s work,<br />beautifully organized.
          </h1>
          <p className="text-base text-violet-200 leading-relaxed max-w-sm">
            Move tasks from idea to done. Huddle gives every teammate a clear view of what&apos;s in flight, what&apos;s next, and what&apos;s shipped.
          </p>
        </div>

        {/* Decorative card stack preview */}
        <div className="space-y-3">
          {[
            { title: 'Set up CI/CD pipeline', tag: 'DevOps', color: 'bg-amber-100 text-amber-800', initials: 'KR', bg: 'bg-violet-300' },
            { title: 'Redesign onboarding flow', tag: 'Design', color: 'bg-pink-100 text-pink-800', initials: 'SL', bg: 'bg-pink-300' },
            { title: 'Fix auth token refresh bug', tag: 'Backend', color: 'bg-green-100 text-green-800', initials: 'AP', bg: 'bg-green-300' },
          ].map((card) => (
            <div key={`preview-${card.title}`} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.color}`}>{card.tag}</span>
                <span className="text-sm font-medium text-white">{card.title}</span>
              </div>
              <div className={`w-7 h-7 rounded-full ${card.bg} flex items-center justify-center text-xs font-semibold text-white flex-shrink-0`}>
                {card.initials}
              </div>
            </div>
          ))}
          <p className="text-violet-300 text-xs mt-2">3 tasks in progress - Last updated just now</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-semibold text-lg text-foreground">Huddle</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tab === 'login' ? "Sign in to view your team's board." : 'Join your team on Huddle today.'}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-muted rounded-lg p-1 mb-8">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-150 ${
                tab === 'login' ?'bg-white text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-150 ${
                tab === 'signup' ?'bg-white text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm onSwitchToSignup={() => setTab('signup')} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
