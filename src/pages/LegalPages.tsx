import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <nav className="mb-6 text-sm">
      <Link to="/terms" className="text-blue-600 hover:underline mr-4">Terms of Service</Link>
      <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
    </nav>
    {children}
  </div>
);

const TermsOfService: React.FC = () => (
  <Layout>
    <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
    <p className="mb-2">
      By using this app, you agree to abide by all the rules and expectations laid out in this Terms of Service.
    </p>
    <p>
      We may update these terms from time to time. Continued use of the service implies acceptance of any changes.
    </p>
  </Layout>
);

const PrivacyPolicy: React.FC = () => (
  <Layout>
    <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
    <p className="mb-2">
      We value your privacy. We only collect the data necessary to provide our services and never sell your information.
    </p>
    <p>
      You can contact us anytime to review or delete your data.
    </p>
  </Layout>
);

const LegalPages: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  </Router>
);

export default LegalPages; 