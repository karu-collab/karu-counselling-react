import { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Filter, ChevronDown, MoreHorizontal, Edit, Trash2, RefreshCw } from 'lucide-react';
import styles from './AppointmentList.module.css';
import defaultImage from '../../../assets/logo.jpg';

const AppointmentList = ({
                             appointments = [],
                             onReschedule,
                             onCancel,
                             onBookAgain,
                             onUpdateStatus,
                             onDelete
                         }) => {
    const [filter, setFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const filteredAppointments = appointments.filter(appointment =>
        filter === 'all' || appointment.status.toLowerCase() === filter.toLowerCase()
    );

    const filterOptions = [
        { value: 'all', label: 'All Appointments', count: appointments.length },
        { value: 'pending', label: 'Pending', count: appointments.filter(a => a.status.toLowerCase() === 'pending').length },
        { value: 'accepted', label: 'Accepted', count: appointments.filter(a => a.status.toLowerCase() === 'accepted').length },
        { value: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status.toLowerCase() === 'confirmed').length },
        { value: 'completed', label: 'Completed', count: appointments.filter(a => a.status.toLowerCase() === 'completed').length },
        { value: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status.toLowerCase() === 'cancelled').length },
        { value: 'rescheduled', label: 'Rescheduled', count: appointments.filter(a => a.status.toLowerCase() === 'rescheduled').length }
    ];

    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'pending': return '#f59e0b';
            case 'accepted':
            case 'confirmed': return '#10b981';
            case 'completed': return '#6b7280';
            case 'cancelled': return '#ef4444';
            case 'rescheduled': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'pending': return '⏳';
            case 'accepted':
            case 'confirmed': return '✓';
            case 'completed': return '✓';
            case 'cancelled': return '✕';
            case 'rescheduled': return '↻';
            default: return '';
        }
    };

    const handleActionClick = (appointmentId, action) => {
        setActiveDropdown(null);

        switch (action) {
            case 'reschedule':
                onReschedule?.(appointmentId);
                break;
            case 'cancel':
                onCancel?.(appointmentId);
                break;
            case 'delete':
                onDelete?.(appointmentId);
                break;
            case 'book-again':
                onBookAgain?.(appointmentId);
                break;
            case 'accept':
                onUpdateStatus?.(appointmentId, 'ACCEPTED');
                break;
            case 'confirm':
                onUpdateStatus?.(appointmentId, 'CONFIRMED');
                break;
            default:
                console.log('Unknown action:', action);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Time not available';
        return timeString;
    };

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Your Counselling Appointments</h1>
                    <p className={styles.subtitle}>Manage and track your appointments</p>
                </div>

                {/* Filter Dropdown */}
                <div className={styles.filterContainer}>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={styles.filterButton}
                    >
                        <Filter size={16} />
                        <span className={styles.filterLabel}>
                            {filterOptions.find(opt => opt.value === filter)?.label}
                        </span>
                        <span className={styles.filterCount}>
                            {filteredAppointments.length}
                        </span>
                        <ChevronDown size={16} className={isFilterOpen ? styles.chevronUp : styles.chevronDown} />
                    </button>

                    {isFilterOpen && (
                        <div className={styles.filterDropdown}>
                            {filterOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setFilter(option.value);
                                        setIsFilterOpen(false);
                                    }}
                                    className={`${styles.filterOption} ${
                                        filter === option.value ? styles.filterOptionActive : ''
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    <span className={styles.optionCount}>{option.count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                    {filteredAppointments.map(appointment => (
                        <div key={appointment.id} className={styles.appointmentCard}>
                            <div className={styles.appointmentContent}>
                                {/* Counselor Image */}
                                <div className={styles.counselorImageContainer}>
                                    <img
                                        src={appointment.counsellor?.image || defaultImage}
                                        alt={appointment.counsellor?.name || 'Counselor'}
                                        className={styles.counselorImage}
                                    />
                                    <div className={styles.onlineIndicator}></div>
                                </div>

                                {/* Appointment Info */}
                                <div className={styles.appointmentInfo}>
                                    <div className={styles.appointmentHeader}>
                                        <div className={styles.appointmentDetails}>
                                            <h3 className={styles.counselorName}>
                                                {appointment.counsellor?.name || 'Counselor Name'}
                                            </h3>
                                            <p className={styles.appointmentDescription}>
                                                {appointment.description || 'Counselling Appointment'}
                                            </p>

                                            {/* Date and Time */}
                                            <div className={styles.appointmentMeta}>
                                                <div className={styles.metaItem}>
                                                    <Calendar size={14} />
                                                    <span>{formatDate(appointment.date)}</span>
                                                </div>
                                                <div className={styles.metaItem}>
                                                    <Clock size={14} />
                                                    <span>{formatTime(appointment.timeSlot)}</span>
                                                </div>
                                            </div>

                                            {appointment.notes && (
                                                <div className={styles.appointmentNotes}>
                                                    <strong>Notes:</strong> {appointment.notes}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badge and Actions */}
                                        <div className={styles.statusContainer}>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: getStatusColor(appointment.status) }}
                                            >
                                                <span className={styles.statusIcon}>
                                                    {getStatusIcon(appointment.status)}
                                                </span>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase()}
                                            </span>

                                            {/* More Actions Dropdown */}
                                            <div className={styles.actionsDropdown}>
                                                <button
                                                    onClick={() => setActiveDropdown(
                                                        activeDropdown === appointment.id ? null : appointment.id
                                                    )}
                                                    className={styles.moreButton}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {activeDropdown === appointment.id && (
                                                    <div className={styles.actionsMenu}>
                                                        {appointment.status.toLowerCase() === 'pending' && (
                                                            <button
                                                                onClick={() => handleActionClick(appointment.id, 'accept')}
                                                                className={styles.actionMenuItem}
                                                            >
                                                                <ArrowRight size={14} />
                                                                Accept Appointment
                                                            </button>
                                                        )}

                                                        {(appointment.status.toLowerCase() === 'pending' ||
                                                            appointment.status.toLowerCase() === 'accepted') && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleActionClick(appointment.id, 'reschedule')}
                                                                    className={styles.actionMenuItem}
                                                                >
                                                                    <RefreshCw size={14} />
                                                                    Reschedule
                                                                </button>
                                                                <button
                                                                    onClick={() => handleActionClick(appointment.id, 'cancel')}
                                                                    className={styles.actionMenuItem}
                                                                >
                                                                    <Edit size={14} />
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}

                                                        {(appointment.status.toLowerCase() === 'completed' ||
                                                            appointment.status.toLowerCase() === 'cancelled') && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleActionClick(appointment.id, 'book-again')}
                                                                    className={styles.actionMenuItem}
                                                                >
                                                                    <Calendar size={14} />
                                                                    Book Again
                                                                </button>
                                                                <button
                                                                    onClick={() => handleActionClick(appointment.id, 'delete')}
                                                                    className={`${styles.actionMenuItem} ${styles.deleteAction}`}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Primary Action Button */}
                                    <div className={styles.appointmentActions}>
                                        {appointment.status.toLowerCase() === 'pending' && (
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleActionClick(appointment.id, 'accept')}
                                            >
                                                Accept Appointment
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {(appointment.status.toLowerCase() === 'accepted' ||
                                            appointment.status.toLowerCase() === 'confirmed') && (
                                            <button className={styles.actionButton}>
                                                Join Appointment
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {appointment.status.toLowerCase() === 'completed' && (
                                            <button
                                                className={styles.actionButtonSecondary}
                                                onClick={() => handleActionClick(appointment.id, 'book-again')}
                                            >
                                                Book Again
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {appointment.status.toLowerCase() === 'cancelled' && (
                                            <button
                                                className={styles.actionButtonSecondary}
                                                onClick={() => handleActionClick(appointment.id, 'book-again')}
                                            >
                                                Book New Appointment
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                        <Calendar size={48} />
                    </div>
                    <h3 className={styles.emptyStateTitle}>
                        No {filter !== 'all' ? filter : ''} appointments found
                    </h3>
                    <p className={styles.emptyStateText}>
                        {filter === 'all'
                            ? "You haven't booked any counselling appointments yet. Start your journey to better mental health today."
                            : `You have no ${filter} appointments at the moment.`
                        }
                    </p>
                    <button className={styles.emptyStateAction}>
                        <User size={16} />
                        Book Your First Appointment
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentList;