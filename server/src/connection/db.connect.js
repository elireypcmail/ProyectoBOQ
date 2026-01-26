import pkg from 'pg'
const { Pool } = pkg
import _var from '../global/_var.js'

const config = {
  user: _var.DB_USER,
  host: _var.DB_HOST,
  database: _var.DB_NAME,
  password: _var.DB_PASS,
  port: _var.DB_PORT,
}

const pool = new Pool(config)
export default pool 