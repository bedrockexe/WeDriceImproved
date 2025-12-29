import React from 'react';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};


const ReservationCard = ({
  reservation
}) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'ongoing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-24 sm:h-24 mb-3 sm:mb-0 overflow-hidden rounded-md">
          <img src={reservation.image} alt={reservation.carName} className="w-full h-full object-cover" />
        </div>
        <div className="sm:ml-4 flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div>
              <h3 className="font-medium text-gray-800">
                {reservation.carName}
              </h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <CalendarIcon size={14} className="mr-1" />
                <span>
                  {formatDate(reservation.pickupDate)} - {formatDate(reservation.returnDate)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPinIcon size={14} className="mr-1" />
                <span>{reservation.location}</span>
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            {/* Link to reservation details */}
            <Link
              to={`/dashboard/bookingdetails/${reservation.id}`}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              View Details
            </Link>

            <button className="text-sm text-red-500 hover:text-red-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default ReservationCard;