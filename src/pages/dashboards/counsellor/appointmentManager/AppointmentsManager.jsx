import { useEffect, useState } from 'react';
import { useAuth } from '../../../../hooks/AuthenticationContext.jsx';
import styles from './AppointmentsManager.module.css';
import { FaCalendar, FaCheck, FaTimes, FaRedo, FaTrash } from 'react-icons/fa';
import axiosInstance from "../../../../utils/axiosInstance.jsx";

const BaseUrl = import.meta.env.VITE_BACKEND_URL

export default function AppointmentsManager() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({
        date: '',
        timeSlot: ''
    });
    const [isRescheduling, setIsRescheduling] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState({
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
        current_page: 1
    });

    // Filtering and sorting state
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch sessions on component mount and when pagination/filters change
    useEffect(() => {
        fetchAppointments();
    }, [currentPage, pageSize, statusFilter, sortBy, sortOrder]);

    useEffect(() => {
        console.log('user is ', user)
    }, [user])


    const fetchAppointments = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                page_size: pageSize.toString(),
                sort_by: sortBy,
                sort_order: sortOrder
            });

            // Add status filter if selected and user is counsellor
            if (statusFilter && user.role === 'COUNSELLOR') {
                params.append('status', statusFilter);
            }

            const response = await axiosInstance.get(
                `${BaseUrl}/appointment/by-user/${user.id}?${params.toString()}`
            );

            console.log('appointments response: ', response.data);

            if (response.data) {
                // Handle both new paginated format and old format for backward compatibility
                const appointmentsData = response.data.appointments ||
                    response.data._embedded?.sessionList ||
                    [];

                setSessions(appointmentsData);

                // Set pagination info
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                } else {
                    // Fallback for backward compatibility
                    setPagination({
                        total_count: response.data.total_appointments || appointmentsData.length,
                        total_pages: 1,
                        has_next: false,
                        has_prev: false,
                        current_page: 1
                    });
                }
            } else {
                setSessions([]);
                setPagination({
                    total_count: 0,
                    total_pages: 0,
                    has_next: false,
                    has_prev: false,
                    current_page: 1
                });
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch sessions. Please try again later.');
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(parseInt(newSize));
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleSortChange = (field) => {
        if (sortBy === field) {
            // Toggle sort order if same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field with default descending order
            setSortBy(field);
            setSortOrder('desc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const handleAccept = async (session) => {
        try {
            // Update session status to CONFIRMED
            const updatedSession = { ...session, status: 'CONFIRMED' };

            // Add the student to the client list
            console.log('user info:', user)
            await ClientService.addClient(
                baseUrl,
                accessToken,
                {
                    counsellorId: user.userId,
                    studentId: session.studentId,
                    sessionId: session.sessionId
                }
            );

            // Update the session list to reflect the changes
            setSessions(sessions.map(s =>
                s.sessionId === session.sessionId ? updatedSession : s
            ));

            // Refresh sessions from the server
            fetchAppointments();
        } catch (err) {
            setError('Failed to accept session. Please try again.');
            console.error('Error accepting session:', err);
        }
    };

    const handleReject = async (session) => {
        try {
            // Cancel the session
            await SessionService.cancelSession(
                baseUrl,
                accessToken,
                session.sessionId
            );

            // Remove the session from the list
            setSessions(sessions.filter(s => s.sessionId !== session.sessionId));
        } catch (err) {
            setError('Failed to reject session. Please try again.');
            console.error('Error rejecting session:', err);
        }
    };

    const handleDelete = async (session) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                // Cancel the session
                await SessionService.cancelSession(
                    baseUrl,
                    accessToken,
                    session.sessionId
                );

                // Remove the session from the list
                setSessions(sessions.filter(s => s.sessionId !== session.sessionId));
            } catch (err) {
                setError('Failed to delete session. Please try again.');
                console.error('Error deleting session:', err);
            }
        }
    };

    const openRescheduleModal = (session) => {
        setSelectedSession(session);
        setRescheduleData({
            date: formatDateForInput(new Date(session.date)),
            timeSlot: session.timeSlot
        });
        setIsRescheduling(true);
    };

    const closeRescheduleModal = () => {
        setIsRescheduling(false);
        setSelectedSession(null);
    };

    const handleRescheduleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSession) return;

        try {
            await SessionService.rescheduleSession(
                baseUrl,
                accessToken,
                selectedSession.sessionId,
                new Date(rescheduleData.date),
                rescheduleData.timeSlot
            );

            // Update the session in the list
            setSessions(sessions.map(s =>
                s.sessionId === selectedSession.sessionId
                    ? { ...s, status: 'RESCHEDULED', date: new Date(rescheduleData.date), timeSlot: rescheduleData.timeSlot }
                    : s
            ));

            closeRescheduleModal();
            // Refresh sessions from the server
            fetchAppointments();
        } catch (err) {
            setError('Failed to reschedule session. Please try again.');
            console.error('Error rescheduling session:', err);
        }
    };

    const formatDateForInput = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'CONFIRMED': return styles.confirmed;
            case 'RESCHEDULED': return styles.confirmed;
            case 'CANCELLED': return styles.cancelled;
            case 'PENDING': return styles.pending;
            case 'COMPLETED': return styles.completed;
            default: return '';
        }
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        const totalPages = pagination.total_pages;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages around current page
            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className={styles.sessionManager}>
            <div className={styles.header}>
                <h2>Session Management</h2>
                <div className={styles.headerControls}>
                    {/* Status Filter (for counsellors only) */}
                    {user?.role === 'COUNSELLOR' && (
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="RESCHEDULED">Rescheduled</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    )}

                    {/* Page Size Selector */}
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        className={styles.pageSizeSelect}
                    >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </select>

                    <button
                        className={styles.refreshButton}
                        onClick={fetchAppointments}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Pagination Info */}
            <div className={styles.paginationInfo}>
                Showing {sessions.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, pagination.total_count)} of {pagination.total_count} appointments
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading sessions...</div>
            ) : sessions.length === 0 ? (
                <div className={styles.noSessions}>No sessions found.</div>
            ) : (
                <>
                    <div className={styles.sessionList}>
                        {sessions.map((session) => (
                            <div key={session.sessionId} className={styles.sessionCard}>
                                <div className={styles.sessionHeader}>
                                    <div className={styles.sessionDate}>
                                        <FaCalendar className={styles.icon} />
                                        <span>{formatDate(session.date)} - {session.timeSlot}</span>
                                    </div>
                                    <div className={`${styles.sessionStatus} ${getStatusClass(session.status)}`}>
                                        {session.status}
                                    </div>
                                </div>

                                <div className={styles.sessionBody}>
                                    <div className={styles.sessionDetail}>
                                        <strong>Student ID:</strong> {session.studentId}
                                    </div>
                                    <div className={styles.sessionDetail}>
                                        <strong>Description:</strong> {session.description || 'No description provided.'}
                                    </div>
                                </div>

                                <div className={styles.sessionActions}>
                                    {session.status === 'PENDING' && (
                                        <>
                                            <button
                                                className={`${styles.actionButton} ${styles.acceptButton}`}
                                                onClick={() => handleAccept(session)}
                                                title="Accept"
                                            >
                                                <FaCheck /> Accept
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.rejectButton}`}
                                                onClick={() => handleReject(session)}
                                                title="Reject"
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className={`${styles.actionButton} ${styles.rescheduleButton}`}
                                        onClick={() => openRescheduleModal(session)}
                                        title="Reschedule"
                                    >
                                        <FaRedo /> Reschedule
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        onClick={() => handleDelete(session)}
                                        title="Delete"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.total_pages > 1 && (
                        <div className={styles.paginationControls}>
                            {/* Previous Button */}
                            <button
                                className={`${styles.paginationButton} ${!pagination.has_prev ? styles.disabled : ''}`}
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.has_prev}
                            >
                                <FaChevronLeft /> Previous
                            </button>

                            {/* Page Numbers */}
                            <div className={styles.pageNumbers}>
                                {getPageNumbers().map(pageNum => (
                                    <button
                                        key={pageNum}
                                        className={`${styles.pageButton} ${pageNum === currentPage ? styles.active : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            {/* Next Button */}
                            <button
                                className={`${styles.paginationButton} ${!pagination.has_next ? styles.disabled : ''}`}
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.has_next}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}


            {/* Reschedule Modal */}
            {isRescheduling && selectedSession && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Reschedule Session</h3>

                        <form onSubmit={handleRescheduleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="date">Date:</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={rescheduleData.date}
                                    onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="timeSlot">Time Slot:</label>
                                <select
                                    id="timeSlot"
                                    value={rescheduleData.timeSlot}
                                    onChange={(e) => setRescheduleData({...rescheduleData, timeSlot: e.target.value})}
                                    required
                                >
                                    <option value="">Select Time Slot</option>
                                    <option value="09:00 - 10:00">09:00 - 10:00</option>
                                    <option value="10:00 - 11:00">10:00 - 11:00</option>
                                    <option value="11:00 - 12:00">11:00 - 12:00</option>
                                    <option value="13:00 - 14:00">13:00 - 14:00</option>
                                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                                    <option value="15:00 - 16:00">15:00 - 16:00</option>
                                    <option value="16:00 - 17:00">16:00 - 17:00</option>
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="submit" className={styles.submitButton}>
                                    Reschedule
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={closeRescheduleModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}