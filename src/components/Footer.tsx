import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="text-xs text-center text-gray-400 py-4">
      <div className="space-x-4">
        <Link to="/safety" className="hover:underline">Safety</Link>
        <Link to="/terms" className="hover:underline">Terms</Link>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
      </div>
    </footer>
  );
};

export default Footer; 