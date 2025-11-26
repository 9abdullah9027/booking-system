import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';

const localizer = momentLocalizer(moment);

// --- CUSTOM HOVER CARD COMPONENT ---
const EventComponent = ({ event }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div 
            className="relative h-full w-full"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* The Colored Bar on Calendar */}
            <div className="text-[10px] md:text-xs font-semibold truncate px-1 h-full flex items-center leading-tight">
                {event.title}
            </div>

            {/* The Popup Card (Tooltip) */}
            {showTooltip && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 pointer-events-none"
                    style={{ minWidth: '260px' }}
                >
                    {/* Image Area */}
                    <div className="h-32 w-full bg-gray-100 relative">
                        {event.resource.image ? (
                            <img src={event.resource.image} className="w-full h-full object-cover" alt="Room"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs uppercase font-bold bg-gray-50">
                                No Photo
                            </div>
                        )}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm text-white ${event.resource.statusColor}`}>
                            {event.resource.status}
                        </div>
                    </div>
                    
                    {/* Text Details */}
                    <div className="p-3">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{event.resource.unitName}</h4>
                        <p className="text-xs text-gray-500 mb-2">{event.resource.guest}</p>
                        
                        <div className="border-t border-gray-100 pt-2 flex justify-between text-xs">
                            <span className="text-gray-400 font-medium">Dates:</span>
                            <span className="font-semibold text-blue-600">
                                {moment(event.start).format('MMM D')} - {moment(event.end).subtract(1,'days').format('MMM D')}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date()); // Controls Navigation
    
    const API = "http://localhost/booking-system/backend/";
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(API + 'bookings.php', config);
            if (Array.isArray(res.data)) {
                const calendarEvents = res.data
                    // Filter: Hide checked_out and cancelled
                    .filter(b => b.status !== 'checked_out' && b.status !== 'cancelled')
                    .map(b => {
                        let startDate = new Date(b.check_in_date);
                        let endDate = new Date(b.check_out_date);
                        endDate.setDate(endDate.getDate() + 1); // Fix calendar end-date exclusivity

                        // Color Logic
                        let color = 'bg-blue-500';
                        if(b.status === 'checked_in') color = 'bg-green-500';
                        if(b.status === 'pending') color = 'bg-yellow-500';

                        return {
                            id: b.id,
                            title: `${b.guest_name} (${b.unit_name})`,
                            start: startDate,
                            end: endDate,
                            allDay: true,
                            resource: {
                                unitName: b.unit_name,
                                guest: b.guest_name,
                                status: b.status.replace('_', ' '),
                                statusColor: color,
                                // Image URL Construction
                                image: b.image_path ? API + 'uploads/units/' + b.image_path : null
                            }
                        };
                    });
                setEvents(calendarEvents);
            }
        } catch (error) { console.error(error); }
    };

    // Style the Event Bars (Blue/Green boxes)
    const eventStyleGetter = (event) => {
        let hex = '#3B82F6'; // Blue
        if (event.resource.status === 'checked in') hex = '#10B981'; // Green
        if (event.resource.status === 'pending') hex = '#F59E0B'; // Yellow

        return {
            style: {
                backgroundColor: hex,
                borderRadius: '6px',
                opacity: 1,
                color: 'white',
                border: '1px solid white',
                display: 'block',
                fontSize: '11px',
                fontWeight: '600',
            }
        };
    };

    return (
        <Layout title="Availability Calendar">
            {/* CSS Overrides for BigCalendar to match UrbanNest Theme */}
            <style>{`
                .rbc-toolbar { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                
                /* TITLE STYLING: BOLD AND BIG */
                .rbc-toolbar-label { 
                    font-size: 1.75rem !important; 
                    font-weight: 800 !important; 
                    color: #1e293b; 
                    text-transform: capitalize;
                    font-family: 'Inter', sans-serif;
                }

                /* BUTTON STYLING */
                .rbc-btn-group button { 
                    border: 1px solid #e2e8f0 !important; 
                    background: white; 
                    color: #64748b; 
                    font-weight: 600; 
                    padding: 8px 16px; 
                    border-radius: 8px !important; 
                    margin: 0 2px; 
                    transition: all 0.2s;
                    font-size: 14px;
                }
                .rbc-btn-group button:hover { background: #f8fafc; color: #3b82f6; border-color: #3b82f6 !important; }
                .rbc-btn-group button.rbc-active { background: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; shadow: 0 4px 10px rgba(59,130,246,0.3); }
                
                /* GRID STYLING */
                .rbc-month-view { border: 1px solid #e2e8f0; border-radius: 16px; background: white; overflow: hidden; }
                .rbc-header { padding: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 11px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
                .rbc-month-row + .rbc-month-row { border-top: 1px solid #f1f5f9; }
                .rbc-date-cell { padding: 8px; font-weight: 600; color: #475569; font-size: 13px; }
                .rbc-off-range-bg { background: #fcfcfc; }
                .rbc-today { background: #eff6ff !important; }
                
                /* EVENT BAR STYLING */
                .rbc-event { padding: 2px 4px !important; min-height: 24px; transition: transform 0.1s; }
                .rbc-event:hover { transform: scale(1.02); z-index: 50; }
            `}</style>

            <div className="h-[82vh] bg-white p-6 rounded-2xl shadow-card border border-gray-100">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    
                    // Navigation Control
                    date={date}
                    onNavigate={(newDate) => setDate(newDate)}
                    view={view}
                    onView={(newView) => setView(newView)}
                    
                    views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
                    step={60}
                    showMultiDayTimes
                    
                    // Styling
                    style={{ height: '100%', fontFamily: 'Inter, sans-serif' }}
                    eventPropGetter={eventStyleGetter}
                    components={{ event: EventComponent }}
                />
            </div>
        </Layout>
    );
};

export default CalendarView;s