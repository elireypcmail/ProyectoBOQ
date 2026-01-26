1. Tipos de rol - Usuarios

```SQL
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
)
```

Estos serian : 

* Admin
* UsuarioAdministrativo
* UsuarioFinanzas
* UsuariosTributos
* Almacen
