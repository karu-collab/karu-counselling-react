import { useEffect, useState } from 'react';
import { useAuthentication } from '../../../hooks/AuthenticationContext.jsx';
import SessionService from '../../../services/SessionService';
import ClientService from '../../../services/ClientService';
import styles from './SessionManager.module.css';
import { FaCalendar, FaCheck, FaTimes, FaRedo, FaTrash } from 'react-icons/fa';


const userId = localStorage.getItem('userId')

export default function SessionManager() {
    const { accessToken, baseUrl, userInfo } = useAuthentication();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({
        date: '',
        timeSlot: ''
    });
    const [isRescheduling, setIsRescheduling] = useState(false);

    // Fetch sessions on component mount
    useEffect(() => {
        fetchSessions();
    }, [ ]);

    const fetchSessions = async () => {
        if ( !accessToken) return;

        try {
            setLoading(true);
            const response = await SessionService.fetchCounsellorSessions(
                baseUrl,
                accessToken,
                userId
            );

            console.log('counsellor sessions: ', await response)
            
            if (response && response._embedded && response._embedded.sessionList) {
                // Sort sessions by date (newest first)
                const sortedSessions = response._embedded.sessionList.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                setSessions(sortedSessions);
            } else {
                setSessions([]);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch sessions. Please try again later.');
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (session) => {
        try {
            // Update session status to CONFIRMED
            const updatedSession = { ...session, status: 'CONFIRMED' };
            
            // Add the student to the client list
            console.log('user info:',userInfo)
            await ClientService.addClient(
                baseUrl,
                accessToken,
                {
                    counsellorId: userInfo.userId,
                    studentId: session.studentId,
                    sessionId: session.sessionId
                }
            );
            
            // Update the session list to reflect the changes
            setSessions(sessions.map(s => 
                s.sessionId === session.sessionId ? updatedSession : s
            ));
            
            // Refresh sessions from the server
            fetchSessions();
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
                    ? { ...s,status: RESCHEDULED, date: new Date(rescheduleData.date), timeSlot: rescheduleData.timeSlot } 
                    : s
            ));
            
            closeRescheduleModal();
            // Refresh sessions from the server
            fetchSessions();
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

    return (
        <div className={styles.sessionManager}>
            <div className={styles.header}>
                <h2>Session Management</h2>
                <button 
                    className={styles.refreshButton} 
                    onClick={fetchSessions}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading sessions...</div>
            ) : sessions.length === 0 ? (
                <div className={styles.noSessions}>No sessions found.</div>
            ) : (
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