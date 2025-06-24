import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/AuthenticationContext.jsx'
import LoginPage from '../pages/login/LoginPage.jsx'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    return (
        <>
            <style>
                {`
                .min-h-screen {
                    min-height: 100vh;
                }
                .flex {
                    display: flex;
                }
                .items-center {
                    align-items: center;
                }
                .justify-center {
                    justify-content: center;
                }
                .bg-gradient-to-br {
                    background: linear-gradient(to bottom right, #f0f9ff, #e0f2fe);
                }
                .text-center {
                    text-align: center;
                }
                .w-16 {
                    width: 4rem;
                }
                .h-16 {
                    height: 4rem;
                }
                .border-4 {
                    border-width: 4px;
                }
                .border-primary-200 {
                    border-color: #bfdbfe;
                }
                .border-t-primary-600 {
                    border-top-color: #2563eb;
                }
                .rounded-full {
                    border-radius: 9999px;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                .mx-auto {
                    margin-left: auto;
                    margin-right: auto;
                }
                .mb-4 {
                    margin-bottom: 1rem;
                }
                .text-medical-600 {
                    color: #075985;
                }
                .font-medium {
                    font-weight: 500;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                `}
            </style>

            {isLoading ? (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-medical-600 font-medium">Verifying your authentication...</p>
                    </div>
                </div>
            ) : !isAuthenticated ? (
                <LoginPage redirectTo={location.pathname} />
            ) : (
                <>{children}</>
            )}
        </>
    )
}

export default ProtectedRoute
