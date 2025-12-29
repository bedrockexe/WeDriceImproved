import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from 'axios';
import { ConfirmationModal } from '../components/UI/ConfirmationModal';
import { toast, Toaster } from 'sonner';

const EditAccount = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // ------------------------------------------
  // 1️⃣ Load current user (cached globally)
  // ------------------------------------------
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentuser"],
    queryFn: () =>
      axios
        .get(`${API}/api/users/me`, { withCredentials: true })
        .then((res) => res.data.user),
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    licenseNumber: "",
    licenseExpiry: "",
    birthdate: "",
  });

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  // ------------------------------------------
  // 3️⃣ Handle form input
  // ------------------------------------------
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const updateUserMutation = useMutation({
    mutationFn: () =>
      axios.put(`${API}/api/users/me`, formData, {
        withCredentials: true,
      }),
    onSuccess: async () => {
      // Refresh cached user data
      queryClient.invalidateQueries(["currentuser"]);
      toast.success('Edit Account successful!', {
        duration: 3000,
      })
      await delay(1000);
      navigate("/dashboard/profile");
    },
    onError: () => {
      alert("Error updating profile");
      toast.error('There was error encountered! Please try again', {
        duration: 3000,
      })
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true)
  };

  const handleConfirmSave = () => {
    setIsSaving(true)
    updateUserMutation.mutate();
    setTimeout(() => {
      setIsSaving(false)
      setShowConfirmModal(false)
    }, 1000)
  }

  if (isLoading) return <div>Loading...</div>;


  return (
    <>
    <Toaster richColors />
    <div>
      <div className="flex items-center mb-6">
        <Link to="/dashboard/profile" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon size={20} />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Edit Account
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        
        {/* Personal Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

          </div>
        </div>

        {/* Address */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">Home Address</label>
          <input 
            type="text"
            name="address"
            value={formData.address}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md 
                      bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Driver Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Driver Information</h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
          <input 
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        bg-gray-100 text-gray-500 cursor-not-allowed mb-5"
            />
          <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
          <input 
              type="text"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        bg-gray-100 text-gray-500 cursor-not-allowed mb-5"
            />
          <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
          <input 
              type="text"
              name="birthdate"
              value={formatDate(formData.birthdate)}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        bg-gray-100 text-gray-500 cursor-not-allowed"
            />

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Link 
            to="/dashboard/profile" 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button 
            type="submit" 
            className="flex items-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <SaveIcon size={18} className="mr-2" /> Save Changes
          </button>
        </div>

      </form>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="Save Changes"
        message="Are you sure you want to save these changes to your profile? This action cannot be undone."
        confirmText="Save Changes"
        cancelText="Keep Editing"
        variant="primary"
        isLoading={isSaving}
      />
    </div>
    </>
    
  );
};

export default EditAccount;
