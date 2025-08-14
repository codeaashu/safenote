// Authentication context to manage workspace sessions
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authenticatedWorkspaces, setAuthenticatedWorkspaces] = useState(new Set());

  useEffect(() => {
    // Load authenticated workspaces from sessionStorage
    const stored = sessionStorage.getItem('safenote_auth_workspaces');
    if (stored) {
      setAuthenticatedWorkspaces(new Set(JSON.parse(stored)));
    }
  }, []);

  const authenticateWorkspace = (username) => {
    const newSet = new Set(authenticatedWorkspaces);
    newSet.add(username.toLowerCase());
    setAuthenticatedWorkspaces(newSet);
    sessionStorage.setItem('safenote_auth_workspaces', JSON.stringify([...newSet]));
  };

  const isWorkspaceAuthenticated = (username) => {
    return authenticatedWorkspaces.has(username?.toLowerCase());
  };

  const logoutWorkspace = (username) => {
    const newSet = new Set(authenticatedWorkspaces);
    newSet.delete(username.toLowerCase());
    setAuthenticatedWorkspaces(newSet);
    sessionStorage.setItem('safenote_auth_workspaces', JSON.stringify([...newSet]));
  };

  const logoutAll = () => {
    setAuthenticatedWorkspaces(new Set());
    sessionStorage.removeItem('safenote_auth_workspaces');
  };

  return (
    <AuthContext.Provider value={{
      authenticateWorkspace,
      isWorkspaceAuthenticated,
      logoutWorkspace,
      logoutAll,
      authenticatedWorkspaces: [...authenticatedWorkspaces]
    }}>
      {children}
    </AuthContext.Provider>
  );
};
