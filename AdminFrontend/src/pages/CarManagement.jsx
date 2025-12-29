import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  CarIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  WrenchIcon,
  EyeIcon,
  UploadIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react'
import { ConfirmationModal } from './ConfirmationModal'
import { toast, Toaster } from 'sonner'
import axios from 'axios'


const AdminFleetManagement = () => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const [cars, setCars] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedCar, setSelectedCar] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [carToDelete, setCarToDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState({
    car: null,
    newStatus: null,
  });
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    transmission: '',
    seats: 0,
    fuelType: '',
    pricePerDay: 0,
    status: 'available',
    features: [],
    description: '',
    mainImageIndex: 0,
  })

  const [images, setImages] = useState([]);

  const fetchCars = async () => {
    const res = await axios.get(`${API}/api/cars`, {withCredentials: true});
    setCars(res.data.cars);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const categories = [
    "Economy",
    "Compact",
    "Sedan",
    "SUV",
    "Van",
    "MPV",
    "Pickup",
    "Luxury",
  ];


  const statuses = [
    {
      value: 'available',
      label: 'Available',
      color: 'green',
    },
    {
      value: 'rented',
      label: 'Currently Rented',
      color: 'blue',
    },
    {
      value: 'maintenance',
      label: 'Under Maintenance',
      color: 'orange',
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'gray',
    },
  ]

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || car.status === filterStatus
    const matchesCategory =
      filterCategory === 'all' || car.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleImageUpload = (e) => {
    const files = [...e.target.files]

    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev]
      newImages.splice(index, 1)
      return newImages
    })
  }

  const confirmStatusChange = async () => {
    const { car, newStatus } = pendingStatusChange;
    if (!car) return;

    try {
      await axios.patch(`${API}/api/cars/status/${car._id}`, {
        status: newStatus,
      }, {withCredentials: true});

      setCars((prev) =>
        prev.map((c) =>
          c._id === car._id ? { ...c, status: newStatus } : c
        )
      );

      fetchCars();

      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast.error("Failed to update status");
    }

    setShowStatusModal(false);
    setPendingStatusChange({ car: null, newStatus: null });
  };

  const cancelStatusChange = () => {
    setShowStatusModal(false);
    setPendingStatusChange({ car: null, newStatus: null });
  };


  const addFeature = (feature) => {
    if (!feature.trim()) return
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, feature]
    }))
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = statuses.find((s) => s.value === status)
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[statusConfig?.color]}`}
      >
        {statusConfig?.label}
      </span>
    )
  }

  const handleOpenModal = (mode, car) => {
    setModalMode(mode)
    if (mode === 'edit' && car) {
      setSelectedCar(car)
      setFormData({
        name: car.name,
        brand: car.brand,
        model: car.model,
        year: car.year,
        category: car.category,
        transmission: car.transmission,
        seats: car.seats,
        fuelType: car.fuelType,
        pricePerDay: car.pricePerDay,
        features: car.features,
        description: car.description,
        mainImageIndex: car.mainImageIndex || 0,
      });
      setImages([]);
      setMainImageIndex(car.mainImageIndex ?? 0);
    } else {
      setSelectedCar(null)
      setFormData({
        name: '',
        brand: '',
        model: '',
        year: new Date().getFullYear().toString(),
        category: '',
        transmission: '',
        seats: 0,
        fuelType: '',
        pricePerDay: 0,
        features: [],
        description: '',
        mainImageIndex: 0,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedCar(null)
    setFormData({
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear().toString(),
      category: '',
      transmission: '',
      seats: 0,
      fuelType: '',
      pricePerDay: 0,
      features: [],
      description: '',
      mainImageIndex: 0,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(async () => {
      if (modalMode === 'create') {
        const newCarData = new FormData()

        Object.keys(formData).forEach((key) => {
          const value = formData[key];

          if (Array.isArray(value)) {
            newCarData.append(key, JSON.stringify(value));
          } else {
            newCarData.append(key, value);
          }
        });

        images.forEach((img) => newCarData.append("images", img));

        for (let [key, value] of newCarData.entries()) {
          console.log(key, value);
        }

        const res = await axios.post(`${API}/api/cars/add`, newCarData, {withCredentials: true});
        console.log(res.data);
        setCars([...cars, res.data.car])
        setImages([]);
        toast.success('Car listing created successfully!')
      } else if (selectedCar) {
        const updatedCarData = new FormData()
        Object.keys(formData).forEach((key) => {
          const value = formData[key];
          if (key === "images" || key === "mainImage" || key === "_id" || key === "__v") return;
          if (Array.isArray(value)) {
            updatedCarData.append(key, JSON.stringify(value));
          } else {
            updatedCarData.append(key, value);
          }
        });
        images.forEach((img) => updatedCarData.append("images", img));

        for (let [key, value] of updatedCarData.entries()) {
          console.log(key, value);
        }

        const res = await axios.put(`${API}/api/cars/update/${selectedCar._id}`, updatedCarData, {withCredentials: true});
        fetchCars();
        toast.success(res.data.message)
      }
      setIsSubmitting(false)
      handleCloseModal()
    }, 1500)
  }

  const handleDelete = async () => {
    if (!carToDelete) return;

    setIsSubmitting(true);

    try {
      await axios.delete(`${API}/api/cars/${carToDelete._id}`, {withCredentials: true});

      setCars((prev) =>
        prev.filter((car) => car._id !== carToDelete._id)
      );

      toast.success("Car listing deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete car");
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setCarToDelete(null);
    }
  };

  const handleStatusChange = (carId, newStatus) => {
    setCars(
      cars.map((car) =>
        car._id === carId
          ? {
              ...car,
              availability: newStatus,
            }
          : car,
      ),
    )
    toast.success('Car status updated successfully!')
  }

  const statsData = {
    total: cars.length,
    available: cars.filter((c) => c.status === 'available').length,
    rented: cars.filter((c) => c.status === 'rented').length,
    maintenance: cars.filter((c) => c.status === 'maintenance').length,
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Fleet Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your vehicle inventory and listings
            </p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <PlusIcon size={20} className="mr-2" />
            Add New Car
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Fleet</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {statsData.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <CarIcon size={24} className="text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Available</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {statsData.available}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Rented</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {statsData.rented}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CarIcon size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Maintenance
                </p>
                <p className="text-3xl font-bold text-orange-900 mt-1">
                  {statsData.maintenance}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <WrenchIcon size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, brand, license plate, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cars Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCars.map((car) => (
                  <tr
                    key={car._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={car.mainImage}
                          alt={car.name}
                          className="w-16 h-12 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {car.name}
                          </p>
                          <p className="text-sm text-gray-500">{car.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {car.category} • {car.transmission}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                        ₱{car.pricePerDay}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={car.status}
                        onChange={(e) => {
                            setPendingStatusChange({
                              car,
                              newStatus: e.target.value,
                            });
                            setShowStatusModal(true);
                          }}
                        className="text-sm border-0 bg-transparent font-medium focus:ring-2 focus:ring-green-500 rounded-lg cursor-pointer"
                      >
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal('edit', car)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <EditIcon size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setCarToDelete(car)
                            setShowDeleteModal(true)
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCars.length === 0 && (
            <div className="p-12 text-center">
              <CarIcon size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No vehicles found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Add New Vehicle' : 'Edit Vehicle'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Toyota"
                  />
                </div>
                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Toyota"
                  />
                </div>
                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        model: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Corolla"
                  />
                </div>
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.transmission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transmission: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Transmission</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.fuelType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fuelType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                {/* Seats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="9"
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seats: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {/* Price Per Day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Day <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.pricePerDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerDay: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Images <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm"
                  />

                  {/* Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`relative border rounded-lg overflow-hidden cursor-pointer ${
                          formData.mainImageIndex === index
                            ? 'ring-2 ring-green-500'
                            : ''
                        }`}
                        onClick={() => {
                          setFormData({ ...formData, mainImageIndex: index })
                          console.log(`Form Data: ${JSON.stringify(formData)}`)
                        }}
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-full h-24 object-cover"
                        />

                        {/* Thumbnail Badge */}
                        {formData.mainImageIndex === index && (
                          <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                            Thumbnail
                          </span>
                        )}

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  

                  <p className="text-xs text-gray-500 mt-2">
                    Click an image to set it as the main thumbnail
                  </p>
                </div>

                {/* Features */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="e.g., Bluetooth, Backup Camera"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addFeature(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling
                        addFeature(input.value)
                        input.value = ''
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-2 text-red-500"
                        >
                          <XIcon size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Brief description of the vehicle..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon size={18} className="mr-2" />
                      {modalMode === 'create'
                        ? 'Create Listing'
                        : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setCarToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Vehicle Listing"
        message={`Are you sure you want to delete ${carToDelete?.name}? This action cannot be undone and will remove the vehicle from your fleet permanently.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />

      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={cancelStatusChange}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        message={`Are you sure you want to change the status of "${pendingStatusChange.car?.name}" to "${pendingStatusChange.newStatus}"?`}
        confirmText="Yes, Change Status"
        cancelText="Cancel"
        variant="warning"
        isLoading={isSubmitting}
      />

    </>
  )
}
export default AdminFleetManagement
