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
import StudentPortal from "./pages/student/StudentPortal.jsx";
import ArticlesPage from "./pages/articles/ArticlesPage.jsx";


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
                path: '/student',
                element: <StudentPortal/>
            },
            {
                path: '/counselor',
                element: <LoginPage/>
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


const CLIENT_ID = 'your-google-client-id';

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeContextProvider>
          <AuthProvider>
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                  <WebSocketProvider>
                      <RouterProvider router={router}/>
                  </WebSocketProvider>
              </GoogleOAuthProvider>
          </AuthProvider>
      </ThemeContextProvider>,
    </StrictMode>,
)