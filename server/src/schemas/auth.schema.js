import {z} from 'zod'

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'El email es obligatorio'
    }),
    contrasena: z
      .string({
        required_error: 'La contraseña es obligatoria'
      })
      .min(8, {
        message: 'La contraseña debe tener mas de 8 caracteres'
      })
})