'use client';

import * as React from 'react';
import Image, { ImageProps } from 'next/image';

export const LazyImage = React.memo(function LazyImage(props: ImageProps) {
  return <Image {...props} loading="lazy" />;
});
