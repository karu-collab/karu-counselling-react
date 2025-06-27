import styles from './StudentDashboard.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";
import {useNavigate} from "react-router-dom";
import { Calendar, MessageCircle, Bell, User } from 'lucide-react';
import CounsellorList from "./CounsellorList.jsx";
import SessionList from "./SessionList.jsx";
import BookingModal from "./BookingModal.jsx";

export default function StudentDashboard() {

    const navigate = useNavigate();
    const [counsellors, setCounsellors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const [selectedCounsellor, setSelectedCounsellor] = useState(null);

    const {user} = useAuth()
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [studentInfo, setStudentInfo] = useState({
        name: '',
        studentId: '',
        email: '',
        phone: '',
        reason: ''
    });
    const [bookings, setBookings] = useState([]);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);

    const counselors = ['Dr. Smith', 'Ms. Johnson', 'Mr. Lee']; // Example counselors

    const calendarEvents = bookings.map(booking => ({
        id: booking.id,
        title: `${booking.counsellor} - ${booking.studentInfo.name}`,
        start: new Date(`${booking.date}T${booking.time}`),
        end: new Date(`${booking.date}T${booking.time}`),
        resource: booking
    }));

    const handleBookingSubmit = () => {
        if (!selectedDate || !selectedTime || !selectedCounsellor || !studentInfo.name) {
            alert('Please fill in all fields.');
            return;
        }

        const newBooking = {
            id: bookings.length + 1,
            date: selectedDate,
            time: selectedTime,
            counsellor: selectedCounsellor,
            studentInfo: { ...studentInfo }
        };

        setBookings([...bookings, newBooking]);
        setShowBookingForm(false);
        setBookingStatus('Booking successful!');
    };


    const handleBookSession = (counselorId) => {
        const counselor = counsellors.find((c) => c.userId === counselorId);
        if (counselor) {
            setSelectedCounsellor(counselor);
            setIsBookingModalOpen(true);
        } else {
            console.error(`Counselor with ID ${counselorId} not found.`);
        }
    };


    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
    };
    const handleBookingConfirm = async (date, timeSlot, notes,slotId) => {
        if (!selectedCounsellor) {
            alert('No counselor selected.');
            return;
        }
    }

    const handleStartChat = (counselorId) => {


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
            setSelectedCounsellor(counselor);
            setIsBookingModalOpen(true);
        }
    };


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.welcomeSection}>
                    <h2> welcome {user?.first_name || user?.last_name || user?.full_name}!</h2>
                    <p className={styles.welcomeSubtitle}>How can we support you today?</p>
                </div>
            </header>

            <div className={styles.tabsContainer}>
                <ul className={styles.tabsList}>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'book' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('book')}
                    >
                        <Calendar className={styles.tabIcon} />
                        <span className={styles.tabText}>Book a Session</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'sessions' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('sessions')}
                    >
                        <Calendar className={styles.tabIcon} />
                        <span className={styles.tabText}>My Sessions</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'account' ? styles.activeTab : ''}`}
                        onClick={() => navigate('/setup-account')}
                    >
                        <User className={styles.tabIcon} />
                        <span className={styles.tabText}>My Account</span>
                    </li>
                </ul>
            </div>

            <div className={styles.tabContent}>
                {/* My Sessions Tab */}
                {activeTab === 'book' && (
                    <div>



                        {counsellors && counsellors.length > 0 ? (
                                <div>
                                    <h2>Available Counselors</h2>
                                    <CounsellorList
                                        counsellors={counsellors}
                                        onBookSession={handleBookSession}
                                        onStartChat={handleStartChat}
                                    />
                                </div>
                        ):(
                            <div>
                                <h1>Counsellors are not available yet</h1>
                            </div>
                        )}


                    </div>
                )}
                {/* My Sessions Tab */}
                {activeTab === 'sessions' && (
                    <div>

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

            </div>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={handleCloseBookingModal}
                    counselor={selectedCounsellor}
                    onBookingConfirm={handleBookingConfirm}
                />
            )}
        </div>
    );

}
