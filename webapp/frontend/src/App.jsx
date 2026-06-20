// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Redact from './pages/Redact';
import History from './pages/History';
import Settings from './pages/Settings';
import Compliance from './pages/Compliance';
import SecureShare from './pages/SecureShare';
import SharedView from './pages/SharedView';
import BulkAudit from './pages/BulkAudit';

const P = ({ children }) => <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/shared/:id"  element={<SharedView />} />
          <Route path="/"            element={<P><Home /></P>} />
          <Route path="/scan"        element={<P><Scanner /></P>} />
          <Route path="/redact"      element={<P><Redact /></P>} />
          <Route path="/compliance"  element={<P><Compliance /></P>} />
          <Route path="/share"       element={<P><SecureShare /></P>} />
          <Route path="/bulk"        element={<P><BulkAudit /></P>} />
          <Route path="/history"     element={<P><History /></P>} />
          <Route path="/settings"    element={<P><Settings /></P>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
