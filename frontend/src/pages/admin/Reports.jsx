import { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../../utils/api'

const AdminReports = () => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery(
    ['daily-report', reportDate],
    async () => {
      const response = await api.get(`/reports/daily?date=${reportDate}`)
      return response.data
    }
  )

  const handleExport = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/daily/export?date=${reportDate}`, '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Reports</h1>

      <div className="card mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Select Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="input"
            />
          </div>
          <button onClick={handleExport} className="btn btn-primary">
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Daily Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{data?.total_orders || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{data?.total_revenue || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-2xl font-bold">{data?.date}</p>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.orders?.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.ticket_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer_name || 'N/A'}
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{order.final_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.payment_method} - {order.payment_status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports

