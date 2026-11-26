import { useState } from 'react';
import variants from './image-variants.json';
import imageSizes from './image-sizes.json';

export default function ResponsiveImage({ src, sizeHint = 'card', responsive = true, onError, ...props }) {
  const [failedVariant, setFailedVariant] = useState(null);
  const originalOnly = failedVariant === src;
  const entry = variants[src];
  const optimized = responsive && entry && !originalOnly;
  return <img {...props} src={src}
    width={entry?.width} height={entry?.height}
    srcSet={optimized ? entry.variants.map(image => `${image.src} ${image.width}w`).join(', ') : undefined}
    sizes={optimized ? imageSizes[sizeHint] || sizeHint : undefined}
    decoding="async"
    onError={event => {
      if (optimized) setFailedVariant(src);
      else onError?.(event);
    }} />;
}
