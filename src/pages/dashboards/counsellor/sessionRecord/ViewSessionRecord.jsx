import React from 'react';
import styles from "./ViewSessionRecord.module.css";

export default function ViewSessionRecord({ sessionRecord, onEdit }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSeverityClass = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'mild': return styles.mild;
            case 'moderate': return styles.moderate;
            case 'severe':
            case 'very severe': return styles.severe;
            default: return '';
        }
    };

    if (!sessionRecord) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h2>No session record found</h2>
                    <p>Click Edit to create a new session record.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Session Record #{sessionRecord.sessionId}</h1>
                {onEdit && (
                    <button className={styles.editBtn} onClick={onEdit}>
                        Edit
                    </button>
                )}
            </div>

            {/* Basic Info */}
            <div className={styles.basicInfo}>
                <span>Counselor: <strong>{sessionRecord.counsellorName || 'N/A'}</strong></span>
                <span>
                    Severity: <span className={`${styles.severity} ${getSeverityClass(sessionRecord.problemSeverity)}`}>
                        {sessionRecord.problemSeverity || 'Not assessed'}
                    </span>
                </span>
                <span>Next Visit: <strong>{formatDate(sessionRecord.nextVisitDate)}</strong></span>
            </div>

            {/* Content Sections */}
            <div className={styles.content}>
                {sessionRecord.presentingProblem && (
                    <section className={styles.section}>
                        <h2>Presenting Problem</h2>
                        <p>{sessionRecord.presentingProblem}</p>
                    </section>
                )}

                {/* Vegetative Signs */}
                {(sessionRecord.appetite || sessionRecord.sleep || sessionRecord.bowelMovement || sessionRecord.monthlyCycle) && (
                    <section className={styles.section}>
                        <h2>Vegetative Signs</h2>
                        <div className={styles.itemList}>
                            {sessionRecord.appetite && <div><strong>Appetite:</strong> {sessionRecord.appetite}</div>}
                            {sessionRecord.sleep && <div><strong>Sleep:</strong> {sessionRecord.sleep}</div>}
                            {sessionRecord.bowelMovement && <div><strong>Bowel Movement:</strong> {sessionRecord.bowelMovement}</div>}
                            {sessionRecord.monthlyCycle && <div><strong>Monthly Cycle:</strong> {sessionRecord.monthlyCycle}</div>}
                        </div>
                    </section>
                )}

                {sessionRecord.medicalPsychiatricHistory && (
                    <section className={styles.section}>
                        <h2>Medical/Psychiatric History</h2>
                        <p>{sessionRecord.medicalPsychiatricHistory}</p>
                    </section>
                )}

                {/* Family Background */}
                {(sessionRecord.fatherInfo || sessionRecord.motherInfo || sessionRecord.siblingsInfo || sessionRecord.familyMedicalHistory) && (
                    <section className={styles.section}>
                        <h2>Family Background</h2>
                        {sessionRecord.fatherInfo && (
                            <div className={styles.subsection}>
                                <h3>Father</h3>
                                <p>{sessionRecord.fatherInfo}</p>
                            </div>
                        )}
                        {sessionRecord.motherInfo && (
                            <div className={styles.subsection}>
                                <h3>Mother</h3>
                                <p>{sessionRecord.motherInfo}</p>
                            </div>
                        )}
                        {sessionRecord.siblingsInfo && (
                            <div className={styles.subsection}>
                                <h3>Siblings</h3>
                                <p>{sessionRecord.siblingsInfo}</p>
                            </div>
                        )}
                        {sessionRecord.familyMedicalHistory && (
                            <div className={styles.subsection}>
                                <h3>Medical History</h3>
                                <p>{sessionRecord.familyMedicalHistory}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Personal History */}
                {(sessionRecord.academicHistory || sessionRecord.psychosocialHistory || sessionRecord.abuseHistory) && (
                    <section className={styles.section}>
                        <h2>Personal History</h2>
                        {sessionRecord.academicHistory && (
                            <div className={styles.subsection}>
                                <h3>Academic</h3>
                                <p>{sessionRecord.academicHistory}</p>
                            </div>
                        )}
                        {sessionRecord.psychosocialHistory && (
                            <div className={styles.subsection}>
                                <h3>Psychosocial</h3>
                                <p>{sessionRecord.psychosocialHistory}</p>
                            </div>
                        )}
                        {sessionRecord.abuseHistory && (
                            <div className={styles.subsection}>
                                <h3>Abuse History</h3>
                                <p>{sessionRecord.abuseHistory}</p>
                            </div>
                        )}
                    </section>
                )}

                {sessionRecord.riskAssessment && (
                    <section className={styles.section}>
                        <h2>Risk Assessment</h2>
                        <p>{sessionRecord.riskAssessment}</p>
                    </section>
                )}

                {sessionRecord.mentalStatusExam && (
                    <section className={styles.section}>
                        <h2>Mental Status Examination</h2>
                        <p>{sessionRecord.mentalStatusExam}</p>
                    </section>
                )}

                {/* Assessment and Treatment */}
                {(sessionRecord.assessedProblem || sessionRecord.treatmentPlan) && (
                    <section className={styles.section}>
                        <h2>Assessment and Treatment</h2>
                        {sessionRecord.assessedProblem && (
                            <div className={styles.subsection}>
                                <h3>Assessment</h3>
                                <p>{sessionRecord.assessedProblem}</p>
                            </div>
                        )}
                        {sessionRecord.treatmentPlan && (
                            <div className={styles.subsection}>
                                <h3>Treatment Plan</h3>
                                <p>{sessionRecord.treatmentPlan}</p>
                            </div>
                        )}
                    </section>
                )}

                {sessionRecord.precipitatingFactors && (
                    <section className={styles.section}>
                        <h2>Precipitating Factors</h2>
                        <p>{sessionRecord.precipitatingFactors}</p>
                    </section>
                )}

                {/* Footer */}
                <footer className={styles.footer}>
                    <div>Created: {formatDate(sessionRecord.createdAt)}</div>
                    <div>Updated: {formatDate(sessionRecord.updatedAt)}</div>
                    {sessionRecord.counselorSignature && (
                        <div>Signed by: {sessionRecord.counselorSignature}</div>
                    )}
                </footer>
            </div>
        </div>
    );
}