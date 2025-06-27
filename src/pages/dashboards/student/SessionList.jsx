import { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Filter, ChevronDown } from 'lucide-react';
import styles from './SessionList.module.css';
import defaultImage from '../../../assets/logo.jpg';

const SessionList = ({ sessions = [] }) => {
    const [filter, setFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredSessions = sessions.filter(session =>
        filter === 'all' || session.status.toLowerCase() === filter
    );

    const filterOptions = [
        { value: 'all', label: 'All Sessions', count: sessions.length },
        { value: 'pending', label: 'Pending', count: sessions.filter(s => s.status.toLowerCase() === 'pending').length },
        { value: 'confirmed', label: 'Confirmed', count: sessions.filter(s => s.status.toLowerCase() === 'confirmed').length },
        { value: 'completed', label: 'Completed', count: sessions.filter(s => s.status.toLowerCase() === 'completed').length },
        { value: 'cancelled', label: 'Cancelled', count: sessions.filter(s => s.status.toLowerCase() === 'cancelled').length },
        { value: 'rescheduled', label: 'Rescheduled', count: sessions.filter(s => s.status.toLowerCase() === 'rescheduled').length }
    ];

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Your Counselling Sessions</h1>
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
                            {filteredSessions.length}
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

            {/* Sessions List */}
            {filteredSessions.length > 0 ? (
                <div className={styles.sessionsList}>
                    {filteredSessions.map(session => (
                        <div key={session.id} className={styles.sessionCard}>
                            <div className={styles.sessionContent}>
                                {/* Counselor Image */}
                                <div className={styles.counselorImageContainer}>
                                    <img
                                        src={session.counsellor?.image || defaultImage}
                                        alt={session.counsellor?.name || 'Counselor'}
                                        className={styles.counselorImage}
                                    />
                                    <div className={styles.onlineIndicator}></div>
                                </div>

                                {/* Session Info */}
                                <div className={styles.sessionInfo}>
                                    <div className={styles.sessionHeader}>
                                        <div className={styles.sessionDetails}>
                                            <h3 className={styles.counselorName}>
                                                {session.counsellor?.name || 'Counselor Name'}
                                            </h3>
                                            <p className={styles.sessionDescription}>
                                                {session.description || 'Counselling Session'}
                                            </p>

                                            {/* Date and Time */}
                                            <div className={styles.sessionMeta}>
                                                <div className={styles.metaItem}>
                                                    <Calendar size={14} />
                                                    <span>{session.date}</span>
                                                </div>
                                                <div className={styles.metaItem}>
                                                    <Clock size={14} />
                                                    <span>{session.timeSlot}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={styles.statusContainer}>
                                            <span className={`${styles.statusBadge} ${styles[session.status.toLowerCase()]}`}>
                                                <span className={styles.statusIcon}>
                                                    {session.status.toLowerCase() === 'confirmed' && '✓'}
                                                    {session.status.toLowerCase() === 'pending' && '⏳'}
                                                    {session.status.toLowerCase() === 'completed' && '✓'}
                                                    {session.status.toLowerCase() === 'cancelled' && '✕'}
                                                    {session.status.toLowerCase() === 'rescheduled' && '↻'}
                                                </span>
                                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className={styles.sessionActions}>
                                        {session.status.toLowerCase() === 'pending' && (
                                            <button className={styles.actionButton}>
                                                Confirm Session
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {session.status.toLowerCase() === 'confirmed' && (
                                            <button className={styles.actionButton}>
                                                Join Session
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {(session.status.toLowerCase() === 'completed' || session.status.toLowerCase() === 'cancelled') && (
                                            <button className={styles.actionButtonSecondary}>
                                                View Details
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
                        No {filter !== 'all' ? filter : ''} sessions found
                    </h3>
                    <p className={styles.emptyStateText}>
                        {filter === 'all'
                            ? "You haven't booked any counselling sessions yet. Start your journey to better mental health today."
                            : `You have no ${filter} sessions at the moment.`
                        }
                    </p>
                    <button className={styles.emptyStateAction}>
                        <User size={16} />
                        Book Your First Session
                    </button>
                </div>
            )}
        </div>
    );
};

export default SessionList;