import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const AdminServices = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    min_price: '',
    max_price: '',
    unit: 'per page',
    category: '',
    active: true
  })

  const { data, isLoading } = useQuery('services', async () => {
    const response = await api.get('/services')
    return response.data
  })

  const createMutation = useMutation(
    (data) => api.post('/services', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services')
        toast.success('Service created successfully')
        setShowModal(false)
        resetForm()
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create service')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/services/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services')
        toast.success('Service updated successfully')
        setShowModal(false)
        setEditingService(null)
        resetForm()
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update service')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/services/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services')
        toast.success('Service deleted successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete service')
      }
    }
  )

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      min_price: '',
      max_price: '',
      unit: 'per page',
      category: '',
      active: true
    })
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      base_price: service.base_price,
      min_price: service.min_price || '',
      max_price: service.max_price || '',
      unit: service.unit || 'per page',
      category: service.category || '',
      active: service.active
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      base_price: parseFloat(formData.base_price),
      min_price: formData.min_price ? parseFloat(formData.min_price) : null,
      max_price: formData.max_price ? parseFloat(formData.max_price) : null
    }

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Services</h1>
        <button
          onClick={() => {
            setEditingService(null)
            resetForm()
            setShowModal(true)
          }}
          className="btn btn-primary"
        >
          + Add Service
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.services?.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{service.base_price}
                      {service.min_price !== service.max_price && (
                        <span className="text-gray-500"> - ₹{service.max_price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this service?')) {
                            deleteMutation.mutate(service.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingService ? 'Edit Service' : 'Add Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingService(null)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServices

