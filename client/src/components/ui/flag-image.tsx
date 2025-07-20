import React, { useState, useEffect } from 'react';
import colombiaFlag from '@assets/colombia_1753044330762.png';
import guatemalaFlag from '@assets/guatemala_1753044330764.png';

interface FlagImageProps {
  src?: string;
  alt: string;
  countrySlug?: string;
  className?: string;
  onError?: () => void;
}

// Fallback flags for specific countries
const FALLBACK_FLAGS: Record<string, string> = {
  'COL': colombiaFlag,
  'GTM': guatemalaFlag,
  'colombia': colombiaFlag,
  'guatemala': guatemalaFlag,
};

export function FlagImage({ src, alt, countrySlug, className, onError }: FlagImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    if (src && src !== currentSrc) {
      setCurrentSrc(src);
      setHasError(false);
    }
  }, [src]);

  // Validate if the source is a valid image URL or base64
  const isValidImageSrc = (imageSrc: string | undefined): boolean => {
    if (!imageSrc || imageSrc.trim() === '') return false;
    
    // Check for base64 images
    if (imageSrc.startsWith('data:image/')) return true;
    
    // Check for valid URL patterns
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('/')) {
      return true;
    }
    
    // Check if it's an imported asset (should be a blob URL or file path)
    if (imageSrc.includes('blob:') || imageSrc.startsWith('/@') || imageSrc.includes('/assets/')) {
      return true;
    }
    
    return false;
  };

  const handleImageError = () => {
    console.warn(`Flag image failed to load: ${currentSrc}`, { alt, countrySlug });
    
    setHasError(true);
    
    // Try fallback flag if available
    if (countrySlug && FALLBACK_FLAGS[countrySlug] && currentSrc !== FALLBACK_FLAGS[countrySlug]) {
      console.log(`Using fallback flag for ${countrySlug}`);
      setCurrentSrc(FALLBACK_FLAGS[countrySlug]);
      setHasError(false);
      return;
    }

    // Try fallback by country name in alt text
    const countryName = alt.toLowerCase();
    for (const [key, fallbackSrc] of Object.entries(FALLBACK_FLAGS)) {
      if (countryName.includes(key.toLowerCase()) && currentSrc !== fallbackSrc) {
        console.log(`Using fallback flag for country name: ${countryName}`);
        setCurrentSrc(fallbackSrc);
        setHasError(false);
        return;
      }
    }

    if (onError) {
      onError();
    }
  };

  // Don't render if no valid source and no fallback available
  if (!isValidImageSrc(currentSrc) && hasError) {
    return null;
  }

  // Don't render if source is invalid from the start
  if (!isValidImageSrc(currentSrc)) {
    // Try to get fallback immediately
    if (countrySlug && FALLBACK_FLAGS[countrySlug]) {
      return (
        <img
          src={FALLBACK_FLAGS[countrySlug]}
          alt={alt}
          className={className}
          onError={handleImageError}
        />
      );
    }

    // Try by country name
    const countryName = alt.toLowerCase();
    for (const [key, fallbackSrc] of Object.entries(FALLBACK_FLAGS)) {
      if (countryName.includes(key.toLowerCase())) {
        return (
          <img
            src={fallbackSrc}
            alt={alt}
            className={className}
            onError={handleImageError}
          />
        );
      }
    }

    return null;
  }

  return (
    <img
      src={currentSrc!}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
}