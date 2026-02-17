import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
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
  Lock // 1. Importamos el ícono de candado
} from "lucide-react";
import "../../styles/components/ListLots.css";

const ListLots = ({ id_producto, onRefreshProducts }) => {
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
    cantidad: "",
    fecha_vencimiento: "",
    estatus: true,
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getAllLotesByProd(id_producto);
    getAllDeposits();
  }, [id_producto]);

  const depositOptions = useMemo(() => {
    return (deposits || []).map(d => ({
      value: d.id,
      label: d.nombre
    }));
  }, [deposits]);

  const filteredLotes = useMemo(() => {
    const base = Array.isArray(lotes) ? lotes : [];
    return base
      .filter(l => l.id_producto === id_producto)
      .filter(l =>
        l.nro_lote?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [lotes, searchTerm, id_producto]);

  const currentLotes = filteredLotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenForm = (lote = null) => {
    if (lote) {
      setSelectedLote(lote);
      setFormData({
        nro_lote: lote.nro_lote,
        id_deposito: lote.id_deposito,
        cantidad: lote.cantidad ?? "",
        fecha_vencimiento: lote.fecha_vencimiento?.split("T")[0] || "",
        estatus: true,
      });
    } else {
      setSelectedLote(null);
      setFormData({
        nro_lote: "",
        id_deposito: "",
        cantidad: "",
        fecha_vencimiento: "",
        estatus: true,
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSubmit = async () => {
    const { nro_lote, id_deposito, cantidad, fecha_vencimiento } = formData;

    // 1. Validaciones básicas de campos vacíos
    if (!nro_lote || !id_deposito || !fecha_vencimiento || cantidad === "") {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    // 2. Validación de coherencia de datos
    if (Number(cantidad) < 0) {
      alert("La cantidad no puede ser negativa.");
      return;
    }

    if (fecha_vencimiento <= today) {
      alert("La fecha de caducidad debe ser posterior a la fecha actual.");
      return;
    }

    const payload = { 
      ...formData, 
      id_producto,
      id_deposito: Number(id_deposito)
    };

    if (selectedLote) {
      await editLote(selectedLote.id, payload);
    } else {
      await createNewLote(payload);
    }

    setIsFormModalOpen(false);
    await getAllLotesByProd(id_producto);
    if (onRefreshProducts) await onRefreshProducts();
  };

  const handleDeleteLote = async () => {
    await deleteLoteById(selectedLote.id);
    setIsDeleteModalOpen(false);
    await getAllLotesByProd(id_producto);
    if (onRefreshProducts) await onRefreshProducts();
    setSelectedLote(null);
  };

  const selectStyles = {
    control: base => ({
      ...base,
      borderRadius: "8px",
      borderColor: "#e2e8f0",
      minHeight: "42px",
      boxShadow: "none",
      "&:hover": { borderColor: "#cbd5e1" }
    })
  };

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
            onChange={e => {
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
              <th>Lote</th>
              <th><Warehouse size={14} /> Depósito</th>
              <th>Cantidad</th>
              <th><Calendar size={14} /> Vencimiento</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentLotes.map(lote => (
              <tr key={lote.id}>
                <td>#{lote.nro_lote}</td>
                <td>{lote.deposito_nombre}</td>
                <td>{lote.cantidad}</td>
                <td>
                  <div className={`date-badge ${new Date(lote.fecha_vencimiento) < new Date() ? "is-expired" : ""}`}>
                    {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                  </div>
                </td>
                <td><span className="status-tag st-active">Disponible</span></td>
                <td>
                  <div className="actions-group">
                    <button className="act-btn edit" onClick={() => handleOpenForm(lote)}>
                      <Pencil size={15} />
                    </button>
                    <button className="act-btn delete" onClick={() => {
                      setSelectedLote(lote);
                      setIsDeleteModalOpen(true);
                    }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentLotes.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">No hay lotes registrados para este producto.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulario */}
      {isFormModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card">
            <div className="modal-header">
              <h4>{selectedLote ? "Editar Lote" : "Nuevo Lote"}</h4>
            </div>

            <div className="modal-body">
              <div className="input-group">
                <label>Nro. de Lote</label>
                <input
                  type="text"
                  value={formData.nro_lote}
                  onChange={e =>
                    setFormData({ ...formData, nro_lote: e.target.value.toUpperCase() })
                  }
                />
              </div>

              <div className="input-group">
                <label>Depósito</label>
                <Select
                  options={depositOptions}
                  styles={selectStyles}
                  value={depositOptions.find(o => o.value === Number(formData.id_deposito)) || null}
                  onChange={opt =>
                    setFormData({ ...formData, id_deposito: opt ? opt.value : "" })
                  }
                  placeholder="Seleccione un depósito..."
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Cantidad
                  {/* Visualmente mostramos un candado si está bloqueado */}
                  {selectedLote && <Lock size={14} color="#94a3b8" />}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cantidad}
                  // 2. Deshabilitamos si hay un lote seleccionado (Modo Edición)
                  disabled={!!selectedLote}
                  // Estilo opcional para indicar que está deshabilitado si tu CSS no lo maneja
                  style={selectedLote ? { backgroundColor: "#f1f5f9", color: "#64748b", cursor: "not-allowed" } : {}}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").replace(/^0+(?!$)/, "");
                    setFormData({ ...formData, cantidad: value });
                  }}
                  placeholder="Ej: 150"
                />
                {selectedLote && (
                  <small style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px" }}>
                    La cantidad no se puede editar una vez creado el lote.
                  </small>
                )}
              </div>

              <div className="input-group">
                <label>Fecha de Caducidad</label>
                <input
                  type="date"
                  min={today}
                  value={formData.fecha_vencimiento}
                  onChange={e =>
                    setFormData({ ...formData, fecha_vencimiento: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsFormModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn-primary-solid" onClick={handleSubmit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card modal-danger">
            <div className="danger-icon"><AlertTriangle size={32} /></div>
            <h4>¿Eliminar este lote?</h4>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn-danger-solid" onClick={handleDeleteLote}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListLots;