import { instanceApp } from './axios'

export const loginRequest = (user) => instanceApp.post(`/login`, user)

export const verifyTokenRequest = () => instanceApp.get(`/verify`)
