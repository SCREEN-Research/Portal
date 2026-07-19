import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Landing } from './components/Landing';
import { ToastProvider } from './components/ui/Toast';
import { LockScreen } from './components/LockScreen';

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setRole } = useWorkspace();

  const handleAuthenticate = () => {
    setRole(null);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LockScreen onAuthenticate={handleAuthenticate} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/workspace/:tab?" element={<Dashboard />} />
        <Route path="/:tab" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <WorkspaceProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </WorkspaceProvider>
    </ErrorBoundary>
  );
}

export default App;
