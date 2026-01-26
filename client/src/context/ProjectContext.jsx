// Dependencies
import React , { createContext , useState , useContext } from 'react'
import Cookies from "js-cookie"
// Api
import { 
  getProjects, 
  createProjects, 
  editProjects, 
  deleteProjects, 
  highlightProjects, 
  saveFileProjects, 
} from "../api/project"

// Context
export const ProjectContext = createContext()

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within an Provider')
  }
  return context
}

export const ProjectProvider = ({children}) => {
  const [projects, setProjects] = useState([])
  const [errors, setErrors] = useState([])

  const getAllProjects = async () => {
    try {
      const res = await getProjects()
      let project = res.data.projects
      setProjects(project)
    } catch (error) {
      console.log(error)
      setErrors(error.response?.data || ["Error fetching projects"])
    }
  }

  const createNewProject = async (newProject) => {
    try {
      const res = await createProjects(newProject)
      // Si el API devuelve el proyecto creado en res.data.project, lo añadimos
      const created = res.data.data
      setProjects(prev => [...prev, created])
      return { status: true, data: created }
    } catch (error) {
      console.log(error)
      setErrors(error.response?.data || ["Error creating project"])
      return { status: false, error: error.response?.data || error.message }
    }
  }

  const editedProject = async (id_project, project) => {
    try {
      const { files, images, ...cleanProject } = project

      const res = await editProjects(id_project, cleanProject)
      const updated = res.data.data

      // 🔒 Conservar files e images que ya estaban
      setProjects(prev =>
        prev.map(p =>
          p.id == id_project
            ? { ...updated, files: p.files, images: p.images }
            : p
        )
      )

      return { status: true, data: updated }
    } catch (error) {
      console.log(error)
      setErrors(error.response?.data || ["Error editing project"])
      return { status: false, error: error.response?.data || error.message }
    }
  }


  const toggleHighlightProject = async (id_project) => {
    try {
      const res = await highlightProjects(id_project)
      // Solo nos interesa si cambió el favorito
      const updated = res.data?.data || res.data?.project || res.data

      setProjects(prev =>
        prev.map(p =>
          p.id === id_project
            ? { ...p, favorite: updated.favorite } // 👈 solo cambia la propiedad favorite
            : p
        )
      )

      return { status: true, data: updated }
    } catch (error) {
      console.log(error)
      setErrors(error.response?.data || ["Error highlighting project"])
      return { status: false, error: error.response?.data || error.message }
    }
  }


  const deleteProject = async (id_project) => {
    try {
      const res = await deleteProjects(id_project)
      // Actualizamos estado eliminando el proyecto
      const deleted = res.data.data
      setProjects(prev => prev.filter(p => p.id !== id_project))
      return { status: true, data: res.data.data}
    } catch (error) {
      console.log(error)
      setErrors(error.response?.data || ["Error deleting project"])
      return { status: false, error: error.response?.data || error.message }
    }
  }

  const saveFilesProject = async (id_project, files, filesJson) => {
    try {
      console.log(id_project, files, filesJson)
      
      // 🔹 Guardar archivos en backend
      await saveFileProjects(id_project, files, filesJson)
      
      // 🔹 Traer todos los proyectos actualizados desde la API
      const res = await getProjects()
      setProjects(res.data.projects || [])
      
      return { status: true }
    } catch (error) {
      console.log(error)
      setErrors(error.response?.data || ["Error saving project files"])
      return { status: false, error: error.response?.data || error.message }
    }
  }

  const logout = () => {
    Cookies.remove('token')
  }

  return (
    <ProjectContext.Provider value={{
      createNewProject,
      getAllProjects,
      editedProject,
      toggleHighlightProject,
      deleteProject,
      saveFilesProject,
      setProjects,
      projects,
      logout,
      errors
    }}>
      {children}
    </ProjectContext.Provider>
  )
}
