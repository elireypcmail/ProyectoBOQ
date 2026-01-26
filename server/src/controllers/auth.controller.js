// Models
import { Users } from '../models/user.model.js'

export const controller = {}

controller.login = async (req, res) => {
  try {
    const { email , contrasena } = req.body

    console.log(req.body)

    const filterKeys = Object.keys(req.body)

    if(filterKeys.length < 2 || !email || !contrasena) {
      return res.status(404).json({
        error: 'Nombre de Usuario o contraseña invalida'
      })
    }else{
      const user = await Users.verify(email, contrasena)
      console.log(user)
      if(user.code == 200){
        res.cookie('token', user.tokenUser)
        res.status(user.code).json(user)
      }else{
        return res.status(500).json([[user.msg.msg]])
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.register = async (req, res) => {
  try {
    const data = req.body
    const user = await Users.create(data)
    console.log(user)
    if(user.code == 201){
      // res.cookie('token', user.tokenUser)
      res.status(user.code).json(user)
    }else{
      return res.status(500).json(user)
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.logout = async (req, res) => {
  try {    
    res.cookie('token', '' , {
      expires : new Date(0)
    })
    res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.verifyToken = async (req, res) => {
  try {    
    const {token} = req.cookies

    const filterKeys = Object.keys(req.cookies)
  
    if (filterKeys.length < 1 || !token ) {      
      return res.status(400).json({ error: "Token no autorizado, acceso denegado" })
    }else{
      const user = await Users.verifyToken(token)
      res.json(user)
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}