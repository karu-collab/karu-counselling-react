import styles from "./CounsellorDashboard.module.css"
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import { Calendar, MessageCircle, Bell, User } from 'lucide-react';

export default function CounsellorDashboard() {

    const navigate = useNavigate();
    const [counsellors, setCounsellors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);

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
                        className={`${styles.tabItem} ${activeTab === 'sessions' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('sessions')}
                    >
                        <Calendar className={styles.tabIcon} />
                        <span className={styles.tabText}>My Sessions</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'chats' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('chats')}
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

        </div>
    )
}