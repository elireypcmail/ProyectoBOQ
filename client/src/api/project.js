import { instanceApp } from './axios'

export const loginRequest = (user) => instanceApp.post(`/login`, user)

export const getProjects = () => instanceApp.get(`/projects`)

export const createProjects = (project) => instanceApp.post(`/create/project`, project)

export const editProjects = (id_project, project) => instanceApp.put(`/edit/project/${id_project}`, project)

export const deleteProjects = (id_project) => instanceApp.delete(`/delete/project/${id_project}`)

export const highlightProjects = (id_project) => instanceApp.put(`/highlight/project/${id_project}`)


export const saveFileProjects = (id_project, files, filesJson) => {
  const formData = new FormData()

  // Agregar archivos
  files.forEach((file) => {
    formData.append("files", file)
  })

  // Agregar JSON como string
  formData.append("files_json", JSON.stringify(filesJson))

  return instanceApp.post(`/save/file/${id_project}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}
