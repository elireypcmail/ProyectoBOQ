import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select"; // Importamos react-select
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

  // Mapear opciones para react-select
  const depositOptions = useMemo(() => {
    return (deposits || []).map(d => ({
      value: d.id,
      label: d.nombre
    }));
  }, [deposits]);

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
        id_deposito: lote.id_deposito, // Guardamos el ID
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

    if (!nro_lote || !id_deposito || !fecha_vencimiento) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (fecha_vencimiento <= today) {
      alert("La fecha de caducidad debe ser posterior a la fecha actual.");
      return;
    }

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

  // Estilos básicos para react-select (puedes ajustarlos a tu CSS)
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '8px',
      borderColor: '#e2e8f0',
      minHeight: '42px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#cbd5e1' }
    })
  };

  return (
    <div className="lots-container">
      {/* ... (Header y tabla se mantienen igual) ... */}
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
            {currentLotes.map((lote) => (
              <tr key={lote.id}>
                <td className="col-lote">#{lote.nro_lote}</td>
                <td className="col-depo">{lote.deposito_nombre}</td>
                <td>
                    <div className={`date-badge ${new Date(lote.fecha_vencimiento) < new Date() ? "is-expired" : ""}`}>
                      {lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : "Indefinido"}
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
            ))}
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
                <Select
                  options={depositOptions}
                  placeholder="Seleccionar ubicación..."
                  styles={selectStyles}
                  // Aquí está el truco: buscamos el objeto entero basado en el ID del estado
                  value={depositOptions.find(opt => opt.value === Number(formData.id_deposito)) || null}
                  onChange={(selected) => setFormData({ 
                    ...formData, 
                    id_deposito: selected ? selected.value : "" 
                  })}
                  noOptionsMessage={() => "No hay depósitos registrados"}
                />
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

      {/* ... (Delete Modal se mantiene igual) ... */}
      {isDeleteModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card modal-danger">
            <div className="danger-icon"><AlertTriangle size={32} /></div>
            <h4>¿Eliminar este lote?</h4>
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