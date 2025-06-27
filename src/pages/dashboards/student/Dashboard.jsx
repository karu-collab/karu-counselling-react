import {useEffect, useState} from 'react';
import {FaBell, FaBook, FaCalendarAlt, FaCalendarCheck, FaComments, FaSignOutAlt, FaUser} from 'react-icons/fa';
import styles from './Dashboard.module.css';
import CounsellorList from './CounsellorList.jsx';
import SessionList from './SessionList.jsx';
import BookingModal from './BookingModal.jsx';
import CounsellorService from '../../services/CounsellorService.js'
import ChatPage from "../chat/ChatPage.jsx";
import {useAuthentication} from "../../hooks/AuthenticationContext.jsx";
import SessionService from "../../services/SessionService.js";
import UserService from "../../services/UserService.js";
import {useWebSocket} from "../../hooks/WebSocketContext.jsx";
import {useNavigate} from "react-router-dom";



// Sample notifications
const notifications = [
    {
        id: 1,
        title: 'Upcoming Session.ts',
        message: 'Your session with Dr. Sarah Johnson is scheduled for tomorrow at 2:00 PM.',
        time: '1 hour ago',
        icon: <FaCalendarCheck />
    },
    {
        id: 2,
        title: 'New Resource Available',
        message: 'Check out our new guide on "Managing Exam Stress" in the resource library.',
        time: '2 days ago',
        icon: <FaBook />
    },
    {
        id: 3,
        title: 'Session.ts Reminder',
        message: 'Don\'t forget your session with Prof. Michael Ochieng on Friday at 10:00 AM.',
        time: '3 days ago',
        icon: <FaBell />
    }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const {addContactToMyChats} = useWebSocket()
    const {accessToken,baseUrl,userInfo, setUserInfo} = useAuthentication()
    const [counsellors, setCounsellors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);
    const [selectedCounselor, setSelectedCounselor] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [page, setPage] = useState(0); // Current page
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!accessToken) return;

            try {
                setLoading(true);
                const response = await UserService.getUserInfo(baseUrl,accessToken);

                setUserInfo(response);
            } catch (error) {
                console.error("Error fetching user info:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, [accessToken]);


    useEffect(() => {
        const fetchCounsellors = async () => {
            try {
                setLoading(true);
                const data = await CounsellorService.getCounsellors(accessToken);

                setCounsellors(data);
            } catch (error) {
                console.error('Failed to fetch counsellors:', error);
            } finally {
                setLoading(false);
            }
        };

        if (accessToken) {
            fetchCounsellors();
        }
    }, [accessToken]);

    const fetchSessions = async (currentPage = 0) => {
        try {
            setLoading(true);
            const sessionData = await SessionService.fetchSessions(baseUrl, accessToken, userInfo.userId, currentPage);


            if (sessionData.page.totalElements > 0) {
                // Combine session data with counselor data
                const combinedSessions = sessionData._embedded.sessionList.map((session) => {
                    const counselor = counsellors.find(c => c.userId === session.counsellorId);
                    return {
                        id: session.sessionId,
                        counsellor: {
                            id: session.counsellorId,
                            name: counselor ? `${counselor.firstName} ${counselor.lastName}` : 'Unknown Counselor',
                            image: counselor?.imageUrl || '/api/placeholder/80/80',
                        },
                        description: session.description,
                        status: session.status,
                        date: new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                        time: session.timeSlot,
                    };
                });

                setSessions(prev => [...prev, ...combinedSessions]); // Append new sessions for endless scrolling


                setPage(sessionData.page.number); // Current page
                setTotalPages(sessionData.page.totalPages); // Total pages
            }else {
                console.log('Total sessions are zero: ');
            }


        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100
            ) {
                if (page + 1 < totalPages && !loading) {
                    fetchSessions(page + 1); // Fetch next page
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, totalPages, loading]); // Dependencies for re-attaching listener


    useEffect(() => {
        if (accessToken && counsellors.length > 0) {
            fetchSessions(0);
        }
    }, [accessToken, counsellors]);

    const handleLogout = () => {

        if (confirm("You are about to log out")){
            navigate('/')
        }
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        // In a real application, handle account info update
        alert('Account information updated successfully!');
    };

    const handleUserInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBookSession = (counselorId) => {
        const counselor = counsellors.find((c) => c.userId === counselorId);
        if (counselor) {
            setSelectedCounselor(counselor);
            setIsBookingModalOpen(true);
        } else {
            console.error(`Counselor with ID ${counselorId} not found.`);
        }
    };


    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
    };
    const handleBookingConfirm = async (date, timeSlot, notes,slotId) => {
        if (!selectedCounselor) {
            alert('No counselor selected.');
            return;
        }


        const newSession = {
            counsellorId: selectedCounselor.userId,
            studentId: userInfo.userId, // Updated to match UserDto structure
            slotId: slotId,
            date: date.toISOString(), // Ensure date is in ISO 8601 format
            timeSlot,
            description: notes,
        };

        console.log('new session: ', newSession);

        try {
            const respondedSession = await SessionService.bookSession(newSession, baseUrl, accessToken);

             console.log('respondedSession:', respondedSession);

            // Combine the responded session with selected counselor to form the final object
            const finalSession = {
                id: respondedSession.sessionId, // Using sessionId from the API response
                counsellor: {
                    id: respondedSession.counsellorId, // Counselor ID from API response
                    name: `${selectedCounselor.firstName} ${selectedCounselor.lastName}`, // Build name from selectedCounselor object
                    image: selectedCounselor.imageUrl || '/api/placeholder/80/80', // Default to placeholder if no image URL
                },
                type: respondedSession.description, // Static or dynamic type, adjust as needed
                status: respondedSession.status, // Status from the API response
                date: new Date(respondedSession.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), // Format the date
                time: respondedSession.timeSlot, // Directly using the timeSlot from the response
            };

            console.log('Final session object:', finalSession);

            // Update sessions with the final session object
            setSessions([finalSession, ...sessions]);

            fetchSessions();

            alert('Session booked successfully! The counselor will review your request.');
        } catch (error) {
            console.error('Error confirming booking:', error.message);
            alert('Failed to book session. Please try again later.');
        } finally {
            setSelectedCounselor(null);
        }
    };


    const handleStartChat = (counselorId) => {

        const counsellor = counsellors.find(c => c.userId === counselorId);


        const contactInfo = {
            currentUserId: userInfo.userId,
            currentUserName: userInfo.regNo+" | "+userInfo.firstName +" "+userInfo.lastName,
            contactUserId:  counselorId,
            contactUserName: counsellor.firstName+" "+ counsellor.lastName,
            contactImageUrl: counsellor.imageUrl,
        }
        localStorage.setItem('username',userInfo.regNo+" | "+userInfo.firstName +" "+userInfo.lastName)
        localStorage.setItem('userId',userInfo.userId)
        console.log("contact: ",contactInfo);

        addContactToMyChats(contactInfo)
        setActiveTab('chats')
    };


    const handleRescheduleSession = (sessionId) => {
        // In a real application, implement reschedule logic
        alert(`Rescheduling session #${sessionId}`);
    };

    const handleCancelSession = (sessionId) => {
        // In a real application, implement cancel logic
        // For now, just update the status in our local state
        setSessions(sessions.map(session =>
            session.id === sessionId
                ? { ...session, status: 'cancelled' }
                : session
        ));
        alert(`Session #${sessionId} cancelled`);
    };

    const handleBookAgain = (sessionId) => {
        // Find the session
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            // Find the corresponding counselor
            const counselor = counsellors.find((c) => c.id === session.counselor.id);
            setSelectedCounselor(counselor);
            setIsBookingModalOpen(true);
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>Welcome, {userInfo.firstName}!</h1>
                    <p className={styles.welcomeSubtitle}>How can we support you today?</p>
                </div>
            </header>

            <div className={styles.tabsContainer}>
                <ul className={styles.tabsList}>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'sessions' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('sessions')}
                    >
                        <FaCalendarAlt className={styles.tabIcon} />
                        <span className={styles.tabText}>My Sessions</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'chats' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('chats')}
                    >
                        <FaComments className={styles.tabIcon} />
                        <span className={styles.tabText}>Chats </span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <FaBell className={styles.tabIcon} />
                        <span className={styles.tabText}>Notifications</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'account' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        <FaUser className={styles.tabIcon} />
                        <span className={styles.tabText}>My Account</span>
                    </li>
                    <li
                        className={styles.tabItem}
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt className={styles.tabIcon} />
                        <span className={styles.tabText}>Logout</span>
                    </li>
                </ul>
            </div>

            <div className={styles.tabContent}>
                {/* My Sessions Tab */}
                {activeTab === 'sessions' && (
                    <div>
                        <h2>Available Counselors</h2>
                        <CounsellorList
                            counsellors={counsellors}
                            onBookSession={handleBookSession}
                            onStartChat={handleStartChat}
                        />

                        {sessions && sessions.length > 0 ? (
                            <SessionList
                                sessions={sessions}
                                onReschedule={handleRescheduleSession}
                                onCancel={handleCancelSession}
                                onBookAgain={handleBookAgain}
                            />
                        ):(
                            <div>
                                <h1>No booked sessions yet</h1>
                            </div>
                        )}


                    </div>
                )}

                {activeTab === 'chats' && (
                    <ChatPage />
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div>
                        <h2>Notifications</h2>
                        {notifications.length > 0 ? (
                            <div className={styles.notificationsList}>
                                {notifications.map(notification => (
                                    <div key={notification.id} className={styles.notificationItem}>
                                        <div className={styles.notificationIcon}>
                                            {notification.icon}
                                        </div>
                                        <div className={styles.notificationContent}>
                                            <h4 className={styles.notificationTitle}>{notification.title}</h4>
                                            <p className={styles.notificationMessage}>{notification.message}</p>
                                            <p className={styles.notificationTime}>{notification.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <FaBell className={styles.emptyStateIcon} />
                                <p className={styles.emptyStateText}>You have no new notifications.</p>
                                <p>Check back later for updates on your sessions and new resources.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className={styles.accountSection}>
                        <h2 className={styles.accountSectionTitle}>Personal Information</h2>
                        <form className={styles.accountForm} onSubmit={handleFormSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>First Name</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    name="firstName"
                                    value={userInfo.firstName}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Last Name</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    name="lastName"
                                    value={userInfo.lastName}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.formInput}
                                    name="email"
                                    value={userInfo.schoolEmail}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Phone Number</label>
                                <input
                                    type="tel"
                                    className={styles.formInput}
                                    name="phone"
                                    value={userInfo.phoneNumber}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Program</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    name="program"
                                    value={userInfo.program}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Year of Study</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    name="year"
                                    value={userInfo.year}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Emergency Contact Name</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    name="emergencyName"
                                    value={userInfo.emergencyName}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Emergency Contact Number</label>
                                <input
                                    type="tel"
                                    className={styles.formInput}
                                    name="emergencyContact"
                                    value={userInfo.emergencyContact}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <button type="submit" className={styles.formSubmit}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={handleCloseBookingModal}
                    counselor={selectedCounselor}
                    onBookingConfirm={handleBookingConfirm}
                />
            )}
        </div>
    );
}