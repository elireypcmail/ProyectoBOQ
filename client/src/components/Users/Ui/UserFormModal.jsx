import React, { useState, useEffect } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import { Save, X, Loader2, User, Mail, Lock, Shield } from "lucide-react";
import "react-phone-input-2/lib/style.css";

// Reutilizamos los estilos o puedes crear UserFormModal.css basado en SellerFormModal.css
import "../../../styles/ui/SellerFormModal.css"; 

const UserFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  user, // Si existe, estamos en modo edición
  isSaving,
  oficinas = [],
  depositos = []
}) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("");
  const [idOficina, setIdOficina] = useState("");
  const [idDeposito, setIdDeposito] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setContrasena(""); // Por seguridad no se carga la contraseña actual
      setRol(user.rol || "");
      setIdOficina(user.id_oficina || "");
      setIdDeposito(user.id_deposito || "");
      setTelefono(user.telefono || "");
    } else {
      resetLocalForm();
    }
  }, [user, isOpen]);

  const resetLocalForm = () => {
    setNombre("");
    setEmail("");
    setContrasena("");
    setRol("");
    setIdOficina("");
    setIdDeposito("");
    setTelefono("");
  };

  const handleNameInput = (value) => {
    setNombre(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const handleSubmit = () => {
    if (!nombre.trim()) return alert("El nombre es obligatorio");
    if (!email.trim()) return alert("El email es obligatorio");
    if (!user && !contrasena) return alert("La contraseña es obligatoria para nuevos usuarios");
    if (!rol) return alert("Debe seleccionar un rol");

    const payload = {
      nombre: nombre.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      telefono: telefono || null,
      rol: rol,
      id_oficina: idOficina ? parseInt(idOficina) : null,
      id_deposito: idDeposito ? parseInt(idDeposito) : null,
      estatus: user ? user.estatus : true
    };

    // Solo incluimos la contraseña si se escribió algo (para permitir editar sin cambiar clave)
    if (contrasena) payload.contrasena = contrasena;

    onSave(payload);
  };

  // Opciones para Select
  const oficinaOptions = oficinas.map(of => ({ value: of.id, label: of.nombre }));
  const depositoOptions = depositos.map(dep => ({ value: dep.id, label: dep.nombre }));
  const rolOptions = [
    { value: "ADMIN", label: "ADMINISTRADOR" },
    { value: "OPRI", label: "OP. REGISTRO DE INSTRUMENTACIÓN" }
    // { value: "VENDEDOR", label: "VENDEDOR" },
    // { value: "ALMACEN", label: "ALMACÉN" }
  ];

  if (!isOpen) return null;

  return (
    <div className="sellerMf-overlay">
      <div className="sellerMf-content">
        <div className="sellerMf-header">
          <h3>{user ? "Editar Usuario" : "Nuevo Usuario"}</h3>
          <button className="sellerMf-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sellerMf-body">
          {/* Nombre */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">Nombre Completo</label>
            <div className="sellerMf-input-group">
               <input
                className="sellerMf-input"
                value={nombre}
                onChange={(e) => handleNameInput(e.target.value)}
                placeholder="EJ: JUAN PÉREZ"
              />
            </div>
          </div>

          {/* Email */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">Correo Electrónico</label>
            <input
              className="sellerMf-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Teléfono */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">Teléfono</label>
            <PhoneInput
              country={"ve"}
              value={telefono}
              onChange={setTelefono}
              containerClass="sellerMf-phone-container"
              inputClass="sellerMf-phone-input"
              placeholder="Ingresar teléfono"
            />
          </div>

          {/* Contraseña */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">
              {user ? "Nueva Contraseña (opcional)" : "Contraseña"}
            </label>
            <input
              className="sellerMf-input"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="********"
            />
          </div>

          {/* Rol */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">Rol de Usuario</label>
            <Select
              options={rolOptions}
              value={rolOptions.find(opt => opt.value === rol)}
              onChange={(opt) => setRol(opt?.value || "")}
              placeholder="SELECCIONAR ROL"
              classNamePrefix="sellerMf-select"
            />
          </div>

          {/* Oficina */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">Oficina Asignada</label>
            <Select
              options={oficinaOptions}
              value={oficinaOptions.find(opt => opt.value === idOficina)}
              onChange={(opt) => setIdOficina(opt?.value || "")}
              isClearable
              placeholder="SELECCIONAR OFICINA"
              classNamePrefix="sellerMf-select"
            />
          </div>

          {/* Depósito */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">Depósito Asignado</label>
            <Select
              options={depositoOptions}
              value={depositoOptions.find(opt => opt.value === idDeposito)}
              onChange={(opt) => setIdDeposito(opt?.value || "")}
              isClearable
              placeholder="SELECCIONAR DEPÓSITO"
              classNamePrefix="sellerMf-select"
            />
          </div>
        </div>

        <div className="sellerMf-footer">
          <button className="sellerMf-btn-cancel" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button className="sellerMf-btn-save" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="sellerMf-spin" size={18} /> : <Save size={18} />}
            {isSaving ? "Guardando..." : user ? "Actualizar Usuario" : "Guardar Usuario"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;