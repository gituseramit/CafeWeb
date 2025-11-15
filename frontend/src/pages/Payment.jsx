import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

const Payment = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [paymentInitiated, setPaymentInitiated] = useState(false)

  const { data: orderData } = useQuery(
    ['order', orderId],
    async () => {
      const response = await api.get(`/orders/${orderId}`)
      return response.data.order
    },
    { enabled: !!orderId }
  )

  const createPaymentMutation = useMutation(
    async () => {
      const response = await api.post('/payments/create', {
        order_id: orderId,
        amount: orderData?.final_amount
      })
      return response.data
    },
    {
      onSuccess: (data) => {
        initiateRazorpayPayment(data)
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create payment')
      }
    }
  )

  const verifyPaymentMutation = useMutation(
    async (paymentData) => {
      const response = await api.post('/payments/verify', paymentData)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Payment successful!')
        navigate(`/order/${orderData?.ticket_number}`)
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Payment verification failed')
      }
    }
  )

  const initiateRazorpayPayment = (paymentData) => {
    const options = {
      key: paymentData.key,
      amount: paymentData.transaction.amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Cyber-Café',
      description: `Order ${orderData?.ticket_number}`,
      order_id: paymentData.razorpay_order_id,
      handler: function (response) {
        verifyPaymentMutation.mutate({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      },
      prefill: {
        name: orderData?.customer_name || '',
        email: orderData?.customer_email || '',
        contact: orderData?.customer_phone || ''
      },
      theme: {
        color: '#0ea5e9'
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
    setPaymentInitiated(true)
  }

  const handlePayNow = () => {
    if (!orderData) {
      toast.error('Order not found')
      return
    }
    createPaymentMutation.mutate()
  }

  if (!orderData) {
    return <div className="text-center py-12">Loading order...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment</h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">Order: {orderData.ticket_number}</p>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>₹{orderData.total_amount}</span>
            </div>
            {orderData.tax_amount > 0 && (
              <div className="flex justify-between mb-2">
                <span>Tax:</span>
                <span>₹{orderData.tax_amount}</span>
              </div>
            )}
            {orderData.service_charge > 0 && (
              <div className="flex justify-between mb-2">
                <span>Service Charge:</span>
                <span>₹{orderData.service_charge}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold pt-2 border-t">
              <span>Total:</span>
              <span>₹{orderData.final_amount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handlePayNow}
            disabled={createPaymentMutation.isLoading || paymentInitiated}
            className="btn btn-primary w-full text-lg py-3"
          >
            {createPaymentMutation.isLoading ? 'Processing...' : 'Pay Now'}
          </button>

          <button
            onClick={() => navigate(`/order/${orderData.ticket_number}`)}
            className="btn btn-secondary w-full"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You will be redirected to Razorpay payment gateway. 
            Make sure pop-ups are enabled in your browser.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Payment

