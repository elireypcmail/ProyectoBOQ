import React, { useEffect, useState, useMemo } from "react";
import { usePurchases } from "../../context/PurchasesContext";

// Dependencia para teléfono internacional
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Iconos
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListSuppliers = () => {
  const {
    suppliers,
    getAllSuppliers,
    createNewSupplier,
    editSupplier,
    deleteSupplierById
  } = usePurchases();

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Formulario
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [nombre, setNombre] = useState("");
  
  // CAMBIO 1: Estado unificado para el documento
  const [documentoField, setDocumentoField] = useState("");
  
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    getAllSuppliers();
  }, []);

  // --- HELPERS ---

  const handleNameInput = (value) => {
    setNombre(value.toUpperCase());
  };

  // CAMBIO 2: Lógica unificada (1 Letra + Guion + 10 Números)
  const handleDocumentInput = (value) => {
    // 1. Convertir a mayúsculas
    const upperValue = value.toUpperCase();

    // 2. Limpiar todo lo que no sea letra o número para procesar
    const cleanValue = upperValue.replace(/[^A-Z0-9]/g, "");

    // Si está vacío, resetear
    if (!cleanValue) {
      setDocumentoField("");
      return;
    }

    // 3. Extraer partes
    const firstChar = cleanValue.charAt(0);
    const rest = cleanValue.slice(1);

    // 4. Validar que el primer caracter sea LETRA
    if (!/^[A-Z]$/.test(firstChar)) {
      // Si el usuario intenta escribir un número primero, lo ignoramos
      return; 
    }

    // 5. Validar que el resto sean NÚMEROS y máximo 10 dígitos
    const numbersOnly = rest.replace(/[^0-9]/g, "").slice(0, 10);

    // 6. Formatear visualmente: LETRA-NUMEROS
    // Si hay números, ponemos el guion. Si solo está la letra, mostramos solo la letra.
    const formatted = numbersOnly.length > 0 
      ? `${firstChar}-${numbersOnly}` 
      : firstChar;

    setDocumentoField(formatted);
  };

  // Filtrado
  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s =>
      s.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [suppliers, searchTerm]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const currentSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setNombre("");
    setDocumentoField(""); // Reset campo único
    setTelefono("");
    setEmail("");
    setSelectedSupplier(null);
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setNombre(supplier.nombre);
    
    // CAMBIO 3: Cargar documento directamente al campo único
    setDocumentoField(supplier.documento || "");

    setTelefono(supplier.telefono || "");
    setEmail(supplier.email || "");
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    // Validar que el documento esté completo (al menos Letra y 1 número)
    if (documentoField.length < 3 && documentoField.length > 0) {
         alert("El documento debe tener un formato válido (Ej: V-123456)");
         return;
    }

    const payload = {
      nombre: nombre.trim(),
      documento: documentoField || null, // Se envía tal cual (Ej: "V-12345678")
      telefono: telefono,
      email: email.toLowerCase().trim() || null,
      estatus: true
    };

    if (isEditModalOpen && selectedSupplier) {
      await editSupplier(selectedSupplier.id, payload);
    } else {
      await createNewSupplier(payload);
    }

    resetForm();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    getAllSuppliers();
  };

  const handleDelete = async () => {
    await deleteSupplierById(selectedSupplier.id);
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
    getAllSuppliers();
  };

  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Proveedores</h2>
          <p>{filteredSuppliers.length} proveedores registrados</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus size={16} /> Nuevo Proveedor
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th className="hide-mobile">Teléfono</th>
              <th className="hide-mobile">Email</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.length ? currentSuppliers.map(s => (
              <tr key={s.id}>
                <td>#{s.id}</td>
                <td>{s.nombre}</td>
                <td className="hide-mobile">{s.telefono ? `+${s.telefono}` : "—"}</td>
                <td className="hide-mobile">{s.email || "—"}</td>
                <td className="center">
                  <button className="icon-btn" onClick={() => { setSelectedSupplier(s); setIsDetailsModalOpen(true); }}>
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="no-results">No se encontraron proveedores</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isCreateModalOpen ? "Nuevo Proveedor" : "Editar Proveedor"}</h3>

            <label className="modal-label">Nombre / Razón Social</label>
            <input
              className="modal-input"
              placeholder="Ej: INVERSIONES 123 C.A."
              value={nombre}
              onChange={(e) => handleNameInput(e.target.value)}
            />

            <label className="modal-label">Documento de Identidad</label>
            {/* CAMBIO 4: Input unificado */}
            <input
                className="modal-input"
                placeholder="Ej: V-1234567890"
                value={documentoField}
                onChange={(e) => setDocumentoField(e.target.value.toUpperCase())}
            />

            <label className="modal-label">Teléfono de Contacto</label>
            <div className="phone-input-container" style={{ marginBottom: '15px' }}>
              <PhoneInput
                country={'ve'}
                value={telefono}
                onChange={(value) => setTelefono(value)}
                inputStyle={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #ccc'
                }}
                buttonStyle={{
                    borderRadius: '8px 0 0 8px'
                }}
              />
            </div>

            <label className="modal-label">Correo Electrónico</label>
            <input
              className="modal-input"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
            />

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedSupplier && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles del Proveedor</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> #{selectedSupplier.id}</div>
              <div className="detail-card"><strong>Nombre:</strong> {selectedSupplier.nombre}</div>
              <div className="detail-card"><strong>Documento:</strong> {selectedSupplier.documento || "—"}</div>
              <div className="detail-card"><strong>Teléfono:</strong> {selectedSupplier.telefono ? `+${selectedSupplier.telefono}` : "—"}</div>
              <div className="detail-card"><strong>Email:</strong> {selectedSupplier.email || "—"}</div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(selectedSupplier); }}>
                <Pencil size={16} /> Editar
              </button>
              <button className="btn-danger" onClick={() => { setIsDetailsModalOpen(false); setIsDeleteModalOpen(true); }}>
                <Trash2 size={16} /> Eliminar
              </button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedSupplier && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar proveedor?</h3>
            </div>
            <p>Confirma que deseas eliminar a <strong>{selectedSupplier.nombre}</strong>.</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSuppliers;