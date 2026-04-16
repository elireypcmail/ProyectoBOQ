import React, { useState, useEffect } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import { Save, X, Loader2, Plus } from "lucide-react";
import "react-phone-input-2/lib/style.css";

// Contexto
import { useAuth } from "../../../context/AuthContext";

// Estilos
import "../../../styles/ui/SellerFormModal.css"; 

const TEXTOS = {
  alertas: {
    nombreRolRequerido: "El nombre del rol es obligatorio",
    errorCrearRol: "Error al crear el nuevo rol",
    nombreRequerido: "El nombre es obligatorio",
    emailRequerido: "El correo electrónico es obligatorio",
    passRequeridoNuevo: "La contraseña es obligatoria para nuevos usuarios",
    rolRequerido: "Debe seleccionar al menos un rol"
  },
  titulos: {
    editarUsuario: "Editar Usuario",
    nuevoUsuario: "Nuevo Usuario"
  },
  etiquetas: {
    nombreCompleto: "Nombre Completo",
    email: "Correo Electrónico",
    telefono: "Teléfono",
    nuevaPass: "Nueva Contraseña (opcional)",
    pass: "Contraseña",
    rolUsuario: "Roles de Usuario",
    agregarRol: "Agregar Rol",
    oficina: "Oficina Asignada",
    deposito: "Depósito Asignado"
  },
  placeholders: {
    nombreCompleto: "EJ: JUAN PÉREZ",
    email: "correo@ejemplo.com",
    telefono: "Ingresar teléfono",
    pass: "********",
    nuevoRol: "NOMBRE DEL NUEVO ROL",
    seleccionarRol: "SELECCIONAR ROLES",
    seleccionarOficina: "SELECCIONAR OFICINA",
    seleccionarDeposito: "SELECCIONAR DEPÓSITO"
  },
  mensajes: {
    sinRoles: "No hay roles disponibles"
  },
  botones: {
    cancelar: "Cancelar",
    guardando: "Guardando...",
    actualizar: "Actualizar Usuario",
    guardar: "Guardar Usuario"
  }
};

const UserFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  user, 
  isSaving,
  oficinas = [],
  depositos = []
}) => {

  const { rolesList, fetchAllRoles, createNewRole } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [roles, setRoles] = useState([]); // 🔥 ARRAY
  const [idOficina, setIdOficina] = useState("");
  const [idDeposito, setIdDeposito] = useState("");
  const [telefono, setTelefono] = useState("");

  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setContrasena("");
      setRoles(user.roles_ids || []); // 🔥 IMPORTANTE
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
    setRoles([]);
    setIdOficina("");
    setIdDeposito("");
    setTelefono("");
    setIsCreatingRole(false);
    setNewRoleName("");
  };

  const handleNameInput = (value) => {
    setNombre(value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());
  };

  const handleCreateNewRole = async () => {
    if (!newRoleName.trim()) return alert(TEXTOS.alertas.nombreRolRequerido);
    
    setIsSavingRole(true);
    try {
      const payload = { nombre: newRoleName.trim().toUpperCase() };
      const res = await createNewRole(payload);

      if (res?.data?.id) {
        setRoles(prev => [...prev, res.data.id]); // 🔥 agregar al array
      }

      setIsCreatingRole(false);
      setNewRoleName("");
    } catch (error) {
      alert(TEXTOS.alertas.errorCrearRol);
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleSubmit = () => {
    if (!nombre.trim()) return alert(TEXTOS.alertas.nombreRequerido);
    if (!email.trim()) return alert(TEXTOS.alertas.emailRequerido);
    if (!user && !contrasena) return alert(TEXTOS.alertas.passRequeridoNuevo);
    if (roles.length === 0) return alert(TEXTOS.alertas.rolRequerido);

    const payload = {
      nombre: nombre.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      telefono: telefono || null,
      roles, // 🔥 ARRAY
      id_oficina: idOficina ? parseInt(idOficina) : null,
      id_deposito: idDeposito ? parseInt(idDeposito) : null,
      estatus: user ? user.estatus : true
    };

    if (contrasena) payload.contrasena = contrasena;

    onSave(payload);
  };

  const oficinaOptions = oficinas.map(of => ({ value: of.id, label: of.nombre }));
  const depositoOptions = depositos.map(dep => ({ value: dep.id, label: dep.nombre }));

  const rolOptions = rolesList.map(rol => ({
    value: rol.id,
    label: rol.nombre.toUpperCase()
  }));

  if (!isOpen) return null;

  return (
    <div className="sellerMf-overlay">
      <div className="sellerMf-content">

        <div className="sellerMf-header">
          <h3>{user ? TEXTOS.titulos.editarUsuario : TEXTOS.titulos.nuevoUsuario}</h3>
          <button className="sellerMf-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sellerMf-body">

          {/* Nombre */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">{TEXTOS.etiquetas.nombreCompleto}</label>
            <input
              className="sellerMf-input"
              value={nombre}
              onChange={(e) => handleNameInput(e.target.value)}
              placeholder={TEXTOS.placeholders.nombreCompleto}
            />
          </div>

          {/* Email */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">{TEXTOS.etiquetas.email}</label>
            <input
              className="sellerMf-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
              placeholder={TEXTOS.placeholders.email}
            />
          </div>

          {/* Teléfono */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">{TEXTOS.etiquetas.telefono}</label>
            <PhoneInput
              country={"ve"}
              value={telefono}
              onChange={setTelefono}
              containerClass="sellerMf-phone-container"
              inputClass="sellerMf-phone-input"
              placeholder={TEXTOS.placeholders.telefono}
            />
          </div>

          {/* Contraseña */}
          <div className="sellerMf-field">
            <label className="sellerMf-label">
              {user ? TEXTOS.etiquetas.nuevaPass : TEXTOS.etiquetas.pass}
            </label>
            <input
              className="sellerMf-input"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder={TEXTOS.placeholders.pass}
            />
          </div>

          {/* ROLES MULTI */}
          <div className="sellerMf-field">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="sellerMf-label">{TEXTOS.etiquetas.rolUsuario}</label>

              {!isCreatingRole && (
                <button type="button" onClick={() => setIsCreatingRole(true)}>
                  <Plus size={14} /> {TEXTOS.etiquetas.agregarRol}
                </button>
              )}
            </div>

            {isCreatingRole ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  className="sellerMf-input"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value.toUpperCase())}
                />

                <button onClick={handleCreateNewRole}>
                  {isSavingRole ? <Loader2 size={16} /> : <Save size={16} />}
                </button>

                <button onClick={() => setIsCreatingRole(false)}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Select
                isMulti
                options={rolOptions}
                value={rolOptions.filter(opt => roles.includes(opt.value))}
                onChange={(selected) =>
                  setRoles(selected ? selected.map(r => r.value) : [])
                }
                placeholder={TEXTOS.placeholders.seleccionarRol}
              />
            )}
          </div>

          {/* Oficina */}
          <Select
            options={oficinaOptions}
            value={oficinaOptions.find(o => o.value === idOficina)}
            onChange={(opt) => setIdOficina(opt?.value || "")}
            isClearable
          />

          {/* Deposito */}
          <Select
            options={depositoOptions}
            value={depositoOptions.find(d => d.value === idDeposito)}
            onChange={(opt) => setIdDeposito(opt?.value || "")}
            isClearable
          />

        </div>

        <div className="sellerMf-footer">
          <button onClick={onClose}>{TEXTOS.botones.cancelar}</button>

          <button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 size={18} /> : <Save size={18} />}
            {user ? TEXTOS.botones.actualizar : TEXTOS.botones.guardar}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserFormModal;