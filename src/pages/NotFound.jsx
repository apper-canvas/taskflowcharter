import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

// Icon declarations
const HomeIcon = getIcon("Home");
const AlertTriangleIcon = getIcon("AlertTriangle");

const NotFound = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
    >
      <div className="relative mb-6">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="text-primary"
        >
          <AlertTriangleIcon className="w-24 h-24 sm:w-32 sm:h-32" />
        </motion.div>
      </div>
      
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        404
      </h1>
      
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
        Page Not Found
      </h2>
      
      <p className="text-surface-600 dark:text-surface-300 max-w-md mb-8 text-lg">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-soft"
      >
        <HomeIcon className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>
    </motion.div>
  );
};

export default NotFound;