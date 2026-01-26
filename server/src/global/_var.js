import dotenv from "dotenv"
dotenv.config()

const _var = {
  /* =============================
   * CORS
   * ============================= */
  ORIGIN: process.env.FRONT_URL,
  ORIGIN1: process.env.FRONT_2,

  /* =============================
   * SERVER
   * ============================= */
  PORT: process.env.PORT || 5000,

  /* =============================
   * JWT
   * ============================= */
  JWT: process.env.JWT,

  /* =============================
   * DATABASE
   * ============================= */
  DB_HOST: process.env.HOST,
  DB_USER: process.env.USER,
  DB_PASS: process.env.PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.PORT_DB,

  /* =============================
   * IP SERVICE
   * ============================= */
  IP_SERVICE: process.env.IP_SERVICE,

  /* =============================
   * ROUTES - AUTH / USERS
   * ============================= */
  LOGIN: process.env.LOGIN,
  REGISTER: process.env.REGISTER,
  VERIFY: process.env.VERIFY,
  LOGOUT: process.env.LOGOUT,

  /* =============================
   * ROUTES - OFFICES
   * ============================= */
  OFFICES: process.env.OFFICES,
  OFFICE: process.env.OFFICE,
  CREATE_OFFICE: process.env.CREATE_OFFICE,
  EDIT_OFFICE: process.env.EDIT_OFFICE,
  DELETE_OFFICE: process.env.DELETE_OFFICE,

  /* =============================
   * ROUTES - ZONES
   * ============================= */
  ZONES: process.env.ZONES,
  ZONE: process.env.ZONE,
  CREATE_ZONE: process.env.CREATE_ZONE,
  EDIT_ZONE: process.env.EDIT_ZONE,
  DELETE_ZONE: process.env.DELETE_ZONE,

  /* =============================
   * ROUTES - DEPOSITS
   * ============================= */
  DEPOSITS: process.env.DEPOSITS,
  DEPOSIT: process.env.DEPOSIT,
  CREATE_DEPOSIT: process.env.CREATE_DEPOSIT,
  EDIT_DEPOSIT: process.env.EDIT_DEPOSIT,
  DELETE_DEPOSIT: process.env.DELETE_DEPOSIT,

  /* =============================
   * ROUTES - PARAMETERS
   * ============================= */
  PARAMETERS: process.env.PARAMETERS,
  PARAMETER: process.env.PARAMETER,
  CREATE_PARAMETER: process.env.CREATE_PARAMETER,
  EDIT_PARAMETER: process.env.EDIT_PARAMETER,
  DELETE_PARAMETER: process.env.DELETE_PARAMETER,

  /* =============================
   * ROUTES - PRODUCTS
   * ============================= */
  PRODUCTS: process.env.PRODUCTS,
  PRODUCT: process.env.PRODUCT,
  CREATE_PRODUCT: process.env.CREATE_PRODUCT,
  EDIT_PRODUCT: process.env.EDIT_PRODUCT,
  DELETE_PRODUCT: process.env.DELETE_PRODUCT,
  HIGHLIGHT_PRODUCT: process.env.HIGHLIGHT_PRODUCT,

  /* =============================
   * FILES
   * ============================= */
  SAVE_FILE_PRODUCT: process.env.SAVE_FILE_PRODUCT
}

export default _var
