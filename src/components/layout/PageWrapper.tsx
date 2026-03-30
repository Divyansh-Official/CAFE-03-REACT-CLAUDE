import React from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children, className = '', fullWidth = false
}) => {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`min-h-screen bg-surface relative z-10 ${className}`}
    >
      {fullWidth ? children : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      )}
    </motion.main>
  );
};

export default PageWrapper;
