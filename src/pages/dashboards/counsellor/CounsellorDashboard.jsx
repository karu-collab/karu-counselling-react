import styles from "./CounsellorDashboard.module.css"
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import { Calendar, MessageCircle, Bell, User } from 'lucide-react';
import ArticleManager from "./articleManager/ArticleManager.jsx";
import AppointmentsManager from "./appointmentManager/AppointmentsManager.jsx";

export default function CounsellorDashboard() {

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('appointments');

    const {user} = useAuth()


    return (
        <div>
            <header className={styles.header}>
                <div className={styles.welcomeSection}>
                    <h2> welcome {user?.first_name || user?.last_name || user?.full_name}!</h2>
                    <p className={styles.welcomeSubtitle}>You're ready to make an impact today?</p>
                </div>
            </header>

            <div className={styles.tabsContainer}>
                <ul className={styles.tabsList}>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'appointments' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('appointments')}
                    >
                        <Calendar className={styles.tabIcon} />
                        <span className={styles.tabText}>My Appointments</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'articles' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('articles')}
                    >
                        <MessageCircle className={styles.tabIcon} />
                        <span className={styles.tabText}>Articles</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'account' ? styles.activeTab : ''}`}
                        onClick={() => navigate('/setup-account')}
                    >
                        <User className={styles.tabIcon} />
                        <span className={styles.tabText}>My Calender</span>
                    </li>
                </ul>
            </div>

            <div className={styles.tabContent}>

                {/* My appointments Tab */}
                {activeTab === 'appointments' && (
                    <div>
                        <AppointmentsManager />
                    </div>
                )}
                {/* My Articles Tab */}
                {activeTab === 'articles' && (
                    <div>
                        <ArticleManager />
                    </div>
                )}
            </div>


        </div>
    )
}