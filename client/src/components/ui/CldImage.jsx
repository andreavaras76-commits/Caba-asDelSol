import { useState } from 'react';
import { cld, cldSrcSet } from '@/utils/cloudinary';

/**
 * <img> optimizada para Cloudinary: f_auto, q_auto, srcSet responsivo y lazy loading.
 * `priority` la carga de inmediato (para el hero / LCP).
 */
export default function CldImage({
  src,
  alt = '',
  width = 1200,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className = '',
  imgClassName = '',
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  if (!src) return null;
  return (
    <span className={`relative block overflow-hidden bg-piedra-light ${className}`}>
      <img
        src={cld(src, { width, crop: 'limit' })}
        srcSet={cldSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        {...rest}
      />
    </span>
  );
}
