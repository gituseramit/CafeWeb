import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../utils/api'

const Services = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data, isLoading } = useQuery(
    ['services', search, category],
    async () => {
      const params = new URLSearchParams({ active: 'true' })
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      const response = await api.get(`/services?${params}`)
      return response.data
    }
  )

  const categories = [...new Set(data?.services?.map(s => s.category).filter(Boolean) || [])]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Services</h1>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.services?.map((service) => (
            <div key={service.id} className="card hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
                {service.category && (
                  <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                    {service.category}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{service.base_price}
                  </span>
                  {service.min_price !== service.max_price && (
                    <span className="text-sm text-gray-500 ml-2">
                      - ₹{service.max_price}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{service.unit}</span>
              </div>
              <Link
                to="/submit-job"
                state={{ serviceId: service.id }}
                className="btn btn-primary w-full text-center"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}

      {data?.services?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No services found. Try adjusting your search.
        </div>
      )}
    </div>
  )
}

export default Services

