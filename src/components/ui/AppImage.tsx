'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';

type NextImageProps = React.ComponentProps<typeof Image>;

interface AppImageProps
  extends Omit<
    NextImageProps,
    | 'src'
    | 'alt'
    | 'width'
    | 'height'
    | 'className'
    | 'priority'
    | 'quality'
    | 'placeholder'
    | 'blurDataURL'
    | 'fill'
    | 'sizes'
    | 'onClick'
    | 'loading'
    | 'unoptimized'
    | 'onError'
    | 'onLoad'
  > {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
}

const AppImage = memo(function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = '/assets/images/no_image.png',
  loading = 'lazy',
  unoptimized = false,
  style,
  ...props
}: AppImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isExternalUrl = useMemo(() => imageSrc.startsWith('http'), [imageSrc]);
  const resolvedUnoptimized = unoptimized || isExternalUrl;

  const handleError = useCallback(() => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }

    setIsLoading(false);
  }, [hasError, imageSrc, fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const imageClassName = useMemo(() => {
    const classes = [className];

    if (isLoading) classes.push('bg-gray-200');
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');

    return classes.filter(Boolean).join(' ');
  }, [className, isLoading, onClick]);

  if (fill) {
    return (
      <div className="relative" style={{ width: '100%', height: '100%' }}>
        <Image
          src={imageSrc}
          alt={alt}
          className={imageClassName}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
          unoptimized={resolvedUnoptimized}
          onError={handleError}
          onLoad={handleLoad}
          onClick={onClick}
          priority={priority}
          loading={priority ? undefined : loading}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          style={{ objectFit: 'cover', ...style }}
          {...props}
        />
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={imageClassName}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
      unoptimized={resolvedUnoptimized}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      priority={priority}
      loading={priority ? undefined : loading}
      width={width || 400}
      height={height || 300}
      sizes={sizes}
      style={style}
      {...props}
    />
  );
});

AppImage.displayName = 'AppImage';

export default AppImage;
