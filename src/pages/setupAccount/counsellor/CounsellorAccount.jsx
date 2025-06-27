import  { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, Save, AlertCircle, } from 'lucide-react';
import styles from './CounsellorAccount.module.css';
import axiosInstance from "../../../utils/axiosInstance.jsx";
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner.jsx";
import {useNavigate} from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL


// Utility functions for time slot validation
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const doSlotsOverlap = (slot1, slot2) => {
    const start1 = timeToMinutes(slot1.start);
    const end1 = timeToMinutes(slot1.end);
    const start2 = timeToMinutes(slot2.start);
    const end2 = timeToMinutes(slot2.end);
    return start1 < end2 && start2 < end1;
};

const validateTimeSlot = (newSlot, existingSlots) => {
    const errors = [];
    const conflictingSlots = [];

    if (!newSlot.start || !newSlot.end) {
        errors.push('Both start and end times are required');
        return { isValid: false, conflictingSlots, errors };
    }

    const startMinutes = timeToMinutes(newSlot.start);
    const endMinutes = timeToMinutes(newSlot.end);

    if (endMinutes <= startMinutes) {
        errors.push('End time must be after start time');
    }

    const minDurationMinutes = 30;
    if (endMinutes - startMinutes < minDurationMinutes) {
        errors.push(`Time slot must be at least ${minDurationMinutes} minutes long`);
    }

    const maxDurationMinutes = 240;
    if (endMinutes - startMinutes > maxDurationMinutes) {
        errors.push(`Time slot cannot exceed ${maxDurationMinutes / 60} hours`);
    }

    existingSlots.forEach(existingSlot => {
        if (doSlotsOverlap(newSlot, existingSlot)) {
            conflictingSlots.push(existingSlot);
            errors.push(`Conflicts with existing slot: ${existingSlot.label}`);
        }
    });

    const isDuplicate = existingSlots.some(slot =>
        slot.start === newSlot.start && slot.end === newSlot.end
    );

    if (isDuplicate) {
        errors.push('This exact time slot already exists');
    }

    return {
        isValid: errors.length === 0,
        conflictingSlots,
        errors
    };
};

export default function CounsellorAccount() {
    const [workingDays, setWorkingDays] = useState({
        monday: { enabled: false, timeslots: [] },
        tuesday: { enabled: false, timeslots: [] },
        wednesday: { enabled: false, timeslots: [] },
        thursday: { enabled: false, timeslots: [] },
        friday: { enabled: false, timeslots: [] },
        saturday: { enabled: false, timeslots: [] },
        sunday: { enabled: false, timeslots: [] }
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()
    const {user} = useAuth();

    const [newSlot, setNewSlot] = useState({ start: '', end: '' });
    const [activeDay, setActiveDay] = useState('monday');
    const [validationErrors, setValidationErrors] = useState([]);
    const [showValidation, setShowValidation] = useState(false);

    const dayNames = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    };

    const toggleDay = (day) => {
        setWorkingDays(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                enabled: !prev[day].enabled,
                timeslots: prev[day].enabled ? [] : prev[day].timeslots
            }
        }));
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const addTimeSlot = (day) => {
        // Clear previous validation errors
        setValidationErrors([]);
        setShowValidation(false);

        // Validate the new time slot
        const validation = validateTimeSlot(newSlot, workingDays[day].timeslots);

        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setShowValidation(true);
            return;
        }

        const newTimeslot = {
            id: Date.now(),
            start: newSlot.start,
            end: newSlot.end,
            label: `${formatTime(newSlot.start)} - ${formatTime(newSlot.end)}`
        };

        setWorkingDays(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeslots: [...prev[day].timeslots, newTimeslot].sort((a, b) => a.start.localeCompare(b.start))
            }
        }));

        setNewSlot({ start: '', end: '' });
        setShowValidation(false);
    };

    const removeTimeSlot = (day, slotId) => {
        setWorkingDays(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeslots: prev[day].timeslots.filter(slot => slot.id !== slotId)
            }
        }));
    };

    const addPresetSlot = (day, preset) => {
        // Validate preset slot before adding
        const validation = validateTimeSlot(preset, workingDays[day].timeslots);

        if (!validation.isValid) {
            alert(`Cannot add preset slot: ${validation.errors.join(', ')}`);
            return;
        }

        const newTimeslot = {
            id: Date.now(),
            start: preset.start,
            end: preset.end,
            label: preset.label
        };

        setWorkingDays(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeslots: [...prev[day].timeslots, newTimeslot].sort((a, b) => a.start.localeCompare(b.start))
            }
        }));
    };

    const saveSchedule = async () => {
        // Validate all days before saving
        const allErrors = [];

        Object.entries(workingDays).forEach(([day, dayData]) => {
            if (dayData.enabled && dayData.timeslots.length === 0) {
                allErrors.push(`${dayNames[day]} is enabled but has no time slots`);
            }

            // Check for internal conflicts within each day
            for (let i = 0; i < dayData.timeslots.length; i++) {
                for (let j = i + 1; j < dayData.timeslots.length; j++) {
                    if (doSlotsOverlap(dayData.timeslots[i], dayData.timeslots[j])) {
                        allErrors.push(`${dayNames[day]}: Conflict between ${dayData.timeslots[i].label} and ${dayData.timeslots[j].label}`);
                    }
                }
            }
        });

        if (allErrors.length > 0) {
            alert(`Please fix the following issues before saving:\n${allErrors.join('\n')}`);
            return;
        }

        // Validate user ID exists
        if (!user?.id) {
            alert('User authentication error. Please refresh and try again.');
            return;
        }

        const enabledDays = Object.entries(workingDays)
            .filter(([, dayData]) => dayData.enabled)
            .reduce((acc, [day, dayData]) => {
                acc[day] = dayData;
                return acc;
            }, {});

        // Validate we have at least one enabled day
        if (Object.keys(enabledDays).length === 0) {
            alert('Please enable at least one working day before saving.');
            return;
        }

        try {
            setIsLoading(true);

            const response = await axiosInstance.post(`${BASE_URL}/auth/counsellor/setup-account`, {
                userId: user.id,
                workCalender: enabledDays,
            });

            console.log('Server response:', response.data);

            // Update local user state on successful response
            if (response.status === 200) {
                // Update the user object
                const updatedUser = { ...user, account_is_set: true };
                localStorage.setItem('karu_user', JSON.stringify(updatedUser));

                user.account_is_set = true

                alert('Schedule saved successfully! Your counsellor account is now set up.');

               navigate('/dashboard')
            }

        } catch (error) {
            console.error('Error saving schedule:', error);

            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const errorMessage = error.response.data?.detail || 'Failed to save schedule';
                alert(`Error: ${errorMessage}`);
            } else if (error.request) {
                // Request was made but no response received
                alert('Network error. Please check your connection and try again.');
            } else {
                // Something else happened
                alert('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const quickAddPresets = [
        { label: '9:00 - 10:00', start: '09:00', end: '10:00' },
        { label: '10:15 - 11:15', start: '10:15', end: '11:15' },
        { label: '11:30 - 12:30', start: '11:30', end: '12:30' },
        { label: '2:00 - 3:00', start: '14:00', end: '15:00' },
        { label: '3:15 - 4:15', start: '15:15', end: '16:15' },
        { label: '4:30 - 5:30', start: '16:30', end: '17:30' }
    ];

    // Check if current input would be valid (for real-time feedback)
    const currentValidation = newSlot.start && newSlot.end
        ? validateTimeSlot(newSlot, workingDays[activeDay].timeslots)
        : { isValid: true, errors: [] };

    return (
        <div className={styles.container}>
            <div className={styles.maxWidth}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <Calendar className={styles.titleIcon} />
                        Create Your Booking Calendar
                    </h1>
                    <p className={styles.subtitle}>Set up your working days and available time slots for client sessions</p>
                </div>

                <div className={`${styles.grid} ${styles.gridLg}`}>
                    {/* Day Selection */}
                    <div className={styles.card}>
                        <h2 className={styles.cardHeader}>Working Days</h2>
                        <div className={styles.daysList}>
                            {Object.entries(dayNames).map(([key, name]) => (
                                <div key={key} className={styles.dayItem}>
                                    <span className={styles.dayName}>{name}</span>
                                    <div className={styles.dayControls}>
                                        <span className={styles.slotCount}>
                                            {workingDays[key].timeslots.length} slots
                                        </span>
                                        <button
                                            onClick={() => setActiveDay(key)}
                                            className={`${styles.editButton} ${
                                                activeDay === key ? styles.editButtonActive : styles.editButtonInactive
                                            }`}
                                        >
                                            Edit
                                        </button>
                                        <label className={styles.toggle}>
                                            <input
                                                type="checkbox"
                                                className={styles.toggleInput}
                                                checked={workingDays[key].enabled}
                                                onChange={() => toggleDay(key)}
                                            />
                                            <div className={`${styles.toggleSlider} ${
                                                workingDays[key].enabled ? styles.toggleSliderOn : styles.toggleSliderOff
                                            }`}>
                                                <div className={`${styles.toggleThumb} ${
                                                    workingDays[key].enabled ? styles.toggleThumbOn : styles.toggleThumbOff
                                                }`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Slot Management */}
                    <div className={styles.card}>
                        <div className={styles.timeSlotHeader}>
                            <h2 className={`${styles.cardHeader} ${styles.cardHeaderWithIcon}`}>
                                <Clock className={styles.cardHeaderIcon} />
                                {dayNames[activeDay]} Time Slots
                            </h2>
                            <div>
                                <span className={`${styles.status} ${
                                    workingDays[activeDay].enabled ? styles.statusActive : styles.statusInactive
                                }`}>
                                    {workingDays[activeDay].enabled ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {!workingDays[activeDay].enabled ? (
                            <div className={styles.inactiveState}>
                                <Calendar className={styles.inactiveIcon} />
                                <p className={styles.inactiveText}>This day is not enabled for bookings</p>
                                <button
                                    onClick={() => toggleDay(activeDay)}
                                    className={styles.enableButton}
                                >
                                    Enable {dayNames[activeDay]}
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Add New Time Slot */}
                                <div className={styles.addSlotSection}>
                                    <h3 className={styles.addSlotTitle}>Add Time Slot</h3>

                                    {/* Validation Messages */}
                                    {showValidation && validationErrors.length > 0 && (
                                        <div style={{
                                            backgroundColor: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '6px',
                                            padding: '12px',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <AlertCircle size={16} color="#dc2626" />
                                                <span style={{ fontWeight: '600', color: '#dc2626' }}>Validation Errors</span>
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#dc2626' }}>
                                                {validationErrors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Real-time validation feedback */}
                                    {newSlot.start && newSlot.end && !currentValidation.isValid && (
                                        <div style={{
                                            backgroundColor: '#fef3cd',
                                            border: '1px solid #fde68a',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            marginBottom: '12px',
                                            fontSize: '14px',
                                            color: '#92400e'
                                        }}>
                                            <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                            {currentValidation.errors[0]}
                                        </div>
                                    )}

                                    <div className={styles.addSlotGrid}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.inputLabel}>Start Time</label>
                                            <input
                                                type="time"
                                                value={newSlot.start}
                                                onChange={(e) => setNewSlot(prev => ({ ...prev, start: e.target.value }))}
                                                className={styles.timeInput}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.inputLabel}>End Time</label>
                                            <input
                                                type="time"
                                                value={newSlot.end}
                                                onChange={(e) => setNewSlot(prev => ({ ...prev, end: e.target.value }))}
                                                className={styles.timeInput}
                                            />
                                        </div>
                                        <div className={styles.addSlotButtonContainer}>
                                            <button
                                                onClick={() => addTimeSlot(activeDay)}
                                                disabled={!currentValidation.isValid}
                                                className={styles.addSlotButton}
                                                style={{
                                                    opacity: !currentValidation.isValid ? 0.5 : 1,
                                                    cursor: !currentValidation.isValid ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {currentValidation.isValid ? (
                                                    <Plus className={styles.addIcon} />
                                                ) : (
                                                    <AlertCircle className={styles.addIcon} />
                                                )}
                                                Add Slot
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Add Presets */}
                                <div className={styles.quickAddSection}>
                                    <h3 className={styles.quickAddTitle}>Quick Add Common Slots</h3>
                                    <div className={styles.quickAddGrid}>
                                        {quickAddPresets.map((preset, index) => {
                                            const presetValidation = validateTimeSlot(preset, workingDays[activeDay].timeslots);
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => addPresetSlot(activeDay, preset)}
                                                    disabled={!presetValidation.isValid}
                                                    className={styles.quickAddButton}
                                                    style={{
                                                        opacity: !presetValidation.isValid ? 0.5 : 1,
                                                        cursor: !presetValidation.isValid ? 'not-allowed' : 'pointer'
                                                    }}
                                                    title={!presetValidation.isValid ? presetValidation.errors.join(', ') : ''}
                                                >
                                                    {preset.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Current Time Slots */}
                                <div>
                                    <h3 className={styles.currentSlotsTitle}>
                                        Current Slots ({workingDays[activeDay].timeslots.length})
                                    </h3>
                                    {workingDays[activeDay].timeslots.length === 0 ? (
                                        <div className={styles.emptySlots}>
                                            <Clock className={styles.emptySlotsIcon} />
                                            <p className={styles.emptySlotsText}>No time slots added yet</p>
                                        </div>
                                    ) : (
                                        <div className={styles.slotsList}>
                                            {workingDays[activeDay].timeslots.map((slot) => (
                                                <div key={slot.id} className={styles.slotItem}>
                                                    <span className={styles.slotLabel}>{slot.label}</span>
                                                    <button
                                                        onClick={() => removeTimeSlot(activeDay, slot.id)}
                                                        className={styles.deleteButton}
                                                    >
                                                        <Trash2 className={styles.deleteIcon} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div className={styles.saveSection}>
                    <button
                        onClick={saveSchedule}
                        className={styles.saveButton}
                    >
                        <Save className={styles.saveIcon} />
                        Save Schedule
                    </button>
                </div>

                {/* Schedule Summary */}
                <div className={`${styles.card} ${styles.summaryCard}`}>
                    <h3 className={styles.summaryTitle}>Schedule Summary</h3>
                    <div className={styles.summaryGrid}>
                        {Object.entries(workingDays)
                            .filter(([, dayData]) => dayData.enabled)
                            .map(([day, dayData]) => (
                                <div key={day} className={styles.summaryDay}>
                                    <h4 className={styles.summaryDayName}>{dayNames[day]}</h4>
                                    <div className={styles.summarySlots}>
                                        {dayData.timeslots.map((slot) => (
                                            <span key={slot.id} className={styles.summarySlot}>
                                                {slot.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        {Object.values(workingDays).every(day => !day.enabled) && (
                            <p className={styles.summaryEmpty}>No working days configured yet</p>
                        )}
                    </div>
                </div>
            </div>
            {isLoading && <LoadingSpinner/>}
        </div>
    );
}