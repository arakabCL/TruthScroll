import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <motion.main
      className="not-found-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
    >
      <p className="not-found-kicker">Oops</p>
      <h1>This path is missing.</h1>
      <p className="not-found-copy">
        Tibbee could not find this room. Let&apos;s head back to the desk and choose a safe path.
      </p>
      <Link to="/" className="not-found-cta">
        Back to Desk
      </Link>
    </motion.main>
  );
};

export default NotFound;
