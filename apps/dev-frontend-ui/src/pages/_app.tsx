import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactLenis } from '@studio-freight/react-lenis';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Suppress hydration warning for timestamp mismatches
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Warning: Text content did not match')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <ReactLenis root>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </ReactLenis>
  );
}
