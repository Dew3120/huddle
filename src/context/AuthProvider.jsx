import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearAuthToken,
  getAuthToken,
  isNetworkError,
  setAuthToken,
} from '../api/client.js';
import { getCurrentUser, loginUser, registerUser } from '../api/auth.js';
import { AuthContext } from './AuthContext.js';

const USER_STORAGE_KEY = 'huddle-user';

function getMessage(error) {
  return error?.message ?? 'Authentication failed.';
}

function readCachedUser() {
  if (typeof window === 'undefined' || !getAuthToken()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(USER_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function cacheUser(user) {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearCachedUser() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser);
  const [loading, setLoading] = useState(
    () => Boolean(getAuthToken()) && !readCachedUser(),
  );
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getAuthToken()) {
        clearCachedUser();
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
          cacheUser(currentUser);
          setError('');
        }
      } catch (restoreError) {
        const cachedUser = readCachedUser();

        if (!cancelled) {
          if (cachedUser && isNetworkError(restoreError)) {
            setUser(cachedUser);
            setError('');
          } else {
            clearAuthToken();
            clearCachedUser();
            setUser(null);
            setError(getMessage(restoreError));
          }
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
      clearCachedUser();
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
      cacheUser(result.user);
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
    clearCachedUser();
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
