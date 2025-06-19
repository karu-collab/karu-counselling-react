import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Store auth methods that will be set by the app
let authMethods = null;

// Function to set authentication methods
export const setAuthMethods = (methods) => {
    authMethods = methods;
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const { response, config } = error;

        if (response?.status === 401 || response?.status === 403) {
            if (!authMethods) {
                console.error('Auth methods not available');
                return Promise.reject(error);
            }

            try {
                console.log("Authentication failed! Attempting token refresh...");
                const refreshResponse = await axios.get(
                    `${baseURL}/api/v1/auth/refresh`,
                    { withCredentials: true }
                );

                console.log("refreshResponse: ", refreshResponse);

                const { accessToken, message } = refreshResponse.data;

                console.log("newAccess Token: ", accessToken);

                // Use the passed auth methods
                authMethods.setAccessToken(accessToken);

                console.log("Better Response message: ", message);

                config.headers['Authorization'] = `Bearer ${accessToken}`;
                return axiosInstance(config); // Retry original request
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                if (authMethods.logout) {
                    authMethods.logout();
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;