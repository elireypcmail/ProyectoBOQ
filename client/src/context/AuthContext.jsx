// Dependencies
import React , { createContext , useState , useContext, useEffect } from 'react'
import Cookies from "js-cookie"
// Api
import {loginRequest, verifyTokenRequest} from "../api/auth"
// Context
export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null)
  const [ isAuthenticated, setIsAuthenticated ] = useState(false)
  const [ errors, setErrors ] = useState([])
  const [ loading, setLoading ] = useState(true)

  const signIn = async (user) => {
    try {
      console.log(user)
      const res = await loginRequest(user)
      localStorage.setItem("UserId", res.data.user.id)
      setUser(res.data)
      console.log(res.data)
      setIsAuthenticated(true)
    } catch (error) {
      setErrors(error.response.data)
    }
  }

  const logout = () => {
    Cookies.remove('token')
    localStorage.clear("UserId")
    setUser(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    if(errors.length > 0) {
      setTimeout(() => {
        setErrors([])
      }, 5000)
      return () => clearTimeout()
    }
  },[errors])

  useEffect(()=>{
    const checkLogin = async () => {
      const cookies = Cookies.get()

      if(!cookies.token){
        setIsAuthenticated(false)
        setLoading(false)
        return setUser(null)
      }

      try {
        const res = await verifyTokenRequest(cookies.token)
        if(!res.data){
          setIsAuthenticated(false)
          setLoading(false)
          return
        } 
        
        setIsAuthenticated(true)
        setUser(res.data)
        localStorage.setItem('timeSelect', JSON.stringify(res.data.time_select))
        setLoading(false)
      } catch (error) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
      }
    }

    checkLogin()
  },[])

  return (
    <AuthContext.Provider value={{
      signIn,
      logout,
      loading,
      user,
      isAuthenticated,
      errors
    }}>
      {children}
    </AuthContext.Provider>
  )
}