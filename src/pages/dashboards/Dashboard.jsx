import {  Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthenticationContext.jsx";

const Dashboard = () => {
    const { user } = useAuth();

    console.log('user dashboard: ',user)

    // Redirect to appropriate dashboard based on user role
    if (user?.role === "COUNSELLOR") {
        return <Navigate to="/dashboard.counsellor" replace />;
    } else if (user?.role === "STUDENT") {
        return <Navigate to="/dashboard.student" replace />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (<Navigate to="/" replace /> );
};

export default Dashboard;