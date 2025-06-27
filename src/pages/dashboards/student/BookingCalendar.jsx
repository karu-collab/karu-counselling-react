// src/components/booking/BookingCalendar.jsx
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaCheck, FaClock } from 'react-icons/fa';
import styles from './BookingCalendar.module.css';
import axiosInstance from "../../../utils/axiosInstance.jsx";
import {useAuth} from "../../../hooks/AuthenticationContext.jsx";

// Days of the week
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Loading skeleton component
const LoadingSkeleton = () => (
    <div className={styles.loadingContainer}>
        <div className={styles.loadingHeader}>
            <div className={styles.skeletonPulse} style={{ width: '150px', height: '24px' }}></div>
        </div>

        <div className={styles.loadingNavigation}>
            <div className={styles.skeletonPulse} style={{ width: '40px', height: '40px', borderRadius: '4px' }}></div>
            <div className={styles.skeletonPulse} style={{ width: '200px', height: '20px' }}></div>
            <div className={styles.skeletonPulse} style={{ width: '40px', height: '40px', borderRadius: '4px' }}></div>
        </div>

        <div className={styles.loadingGrid}>
            <div className={styles.loadingTimeColumn}>
                <div className={styles.skeletonPulse} style={{ width: '100px', height: '60px', marginBottom: '1px' }}></div>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={styles.skeletonPulse} style={{
                        width: '100px',
                        height: '60px',
                        marginBottom: '1px'
                    }}></div>
                ))}
            </div>

            {Array.from({ length: 5 }).map((_, dayIndex) => (
                <div key={dayIndex} className={styles.loadingDayColumn}>
                    <div className={styles.skeletonPulse} style={{ width: '100%', height: '60px', marginBottom: '1px' }}></div>
                    {Array.from({ length: 6 }).map((_, slotIndex) => (
                        <div key={slotIndex} className={styles.skeletonPulse} style={{
                            width: '100%',
                            height: '60px',
                            marginBottom: '1px'
                        }}></div>
                    ))}
                </div>
            ))}
        </div>

        <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span>Loading available time slots...</span>
        </div>
    </div>
);

const BookingCalendar = ({ counsellorId, onBookSlot, onClose }) => {
    const {accessToken} = useAuth()
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const [weekDays, setWeekDays] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState({ date: null, slotId: null });
    const [bookedSlots, setBookedSlots] = useState([]);
    const [timeslots, setTimeSlots] = useState([
        { id: 1, start: '9:00', end: '10:00', label: '9:00 - 10:00' },
        { id: 2, start: '10:15', end: '11:15', label: '10:15 - 11:15' },
        { id: 3, start: '11:30', end: '12:30', label: '11:30 - 12:30' },
        { id: 4, start: '14:00', end: '15:00', label: '2:00 - 3:00' },
        { id: 5, start: '15:15', end: '16:15', label: '3:15 - 4:15' },
        { id: 6, start: '16:30', end: '17:00', label: '4:30 - 5:00' }
    ])

    useEffect(() => {
        initializeCalendar();
    }, []);

    const initializeCalendar = async () => {
        setIsLoading(true);
        try {
            // Fetch both booked slots and time slots concurrently
            await Promise.all([
                fetchBookedSlots(),
                fetchTimeSlots()
            ]);
        } catch (error) {
            console.error('Error initializing calendar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBookedSlots = async () => {
        try {
            const response = await axiosInstance.get(`/api/booking/booked-slots/${counsellorId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            console.log('fetching booked slots')
            if (response.status === 200) {
                console.log('fetching booked slots was successful: ', response.data)
                setBookedSlots(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchTimeSlots = async () => {
        try {
            const response = await axiosInstance.get('/api/booking/time-slots', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            if (response.status === 200) {
                setTimeSlots(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Mock function to check counselor availability
    const getCounselorAvailability = (counselorId, date) => {
        // Get current date at midnight for accurate comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Set the input date to midnight for comparison
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        // If the date is before today, mark all slots as unavailable
        if (checkDate < today) {
            return Array(6).fill(false);
        }

        const dayOfWeek = date.getDay();
        const availabilityMap = {
            1: [true, true, true, true, true, true],
            2: [true, true, true, true, true, true],
            3: [true, true, true, true, true, true],
            4: [true, true, true, true, true, true],
            5: [true, true, true, true, true, true],
            6: [false, false, false, false, false, false],
            0: [false, false, false, false, false, false],
        };
        return availabilityMap[dayOfWeek] || Array(6).fill(false);
    };

    // Mock function to check if a slot is already booked
    const isSlotBooked = (counselorId, date, slotId) => {
        const dateStr = date.toISOString().split('T')[0];
        return bookedSlots.some(slot => slot.date === dateStr && slot.slotId === slotId);
    };

    useEffect(() => {
        if (!isLoading) {
            const days = [];
            const currentDate = getStartOfWeek(currentWeek);

            for (let i = 0; i < 5; i++) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + i);
                const availability = getCounselorAvailability(counsellorId, date);

                days.push({
                    date,
                    dayName: DAYS[i],
                    dayOfMonth: date.getDate(),
                    slots: timeslots.map((slot, index) => ({
                        id: slot.id,
                        isAvailable: availability[index],
                        isBooked: isSlotBooked(counsellorId, date, slot.id),
                    })),
                });
            }
            setWeekDays(days);
        }
    }, [counsellorId, currentWeek, bookedSlots, timeslots, isLoading]);

    const getStartOfWeek = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    const goToPreviousWeek = () => {
        const prevWeek = new Date(currentWeek);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentWeek(prevWeek);
    };

    const goToNextWeek = () => {
        const nextWeek = new Date(currentWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentWeek(nextWeek);
    };

    const formatDateRange = () => {
        const startDate = getStartOfWeek(currentWeek);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 4);
        const options = { month: 'short', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    };

    const handleSlotClick = (date, slotId, isAvailable, isBooked) => {
        if (!isAvailable || isBooked) return;
        setSelectedSlot({ date, slotId });
    };

    const handleBooking = () => {
        if (selectedSlot.date && selectedSlot.slotId !== null) {
            const selectedSlotLabel = timeslots.find(slot => slot.id === selectedSlot.slotId)?.label;
            if (selectedSlotLabel) {
                onBookSlot(selectedSlot.date, selectedSlotLabel,selectedSlot.slotId);
            }
        }
    };

    return (
        <div className={styles.calendarModalOverlay}>
            <div className={styles.calendarModal}>
                <div className={styles.calendarHeader}>
                    <h2>Book a Session</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        <div className={styles.calendarNavigation}>
                            <button onClick={goToPreviousWeek} className={styles.navButton}>
                                <FaArrowLeft />
                            </button>
                            <div className={styles.currentWeek}>
                                <FaCalendarAlt className={styles.calendarIcon} />
                                <span>{formatDateRange()}</span>
                            </div>
                            <button onClick={goToNextWeek} className={styles.navButton}>
                                <FaArrowRight />
                            </button>
                        </div>

                        <div className={styles.calendarGrid}>
                            <div className={styles.timeLabelsColumn}>
                                <div className={styles.dayHeader}>
                                    <div className={styles.dayName}>TIME</div>
                                    <div className={styles.dayDate}>SLOT</div>
                                </div>
                                {timeslots.map(slot => (
                                    <div key={slot.id} className={styles.timeLabel}>
                                        <FaClock className={styles.timeIcon} />
                                        <span>{slot.label}</span>
                                    </div>
                                ))}
                            </div>

                            {weekDays.map(day => (
                                <div key={day.dayName} className={styles.dayColumn}>
                                    <div className={styles.dayHeader}>
                                        <div className={styles.dayName}>{day.dayName}</div>
                                        <div className={styles.dayDate}>{day.dayOfMonth}</div>
                                    </div>
                                    {day.slots.map(slot => (
                                        <div
                                            key={slot.id}
                                            className={`${styles.timeSlot} 
                                            ${!slot.isAvailable ? styles.unavailable : ''} 
                                            ${slot.isBooked ? styles.booked : ''} 
                                            ${selectedSlot.date && selectedSlot.date.toDateString() === day.date.toDateString() &&
                                            selectedSlot.slotId === slot.id ? styles.selected : ''}`}
                                            onClick={() => handleSlotClick(day.date, slot.id, slot.isAvailable, slot.isBooked)}
                                        >
                                            {slot.isBooked ? (
                                                <span className={styles.bookedLabel}>Booked</span>
                                            ) : slot.isAvailable ? (
                                                <span className={styles.availableLabel}>Available</span>
                                            ) : (
                                                <span className={styles.unavailableLabel}>Unavailable</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {selectedSlot.date && selectedSlot.slotId !== null && (
                            <div className={styles.bookingConfirmation}>
                                <div className={styles.selectedSlotInfo}>
                                    <p>
                                        <strong>Selected Time:</strong> {
                                        timeslots.find(slot => slot.id === selectedSlot.slotId)?.label
                                    }
                                    </p>
                                    <p>
                                        <strong>Date:</strong> {
                                        selectedSlot.date.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                    }
                                    </p>
                                </div>
                                <button className={styles.bookButton} onClick={handleBooking}>
                                    <FaCheck /> Confirm Booking
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingCalendar;