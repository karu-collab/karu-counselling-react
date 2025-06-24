import './global-polyfill';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import BaseLayout from "./baseLayout/BaseLayout.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";
import ThemeContextProvider from "./hooks/themeProvider.jsx";
import {WebSocketProvider} from "./hooks/WebSocketContext.jsx";
import {AuthProvider} from "./hooks/AuthenticationContext.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google";
import LoginPage from "./pages/login/LoginPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import StudentDashboard from "./pages/dashboards/student/StudentDashboard.jsx";
import ArticlesPage from "./pages/articles/ArticlesPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CounsellorDashboard from "./pages/dashboards/counsellor/CounsellorDashboard.jsx";
import Dashboard from "./pages/dashboards/Dashboard.jsx";


const router = createBrowserRouter([
    {
        path: '/',
        element: <BaseLayout />,
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
            {
                path: '/login',
                element: <LoginPage/>
            },
            {
                path: '/articles',
                element: <ArticlesPage/>
            },
            {
                path: '/dashboard',
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),

            },
            {
                path: '/dashboard.student',
                element: (
                    <ProtectedRoute>
                        <StudentDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/dashboard.counselor',
                element: (
                    <ProtectedRoute>
                        <CounsellorDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/error',
                element: <ErrorPage/>
            },
            {
                path: '*',
                element: <Navigate to='/error' replace={true} />
            }
        ]

    }
])


createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeContextProvider>
          <AuthProvider>
                  <WebSocketProvider>
                      <RouterProvider router={router}/>
                  </WebSocketProvider>
          </AuthProvider>
      </ThemeContextProvider>,
    </StrictMode>,
)