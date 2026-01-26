// Dependencies
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
// Context
import { useAuth } from './context/AuthContext.jsx'

const ProtectedRoutes = () => {
  const { loading, isAuthenticated } = useAuth()

  console.log(isAuthenticated == false)

  if (loading) {
    return <div>Loading...</div>
  }

  if (isAuthenticated == false) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoutes
