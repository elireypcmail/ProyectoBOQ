import { instanceApp } from './axios'

// Services

export const getServices = () => instanceApp.get(`/services`)

export const getService = (id_service) => instanceApp.get(`/service/${id_service}`)

export const createServices = (service) => instanceApp.post(`/create/service`, service)

export const editServices = (id_service, service) => instanceApp.put(`/edit/service/${id_service}`, service)

export const deleteServices = (id_service) => instanceApp.delete(`/delete/service/${id_service}`)

export const saveFileServices = (id_service, files, filesJson) => {
  const formData = new FormData()

  // Agregar archivos
  files.forEach((file) => {
    formData.append("files", file)
  })

  // Agregar JSON como string
  formData.append("files_json", JSON.stringify(filesJson))

  return instanceApp.post(`/save/file/service/${id_service}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

// Collections

export const getCollection = (type) => instanceApp.get(`/collection/${type}`)
