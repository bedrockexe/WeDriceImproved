import React, { useState } from "react";
import { SearchIcon } from "lucide-react";
import CarCard from "../components/UI/CarCard";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const CarCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">

      {/* Car Image */}
      <div className="relative w-full h-36 bg-gray-300 rounded-lg overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
          from-transparent via-white/40 to-transparent 
          animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Text Lines */}
      <div className="mt-4 space-y-2">
        {/* Title */}
        <div className="relative w-3/4 h-5 bg-gray-300 rounded-md overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
            from-transparent via-white/40 to-transparent 
            animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Subtitle */}
        <div className="relative w-1/2 h-4 bg-gray-300 rounded-md overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
            from-transparent via-white/40 to-transparent 
            animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Price */}
        <div className="relative w-1/3 h-5 bg-gray-300 rounded-md overflow-hidden mt-3">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
            from-transparent via-white/40 to-transparent 
            animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};

const AvailableCars = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // ---------------------------
  // 1️⃣ Fetch all cars (cached)
  // ---------------------------
  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      return axios.get(`${API}/api/cars/`, { withCredentials: true })
        .then((res) => res.data.cars)
    },
      
    staleTime: 1000 * 60 * 5, // Cache 5 min
  });

  // ---------------------------
  // 2️⃣ Local UI state
  // ---------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract categories
  const categories = ["All", ...new Set(cars.map((car) => car.category))];

  // ---------------------------
  // 3️⃣ Filtering Logic
  // ---------------------------
  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || car.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Available Cars
        </h1>

        {/* Skeleton Search + Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="h-10 bg-gray-300 rounded-md shimmer animate-[shimmer_1.5s_infinite]" />
          <div className="flex gap-2 mt-4 flex-wrap">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className="h-8 w-20 bg-gray-300 rounded-full relative overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r 
                  from-transparent via-white/40 to-transparent 
                  animate-[shimmer_1.5s_infinite]" />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p>Error loading cars</p>;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Available Cars
      </h1>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Search Bar */}
          <div className="flex-1 relative">
            <SearchIcon
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by car name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredCars.length}{" "}
          {filteredCars.length === 1 ? "car" : "cars"}
        </p>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCars.map((car) => (
          <CarCard key={car._id} car={car} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCars.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <SearchIcon size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No cars found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableCars;
