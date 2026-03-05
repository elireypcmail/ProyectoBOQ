import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { registerSW } from "virtual:pwa-register"

// Registrar Service Worker
const updateSW = registerSW({
  onOfflineReady() {
    console.log("App lista para uso offline")
  },
  onNeedRefresh() {
    console.log("Hay una nueva versión disponible")
    // Opcional: mostrar alerta o notificación al usuario
    if (confirm("Hay una nueva versión disponible. ¿Deseas actualizar?")) {
      updateSW(true) // fuerza la actualización inmediata
    }
  }
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)