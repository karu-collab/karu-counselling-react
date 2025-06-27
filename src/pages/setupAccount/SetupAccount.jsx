import React, { useEffect, useState } from "react";
import StudentAccount from "./student/StudentAccount.jsx";
import CounsellorAccount from "./counsellor/CounsellorAccount.jsx";

export default function SetupAccount() {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("karu_user"));

        if (!user) {
            console.error("User does not exist");
            return;
        }

        setUserRole(user.role);
    }, []);

    return (
        <>
            {userRole === "STUDENT" && <StudentAccount />}
            {userRole === "COUNSELLOR" && <CounsellorAccount />}
            {!userRole && (
                <div>
                    <h1>User role is not set</h1>
                </div>
            )}
        </>
    );
}
