'use client';

import { motion } from 'framer-motion';
import { Music, Heart, Zap, Sun } from 'lucide-react';

export default function LoadingSpinner({ message = "Loading..." }) {
  const icons = [Music, Heart, Zap, Sun];
  
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Animated Icons */}
      <div className="relative w-32 h-32 mb-8">
        {icons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.2 },
              scale: { duration: 2, repeat: Infinity, delay: index * 0.3 }
            }}
            style={{
              transform: `rotate(${index * 90}deg) translateY(-40px) rotate(-${index * 90}deg)`
            }}
          >
            <Icon className="w-8 h-8 text-purple-600" />
          </motion.div>
        ))}
        
        {/* Center Spinner */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
        </motion.div>
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.p
          className="text-xl font-semibold text-gray-700 mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        
        <motion.div
          className="flex justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-600 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
