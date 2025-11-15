import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    tax_percentage: 0,
    service_charge: 0,
    working_hours_open: '09:00',
    working_hours_close: '21:00'
  })

  const { data, isLoading } = useQuery('settings', async () => {
    const response = await api.get('/admin/settings')
    return response.data
  })

  const updateMutation = useMutation(
    ({ key, value }) => api.put(`/admin/settings/${key}`, { value }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settings')
        toast.success('Setting updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update setting')
      }
    }
  )

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const settings = data?.settings || {}

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate({
      key: 'tax_percentage',
      value: parseFloat(formData.tax_percentage)
    })
    updateMutation.mutate({
      key: 'service_charge',
      value: parseFloat(formData.service_charge)
    })
    updateMutation.mutate({
      key: 'working_hours',
      value: {
        open: formData.working_hours_open,
        close: formData.working_hours_close
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pricing Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tax Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_percentage || settings.tax_percentage?.value || 0}
                onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Service Charge (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.service_charge || settings.service_charge?.value || 0}
                onChange={(e) => setFormData({ ...formData, service_charge: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Working Hours</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Opening Time</label>
              <input
                type="time"
                value={formData.working_hours_open || settings.working_hours?.open || '09:00'}
                onChange={(e) => setFormData({ ...formData, working_hours_open: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Closing Time</label>
              <input
                type="time"
                value={formData.working_hours_close || settings.working_hours?.close || '21:00'}
                onChange={(e) => setFormData({ ...formData, working_hours_close: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={updateMutation.isLoading}
        >
          {updateMutation.isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

export default AdminSettings

