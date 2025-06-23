import styles from './StudentPortal.module.css';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';

const localizer = momentLocalizer(moment);

export default function StudentPortal() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedCounsellor, setSelectedCounsellor] = useState('');
    const [studentInfo, setStudentInfo] = useState({
        name: '',
        studentId: '',
        email: '',
        phone: '',
        reason: ''
    });
    const [bookings, setBookings] = useState([]);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);

    const counselors = ['Dr. Smith', 'Ms. Johnson', 'Mr. Lee']; // Example counselors

    const calendarEvents = bookings.map(booking => ({
        id: booking.id,
        title: `${booking.counsellor} - ${booking.studentInfo.name}`,
        start: new Date(`${booking.date}T${booking.time}`),
        end: new Date(`${booking.date}T${booking.time}`),
        resource: booking
    }));

    const handleBookingSubmit = () => {
        if (!selectedDate || !selectedTime || !selectedCounsellor || !studentInfo.name) {
            alert('Please fill in all fields.');
            return;
        }

        const newBooking = {
            id: bookings.length + 1,
            date: selectedDate,
            time: selectedTime,
            counsellor: selectedCounsellor,
            studentInfo: { ...studentInfo }
        };

        setBookings([...bookings, newBooking]);
        setShowBookingForm(false);
        setBookingStatus('Booking successful!');
    };

    return (
        <div className={styles.container}>
            <h1>Welcome to the Student Counseling Portal</h1>

            <div className={styles.calendarContainer}>
                <BigCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    onSelectSlot={(slotInfo) => {
                        setSelectedDate(slotInfo.start.toISOString().split('T')[0]);
                        setShowBookingForm(true);
                    }}
                    onSelectEvent={(event) => alert(`Viewing Booking: ${event.title}`)}
                    selectable
                    views={['month', 'week', 'day']}
                    defaultView="month"
                />
            </div>

            {showBookingForm && (
                <div className={styles.formContainer}>
                    <h2>Book a Counseling Session</h2>
                    <label>Date: {selectedDate}</label>
                    <label>
                        Time:
                        <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        />
                    </label>
                    <label>
                        Counselor:
                        <select
                            value={selectedCounsellor}
                            onChange={(e) => setSelectedCounsellor(e.target.value)}
                        >
                            <option value="">Select a counselor</option>
                            {counselors.map((counselor, index) => (
                                <option key={index} value={counselor}>
                                    {counselor}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Student Name:
                        <input
                            type="text"
                            value={studentInfo.name}
                            onChange={(e) =>
                                setStudentInfo({ ...studentInfo, name: e.target.value })
                            }
                        />
                    </label>
                    <label>
                        Reason for Counseling:
                        <textarea
                            value={studentInfo.reason}
                            onChange={(e) =>
                                setStudentInfo({ ...studentInfo, reason: e.target.value })
                            }
                        />
                    </label>
                    <button type="submit" onClick={handleBookingSubmit}>
                        Book Session
                    </button>
                    <button type="button" onClick={() => setShowBookingForm(false)}>
                        Cancel
                    </button>
                </div>
            )}

            {bookingStatus && <p className={styles.successMessage}>{bookingStatus}</p>}
        </div>
    );

}
