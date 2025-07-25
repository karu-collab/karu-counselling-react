import { useState, useEffect } from 'react';
import BookingCalendar from './BookingCalendar.jsx';
import styles from './BookingModal.module.css';
import defaultImage from '../../../assets/logo.jpg';
import {FaTimes,FaCalendarAlt} from "react-icons/fa";

export default function BookingModal({
                                         isOpen,
                                         onClose,
                                         counselor,
                                         onBookingConfirm,
                                     }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [step, setStep] = useState(1); // 1: Select date/time, 2: Confirm details
    const [notes, setNotes] = useState('');


    useEffect(() => {
        if (isOpen) {
            setSelectedDate(null);
            setSelectedTimeSlot(null);
            setSelectedSlotId(null)
            setStep(1);
            setNotes('');
        }
    }, [isOpen]);

    const handleDateTimeSelected = (date, timeSlotLabel,slotId) => {
        setSelectedDate(date);
        setSelectedTimeSlot(timeSlotLabel);
        setSelectedSlotId(slotId);
        setStep(2);
    };

    const handleConfirmBooking = () => {
        if (selectedDate && selectedTimeSlot && selectedSlotId ) {
            onBookingConfirm(selectedDate, selectedTimeSlot, notes, selectedSlotId);
            onClose();
        }
    };

    const handleBackToCalendar = () => setStep(1);

    if (!isOpen) return null;

    const formatDate = (date) =>
        date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {step === 1 ? 'Book a Session' : 'Confirm Booking'}
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {step === 1 ? (
                        <>
                            <div className={styles.counselorInfo}>
                                <img
                                    src={counselor?.picture || defaultImage}
                                    alt={`${counselor?.name || 'Unknown'} `}
                                    className={styles.counselorImage}
                                />
                                <div>
                                    <h3 className={styles.counselorName}>
                                        {`${counselor?.name || 'Unknown'} `}
                                    </h3>
                                </div>
                            </div>

                            <p className={styles.instructions}>
                                Select an available time slot from the calendar below:
                            </p>

                            <BookingCalendar
                                counsellorId={counselor?._id}
                                workCalendar={counselor?.work_calender}
                                onBookSlot={handleDateTimeSelected}
                                onClose={onClose}
                            />
                        </>
                    ) : (
                        <>
                            <div className={styles.confirmationDetails}>
                                <div className={styles.counselorInfo}>
                                    <img
                                        src={counselor?.picture || defaultImage}
                                        alt={counselor?.name}
                                        className={styles.counselorImage}
                                    />
                                    <div>
                                        <h3 className={styles.counselorName}>
                                            {`${counselor?.name}`}
                                        </h3>
                                    </div>
                                </div>

                                <div className={styles.bookingDetails}>
                                    <div className={styles.detailItem}>
                                        <FaCalendarAlt className={styles.detailIcon} />
                                        <div>
                                            <h4 className={styles.detailTitle}>Date & Time</h4>
                                            <p className={styles.detailValue}>
                                                {selectedDate && formatDate(selectedDate)}
                                            </p>
                                            <p className={styles.detailValue}>{selectedTimeSlot}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.notesSection}>
                                    <label htmlFor="notes" className={styles.notesLabel}>
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        className={styles.notesInput}
                                        placeholder="Add any specific concerns or topics you'd like to discuss in this session..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    {step === 1 ? (
                        <button className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                    ) : (
                        <>
                            <button
                                className={styles.backButton}
                                onClick={handleBackToCalendar}
                            >
                                Back to Calendar
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleConfirmBooking}
                            >
                                Confirm Booking
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}