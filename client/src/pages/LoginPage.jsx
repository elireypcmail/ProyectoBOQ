// Dependencies
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { IoEye, IoEyeOff } from "react-icons/io5"

// Styles
import "../styles/pages/LoginPage.css"

// Images (Importamos AMBOS fondos con nombres distintos)
import fondoHorizontal from "../assets/images/fondoHorizontal.jpeg"
import fondoApp from "../assets/images/fondoApp.jpeg"
import logo from "../assets/images/logo.png"

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const { signIn, isAuthenticated, errors: loginErrors, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate("/inicio")
  }, [isAuthenticated, navigate])

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const onSubmit = async (data) => {
    await signIn(data)
  }

  return (
    <div className="login-container">
      {/* Capa de fondo: 
         Pasamos las dos imágenes como variables CSS personalizadas (--bg-pc y --bg-mobile)
         para que el archivo CSS decida cuál mostrar.
      */}
      <div 
        className="login-background" 
        style={{ 
          '--bg-desktop': `url(${fondoHorizontal})`,
          '--bg-mobile': `url(${fondoApp})`
        }} 
      />
      
      {/* Capa oscura para legibilidad */}
      <div className="login-overlay" />

      {/* Contenido principal */}
      <div className="login-content">
        
        <div className="login-header">
          <img src={logo} alt="Mundo Implantes" className="app-logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              className={errors.email ? "input-error" : ""}
              disabled={isLoading}
              {...register("email", { required: "El Email es obligatorio" })}
            />
            {errors.email && (
              <span className="error-text">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={errors.contrasena ? "input-error" : ""}
                disabled={isLoading}
                {...register("contrasena", { required: "La contraseña es obligatoria" })}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
            {errors.contrasena && (
              <span className="error-text">{errors.contrasena.message}</span>
            )}
          </div>

          {loginErrors?.length > 0 && (
            <div className="general-error">
              <p>Email o contraseña incorrectos.</p>
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p>Nota: tus credenciales estan seguras y cifradas</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage