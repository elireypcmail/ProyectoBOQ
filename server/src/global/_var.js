import dotenv from "dotenv"
dotenv.config()

const _var = {
  // Cors
  ORIGIN: process.env.FRONT_URL,
  ORIGIN1: process.env.FRONT_2,
  // Server
  PORT: process.env.PORT || 5000,
  // JWT
  JWT: process.env.JWT,
  // Database
  DB_HOST: process.env.HOST,
  DB_USER: process.env.USER,
  DB_PASS: process.env.PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.PORT_DB,
  // SERVICE
  IP_SERVICE: process.env.IP_SERVICE,
  // Email
  EMAIL_USER : process.env.EMAIL_USER,
  EMAIL_PASS : process.env.EMAIL_PASS
}

export default _var
