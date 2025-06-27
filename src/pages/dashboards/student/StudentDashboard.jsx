import styles from './StudentDashboard.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {useEffect, useState} from 'react';
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";
import {useNavigate} from "react-router-dom";
import { Calendar, MessageCircle, Bell, User, ChevronLeft, ChevronRight } from 'lucide-react';
import CounsellorList from "./CounsellorList.jsx";
import SessionList from "./SessionList.jsx";
import BookingModal from "./BookingModal.jsx";
import axiosInstance from "../../../utils/axiosInstance.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_URL

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [counsellors, setCounsellors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('book');
    const [sessions, setSessions] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedCounsellor, setSelectedCounsellor] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCounsellors, setTotalCounsellors] = useState(0);
    const [pageLimit] = useState(10); // Items per page

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

    useEffect(() => {
        fetchCounsellors(currentPage);
    }, [currentPage]);


    const fetchCounsellors = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(`${BASE_URL}/users/counsellors`, {
                params: {
                    page: page,
                    limit: pageLimit
                }
            });

            if (response.data) {
                setCounsellors(response.data.counsellors || []);
                setTotalPages(response.data.total_pages || 1);
                setTotalCounsellors(response.data.total || 0);
                setCurrentPage(response.data.page || 1);
            }
        } catch (error) {
            console.error('Error fetching counsellors:', error);
            setError('Failed to load counsellors. Please try again.');
            setCounsellors([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

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
        const counselor = counsellors.find((c) => c._id === counselorId);
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

    const handleBookingConfirm = async (date, timeSlot, notes, slotId) => {
        if (!selectedCounsellor) {
            alert('No counselor selected.');
            return;
        }
        // Implement booking confirmation logic here
    };

    const handleRescheduleSession = (sessionId) => {
        alert(`Rescheduling session #${sessionId}`);
    };

    const handleCancelSession = (sessionId) => {
        setSessions(sessions.map(session =>
            session.id === sessionId
                ? { ...session, status: 'cancelled' }
                : session
        ));
        alert(`Session #${sessionId} cancelled`);
    };

    const handleBookAgain = (sessionId) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            const counselor = counsellors.find((c) => c.id === session.counselor.id);
            setSelectedCounsellor(counselor);
            setIsBookingModalOpen(true);
        }
    };

    // Pagination component
    const PaginationControls = () => (
        <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
                Showing {((currentPage - 1) * pageLimit) + 1} to {Math.min(currentPage * pageLimit, totalCounsellors)} of {totalCounsellors} counsellors
            </div>
            <div className={styles.paginationControls}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>

                <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, currentPage - 2) + i;
                        if (pageNum > totalPages) return null;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`${styles.pageNumber} ${pageNum === currentPage ? styles.activePage : ''}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.welcomeSection}>
                    <h2>Welcome {user?.given_name || user?.name || 'Student'}!</h2>
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
                {/* Book a Session Tab */}
                {activeTab === 'book' && (
                    <div>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>Loading counsellors...</p>
                            </div>
                        ) : error ? (
                            <div className={styles.errorContainer}>
                                <p className={styles.error}>{error}</p>
                                <button
                                    onClick={() => fetchCounsellors(currentPage)}
                                    className={styles.retryButton}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : counsellors && counsellors.length > 0 ? (
                            <div>
                                <div className={styles.sectionHeader}>
                                    <h2>Available Counselors</h2>
                                    <p>{totalCounsellors} counsellors available</p>
                                </div>

                                <CounsellorList
                                    counsellors={counsellors}
                                    onBookSession={handleBookSession}
                                />

                                {totalPages > 1 && <PaginationControls />}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <h3>No Counsellors Available</h3>
                                <p>There are no counsellors available at the moment. Please check back later.</p>
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
                        ) : (
                            <div className={styles.emptyState}>
                                <h3>No Booked Sessions</h3>
                                <p>You haven't booked any sessions yet. Book your first session with a counsellor!</p>
                                <button
                                    onClick={() => setActiveTab('book')}
                                    className={styles.primaryButton}
                                >
                                    Book a Session
                                </button>
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