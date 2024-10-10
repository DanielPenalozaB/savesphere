'use client';

import { useState, useEffect } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
}

export default function useWindowDimensions(): WindowDimensions {
  const [ windowDimensions, setWindowDimensions ] = useState<WindowDimensions>({
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      // Set initial dimensions
      handleResize();

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return windowDimensions;
}
