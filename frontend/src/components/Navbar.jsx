import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Cyber-Café</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/services"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary-600"
              >
                Services
              </Link>
              <Link
                to="/submit-job"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary-600"
              >
                Submit Job
              </Link>
              {user && (
                <Link
                  to={`/order/${user.id}`}
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary-600"
                >
                  My Orders
                </Link>
              )}
              {(user?.role === 'admin' || user?.role === 'cashier') && (
                <Link
                  to="/admin"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary-600"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

