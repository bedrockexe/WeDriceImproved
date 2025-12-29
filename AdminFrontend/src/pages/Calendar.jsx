import { useState, useEffect } from "react";

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { motion, AnimatePresence } from 'framer-motion'
import axios from "axios";
import { useNavigate } from "react-router-dom";


const getRandomColor = () => {
  const colors = [
    '#16a34a', // green
    '#2563eb', // blue
    '#dc2626', // red
    '#f59e0b', // amber
    '#7c3aed', // purple
    '#0891b2'  // cyan
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}



const events = [
  {
    id: '1',
    title: "Honda",
    start: "2025-12-22",
    end: "2025-12-29",
    backgroundColor: "#2563eb",
    extendedProps: {
      customer: "Alice Smith",
      status: "Confirmed",
      price: 150,
      car: "Honda"
    }
  },
  {
    id: '2',
    title: "Ford",
    start: "2025-12-22",
    end: "2025-12-29",
    backgroundColor: "#f59e0b",
    extendedProps: {
      customer: "Bob Johnson",
      status: "Pending",
      price: 200,
      car: "Ford"
    }
  },
  {
    id: '3',
    title: "Toyota",
    start: "2025-12-22",
    end: "2025-12-29",
    backgroundColor: "#16a34a",
    extendedProps: {
      customer: "John Doe",
      status: "Confirmed",
      price: 100,
      car: "Toyota"
    }
  }
]


export default function Calendar() {
  const navigate = useNavigate()
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API}/api/bookings`, {withCredentials: true});
        setBookings(response.data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, [API]);

  const filteredBookings = bookings.filter(booking => booking.status.toLowerCase() === 'approved' || booking.status.toLowerCase() === 'ongoing');

  const colors = ['#16a34a', '#2563eb', '#dc2626', '#f59e0b', '#7c3aed', '#0891b2'];

  const events = filteredBookings.map((booking, index) => ({
    id: index + 1,
    title: booking.carName,
    start: booking.startDate,
    end: booking.endDate,
    backgroundColor: colors[index % colors.length],
    extendedProps: {
      customer: booking.customerName,
      status: booking.status,
      price: booking.totalPrice,
      car: booking.carName,
      bookingId: booking.bookingId,
    }
  }));

  const handleEventClick = (info) => {
    setSelectedBooking({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps
    })
    setOpen(true)
  }

  


  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          eventDisplay="block"
          events={events}
          eventClick={handleEventClick}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg w-full max-w-md"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Booking Details</h2>

                <div className="space-y-2 text-sm">
                  <p><b>Booking ID:</b> {selectedBooking.bookingId}</p>
                  <p><b>Car:</b> {selectedBooking.car}</p>
                  <p><b>Customer:</b> {selectedBooking.customer}</p>
                  <p><b>Status:</b> {selectedBooking.status}</p>
                  <p><b>From:</b> {selectedBooking.start?.toLocaleDateString()}</p>
                  <p><b>To:</b> {selectedBooking.end?.toLocaleDateString()}</p>
                  <p><b>Total Price:</b> ₱{selectedBooking.price}</p>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/bookings?bookingId=${selectedBooking.bookingId}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    View Full
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
