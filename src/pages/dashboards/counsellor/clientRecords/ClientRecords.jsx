import React, { useState } from 'react';
import styles from './ClientRecords.module.css';
import EditSessionRecord from "../sessionRecord/EditSessionRecord.jsx";
import { useAuthentication } from "../../../hooks/AuthenticationContext.jsx";
import ViewSessionRecord from "../sessionRecord/ViewSessionRecord.jsx";
import axios from "axios";
import ClientEditModal from "./clientEditModal/ClientEditModal.jsx";

export default function ClientRecords(props) {
    const { accessToken, baseUrl } = useAuthentication();
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [showSessionRecord, setShowSessionRecord] = useState(false);
    const [sessionRecords, setSessionRecords] = useState({});
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('view');
    const [showEditModal, setShowEditModal] = useState(false);
    const [clientData, setClientData] = useState(props.client);

    const { counsellorId } = props;

    // Fetch session record by ID
    const fetchSessionRecord = async (sessionId, sessionRecordId, mode = 'view') => {
        if (sessionRecords[sessionRecordId]) {
            setSelectedSessionId(sessionId);
            setViewMode(mode);
            setShowSessionRecord(true);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/api/v1/session-records/${sessionRecordId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            setSessionRecords(prev => ({
                ...prev,
                [sessionRecordId]: response.data
            }));

            setSelectedSessionId(sessionId);
            setViewMode(mode);
            setShowSessionRecord(true);
        } catch (error) {
            console.error("Error fetching session record:", error);
            setSelectedSessionId(sessionId);
            setViewMode('edit');
            setShowSessionRecord(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle client details update
    const handleClientUpdate = async (updatedData) => {
        try {
            setLoading(true);
            const response = await axios.put(
                `${baseUrl}/api/v1/clients/${clientData.id}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            setClientData(response.data);
            setShowEditModal(false);
            console.log('Client updated successfully');
        } catch (error) {
            console.error("Error updating client:", error);
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return styles.statusConfirmed;
            case 'pending':
                return styles.statusPending;
            case 'cancelled':
                return styles.statusCancelled;
            case 'completed':
                return styles.statusCompleted;
            default:
                return styles.statusDefault;
        }
    };

    const handleCloseSessionRecord = () => {
        setShowSessionRecord(false);
        setSelectedSessionId(null);
        setViewMode('view');
    };

    const handleSessionRecordSaved = async (updatedRecord) => {
        try {
            setLoading(true);
            const response = await axios.put(
                `${baseUrl}/api/v1/session-records/${updatedRecord.id}`,
                updatedRecord,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            if (selectedSessionId && updatedRecord) {
                const sessionRecordId = clientData.sessions.find(s => s.sessionId === selectedSessionId)?.sessionRecordId;
                if (sessionRecordId) {
                    setSessionRecords(prev => ({
                        ...prev,
                        [sessionRecordId]: updatedRecord
                    }));
                }
            }
            console.log("Session record saved successfully");
        } catch (error) {
            console.error("Error updating session record:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchToEdit = () => {
        setViewMode('edit');
    };

    const handleSwitchToView = () => {
        setViewMode('view');
    };

    if (showSessionRecord && selectedSessionId) {
        const selectedSession = clientData.sessions.find(s => s.sessionId === selectedSessionId);
        const sessionRecord = sessionRecords[selectedSession?.sessionRecordId];

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button
                        className={styles.backButton}
                        onClick={handleCloseSessionRecord}
                    >
                        ← Back to Client Records
                    </button>
                    <h2>Session Record - {selectedSession?.description || `Session ${selectedSessionId}`}</h2>

                    <div className={styles.modeToggle}>
                        <button
                            className={`${styles.backButton} ${viewMode === 'view' ? styles.activeMode : ''}`}
                            onClick={handleSwitchToView}
                            disabled={!sessionRecord}
                        >
                            View
                        </button>
                        <button
                            className={`${styles.backButton} ${viewMode === 'edit' ? styles.activeMode : ''}`}
                            onClick={handleSwitchToEdit}
                        >
                            Edit
                        </button>
                    </div>
                </div>

                {viewMode === 'view' && sessionRecord ? (
                    <ViewSessionRecord
                        sessionRecord={sessionRecord}
                        onEdit={handleSwitchToEdit}
                    />
                ) : (
                    <EditSessionRecord
                        sessionId={selectedSessionId}
                        clientId={clientData.id}
                        counsellorId={counsellorId}
                        existingRecord={sessionRecord}
                        onSaved={handleSessionRecordSaved}
                        onCancel={sessionRecord ? handleSwitchToView : handleCloseSessionRecord}
                    />
                )}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Client Details Section - Enhanced */}
            <div className={styles.clientDetailsSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Client Details</h2>
                    <button
                        className={styles.editButton}
                        onClick={() => setShowEditModal(true)}
                        disabled={loading}
                    >
                        Edit Details
                    </button>
                </div>

                <div className={styles.clientCard}>
                    <div className={styles.clientHeader}>
                        <div className={styles.clientName}>
                            {clientData.firstName} {clientData.lastName}
                        </div>
                        <div className={styles.clientId}>ID: {clientData.id}</div>
                    </div>

                    <div className={styles.detailsGrid}>
                        {/* Personal Information */}
                        <div className={styles.detailsSection}>
                            <h4 className={styles.subsectionTitle}>Personal Information</h4>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Full Name:</span>
                                <span className={styles.value}>{clientData.firstName} {clientData.lastName}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Age:</span>
                                <span className={styles.value}>{clientData.age || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Gender:</span>
                                <span className={styles.value}>{clientData.gender || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Marital Status:</span>
                                <span className={styles.value}>{clientData.maritalStatus || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Religion:</span>
                                <span className={styles.value}>{clientData.religionDenomination || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className={styles.detailsSection}>
                            <h4 className={styles.subsectionTitle}>Contact Information</h4>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Email:</span>
                                <span className={styles.value}>{clientData.email}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Phone:</span>
                                <span className={styles.value}>{clientData.phoneNumber || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Mobile:</span>
                                <span className={styles.value}>{clientData.mobileNumber || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Residency:</span>
                                <span className={styles.value}>{clientData.residency || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Living with Someone:</span>
                                <span className={styles.value}>{clientData.livingWithSomeone || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className={styles.detailsSection}>
                            <h4 className={styles.subsectionTitle}>Academic Information</h4>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Registration Number:</span>
                                <span className={styles.value}>{clientData.registrationNumber || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Year of Study:</span>
                                <span className={styles.value}>{clientData.yearOfStudy || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Client Code:</span>
                                <span className={styles.value}>{clientData.clientCode || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className={styles.detailsSection}>
                            <h4 className={styles.subsectionTitle}>Emergency Contact</h4>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Next of Kin:</span>
                                <span className={styles.value}>{clientData.nextOfKin || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Kin Telephone:</span>
                                <span className={styles.value}>{clientData.kinTelNumber || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Relationship to Kin:</span>
                                <span className={styles.value}>{clientData.relationshipToKin || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className={styles.detailsSection}>
                            <h4 className={styles.subsectionTitle}>Additional Information</h4>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Disability:</span>
                                <span className={styles.value}>{clientData.disability || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Referral Source:</span>
                                <span className={styles.value}>{clientData.referralSource || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>User ID:</span>
                                <span className={styles.value}>{clientData.userId}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Total Sessions:</span>
                                <span className={styles.value}>{clientData.totalSessions}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Registered:</span>
                                <span className={styles.value}>{formatDate(clientData.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sessions List Section */}
            <div className={styles.sessionsSection}>
                <h2 className={styles.sectionTitle}>Session History</h2>

                {clientData.sessions && clientData.sessions.length > 0 ? (
                    <div className={styles.sessionsList}>
                        {clientData.sessions.map((session) => (
                            <div key={session.sessionId} className={styles.sessionCard}>
                                <div className={styles.sessionHeader}>
                                    <div className={styles.sessionInfo}>
                                        <h3 className={styles.sessionTitle}>
                                            Session #{session.sessionId}
                                        </h3>
                                        <p className={styles.sessionDate}>
                                            {formatDate(session.date)}
                                        </p>
                                    </div>
                                    <div className={styles.sessionMeta}>
                                        <span className={`${styles.statusBadge} ${getStatusClass(session.status)}`}>
                                            {session.status}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.sessionDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Time Slot:</span>
                                        <span className={styles.value}>{session.timeSlot}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Description:</span>
                                        <span className={styles.value}>{session.description}</span>
                                    </div>
                                    {session.sessionRecordId && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.label}>Record ID:</span>
                                            <span className={styles.value}>{session.sessionRecordId}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.sessionActions}>
                                    {session.sessionRecordId ? (
                                        <>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => fetchSessionRecord(session.sessionId, session.sessionRecordId, 'view')}
                                                disabled={loading}
                                            >
                                                {loading && selectedSessionId === session.sessionId
                                                    ? 'Loading...'
                                                    : 'View Record'
                                                }
                                            </button>
                                            <button
                                                className={styles.recordButton}
                                                onClick={() => fetchSessionRecord(session.sessionId, session.sessionRecordId, 'edit')}
                                                disabled={loading}
                                            >
                                                {loading && selectedSessionId === session.sessionId
                                                    ? 'Loading...'
                                                    : 'Edit Record'
                                                }
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className={styles.recordButton}
                                            onClick={() => fetchSessionRecord(session.sessionId, session.sessionRecordId, 'edit')}
                                            disabled={loading}
                                        >
                                            {loading && selectedSessionId === session.sessionId
                                                ? 'Loading...'
                                                : 'Create Record'
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noSessions}>
                        <p>No sessions found for this client.</p>
                    </div>
                )}
            </div>

            {/* Client Edit Modal */}
            <ClientEditModal
                client={clientData}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleClientUpdate}
            />
        </div>
    );
}