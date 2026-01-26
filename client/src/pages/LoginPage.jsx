// Dependencies
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { IoEye, IoEyeOff } from "react-icons/io5"
// Styles
import "../styles/pages/LoginPage.css"

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
    <div className="admin-login-container">
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h2>Inicio de Sesión</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="admin-login-form">
            <div className="form-groupLogin">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="text"
                placeholder="Ingresa tu Email"
                disabled={isLoading}
                {...register("email", { required: "El Email es obligatorio" })}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="form-groupLogin">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
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
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            {loginErrors?.length > 0 && (
              <div className="error-message">
                <p>Email o contraseña incorrectos. Inténtalo de nuevo.</p>
              </div>
            )}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="login-info">
            <p><strong>Nota:</strong> Tus credenciales están seguras y cifradas.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
