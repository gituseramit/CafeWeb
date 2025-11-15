import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import ErrorBoundary from './pages/ErrorBoundary'
import './index.css'

// Check if running from file:// protocol
if (window.location.protocol === 'file:') {
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: Arial; max-width: 600px; margin: 50px auto; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px;">
      <h1 style="color: #856404; margin-top: 0;">⚠️ Wrong Way to Open the App!</h1>
      <p style="color: #856404; font-size: 16px; line-height: 1.6;">
        You're trying to open the HTML file directly. React apps must run through a development server.
      </p>
      <h2 style="color: #856404; margin-top: 30px;">✅ Correct Way:</h2>
      <ol style="color: #856404; line-height: 2;">
        <li>Open a terminal in the <code>frontend</code> folder</li>
        <li>Run: <code>npm install</code> (if not done already)</li>
        <li>Run: <code>npm run dev</code></li>
        <li>Open <strong>http://localhost:3000</strong> in your browser</li>
      </ol>
      <p style="color: #856404; margin-top: 20px;">
        See <strong>START_HERE.md</strong> for detailed instructions.
      </p>
    </div>
  `
} else {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}

