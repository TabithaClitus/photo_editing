
import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Editor from './components/Editor';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('photo-editor-user');
    if (loggedInUser) {
      setUser(loggedInUser);
    }
     // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = useCallback((username: string) => {
    if (username.trim()) {
      localStorage.setItem('photo-editor-user', username);
      setUser(username);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('photo-editor-user');
    setUser(null);
  }, []);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Editor user={user} onLogout={handleLogout} />;
};

export default App;
