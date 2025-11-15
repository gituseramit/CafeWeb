import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const AdminOrders = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  const { data, isLoading } = useQuery(
    ['orders', statusFilter, paymentFilter],
    async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (paymentFilter) params.append('payment_status', paymentFilter)
      const response = await api.get(`/orders?${params}`)
      return response.data
    }
  )

  const updateStatusMutation = useMutation(
    ({ id, status, assigned_to }) => api.put(`/orders/${id}/status`, { status, assigned_to }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders')
        toast.success('Order status updated')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update status')
      }
    }
  )

  const markCashPaymentMutation = useMutation(
    (orderId) => api.post('/payments/cash', { order_id: orderId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders')
        toast.success('Payment marked as received')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to mark payment')
      }
    }
  )

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Orders</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.orders?.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/order/${order.ticket_number}`}
                        className="text-sm font-medium text-primary-600 hover:underline"
                      >
                        {order.ticket_number}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.final_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({
                          id: order.id,
                          status: e.target.value
                        })}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${statusColors[order.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.payment_status}
                      </span>
                      {order.payment_status === 'pending' && order.payment_method === 'cash' && (
                        <button
                          onClick={() => markCashPaymentMutation.mutate(order.id)}
                          className="ml-2 text-xs text-primary-600 hover:underline"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/order/${order.ticket_number}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders

