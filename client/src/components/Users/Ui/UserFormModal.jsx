import React, { useState, useEffect } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import {
  Save,
  X,
  Loader2,
  Plus,
  User,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
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
    rolRequerido: "Debe seleccionar un rol",
  },
  titulos: {
    editarUsuario: "Editar Usuario",
    nuevoUsuario: "Nuevo Usuario",
  },
  etiquetas: {
    nombreCompleto: "Nombre Completo",
    email: "Correo Electrónico",
    telefono: "Teléfono",
    nuevaPass: "Nueva Contraseña (opcional)",
    pass: "Contraseña",
    rolUsuario: "Rol de Usuario",
    agregarRol: "Nuevo Rol",
    oficina: "Oficina Asignada",
    deposito: "Depósito Asignado",
    foto: "Firma / Foto de Perfil",
  },
  placeholders: {
    nombreCompleto: "EJ: JUAN PÉREZ",
    email: "correo@ejemplo.com",
    telefono: "Ingresar teléfono",
    pass: "********",
    nuevoRol: "NOMBRE DEL ROL",
    seleccionarRol: "SELECCIONAR ROL...",
    seleccionarOficina: "SELECCIONAR OFICINA...",
    seleccionarDeposito: "SELECCIONAR DEPÓSITO...",
    subirFoto: "HAZ CLIC AQUÍ PARA SUBIR LA FIRMA",
  },
  botones: {
    cancelar: "Cancelar",
    actualizar: "Actualizar Usuario",
    guardar: "Guardar Usuario",
  },
};

const UserFormModal = ({
  isOpen,
  onClose,
  onSave,
  user,
  isSaving,
  oficinas = [],
  depositos = [],
}) => {
  const { rolesList, fetchAllRoles, createNewRole } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [roleId, setRoleId] = useState(""); // Ahora es un solo ID
  const [idOficina, setIdOficina] = useState("");
  const [idDeposito, setIdDeposito] = useState("");
  const [telefono, setTelefono] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(false);

  useEffect(() => {
    if (isOpen) fetchAllRoles();
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setContrasena("");
      // Tomamos el primer rol si existe en el array
      setRoleId(user.roles_ids && user.roles_ids.length > 0 ? user.roles_ids[0] : "");
      setIdOficina(user.id_oficina || "");
      setIdDeposito(user.id_deposito || "");
      setTelefono(user.telefono || "");
      setSelectedFiles([]);
    } else {
      resetLocalForm();
    }
  }, [user, isOpen]);

  const resetLocalForm = () => {
    setNombre("");
    setEmail("");
    setContrasena("");
    setRoleId("");
    setIdOficina("");
    setIdDeposito("");
    setTelefono("");
    setSelectedFiles([]);
    setIsCreatingRole(false);
    setNewRoleName("");
  };

  const handleNameInput = (val) =>
    setNombre(val.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").toUpperCase());

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0];
    const newFile = {
      url: URL.createObjectURL(file),
      mime_type: file.type,
      name: file.name.toUpperCase(),
      file,
    };

    setSelectedFiles([newFile]);
    e.target.value = null;
  };

  const handleCreateNewRole = async () => {
    if (!newRoleName.trim()) return alert(TEXTOS.alertas.nombreRolRequerido);
    setIsSavingRole(true);
    try {
      const res = await createNewRole({ nombre: newRoleName.trim().toUpperCase() });
      if (res.status) {
        await fetchAllRoles();
        setRoleId(res.data.id); // Seleccionamos el nuevo rol automáticamente
        setIsCreatingRole(false);
        setNewRoleName("");
      } else {
        alert(TEXTOS.alertas.errorCrearRol);
      }
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
    if (!roleId) return alert(TEXTOS.alertas.rolRequerido);

    const payload = {
      nombre: nombre.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      telefono: telefono || null,
      roles: [roleId], // Se envía como array para compatibilidad con el backend
      id_oficina: idOficina ? parseInt(idOficina) : null,
      id_deposito: idDeposito ? parseInt(idDeposito) : null,
      estatus: user ? user.estatus : true,
    };

    if (contrasena) payload.contrasena = contrasena;

    const filesToUpload = selectedFiles.map((f) => f.file);
    onSave(payload, filesToUpload.length > 0 ? filesToUpload[0] : null);
  };

  const oficinaOptions = oficinas.map((of) => ({
    value: of.id,
    label: of.nombre,
  }));
  const depositoOptions = depositos.map((dep) => ({
    value: dep.id,
    label: dep.nombre,
  }));
  const rolOptions = rolesList.map((rol) => ({
    value: rol.id,
    label: rol.nombre.toUpperCase(),
  }));

  if (!isOpen) return null;

  return (
    <div className="sellerMf-overlay">
      <div className="sellerMf-content">
        <div className="sellerMf-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <User size={20} className="sellerMf-icon-primary" />
            <h3>
              {user ? TEXTOS.titulos.editarUsuario : TEXTOS.titulos.nuevoUsuario}
            </h3>
          </div>
          <button className="sellerMf-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sellerMf-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
              marginTop: "0.5rem",
            }}
          >
            <div className="sellerMf-field sellerMf-col-span-2">
              <label className="sellerMf-label">{TEXTOS.etiquetas.nombreCompleto}</label>
              <input
                className="sellerMf-input"
                value={nombre}
                onChange={(e) => handleNameInput(e.target.value)}
                placeholder={TEXTOS.placeholders.nombreCompleto}
              />
            </div>

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

            <div className="sellerMf-field">
              <label className="sellerMf-label">{TEXTOS.etiquetas.telefono}</label>
              <div className="sellerMf-phone-wrapper">
                <PhoneInput
                  country={"ve"}
                  value={telefono}
                  onChange={setTelefono}
                  containerClass="sellerMf-phone-container"
                  inputClass="sellerMf-phone-input"
                  placeholder={TEXTOS.placeholders.telefono}
                />
              </div>
            </div>
          </div>

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

          <div className="sellerMf-field">
            <label className="sellerMf-label">{TEXTOS.etiquetas.rolUsuario}</label>
            <div className="sellerMf-input-group">
              <div className="sellerMf-select-container">
                <Select
                  options={rolOptions}
                  value={rolOptions.find((opt) => opt.value === roleId)}
                  onChange={(selected) => setRoleId(selected ? selected.value : "")}
                  placeholder={TEXTOS.placeholders.seleccionarRol}
                  classNamePrefix="sdm-select"
                  isClearable
                />
              </div>
              <button
                className="sellerMf-btn-add-circle"
                onClick={() => setIsCreatingRole(true)}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
            }}
          >
            <div className="sellerMf-field">
              <label className="sellerMf-label">{TEXTOS.etiquetas.oficina}</label>
              <Select
                options={oficinaOptions}
                value={oficinaOptions.find((o) => o.value === idOficina)}
                onChange={(opt) => setIdOficina(opt?.value || "")}
                placeholder={TEXTOS.placeholders.seleccionarOficina}
                isClearable
                classNamePrefix="sdm-select"
              />
            </div>
            <div className="sellerMf-field">
              <label className="sellerMf-label">{TEXTOS.etiquetas.deposito}</label>
              <Select
                options={depositoOptions}
                value={depositoOptions.find((d) => d.value === idDeposito)}
                onChange={(opt) => setIdDeposito(opt?.value || "")}
                placeholder={TEXTOS.placeholders.seleccionarDeposito}
                isClearable
                classNamePrefix="sdm-select"
              />
            </div>
          </div>

          <div className="sellerMf-field">
            <label className="sellerMf-label">{TEXTOS.etiquetas.foto}</label>
            <div
              className="uploadAdm-box"
              style={{
                cursor: "pointer",
                textAlign: "center",
                padding: "20px",
                border: "2px dashed #d1d5db",
                borderRadius: "8px",
                background: "#f8fafc",
              }}
              onClick={() => document.getElementById("userSignatureUpload").click()}
            >
              <UploadCloud size={30} style={{ margin: "0 auto", color: "#6b7280" }} />
              <span
                className="upload-label"
                style={{
                  display: "block",
                  marginTop: "10px",
                  color: "#374151",
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {TEXTOS.placeholders.subirFoto}
              </span>
              <input
                id="userSignatureUpload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            {selectedFiles.length > 0 && (
              <ul
                className="files_containerEdit"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                  padding: 0,
                  listStyle: "none",
                  flexWrap: "wrap",
                }}
              >
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="file_itemEdit"
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={file.url}
                      alt="PREVIEW"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                    <XCircle
                      className="cms-file-remove"
                      color="#ef4444"
                      size={20}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        cursor: "pointer",
                        background: "white",
                        borderRadius: "50%",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles([]);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="sellerMf-footer">
          <button className="sellerMf-btn-cancel" onClick={onClose}>
            {TEXTOS.botones.cancelar}
          </button>
          <button
            className="sellerMf-btn-save"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={18} className="sellerMf-spin" />
            ) : (
              <Save size={18} />
            )}
            {user ? TEXTOS.botones.actualizar : TEXTOS.botones.guardar}
          </button>
        </div>

        {isCreatingRole && (
          <div className="sellerMf-mini-overlay">
            <div className="sellerMf-mini-card">
              <div className="sellerMf-mini-header">
                <ShieldCheck size={18} className="sellerMf-icon-primary" />
                <h4>Crear Nuevo Rol</h4>
              </div>
              <div className="sellerMf-mini-body">
                <input
                  className="sellerMf-input"
                  placeholder={TEXTOS.placeholders.nuevoRol}
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
              <div className="sellerMf-mini-footer">
                <button
                  className="sellerMf-btn-mini-close"
                  onClick={() => setIsCreatingRole(false)}
                >
                  <X size={18} />
                </button>
                <button
                  className="sellerMf-btn-mini-save"
                  onClick={handleCreateNewRole}
                  disabled={isSavingRole}
                >
                  {isSavingRole ? <Loader2 size={16} className="sellerMf-spin" /> : <Save size={16} />}
                  Guardar Rol
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFormModal;