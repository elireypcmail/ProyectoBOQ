-- Nombre de la base de datos: ProyectoBOQ

-- Usuarios y Estructura Interna
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  id_oficina INT,
  id_deposito INT,
  telefono VARCHAR(20),
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE oficinas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  id_zona INT,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE zonas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE depositos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE parametros (
  id SERIAL PRIMARY KEY,
  nro_factura INT NOT NULL,
  descripcion VARCHAR(100) NOT NULL,
  valor TEXT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Inventario

CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(200) NOT NULL,
  id_categoria INT REFERENCES categorias(id) ON DELETE CASCADE,
  id_marca INT REFERENCES marcas(id) ON DELETE CASCADE,
  files JSON,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE productos_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre_file TEXT,
  data BYTEA NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE marcas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE lotes (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  id_deposito INT NOT NULL REFERENCES depositos(id) ON DELETE CASCADE,
  nro_lote VARCHAR(50) NOT NULL,
  fecha_vencimiento DATE,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE inventario (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nro_serie VARCHAR(100),
  existencia_general INT NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  precio_venta DECIMAL(10,2) NOT NULL,
  margen_ganancia DECIMAL(5,2) NOT NULL,
  stock_minimo_general INT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE edeposito (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  id_deposito INT NOT NULL REFERENCES depositos(id) ON DELETE CASCADE,
  existencia_deposito INT NOT NULL,
  stock_minimo_deposito INT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE kardexg (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  existencia_inicial INT NOT NULL,
  entrada INT NOT NULL,
  salida INT NOT NULL,
  existencia_final INT NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  detalle TEXT NOT NULL,
  documento VARCHAR(100) NOT NULL,
  tipo TEXT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)

CREATE TABLE kardexdep (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  id_deposito INT NOT NULL REFERENCES depositos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  existencia_inicial INT NOT NULL,
  entrada INT NOT NULL,
  salida INT NOT NULL,
  existencia_final INT NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  detalle TEXT NOT NULL,
  documento VARCHAR(100) NOT NULL,
  tipo TEXT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Personal Médico

CREATE TABLE tipoMedicos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE medicos (
  id SERIAL PRIMARY KEY,
  id_tipoMedico INT NOT NULL REFERENCES tipoMedicos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Clientes ( pacientes ) y Pagadores

CREATE TABLE seguros (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100) NOT NULL,
  telefono VARCHAR(100) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE pacientes (
  id SERIAL PRIMARY KEY,
  id_seguro INT REFERENCES seguros(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  documento VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  files JSON,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE paciente_images (
  id SERIAL PRIMARY KEY,
  paciente_id INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre_file TEXT,
  data BYTEA NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE historias (
  id SERIAL PRIMARY KEY,
  id_paciente INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  id_medico INT NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  detalle VARCHAR(50) NOT NULL,
  files JSON,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE historia_images (
  id SERIAL PRIMARY KEY,
  historia_id INT NOT NULL REFERENCES historias(id) ON DELETE CASCADE,
  nombre_file TEXT,
  data BYTEA NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT FALSE
);



-- Fuerza de ventas

CREATE TABLE vendedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  id_oficina INT NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  id_zona INT NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ventas ( Ingresos )

CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  id_paciente INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  id_personal INT NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  id_vendedor INT NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
  id_oficina INT NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  id_seguro INT REFERENCES seguros(id) ON DELETE CASCADE,
  id_presupuesto INT REFERENCES presupuestos(id) ON DELETE CASCADE,
  nro_factura VARCHAR(100) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  impuesto DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  abonado DECIMAL(10,2) NOT NULL,
  estado_pago TEXT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE personal (
  id SERIAL PRIMARY KEY,
  id_medico INT REFERENCES medicos(id) ON DELETE CASCADE,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE ventas_detalle (
  id SERIAL PRIMARY KEY,
  id_venta INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  id_inventario INT NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
  cantidad INT NOT NULL,
  precio_venta DECIMAL(10,2) NOT NULL,
  descuento1 DECIMAL(10,2) NOT NULL,
  descuento2 DECIMAL(10,2) NOT NULL,
  precio_descuento DECIMAL(10,2) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE venta_detalle_lote (
  id SERIAL PRIMARY KEY,
  id_detalle INT NOT NULL REFERENCES ventas_detalle(id) ON DELETE CASCADE,
  id_lote INT NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  cantidad INT NOT NULL,
  fecha_caducidad DATE NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)

CREATE TABLE presupuestos (
  id SERIAL PRIMARY KEY,
  id_paciente INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  id_personal INT REFERENCES personal(id) ON DELETE CASCADE,
  id_vendedor INT REFERENCES vendedores(id) ON DELETE CASCADE,
  id_oficina INT NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  id_seguro INT NOT NULL REFERENCES seguros(id) ON DELETE CASCADE,
  nro_presupuesto VARCHAR(100) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado_pago TEXT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE presupuestos_detalle (
  id SERIAL PRIMARY KEY,
  id_presupuesto INT NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  id_inventario INT NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
  cantidad INT NOT NULL,
  precio_venta DECIMAL(10,2) NOT NULL,
  cantidad INT NOT NULL,
  cantidad_vendida INT NOT NULL,
  backorder INT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Gastos ( Egresos )

CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  documento VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  files JSON,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE proveedor_images (
  id SERIAL PRIMARY KEY,
  proveedor_id INT NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  nombre_file TEXT,
  data BYTEA NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE compras (
  id SERIAL PRIMARY KEY,
  fecha_emision DATE NOT NULL,
  dias_plazo INT NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  id_proveedor INT NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  nro_factura VARCHAR(100) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  abonado DECIMAL(10,2) NOT NULL,
  estado_pago TEXT NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE compras_detalle (
  id SERIAL PRIMARY KEY,
  id_compra INT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  id_inventario INT NOT NULL REFERENCES inventario(id) ON DELETE CASCADE,
  cantidad INT NOT NULL,
  costo_compra DECIMAL(10,2) NOT NULL,
  descuento1 DECIMAL(10,2) NOT NULL,
  descuento2 DECIMAL(10,2) NOT NULL,
  costo_descuento DECIMAL(10,2) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE compras_detalle_lote (
  id SERIAL PRIMARY KEY,
  id_detalle INT NOT NULL REFERENCES compras_detalle(id) ON DELETE CASCADE,
  id_lote INT NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  cantidad INT NOT NULL,
  fecha_caducidad DATE NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  id_motivos_gasto INT NOT NULL REFERENCES motivos_gasto(id) ON DELETE CASCADE,
  id_proveedor INT NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  referencia_id VARCHAR(50) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)

CREATE TABLE motivos_gasto (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Auditoría y Trazabilidad

CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  entidad TEXT NOT NULL,
  id_entidad INT NOT NULL,
  accion TEXT NOT NULL,
  datos_previos JSON NOT NULL,
  datos_nuevos JSON NOT NULL,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE ingresos_egresos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  id_gasto INT REFERENCES gastos(id) ON DELETE CASCADE,
  id_compra INT REFERENCES compras(id) ON DELETE CASCADE,
  id_venta INT REFERENCES ventas(id) ON DELETE CASCADE,
  id_usuario INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)