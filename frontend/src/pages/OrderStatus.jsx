import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../utils/api'

const OrderStatus = () => {
  const { ticketNumber } = useParams()

  const { data, isLoading } = useQuery(
    ['order', ticketNumber],
    async () => {
      const response = await api.get('/orders')
      const orders = response.data.orders || []
      return orders.find(o => o.ticket_number === ticketNumber) || null
    },
    { enabled: !!ticketNumber }
  )

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!data) {
    return <div className="text-center py-12">Order not found</div>
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-2">Ticket: {data.ticket_number}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-semibold ${statusColors[data.status]}`}>
            {data.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <p className="text-gray-600">{data.customer_name || 'N/A'}</p>
            <p className="text-gray-600">{data.customer_phone}</p>
            {data.customer_email && (
              <p className="text-gray-600">{data.customer_email}</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Order Information</h3>
            <p className="text-gray-600">Date: {new Date(data.created_at).toLocaleString()}</p>
            <p className="text-gray-600">Payment: {data.payment_method}</p>
            <p className="text-gray-600">Payment Status: {data.payment_status}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-4">Items</h3>
          <div className="space-y-2">
            {data.items?.map((item) => (
              <div key={item.id} className="flex justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{item.service_name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × ₹{item.unit_rate}
                  </p>
                </div>
                <p className="font-semibold">₹{item.subtotal}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>₹{data.total_amount}</span>
          </div>
          {data.tax_amount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Tax:</span>
              <span>₹{data.tax_amount}</span>
            </div>
          )}
          {data.service_charge > 0 && (
            <div className="flex justify-between mb-2">
              <span>Service Charge:</span>
              <span>₹{data.service_charge}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold pt-2 border-t">
            <span>Total:</span>
            <span>₹{data.final_amount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderStatus

