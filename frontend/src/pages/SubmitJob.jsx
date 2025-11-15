import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const SubmitJob = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedServiceId = location.state?.serviceId

  const [formData, setFormData] = useState({
    items: [{ service_id: preselectedServiceId || '', quantity: 1, options: {} }],
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    payment_method: 'online',
    pickup_time: '',
    delivery_address: '',
    notes: ''
  })
  const [files, setFiles] = useState([])

  const { data: servicesData } = useQuery('services', async () => {
    const response = await api.get('/services?active=true')
    return response.data
  })

  const createOrderMutation = useMutation(
    async (data) => {
      const formDataToSend = new FormData()
      formDataToSend.append('items', JSON.stringify(data.items))
      formDataToSend.append('customer_name', data.customer_name)
      formDataToSend.append('customer_phone', data.customer_phone)
      formDataToSend.append('customer_email', data.customer_email || '')
      formDataToSend.append('payment_method', data.payment_method)
      formDataToSend.append('pickup_time', data.pickup_time || '')
      formDataToSend.append('delivery_address', data.delivery_address || '')
      formDataToSend.append('notes', data.notes || '')
      
      files.forEach((file) => {
        formDataToSend.append('files', file)
      })

      const response = await api.post('/orders', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success('Order created successfully!')
        if (formData.payment_method === 'online') {
          navigate(`/payment/${data.order.id}`)
        } else {
          navigate(`/order/${data.order.ticket_number}`)
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create order')
      }
    }
  )

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service_id: '', quantity: 1, options: {} }]
    })
  }

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.items.some(item => !item.service_id)) {
      toast.error('Please select a service for all items')
      return
    }
    createOrderMutation.mutate(formData)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Submit a Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Items */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Services</h2>
          {formData.items.map((item, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Service</label>
                  <select
                    value={item.service_id}
                    onChange={(e) => updateItem(index, 'service_id', e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select service</option>
                    {servicesData?.services?.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.base_price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    className="input"
                    required
                  />
                </div>
                <div className="flex items-end">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn btn-secondary">
            + Add Service
          </button>
        </div>

        {/* File Upload */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Upload Files</h2>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="input"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
          />
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Selected files: {files.length}</p>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method *</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="input"
                required
              >
                <option value="online">Online Payment</option>
                <option value="cash">Pay in Shop</option>
                <option value="pay_later">Pay Later</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Time</label>
              <input
                type="datetime-local"
                value={formData.pickup_time}
                onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Address (if applicable)</label>
              <textarea
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="input"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows="3"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={createOrderMutation.isLoading}
          className="btn btn-primary w-full text-lg py-3"
        >
          {createOrderMutation.isLoading ? 'Submitting...' : 'Submit Job'}
        </button>
      </form>
    </div>
  )
}

export default SubmitJob

