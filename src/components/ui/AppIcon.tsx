'use client';

import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';

type IconVariant = 'outline' | 'solid';
type HeroIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  variant?: IconVariant;
  size?: number;
  disabled?: boolean;
}

function Icon({
  name,
  variant = 'outline',
  size = 24,
  className = '',
  onClick,
  disabled = false,
  ...props
}: IconProps) {
  const iconSet = (variant === 'solid' ? HeroIconsSolid : HeroIcons) as unknown as Record<
    string,
    HeroIconComponent
  >;
  const IconComponent = iconSet[name];

  if (!IconComponent) {
    return (
      <QuestionMarkCircleIcon
        width={size}
        height={size}
        className={`text-gray-400 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
        onClick={disabled ? undefined : onClick}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={`${
        disabled ? 'cursor-not-allowed opacity-50' : onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${className}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
}

export default Icon;
