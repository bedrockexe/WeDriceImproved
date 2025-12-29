import React from 'react';
import CarCard from '../UI/CarCard';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";

const RecommendedCars = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // Fetch & cache the cars list
  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      return axios
        .get(`${API}/api/cars`, { withCredentials: true })
        .then(res => res.data.cars);
    },
    staleTime: 1000 * 60 * 5,
  });


  const ShimmerCard = () => {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 overflow-hidden">
        {/* Image */}
        <div className="w-full h-32 bg-gray-300 rounded-lg shimmer" />

        {/* Title */}
        <div className="h-4 bg-gray-300 rounded-md mt-3 w-3/4 shimmer" />

        {/* Subtitle */}
        <div className="h-3 bg-gray-200 rounded-md mt-2 w-1/2 shimmer" />

        {/* Price */}
        <div className="h-5 bg-gray-300 rounded-md mt-4 w-1/3 shimmer" />
      </div>
    );
  };

  // Get the first 4 recommended
  const recommendedCars = cars.slice(0, 4);

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recommended Cars</h2>
        </div>

        {/* Render 4 shimmer placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p>Error loading cars</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recommended Cars</h2>
        <Link 
          to="/dashboard/cars" 
          className="text-green-500 text-sm font-medium hover:text-green-600"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendedCars.map(car => (
          <CarCard key={car._id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedCars;
