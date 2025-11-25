import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';

// CSS Import is CRITICAL for Week View columns to align
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    // State to handle current View (Month, Week, Day) manually
    const [view, setView] = useState(Views.MONTH);

    const API_BASE = "http://localhost/booking-system/backend/";
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(API_BASE + 'bookings.php', config);
            
            if (Array.isArray(res.data)) {
                const calendarEvents = res.data.map(b => {
                    // Fix: Parse YYYY-MM-DD strictly
                    let startDate = new Date(b.check_in_date);
                    let endDate = new Date(b.check_out_date);

                    // Add +1 day to end date because standard calendars end at 00:00 of the end day,
                    // making it look like the booking ends 1 day early.
                    endDate.setDate(endDate.getDate() + 1);

                    return {
                        id: b.id,
                        title: `${b.guest_name} (Unit: ${b.unit_name})`,
                        start: startDate,
                        end: endDate,
                        resource: b.unit_name,
                        allDay: true // Forces event into the top "All Day" bar in Week view
                    };
                });
                setEvents(calendarEvents);
            }
        } catch (error) {
            console.error("Error loading calendar", error);
        }
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: '#3174ad',
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            
            <div style={{ marginLeft: '250px', width: '100%', padding: '20px', display:'flex', flexDirection:'column' }}>
                <header style={{ marginBottom: '20px' }}>
                    <h2>Availability Calendar</h2>
                </header>
                
                {/* 
                    FIX: Parent container must have EXACT Height (e.g. 80vh) 
                    The 'Week' view relies on scrolling and needs boundaries.
                */}
                <div style={{ height: '85vh', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        
                        // Control Views
                        views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
                        view={view} 
                        onView={(newView) => setView(newView)} 

                        // Date navigation
                        step={60}
                        showMultiDayTimes
                        
                        style={{ height: '100%', width: '100%' }}
                        eventPropGetter={eventStyleGetter}
                        
                        onSelectEvent={event => alert(
                            `Booking: ${event.title}\nDates: ${moment(event.start).format('MMM D')} - ${moment(event.end).subtract(1, 'days').format('MMM D')}`
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarView;