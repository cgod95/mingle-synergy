import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

const Home: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center px-4">
    <h1 className="text-4xl font-bold mb-4">Home Page</h1>
    <p className="mb-6 text-lg">Welcome to the app.</p>
  </div>
);

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
      <p className="mb-6 text-lg">Looks like you've wandered off the map.</p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
      >
        Go Home
      </button>
    </div>
  );
};

const NotFoundStandalone: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default NotFoundStandalone; 