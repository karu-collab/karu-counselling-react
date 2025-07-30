// Reschedule Modal Component
import {useAuth} from "../../../../../hooks/AuthenticationContext.jsx";
import {useEffect, useState} from "react";
import axiosInstance from "../../../../../utils/axiosInstance.jsx";
import styles from "./RescheduleModal.module.css";
import BookingCalendar from "../../../student/BookingCalendar.jsx";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function RescheduleModal({
                             appointment,
                             formatDate,
                             onClose,
                         }) {
    const { user } = useAuth();
    const [workCalender, setWorkCalender] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCalender, setShowCalender] = useState(true);

    useEffect(() => {
        const getWorkCalender = async () => {
            try {
                const response = await axiosInstance(`${BASE_URL}/booking/working-calendar/${user.id}`);
                setWorkCalender(response.data.work_calendar);
            } catch (error) {
                console.error('Error fetching work calendar:', error);
            }
        };

        if (user?.id) {
            getWorkCalender();
        }
    }, [user?.id]);

    const handleDateTimeSelected = (date, timeSlotLabel, slotId) => {
        console.log('DATE: ', date, ' slot label: ', timeSlotLabel, ' slot id ', slotId);

        // Store the selected slot information
        setSelectedSlot({
            date: date,
            timeSlot: timeSlotLabel,
            slotId: slotId
        });

        setShowCalender(false)
    };

    const handleRescheduleConfirm = async () => {
        if (!selectedSlot) {
            alert('Please select a new date and time slot');
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. First, remove the old booked slot from counsellor's booked_slots
            const removeOldSlotResponse = await axiosInstance.patch(
                `${BASE_URL}/booking/remove-slot`,
                {
                    counsellor_id: appointment.counsellor_id,
                    slot_to_remove: {
                        date: appointment.date,
                        timeSlot: appointment.timeSlot,
                        slotId: appointment.slot_id
                    }
                }
            );

            // 2. Add the new booked slot to counsellor's booked_slots
            const addNewSlotResponse = await axiosInstance.patch(
                `${BASE_URL}/booking/add-slot`,
                {
                    counsellor_id: appointment.counsellor_id,
                    new_slot: {
                        date: selectedSlot.date.toISOString(),
                        timeSlot: selectedSlot.timeSlot,
                        slotId: selectedSlot.slotId,
                        notes: appointment.notes || ''
                    }
                }
            );

            // 3. Update the appointment with new details
            const updateAppointmentResponse = await axiosInstance.patch(
                `${BASE_URL}/appointment/reschedule/${appointment._id}`,
                {
                    date: selectedSlot.date.toISOString(),
                    timeSlot: selectedSlot.timeSlot,
                    slot_id: selectedSlot.slotId,
                    status: 'RESCHEDULED'
                }
            );

            console.log('Reschedule responses:', {
                removeOldSlot: removeOldSlotResponse.data,
                addNewSlot: addNewSlotResponse.data,
                updateAppointment: updateAppointmentResponse.data
            });

            // Simply close the modal - the parent will refresh when modal closes
            // No need to call fetchAppointments here

            // Close the modal
            onClose();

        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            alert('Failed to reschedule appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Reschedule Appointment</h3>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.appointmentInfo}>
                    <p><strong>Client:</strong> {appointment.client_name || appointment.client_id}</p>
                    <p><strong>Current Date:</strong> {formatDate(appointment.date)}</p>
                    <p><strong>Current Time:</strong> {appointment.timeSlot}</p>
                </div>

                {selectedSlot && (
                    <div className={styles.selectedSlotInfo}>
                        <h4>New Appointment Details:</h4>
                        <p><strong>Date:</strong> {formatDate(selectedSlot.date)}</p>
                        <p><strong>Time:</strong> {selectedSlot.timeSlot}</p>
                    </div>
                )}

                {showCalender && (
                    <div className={styles.calendarContainer}>
                        {workCalender ? (
                            <BookingCalendar
                                counsellorId={user.id}
                                workCalendar={workCalender}
                                onBookSlot={handleDateTimeSelected}
                                onClose={() => setShowCalender(false)} // Don't close modal when calendar closes
                            />
                        ) : (
                            <div>Loading calendar...</div>
                        )}
                    </div>
                )}


                <div className={styles.modalActions}>
                    <button
                        className={`${styles.actionButton} ${styles.cancelButton}`}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className={`${styles.actionButton} ${styles.confirmButton}`}
                        onClick={handleRescheduleConfirm}
                        disabled={!selectedSlot || isSubmitting}
                    >
                        {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </button>
                </div>
            </div>
        </div>
    );
}