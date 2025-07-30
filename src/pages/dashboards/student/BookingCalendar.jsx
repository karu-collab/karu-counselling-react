// src/components/booking/BookingCalendar.jsx
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaCheck, FaClock } from 'react-icons/fa';
import styles from './BookingCalendar.module.css';
import axiosInstance from "../../../utils/axiosInstance.jsx";
import { useAuth } from "../../../hooks/AuthenticationContext.jsx";
import axios from "axios";

const BaseUrl = import.meta.env.VITE_BACKEND_URL;
// Days of the week mapping
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DAY_NAMES = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
};

// Helper function to get day name from date
const getDayName = (date) => {
    return DAYS_OF_WEEK[date.getDay()];
};

// Helper function to format date as YYYY-MM-DD
const formatDateString = (date) => {
    return date.toISOString().split('T')[0];
};

// Helper function to get start of week (Monday)
const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    const startOfWeek = new Date(date);
    startOfWeek.setDate(diff);
    return startOfWeek;
};

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
            {Array.from({ length: 7 }).map((_, dayIndex) => (
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

const BookingCalendar = ({ counsellorId, workCalendar, onBookSlot, onClose }) => {

    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [weekData, setWeekData] = useState([]);

    // Initialize calendar on component mount
    useEffect(() => {
        initializeCalendar();
    }, []);

    // Update week data when current week or dependencies change
    useEffect(() => {
        if (workCalendar && !isLoading) {
            generateWeekData();
        }
    }, [currentWeek, workCalendar, bookedSlots, isLoading]);

    const initializeCalendar = async () => {
        setIsLoading(true);
        try {
            await fetchBookedSlots();
        } catch (error) {
            console.error('Error initializing calendar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBookedSlots = async () => {
        try {
           const response = await axiosInstance.get(`${BaseUrl}/booking/booked-slots/${counsellorId}`);


            if (response.status === 200) {
                console.log('Booked slots fetched successfully:', response.data);
                setBookedSlots(response.data.booked_slots || []);
            }
        } catch (error) {
            console.error('Error fetching booked slots:', error);
            setBookedSlots([]);
        }
    };


    const generateWeekData = () => {
        const startOfWeek = getStartOfWeek(new Date(currentWeek));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekDays = [];

        // Generate 7 days starting from Monday
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);

            const dayName = getDayName(currentDate);
            const dayConfig = workCalendar[dayName];

            // Only include days that have configuration and are enabled
            if (dayConfig && dayConfig.enabled && dayConfig.timeslots) {
                const dateString = formatDateString(currentDate);
                const isPastDate = currentDate < today;

                const dayData = {
                    date: new Date(currentDate),
                    dayName: DAY_NAMES[dayName],
                    dayOfMonth: currentDate.getDate(),
                    dateString,
                    isPastDate,
                    slots: dayConfig.timeslots.map(slot => ({
                        id: slot.id,
                        start: slot.start,
                        end: slot.end,
                        label: slot.label,
                        isBooked: bookedSlots.some(bookedSlot =>
                            formatDateString(new Date(bookedSlot.date)) === dateString &&
                            bookedSlot.slotId === slot.id
                        ),

                        isAvailable: !isPastDate && !bookedSlots.some(bookedSlot =>
                            formatDateString(new Date(bookedSlot.date)) === dateString &&
                            bookedSlot.slotId === slot.id
                        )


                    }))
                };

                console.log('booked slots day data: ',dayData)

                weekDays.push(dayData);
            }
        }

        setWeekData(weekDays);
    };


    const getAllUniqueTimeSlots = () => {
        if (!workCalendar) return [];

        const allSlots = new Map();

        Object.values(workCalendar).forEach(dayConfig => {
            if (dayConfig && dayConfig.enabled && dayConfig.timeslots) {
                dayConfig.timeslots.forEach(slot => {
                    const key = `${slot.start}-${slot.end}`;
                    if (!allSlots.has(key)) {
                        allSlots.set(key, {
                            id: slot.id,
                            start: slot.start,
                            end: slot.end,
                            label: slot.label
                        });
                    }
                });
            }
        });

        return Array.from(allSlots.values()).sort((a, b) => a.start.localeCompare(b.start));
    };

    const goToPreviousWeek = () => {
        const prevWeek = new Date(currentWeek);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentWeek(prevWeek);
        setSelectedSlot(null);
    };

    const goToNextWeek = () => {
        const nextWeek = new Date(currentWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentWeek(nextWeek);
        setSelectedSlot(null);
    };

    const formatDateRange = () => {
        const startDate = getStartOfWeek(new Date(currentWeek));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const options = { month: 'short', day: 'numeric' };
        const startStr = startDate.toLocaleDateString('en-US', options);
        const endStr = endDate.toLocaleDateString('en-US', options);

        return `${startStr} - ${endStr}`;
    };

    const handleSlotClick = (dayData, slot) => {
        if (!slot.isAvailable || slot.isBooked || dayData.isPastDate) return;

        console.log('selected slots: ',{
            date: dayData.date,
            dateString: dayData.dateString,
            slotId: slot.id,
            slot: slot,
            dayName: dayData.dayName
        })


        setSelectedSlot({
            date: dayData.date,
            dateString: dayData.dateString,
            slotId: slot.id,
            slot: slot,
            dayName: dayData.dayName
        });
    };

    const handleBooking = () => {
        if (selectedSlot) {
            onBookSlot(selectedSlot.date, selectedSlot.slot.label, selectedSlot.slotId);
        }
    };

    const allTimeSlots = getAllUniqueTimeSlots();

    if (isLoading) {
        return (
            <div className={styles.calendarModalOverlay}>
                <div className={styles.calendarModal}>
                    <div className={styles.calendarHeader}>
                        <h2>Book a Session</h2>
                        <button className={styles.closeButton} onClick={onClose}>×</button>
                    </div>
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.calendarModalOverlay}>
            <div className={styles.calendarModal}>
                <div className={styles.calendarHeader}>
                    <h2>Book a Session</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

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

                {weekData.length === 0 ? (
                    <div className={styles.noAvailability}>
                        <p>No available time slots for this week.</p>
                    </div>
                ) : (
                    <div className={styles.calendarGrid}>
                        {/* Time labels column */}
                        <div className={styles.timeLabelsColumn}>
                            <div className={styles.dayHeader}>
                                <div className={styles.dayName}>TIME</div>
                                <div className={styles.dayDate}>SLOT</div>
                            </div>
                            {allTimeSlots.map(timeSlot => (
                                <div key={timeSlot.id} className={styles.timeLabel}>
                                    <FaClock className={styles.timeIcon} />
                                    <span>{timeSlot.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Day columns */}
                        {weekData.map(dayData => (
                            <div key={`${dayData.dayName}-${dayData.dayOfMonth}`} className={styles.dayColumn}>
                                <div className={styles.dayHeader}>
                                    <div className={styles.dayName}>{dayData.dayName}</div>
                                    <div className={styles.dayDate}>{dayData.dayOfMonth}</div>
                                </div>

                                {allTimeSlots.map(timeSlot => {
                                    const daySlot = dayData.slots.find(slot =>
                                        slot.start === timeSlot.start && slot.end === timeSlot.end
                                    );

                                    const isSelected = selectedSlot &&
                                        selectedSlot.dateString === dayData.dateString &&
                                        selectedSlot.slotId === timeSlot.id;

                                    if (!daySlot) {
                                        // No slot available for this time on this day
                                        return (
                                            <div key={timeSlot.id} className={`${styles.timeSlot} ${styles.unavailable}`}>
                                                <span className={styles.unavailableLabel}>N/A</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={daySlot.id}
                                            className={`${styles.timeSlot} 
                                                ${daySlot.isBooked ? styles.booked : ''} 
                                                ${!daySlot.isAvailable ? styles.unavailable : ''} 
                                                ${isSelected ? styles.selected : ''}
                                                ${dayData.isPastDate ? styles.pastDate : ''}`}
                                            onClick={() => handleSlotClick(dayData, daySlot)}
                                        >
                                            {daySlot.isBooked ? (
                                                <span className={styles.bookedLabel}>Booked</span>
                                            ) : daySlot.isAvailable ? (
                                                <span className={styles.availableLabel}>Available</span>
                                            ) : (
                                                <span className={styles.unavailableLabel}>N/A</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {selectedSlot && (
                    <div className={styles.bookingConfirmation}>
                        <div className={styles.selectedSlotInfo}>
                            <p>
                                <strong>Selected Time:</strong> {selectedSlot.slot.label}
                            </p>
                            <p>
                                <strong>Date:</strong> {selectedSlot.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            </p>
                        </div>
                        <button className={styles.bookButton} onClick={handleBooking}>
                            <FaCheck /> Confirm Booking
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingCalendar;