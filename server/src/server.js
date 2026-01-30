// Dependencies
import express            from "express"
import http               from "http"
import cors               from "cors"
import morgan             from "morgan"
import cookieParser       from "cookie-parser"
import _var               from "./global/_var.js"

// Routes
import authRouter from "./routes/auth.routes.js"
import patientsRouter from "./routes/patients.routes.js"
import doctorsRouter from "./routes/doctors.routes.js"
import typesDocRouter from "./routes/typesDoc.routes.js"
import insurancesRouter from "./routes/insurances.routes.js"
import storiesRouter from "./routes/stories.routes.js"

import productsRouter from "./routes/products.routes.js"
import categoriesRouter from "./routes/categories.routes.js"
import brandsRouter from "./routes/brands.routes.js"
import lotsRouter from "./routes/lots.routes.js"


const app = express()
const server = http.createServer(app)

// Middleware
app.use(morgan("dev"))
app.use(cookieParser())
app.use(
  cors({
    origin: `${_var.IP_SERVICE}`, // Cambia esto si es necesario
    credentials: true,
  })
)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

server.listen(_var.PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${_var.PORT}`)
})

// Use routes
app.use("/auth",authRouter)
app.use("/medicos",doctorsRouter)
app.use("/pacientes",patientsRouter)
app.use("/tipos/medicos",typesDocRouter)
app.use("/seguros",insurancesRouter)
app.use("/historias",storiesRouter)

app.use("/categorias",categoriesRouter)
app.use("/productos",productsRouter)
app.use("/marcas",brandsRouter)
app.use("/lotes",lotsRouter)