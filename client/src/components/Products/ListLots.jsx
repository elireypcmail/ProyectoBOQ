import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  Warehouse,
  Calendar,
  Tag,
  X
} from "lucide-react";
import "../../styles/components/ListLots.css";

const ListLots = ({ id_producto }) => {
  const {
    lotes,
    deposits,
    getAllLotesByProd,
    getAllDeposits,
    createNewLote,
    editLote,
    deleteLoteById,
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedLote, setSelectedLote] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nro_lote: "",
    id_deposito: "",
    fecha_vencimiento: "",
    estatus: true,
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getAllLotesByProd(id_producto);
    getAllDeposits();
  }, [id_producto]);

  const filteredLotes = useMemo(() => {
    const base = Array.isArray(lotes) ? lotes : [];
    return base
      .filter((l) => l.id_producto === id_producto)
      .filter((l) =>
        l.nro_lote?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [lotes, searchTerm, id_producto]);

  const currentLotes = filteredLotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleOpenForm = (lote = null) => {
    if (lote) {
      setSelectedLote(lote);
      setFormData({
        nro_lote: lote.nro_lote,
        id_deposito: lote.id_deposito,
        fecha_vencimiento: lote.fecha_vencimiento?.split("T")[0] || "",
        estatus: true,
      });
    } else {
      setSelectedLote(null);
      setFormData({
        nro_lote: "",
        id_deposito: "",
        fecha_vencimiento: "",
        estatus: true,
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSubmit = async () => {
    const { nro_lote, id_deposito, fecha_vencimiento } = formData;

    // 1. Campos obligatorios
    if (!nro_lote || !id_deposito || !fecha_vencimiento) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    // 2. Validación de fecha futura
    if (fecha_vencimiento <= today) {
      alert("La fecha de caducidad debe ser posterior a la fecha actual.");
      return;
    }

    // 3. Validación de depósito duplicado para este producto
    // Comprobamos si ya existe un lote con ese depósito (excluyendo el lote actual si es edición)
    const isDepositoOcupado = lotes.some(lote => 
      lote.id_deposito === parseInt(id_deposito) && 
      lote.id !== selectedLote?.id
    );

    if (isDepositoOcupado) {
      const depoName = deposits.find(d => d.id === parseInt(id_deposito))?.nombre;
      alert(`El depósito "${depoName}" ya está asignado a otro lote de este producto.`);
      return;
    }

    const payload = { ...formData, id_producto };
    if (selectedLote) await editLote(selectedLote.id, payload);
    else await createNewLote(payload);
    
    setIsFormModalOpen(false);
    getAllLotesByProd(id_producto);
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="lots-container">
      <div className="lots-header-section">
        <div className="title-group">
          <div className="icon-badge"><Tag size={20} /></div>
          <div>
            <h3>Gestión de Lotes</h3>
            <p className="subtitle">{filteredLotes.length} lotes encontrados</p>
          </div>
        </div>
        <button className="btn-add-main" onClick={() => handleOpenForm()}>
          <Plus size={18} /> <span>Nuevo Lote</span>
        </button>
      </div>

      <div className="lots-filter-bar">
        <div className={`search-container ${searchTerm ? "active" : ""}`}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por número de lote..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="filter-results-info">
          Mostrando <strong>{currentLotes.length}</strong> de {filteredLotes.length}
        </div>
      </div>

      <div className="lots-card">
        <table className="lots-custom-table">
          <thead>
            <tr>
              <th>Número de Lote</th>
              <th><Warehouse size={14} /> Deposito</th>
              <th><Calendar size={14} /> Vencimiento</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentLotes.length > 0 ? (
              currentLotes.map((lote) => (
                <tr key={lote.id}>
                  <td className="col-lote">#{lote.nro_lote}</td>
                  <td className="col-depo">{lote.deposito_nombre}</td>
                  <td>
                    <div className={`date-badge ${isExpired(lote.fecha_vencimiento) ? "is-expired" : ""}`}>
                      {lote.fecha_vencimiento
                        ? new Date(lote.fecha_vencimiento).toLocaleDateString()
                        : "Indefinido"}
                    </div>
                  </td>
                  <td><span className="status-tag st-active">Disponible</span></td>
                  <td>
                    <div className="actions-group">
                      <button className="act-btn edit" onClick={() => handleOpenForm(lote)} title="Editar"><Pencil size={15} /></button>
                      <button className="act-btn delete" onClick={() => { setSelectedLote(lote); setIsDeleteModalOpen(true); }} title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="table-empty">No se encontraron lotes registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card">
            <div className="modal-header">
              <h4>{selectedLote ? "Editar Información del Lote" : "Registrar Nuevo Lote"}</h4>
              <p>Completa los datos técnicos del lote.</p>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Nro. de Lote</label>
                <input
                  type="text"
                  value={formData.nro_lote}
                  onChange={(e) => setFormData({ ...formData, nro_lote: e.target.value.toUpperCase() })}
                  placeholder="Ej: LOTE-1020"
                />
              </div>
              <div className="input-group">
                <label>Depósito Destino</label>
                <select
                  value={formData.id_deposito}
                  onChange={(e) => setFormData({ ...formData, id_deposito: e.target.value })}
                >
                  <option value="">Seleccionar ubicación...</option>
                  {deposits?.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Fecha de Caducidad</label>
                <input
                  type="date"
                  min={today}
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                />
                <small className="input-help">Debe ser una fecha futura.</small>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsFormModalOpen(false)}>Descartar</button>
              <button className="btn-primary-solid" onClick={handleSubmit}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card modal-danger">
            <div className="danger-icon"><AlertTriangle size={32} /></div>
            <h4>¿Eliminar este lote?</h4>
            <p>Esta acción es irreversible y podría afectar el inventario.</p>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger-solid" onClick={async () => {
                  await deleteLoteById(selectedLote.id);
                  setIsDeleteModalOpen(false);
                  getAllLotesByProd(id_producto);
                }}
              >Eliminar permanentemente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListLots;