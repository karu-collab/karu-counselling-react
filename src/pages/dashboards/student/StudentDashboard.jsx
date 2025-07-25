import styles from './StudentDashboard.module.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {useEffect, useState} from 'react';
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";
import {useNavigate} from "react-router-dom";
import { Calendar, MessageCircle, Bell, User, ChevronLeft, ChevronRight } from 'lucide-react';
import CounsellorList from "./CounsellorList.jsx";
import AppointmentList from "./AppointmentList.jsx";
import BookingModal from "./BookingModal.jsx";
import axiosInstance from "../../../utils/axiosInstance.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_URL

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [counsellors, setCounsellors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('book');
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [appointmentsError, setAppointmentsError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedCounsellor, setSelectedCounsellor] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCounsellors, setTotalCounsellors] = useState(0);
    const [pageLimit] = useState(10); // Items per page

    const {user} = useAuth()

    useEffect(() => {
        fetchCounsellors(currentPage);
    }, [currentPage]);

    // Fetch appointments when switching to appointments tab
    useEffect(() => {
        if (activeTab === 'appointments' && user?.id) {
            fetchAppointments();
        }
    }, [activeTab, user?.id]);

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

    const fetchAppointments = async () => {
        if (!user?.id) {
            console.error('User ID not available');
            return;
        }

        try {
            setAppointmentsLoading(true);
            setAppointmentsError(null);

            const response = await axiosInstance.get(`${BASE_URL}/appointment/by-user/${user.id}`);

            console.log('appointment response: ',response)

            if (response.data && response.data.appointments) {
                // Transform appointments to match the expected format
                const transformedAppointments = response.data.appointments.map(appointment => ({
                    id: appointment._id,
                    counsellor: {
                        id: appointment.counsellor_id,
                        name: appointment.counsellor_name,
                        email: appointment.counsellor_email,
                        image: appointment.users_info?.counsellor?.image
                    },
                    client: {
                        id: appointment.client_id,
                        name: appointment.client_name,
                        email: appointment.client_email
                    },
                    date: appointment?.date,
                    timeSlot: appointment?.timeSlot,
                    notes: appointment?.notes,
                    status: appointment.status || 'PENDING',
                    description: appointment?.notes || 'Counselling Session',
                    createdAt: appointment.created_at,
                    updatedAt: appointment.updated_at
                }));

                setAppointments(transformedAppointments);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAppointmentsError('Failed to load appointments. Please try again.');
            setAppointments([]);
        } finally {
            setAppointmentsLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleBookAppointment = (counselorId) => {
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
        setSelectedCounsellor(null);
    };

    const handleBookingConfirm = async (date, timeSlot, notes, slotId) => {
        if (!selectedCounsellor || !user) {
            alert('No counselor selected or student name is invalid.');
            return;
        }

        // Only include essential user information for the booking
        const usersInfo = {
            counsellor: {
                _id: selectedCounsellor._id,
                name: selectedCounsellor.name,
                email: selectedCounsellor.email
            },
            client_info: {
                id: user.id,
                email: user.email,
                full_name: user.full_name || `${user.first_name} ${user.last_name}`,
                first_name: user.first_name || user.given_name,
                last_name: user.last_name || user.family_name
            }
        };

        const bookedSlot = {
            date,
            timeSlot,
            notes,
            slotId
        }

        try {
            setLoading(true)
            const response = await axiosInstance.post(`${BASE_URL}/booking/add`, {
                counsellor_id: selectedCounsellor._id,
                client_id: user.id,
                booked_slot: bookedSlot,
                users_info: usersInfo
            });

            console.log("Booking response: ", response);

            // Show success message
            alert('Appointment booked successfully!');

            // Close modal
            handleCloseBookingModal();

            // Refresh appointments if we're on appointments tab
            if (activeTab === 'appointments') {
                fetchAppointments();
            }

        } catch(error) {
            console.error('Booking error:', error);
            alert('Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/appointment/update-status/${appointmentId}`,
                newStatus,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                // Update local state
                setAppointments(prevAppointments =>
                    prevAppointments.map(appointment =>
                        appointment.id === appointmentId
                            ? { ...appointment, status: newStatus }
                            : appointment
                    )
                );

                alert(`Appointment status updated to ${newStatus.toLowerCase()}`);
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            alert('Failed to update appointment status');
        }
    };

    const handleRescheduleAppointment = (appointmentId) => {
        // Find the appointment and counsellor
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment && appointment.counsellor) {
            const counselor = counsellors.find(c => c._id === appointment.counsellor.id);
            if (counselor) {
                setSelectedCounsellor(counselor);
                setIsBookingModalOpen(true);
            } else {
                // If counsellor not in current list, fetch or handle differently
                alert('Counsellor information not available for rescheduling');
            }
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            await handleUpdateAppointmentStatus(appointmentId, 'CANCELLED');
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            try {
                const response = await axiosInstance.delete(`${BASE_URL}/appointment/delete/${appointmentId}`);

                if (response.data) {
                    // Remove from local state
                    setAppointments(prevAppointments =>
                        prevAppointments.filter(appointment => appointment.id !== appointmentId)
                    );

                    alert('Appointment deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting appointment:', error);
                alert('Failed to delete appointment');
            }
        }
    };

    const handleBookAgain = (appointmentId) => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment && appointment.counsellor) {
            const counselor = counsellors.find((c) => c._id === appointment.counsellor.id);
            if (counselor) {
                setSelectedCounsellor(counselor);
                setIsBookingModalOpen(true);
            } else {
                // Switch to book tab to find counsellor
                setActiveTab('book');
                alert('Please find and select the counsellor from the available list');
            }
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
                        <span className={styles.tabText}>Book an Appointment</span>
                    </li>
                    <li
                        className={`${styles.tabItem} ${activeTab === 'appointments' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('appointments')}
                    >
                        <Calendar className={styles.tabIcon} />
                        <span className={styles.tabText}>My Appointments</span>
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
                {/* Book an Appointment Tab */}
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
                                    onBookAppointment={handleBookAppointment}
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

                {/* My appointments Tab */}
                {activeTab === 'appointments' && (
                    <div>
                        {appointmentsLoading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>Loading appointments...</p>
                            </div>
                        ) : appointmentsError ? (
                            <div className={styles.errorContainer}>
                                <p className={styles.error}>{appointmentsError}</p>
                                <button
                                    onClick={fetchAppointments}
                                    className={styles.retryButton}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : appointments && appointments.length > 0 ? (
                            <AppointmentList
                                appointments={appointments}
                                onReschedule={handleRescheduleAppointment}
                                onCancel={handleCancelAppointment}
                                onBookAgain={handleBookAgain}
                                onUpdateStatus={handleUpdateAppointmentStatus}
                                onDelete={handleDeleteAppointment}
                            />
                        ) : (
                            <div className={styles.emptyState}>
                                <h3>No Appointments</h3>
                                <p>You haven't booked any appointments yet. Book your first appointment with a counsellor!</p>
                                <button
                                    onClick={() => setActiveTab('book')}
                                    className={styles.primaryButton}
                                >
                                    Book an appointment
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