import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthContext = createContext(undefined);

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// API client class
class AuthAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    signup(email, password, name) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    }

    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    googleAuth(credential) {
        return this.request('/auth/google', {
            method: 'POST',
            body: JSON.stringify(credential),
        });
    }

    getCurrentUser(token) {
        return this.request('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

const authAPI = new AuthAPI(API_BASE_URL);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const storedToken = localStorage.getItem('kia_token');
            const storedUser = localStorage.getItem('kia_user');

            if (storedToken && storedUser) {
                try {
                    const currentUser = await authAPI.getCurrentUser(storedToken);
                    setToken(storedToken);
                    setUser(currentUser);
                } catch (error) {
                    localStorage.removeItem('kia_token');
                    localStorage.removeItem('kia_user');
                    console.error('Token validation failed:', error);
                }
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthSuccess = (authResponse) => {
        const { access_token, user: userData } = authResponse;

        setToken(access_token);
        setUser(userData);
        setError(null);

        localStorage.setItem('kia_token', access_token);
        localStorage.setItem('kia_user', JSON.stringify(userData));
    };

    const login = async (email, password) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await authAPI.login(email, password);
            handleAuthSuccess(response);
        } catch (error) {
            setError(error.message || 'Login failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = async (response) => {
        try {
            setIsLoading(true);
            setError(null);

            // Extract necessary fields from the response
            const { access_token, authuser, expires_in, scope, token_type, prompt } = response;

            const payload = {
                access_token,
                authuser,
                expires_in,
                scope,
                token_type,
                prompt,
            };

            console.log('payload', payload);

            const apiResponse = await authAPI.googleAuth(payload);
            console.log('apiResponse: ', apiResponse);
            handleAuthSuccess(apiResponse);
        } catch (error) {
            setError(error.message || 'Google login failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email, password, name) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await authAPI.signup(email, password, name);
            handleAuthSuccess(response);
        } catch (error) {
            setError(error.message || 'Signup failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setError(null);
        localStorage.removeItem('kia_token');
        localStorage.removeItem('kia_user');

        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    };

    const clearError = () => setError(null);

    const value = {
        user,
        isAuthenticated: !!user && !!token,
        token,
        login,
        googleLogin,
        signup,
        logout,
        isLoading,
        error,
        clearError,
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
        </GoogleOAuthProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};