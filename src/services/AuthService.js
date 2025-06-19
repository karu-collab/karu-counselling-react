export default {
    getUsername: () => localStorage.getItem("username"),
    BASE_URL: import.meta.env.VITE_BACKEND_URL
};
