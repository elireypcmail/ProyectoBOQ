
CREATE TABLE lotes (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nro_lote VARCHAR(50) NOT NULL,
  fecha_vencimiento DATE,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(200) NOT NULL,
  id_categoria INT REFERENCES categorias(id) ON DELETE CASCADE,
  id_marca INT REFERENCES marcas(id) ON DELETE CASCADE,
  files JSON,
  estatus BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


CREATE TABLE depositos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
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

CREATE TABLE inventario (
  id SERIAL PRIMARY KEY,
  id_lote INT NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  id_oficina INT NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  nro_serie VARCHAR(100),
  existencia_general INT NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  precio_venta DECIMAL(10,2) NOT NULL,
  margen_ganancia DECIMAL(5,2) NOT NULL,
  stock_minimo_general INT NOT NULL,
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
