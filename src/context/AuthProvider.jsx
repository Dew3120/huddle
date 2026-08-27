import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '../api/client.js';
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../api/auth.js';
import { AuthContext } from './AuthContext.js';

function getMessage(error) {
  return error?.message ?? 'Authentication failed.';
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getAuthToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getAuthToken()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (restoreError) {
        clearAuthToken();

        if (!cancelled) {
          setError(getMessage(restoreError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleExpiredSession() {
      setUser(null);
      setError('Your session expired. Please log in again.');
    }

    window.addEventListener('auth:expired', handleExpiredSession);

    return () => {
      window.removeEventListener('auth:expired', handleExpiredSession);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setError('');

    try {
      const result = await loginUser(credentials);
      setAuthToken(result.token);
      setUser(result.user);

      return result.user;
    } catch (loginError) {
      setError(getMessage(loginError));
      throw loginError;
    }
  }, []);

  const register = useCallback(
    async (credentials) => {
      setError('');

      try {
        await registerUser(credentials);
        return login(credentials);
      } catch (registerError) {
        setError(getMessage(registerError));
        throw registerError;
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setError('');
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading, error, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
