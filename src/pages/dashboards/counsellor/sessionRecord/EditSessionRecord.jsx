import React, { useState, useEffect } from "react";
import { FileText, Calendar, User, AlertTriangle, Brain, Target, Save, Clock, Shield, Stethoscope, Heart, Activity } from "lucide-react";
import styles from "./EditSessionRecord.module.css";
const EditSessionRecord = ({ existingRecord, sessionId, clientId, counsellorId, onSaved }) => {
    const [sessionRecord, setSessionRecord] = useState({
        presentingProblem: "",
        treatmentPlan: "",
        precipitatingFactors: "",
        problemSeverity: "Mild",
        riskAssessment: "",
        mentalStatusExam: "",
        nextVisitDate: "",
        counsellorName: "",
        appetite: "",
        sleep: "",
        bowelMovement: "",
        monthlyCycle: "",
        medicalPsychiatricHistory: "",
        assessedProblem: "",
        ...existingRecord
    });

    const [loading, setLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        setSessionRecord(prev => ({ ...prev, ...existingRecord }));
    }, [existingRecord]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSessionRecord((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSaved({
                ...sessionRecord,
                sessionId,
                clientId,
                counsellorId,
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Error saving session record:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.maxWidth}>
                {/* Medical Report Header */}
                <div className={styles.reportHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerLeft}>
                            <div className={styles.iconContainer}>
                                <Stethoscope className={styles.headerIcon} />
                            </div>
                            <div className={styles.headerInfo}>
                                <h1 className={styles.title}>Client intake form</h1>
                                <div className={styles.subtitle}>
                                    <span>Session #{sessionId}</span>
                                    <span className={styles.separator}>•</span>
                                    <span>Patient ID: {clientId}</span>
                                    <span className={styles.separator}>•</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.headerRight}>
                            {lastSaved && (
                                <div className={styles.saveStatus}>
                                    <Clock size={16} className={styles.clockIcon} />
                                    <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.reportGrid}>
                    {/* Main Clinical Content */}
                    <div className={styles.mainContent}>
                        {/* Chief Complaint */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <AlertTriangle className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>CHIEF COMPLAINT & PRESENTING PROBLEM</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="presentingProblem"
                                    value={sessionRecord.presentingProblem}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Document the patient's chief complaint, presenting symptoms, and primary concerns..."
                                />
                            </div>
                        </div>

                        {/* Assessment & Diagnosis */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Brain className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>CLINICAL ASSESSMENT</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="assessedProblem"
                                    value={sessionRecord.assessedProblem}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Professional assessment, differential diagnosis considerations, and clinical impressions..."
                                />
                            </div>
                        </div>

                        {/* Family Background / Genogram */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <User className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>FAMILY BACKGROUND / GENOGRAM</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="familyBackground"
                                    value={sessionRecord.familyBackground}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Provide detailed information about family members, relationships, and history..."
                                />
                            </div>
                        </div>

                        {/* Family Medical/Psychiatric History */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Heart className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>FAMILY MEDICAL/PSYCHIATRIC HISTORY</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="familyMedicalHistory"
                                    value={sessionRecord.familyMedicalHistory}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Detail any medical or psychiatric conditions within the family..."
                                />
                            </div>
                        </div>

                        {/* Academic History */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FileText className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>ACADEMIC HISTORY</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="academicHistory"
                                    value={sessionRecord.academicHistory}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Summarize academic background, performance, and challenges..."
                                />
                            </div>
                        </div>

                        {/* Psychosocial/Sexual/Forensic History */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Brain className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>PSYCHOSOCIAL/SEXUAL/FORENSIC HISTORY</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="psychosocialHistory"
                                    value={sessionRecord.psychosocialHistory}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Include relevant information about psychosocial, sexual, and forensic history..."
                                />
                            </div>
                        </div>

                        {/* Abuse History */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <AlertTriangle className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>ABUSE HISTORY</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="abuseHistory"
                                    value={sessionRecord.abuseHistory}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Document history of abuse: physical, emotional, cyber, or sexual..."
                                />
                            </div>
                        </div>


                        {/* Mental Status Examination */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Activity className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>MENTAL STATUS EXAMINATION</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="mentalStatusExam"
                                    value={sessionRecord.mentalStatusExam}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Appearance, behavior, speech, mood, affect, thought process, thought content, perception, cognition, insight, and judgment..."
                                />
                            </div>
                        </div>

                        {/* Treatment Plan */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Target className={styles.sectionIcon} />
                                <h2 className={styles.sectionTitle}>TREATMENT PLAN & INTERVENTIONS</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <textarea
                                    name="treatmentPlan"
                                    value={sessionRecord.treatmentPlan}
                                    onChange={handleInputChange}
                                    className={styles.clinicalTextarea}
                                    placeholder="Therapeutic interventions, goals, recommended treatments, and planned approach..."
                                />
                            </div>
                        </div>
                    </div>


                    {/* Clinical Sidebar */}
                    <div className={styles.sidebar}>
                        {/* Severity Assessment */}
                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarHeader}>
                                <Shield className={styles.sidebarIcon} />
                                <h3 className={styles.sidebarTitle}>SEVERITY RATING</h3>
                            </div>
                            <div className={styles.sidebarContent}>
                                <select
                                    name="problemSeverity"
                                    value={sessionRecord.problemSeverity}
                                    onChange={handleInputChange}
                                    className={`${styles.clinicalSelect} ${getSeverityStyle(
                                        sessionRecord.problemSeverity
                                    )}`}
                                >
                                    <option value="Mild">Mild</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Severe">Severe</option>
                                    <option value="Very Severe">Very Severe</option>
                                </select>
                            </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarHeader}>
                                <AlertTriangle className={styles.sidebarIcon} />
                                <h3 className={styles.sidebarTitle}>RISK ASSESSMENT</h3>
                            </div>
                            <div className={styles.sidebarContent}>
                                    <textarea
                                        name="riskAssessment"
                                        value={sessionRecord.riskAssessment}
                                        onChange={handleInputChange}
                                        className={styles.sidebarTextarea}
                                        placeholder="Suicide risk, self-harm, violence risk..."
                                    />
                            </div>
                        </div>

                        {/* Vegetative Signs */}
                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarHeader}>
                                <Heart className={styles.sidebarIcon} />
                                <h3 className={styles.sidebarTitle}>VEGETATIVE SIGNS</h3>
                            </div>
                            <div className={styles.sidebarContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.clinicalLabel}>Appetite:</label>
                                    <input
                                        name="appetite"
                                        value={sessionRecord.appetite}
                                        onChange={handleInputChange}
                                        className={styles.clinicalInput}
                                        placeholder="Normal/Decreased/Increased"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.clinicalLabel}>Sleep:</label>
                                    <input
                                        name="sleep"
                                        value={sessionRecord.sleep}
                                        onChange={handleInputChange}
                                        className={styles.clinicalInput}
                                        placeholder="Quality and pattern"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.clinicalLabel}>Bowel Movement:</label>
                                    <input
                                        name="bowelMovement"
                                        value={sessionRecord.bowelMovement}
                                        onChange={handleInputChange}
                                        className={styles.clinicalInput}
                                        placeholder="Regular/Irregular"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Clinical Details */}
                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarHeader}>
                                <User className={styles.sidebarIcon} />
                                <h3 className={styles.sidebarTitle}>CLINICAL DETAILS</h3>
                            </div>
                            <div className={styles.sidebarContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.clinicalLabel}>Counsellor:</label>
                                    <input
                                        name="counsellorName"
                                        value={sessionRecord.counsellorName}
                                        onChange={handleInputChange}
                                        className={styles.clinicalInput}
                                        placeholder="Clinician name"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.clinicalLabel}>Next Visit:</label>
                                    <input
                                        type="datetime-local"
                                        name="nextVisitDate"
                                        value={sessionRecord.nextVisitDate}
                                        onChange={handleInputChange}
                                        className={styles.clinicalInput}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Clinical Sections */}
                        <div className={styles.additionalSections}>
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <FileText className={styles.sectionIcon} />
                                    <h2 className={styles.sectionTitle}>PRECIPITATING FACTORS</h2>
                                </div>
                                <div className={styles.sectionContent}>
                                    <textarea
                                        name="precipitatingFactors"
                                        value={sessionRecord.precipitatingFactors}
                                        onChange={handleInputChange}
                                        className={styles.clinicalTextarea}
                                        placeholder="Environmental, social, psychological, or biological factors that may have triggered or contributed to the current presentation..."
                                    />
                                                        </div>
                                                    </div>

                                                    <div className={styles.section}>
                                                        <div className={styles.sectionHeader}>
                                                            <FileText className={styles.sectionIcon} />
                                                            <h2 className={styles.sectionTitle}>MEDICAL & PSYCHIATRIC HISTORY</h2>
                                                        </div>
                                                        <div className={styles.sectionContent}>
                                    <textarea
                                        name="medicalPsychiatricHistory"
                                        value={sessionRecord.medicalPsychiatricHistory}
                                        onChange={handleInputChange}
                                        className={styles.clinicalTextarea}
                                        placeholder="Relevant medical conditions, psychiatric history, medications, hospitalizations, and previous treatments..."
                                    />
                                                        </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className={styles.saveContainer}>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`${styles.saveButton} ${loading ? styles.saveButtonLoading : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        Saving Record...
                                    </>
                                ) : (
                                    <>
                                        <Save className={styles.saveIcon} />
                                        Save Clinical Record
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    function getSeverityStyle(severity) {
       const styles = {
         'Mild': { backgroundColor: '#f0f9ff', borderColor: '#10b981', color: '#065f46' },
          'Moderate': { backgroundColor: '#fffbeb', borderColor: '#f59e0b', color: '#92400e' },
          'Severe': { backgroundColor: '#fef2f2', borderColor: '#f97316', color: '#dc2626' },
           'Very Severe': { backgroundColor: '#fef2f2', borderColor: '#dc2626', color: '#991b1b' }
       };
        return styles[severity] || {};
    }
};

export default EditSessionRecord;
