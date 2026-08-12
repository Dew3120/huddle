'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
        </div>

        <h2 className="mb-2 text-2xl font-medium text-foreground">Page Not Found</h2>

        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
          >
            <Icon name="ArrowLeftIcon" size={16} />
            Go Back
          </button>

          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="HomeIcon" size={16} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
