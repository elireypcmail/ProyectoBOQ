import { instanceApp } from './axios'

export const loginRequest = (user) => instanceApp.post(`/auth/login`, user)

export const verifyTokenRequest = () => instanceApp.get(`/auth/verify`)
