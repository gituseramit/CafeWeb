import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

const Dashboard = () => {
  const { data, isLoading } = useQuery('admin-dashboard', async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const stats = data?.stats

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-blue-50">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.today_orders || 0}</p>
        </div>
        <div className="card bg-yellow-50">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats?.pending_orders || 0}</p>
        </div>
        <div className="card bg-green-50">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Ready Orders</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.ready_orders || 0}</p>
        </div>
        <div className="card bg-purple-50">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">₹{stats?.today_revenue || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/orders" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Manage Orders</h3>
          <p className="text-gray-600">View and update order statuses</p>
        </Link>
        <Link to="/admin/services" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Manage Services</h3>
          <p className="text-gray-600">Add, edit, or remove services</p>
        </Link>
        <Link to="/admin/reports" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">View Reports</h3>
          <p className="text-gray-600">Sales and order reports</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

