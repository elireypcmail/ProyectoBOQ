import jwt        from "jsonwebtoken"
import _var    from '../global/_var.js'

export const createAccessToken = (payload) => {
  console.log(payload)
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload ,
      _var.JWT, 
      { algorithm: "HS256"}, 
      (err , token) => {
        if (err) reject(err)
        resolve(token)
      }
    )
  })
}