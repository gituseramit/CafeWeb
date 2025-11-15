import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../utils/api'

const Home = () => {
  const { data: servicesData } = useQuery('services', async () => {
    const response = await api.get('/services?active=true&limit=6')
    return response.data
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Cyber-Café
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Print, Scan, Photo Editing, and More Services
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/services" className="btn btn-primary text-lg px-8">
            Browse Services
          </Link>
          <Link to="/submit-job" className="btn btn-secondary text-lg px-8">
            Submit a Job
          </Link>
        </div>
      </div>

      {/* Services Preview */}
      {servicesData?.services && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Popular Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.services.slice(0, 6).map((service) => (
              <div key={service.id} className="card hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{service.base_price}
                  </span>
                  <span className="text-sm text-gray-500">{service.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" className="btn btn-primary">
              View All Services
            </Link>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">Fast Printing</h3>
          <p className="text-gray-600">High-quality B/W and color printing</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2">Easy Payments</h3>
          <p className="text-gray-600">Online or cash payment options</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Quick Service</h3>
          <p className="text-gray-600">Fast turnaround on all jobs</p>
        </div>
      </div>
    </div>
  )
}

export default Home

