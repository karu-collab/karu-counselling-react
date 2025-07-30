import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../hooks/AuthenticationContext.jsx';
import styles from './AppointmentsManager.module.css';
import { FaCalendar, FaCheck, FaTimes, FaRedo, FaTrash, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import axiosInstance from "../../../../utils/axiosInstance.jsx";
import RescheduleModal from "./rescheduleModal/RescheduleModal.jsx";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Constants
const APPOINTMENT_STATUSES = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    RESCHEDULED: 'RESCHEDULED',
    CANCELLED: 'CANCELLED'
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function CounsellorAppointmentsManager() {
    const { user } = useAuth();

    // State management
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        current_page: 1,
        page_size: 10,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
    });

    // Filters and sorting
    const [filters, setFilters] = useState({
        status: '',
        sortBy: 'date',
        sortOrder: 'desc'
    });

    // Reschedule modal state
    const [rescheduleModal, setRescheduleModal] = useState({
        isOpen: false,
        appointment: null,
        data: { date: '', timeSlot: '' }
    });

    // Verify user is a counsellor
    const isCounsellor = user?.role === 'COUNSELLOR';

    // Fetch appointments with useCallback to prevent unnecessary re-renders
    const fetchAppointments = useCallback(async () => {
        if (!user?.id || !isCounsellor) return;

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: pagination.current_page.toString(),
                page_size: pagination.page_size.toString(),
                sort_by: filters.sortBy,
                sort_order: filters.sortOrder
            });

            if (filters.status) {
                params.append('status', filters.status);
            }

            const response = await axiosInstance.get(
                `${BASE_URL}/appointment/by-user/${user.id}?${params.toString()}`
            );

            const { appointments: appointmentsData, pagination: paginationData } = response.data;

            setAppointments(appointmentsData || []);
            setPagination(prevPagination => ({
                ...prevPagination,
                ...paginationData
            }));

        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to fetch appointments. Please try again later.');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id, isCounsellor, pagination.current_page, pagination.page_size, filters]);

    // Initial load and dependency updates
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Handle appointment actions
    const handleAppointmentAction = async (appointment, action) => {
        setActionLoading(appointment._id);

        try {
            let endpoint = '';
            let method = 'patch';
            let payload = {};

            switch (action) {
                case 'accept':
                    endpoint = `/appointment/update-status/${appointment._id}`;
                    payload = APPOINTMENT_STATUSES.ACCEPTED;
                    break;

                case 'reject':
                    endpoint = `/appointment/update-status/${appointment._id}`;
                    payload = APPOINTMENT_STATUSES.REJECTED;
                    break;

                case 'reschedule':
                    endpoint = `/appointment/update-status/${appointment._id}`;
                    payload = APPOINTMENT_STATUSES.RESCHEDULED;
                    // Additional logic for rescheduling would go here
                    break;

                case 'delete':
                    if (!window.confirm('Are you sure you want to delete this appointment?')) {
                        return;
                    }
                    endpoint = `/appointment/delete/${appointment._id}`;
                    method = 'delete';
                    break;

                default:
                    throw new Error(`Unknown action: ${action}`);
            }

            const axiosMethod = axiosInstance[method];
            const response = method === 'delete'
                ? await axiosMethod(`${BASE_URL}${endpoint}`)
                : await axiosMethod(`${BASE_URL}${endpoint}`, payload);

            console.log('action response: ', response)

            // Refresh appointments after successful action
            await fetchAppointments();

            // Close reschedule modal if open
            if (rescheduleModal.isOpen) {
                closeRescheduleModal();
            }

        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            setError(`Failed to ${action} appointment. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({
            ...prev,
            page_size: parseInt(newSize),
            current_page: 1
        }));
    };

    // Filter handlers
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    // Reschedule modal handlers
    const openRescheduleModal = (appointment) => {
        setRescheduleModal({
            isOpen: true,
            appointment,
            data: {
                date: formatDateForInput(new Date(appointment.date)),
                timeSlot: appointment.timeSlot
            }
        });
    };

    const closeRescheduleModal = () => {
        setRescheduleModal({
            isOpen: false,
            appointment: null,
            data: { date: '', timeSlot: '' }
        });
        fetchAppointments();
    };


    // Utility functions
    const formatDateForInput = (date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusClass = (status) => {
        const statusClasses = {
            [APPOINTMENT_STATUSES.ACCEPTED]: styles.accepted,
            [APPOINTMENT_STATUSES.REJECTED]: styles.rejected,
            [APPOINTMENT_STATUSES.CANCELLED]: styles.cancelled,
            [APPOINTMENT_STATUSES.PENDING]: styles.pending,
            [APPOINTMENT_STATUSES.RESCHEDULED]: styles.rescheduled
        };
        return statusClasses[status] || '';
    };

    const generatePageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        const totalPages = pagination.total_pages;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let start = Math.max(1, pagination.current_page - Math.floor(maxVisible / 2));
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

    // Early return if user is not a counsellor
    if (!isCounsellor) {
        return (
            <div className={styles.sessionManager}>
                <div className={styles.error}>
                    Access denied. This page is only available for counsellors.
                </div>
            </div>
        );
    }

    // Loading state
    if (loading && appointments.length === 0) {
        return (
            <div className={styles.sessionManager}>
                <div className={styles.loading}>Loading appointments...</div>
            </div>
        );
    }

    return (
        <div className={styles.sessionManager}>
            {/* Header */}
            <div className={styles.header}>
                <h2>My Appointments</h2>
                <div className={styles.headerControls}>
                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Statuses</option>
                        {Object.values(APPOINTMENT_STATUSES).map(status => (
                            <option key={status} value={status}>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>

                    {/* Page Size Selector */}
                    <select
                        value={pagination.page_size}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        className={styles.pageSizeSelect}
                    >
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>{size} per page</option>
                        ))}
                    </select>

                    {/* Refresh Button */}
                    <button
                        className={styles.refreshButton}
                        onClick={fetchAppointments}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Pagination Info */}
            <div className={styles.paginationInfo}>
                Showing {appointments.length > 0 ? ((pagination.current_page - 1) * pagination.page_size) + 1 : 0} to{' '}
                {Math.min(pagination.current_page * pagination.page_size, pagination.total_count)} of{' '}
                {pagination.total_count} appointments
            </div>

            {/* Error Display */}
            {error && <div className={styles.error}>{error}</div>}

            {/* Appointments List */}
            {appointments.length === 0 ? (
                <div className={styles.noSessions}>
                    No appointments found.
                </div>
            ) : (
                <>
                    <div className={styles.sessionList}>
                        {appointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                onAction={handleAppointmentAction}
                                onReschedule={openRescheduleModal}
                                actionLoading={actionLoading}
                                formatDate={formatDate}
                                getStatusClass={getStatusClass}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.total_pages > 1 && (
                        <PaginationControls
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            generatePageNumbers={generatePageNumbers}
                        />
                    )}
                </>
            )}

            {/* Reschedule Modal */}
            {rescheduleModal.isOpen && (
                <RescheduleModal
                    appointment={rescheduleModal.appointment}
                    onClose={closeRescheduleModal}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
}

// Appointment Card Component
function AppointmentCard({
                             appointment,
                             onAction,
                             onReschedule,
                             actionLoading,
                             formatDate,
                             getStatusClass
                         }) {
    const isLoading = actionLoading === appointment._id;

    return (
        <div className={styles.sessionCard}>
            <div className={styles.sessionHeader}>
                <div className={styles.sessionDate}>
                    <FaCalendar className={styles.icon} />
                    <span>{formatDate(appointment.date)} - {appointment.timeSlot}</span>
                </div>
                <div className={`${styles.sessionStatus} ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                </div>
            </div>

            <div className={styles.sessionBody}>
                <div className={styles.sessionDetail}>
                    <strong>Client:</strong> {appointment.client_name || appointment.client_id}
                </div>
                <div className={styles.sessionDetail}>
                    <strong>Email:</strong> {appointment.client_email || 'N/A'}
                </div>
                <div className={styles.sessionDetail}>
                    <strong>Notes:</strong> {appointment.notes || 'No notes provided.'}
                </div>
            </div>

            <div className={styles.sessionActions}>
                {appointment.status === APPOINTMENT_STATUSES.PENDING && (
                    <>
                        <button
                            className={`${styles.actionButton} ${styles.acceptButton}`}
                            onClick={() => onAction(appointment, 'accept')}
                            disabled={isLoading}
                        >
                            <FaCheck /> {isLoading ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                            className={`${styles.actionButton} ${styles.rejectButton}`}
                            onClick={() => onAction(appointment, 'reject')}
                            disabled={isLoading}
                        >
                            <FaTimes /> {isLoading ? 'Processing...' : 'Reject'}
                        </button>
                    </>
                )}

                <button
                    className={`${styles.actionButton} ${styles.rescheduleButton}`}
                    onClick={() => onReschedule(appointment)}
                    disabled={isLoading}
                >
                    <FaRedo /> Reschedule
                </button>

                <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => onAction(appointment, 'delete')}
                    disabled={isLoading}
                >
                    <FaTrash /> Delete
                </button>
            </div>
        </div>
    );
}

// Pagination Controls Component
function PaginationControls({ pagination, onPageChange, generatePageNumbers }) {
    return (
        <div className={styles.paginationControls}>
            <button
                className={`${styles.paginationButton} ${!pagination.has_prev ? styles.disabled : ''}`}
                onClick={() => onPageChange(pagination.current_page - 1)}
                disabled={!pagination.has_prev}
            >
                <FaChevronLeft /> Previous
            </button>

            <div className={styles.pageNumbers}>
                {generatePageNumbers().map(pageNum => (
                    <button
                        key={pageNum}
                        className={`${styles.pageButton} ${pageNum === pagination.current_page ? styles.active : ''}`}
                        onClick={() => onPageChange(pageNum)}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>

            <button
                className={`${styles.paginationButton} ${!pagination.has_next ? styles.disabled : ''}`}
                onClick={() => onPageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next}
            >
                Next <FaChevronRight />
            </button>
        </div>
    );
}
