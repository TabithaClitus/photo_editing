
import React, { useState } from 'react';
import { CameraIcon } from './Icons';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <div className="w-full max-w-md p-8 space-y-8 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl animate-fadeIn">
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary mb-4">
                <CameraIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">STANfx</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Enter a username to access your personal photo studio.
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-light-surface dark:bg-secondary focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover transition duration-150 ease-in-out"
            >
              Enter Studio
            </button>
          </div>
        </form>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Your projects are saved locally in your browser.
        </p>
      </div>
    </div>
  );
};

export default Login;