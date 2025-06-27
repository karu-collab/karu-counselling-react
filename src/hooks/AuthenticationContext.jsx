import { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthContext = createContext(undefined);

// Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
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

    googleAuth(credential) {
        return this.request('/auth/google', {
            method: 'POST',
            body: JSON.stringify(credential),
        });
    }
}

const authAPI = new AuthAPI(API_BASE_URL);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on app load
    useEffect(() => {
        const initializeAuth = () => {
            try {
                // Restore both user and token
                const storedUser = localStorage.getItem('karu_user');
                const storedToken = localStorage.getItem('karu_token');

                if (storedUser && storedToken) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setToken(storedToken);
                } else {
                    // Clear any partial data
                    if (storedUser) localStorage.removeItem('karu_user');
                    if (storedToken) localStorage.removeItem('karu_token');
                }
            } catch (error) {
                console.error('Error parsing stored auth data:', error);
                // Clear corrupted data
                localStorage.removeItem('karu_user');
                localStorage.removeItem('karu_token');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const handleAuthSuccess = (authResponse) => {
        const { access_token, user: userData } = authResponse;

        console.log('Handling auth success:', { access_token, userData });

        setToken(access_token);
        setUser(userData);
        setError(null);

        // Store both token and user
        localStorage.setItem('karu_token', access_token);
        localStorage.setItem('karu_user', JSON.stringify(userData));
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

            console.log('Google login payload:', payload);

            const apiResponse = await authAPI.googleAuth(payload);
            console.log('Google login API response:', apiResponse);

            handleAuthSuccess(apiResponse);

            if (apiResponse.user.account_is_set === false) {
                return 'setup-account';
            }
            if (apiResponse.user.account_is_set === true) {
                return 'success';
            }
        } catch (error) {
            console.error('Google login error:', error);
            setError(error.message || 'Google login failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        console.log('Logging out user');

        setUser(null);
        setToken(null);
        setError(null);

        // Clear localStorage
        localStorage.removeItem('karu_token');
        localStorage.removeItem('karu_user');

        // Disable Google auto-select
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    };

    const clearError = () => setError(null);

    const value = {
        user,
        isAuthenticated: !!user && !!token,
        token,
        googleLogin,
        logout,
        isLoading,
        error,
        clearError,
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
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