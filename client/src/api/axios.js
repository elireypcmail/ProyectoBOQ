import axios from "axios"

const IP_SERVICE = import.meta.env.VITE_IP_SERVICE
const ENVIRONMENT_PROJECT = import.meta.env.VITE_ENVIRONMENT_PROJECT  // 👈 asegúrate que exista en tu .env

const baseURL =
  ENVIRONMENT_PROJECT === "production"
    ? `https://${IP_SERVICE}`
    : `http://localhost:4000`

const instanceApp = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json", // por defecto JSON
  },
})

export { instanceApp }
