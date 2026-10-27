import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx' // App.jsx will be converted to App.tsx later
import { initFrontendSentry } from './lib/sentry'

initFrontendSentry();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// ShopContextProvider is temporarily kept until we migrate Cart state to Zustand fully.
import { ShopContextProvider } from './context/ShopContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={(import.meta as any).env.VITE_GOOGLE_CLIENT_ID || ''}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ShopContextProvider>
            <App />
          </ShopContextProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
