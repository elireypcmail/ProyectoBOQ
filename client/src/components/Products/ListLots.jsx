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
  Lock
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
    return (deposits || [])
      .map(d => ({
        value: d.id,
        label: d.nombre.toUpperCase()
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [deposits]);

  // -------------------- Filtrado y Ordenación --------------------
  const filteredLotes = useMemo(() => {
    const base = Array.isArray(lotes) ? lotes : [];
    const filtered = base
      .filter(l => l.id_producto === id_producto)
      .filter(l =>
        (l.nro_lote ?? "").toUpperCase().includes(searchTerm.toUpperCase())
      );

    // Ordenar por número de lote alfabéticamente
    return [...filtered].sort((a, b) => 
      (a.nro_lote || "").localeCompare(b.nro_lote || "")
    );
  }, [lotes, searchTerm, id_producto]);

  const currentLotes = filteredLotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const handleOpenForm = (lote = null) => {
    if (lote) {
      setSelectedLote(lote);
      setFormData({
        nro_lote: lote.nro_lote.toUpperCase(),
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

    if (!nro_lote || !id_deposito || !fecha_vencimiento || cantidad === "") {
      alert("POR FAVOR, COMPLETE TODOS LOS CAMPOS OBLIGATORIOS.");
      return;
    }

    if (Number(cantidad) < 0) {
      alert("LA CANTIDAD NO PUEDE SER NEGATIVA.");
      return;
    }

    if (fecha_vencimiento <= today && !selectedLote) {
      alert("LA FECHA DE CADUCIDAD DEBE SER POSTERIOR A LA FECHA ACTUAL.");
      return;
    }

    const payload = { 
      ...formData, 
      nro_lote: nro_lote.trim().toUpperCase(),
      id_producto,
      id_deposito: Number(id_deposito)
    };

    try {
      if (selectedLote) {
        await editLote(selectedLote.id, payload);
      } else {
        await createNewLote(payload);
      }
      setIsFormModalOpen(false);
      await getAllLotesByProd(id_producto);
      if (onRefreshProducts) await onRefreshProducts();
    } catch (error) {
      console.error("Error al procesar lote:", error);
    }
  };

  const handleDeleteLote = async () => {
    try {
      await deleteLoteById(selectedLote.id);
      setIsDeleteModalOpen(false);
      await getAllLotesByProd(id_producto);
      if (onRefreshProducts) await onRefreshProducts();
      setSelectedLote(null);
    } catch (error) {
      console.error("Error al eliminar lote:", error);
    }
  };

  const selectStyles = {
    control: base => ({
      ...base,
      borderRadius: "8px",
      borderColor: "#e2e8f0",
      minHeight: "42px",
      boxShadow: "none",
      textTransform: "uppercase",
      "&:hover": { borderColor: "#cbd5e1" }
    }),
    option: (base) => ({
      ...base,
      textTransform: "uppercase"
    })
  };

  return (
    <div className="lots-container">
      <div className="lots-header-section">
        <div className="title-group">
          <div className="icon-badge"><Tag size={20} /></div>
          <div>
            <h3>GESTIÓN DE LOTES</h3>
            <p className="subtitle">{filteredLotes.length} LOTES ENCONTRADOS</p>
          </div>
        </div>
        <button className="btn-add-main" onClick={() => handleOpenForm()}>
          <Plus size={18} /> <span>NUEVO LOTE</span>
        </button>
      </div>

      <div className="lots-filter-bar">
        <div className={`search-container ${searchTerm ? "active" : ""}`}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="BUSCAR POR NÚMERO DE LOTE..."
            style={{ textTransform: 'uppercase' }}
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value.toUpperCase());
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="lots-card">
        <table className="lots-custom-table">
          <thead>
            <tr>
              <th>LOTE</th>
              <th><Warehouse size={14} /> DEPÓSITO</th>
              <th>CANTIDAD</th>
              <th><Calendar size={14} /> VENCIMIENTO</th>
              <th>ESTADO</th>
              <th className="text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentLotes.map(lote => (
              <tr key={lote.id}>
                <td className="bold">#{lote.nro_lote.toUpperCase()}</td>
                <td>{(lote.deposito_nombre || "N/A").toUpperCase()}</td>
                <td className="bold">{lote.cantidad}</td>
                <td>
                  <div className={`date-badge ${new Date(lote.fecha_vencimiento) < new Date() ? "is-expired" : ""}`}>
                    {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                  </div>
                </td>
                <td><span className="status-tag st-active">DISPONIBLE</span></td>
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
                <td colSpan="6" className="text-center">NO HAY LOTES REGISTRADOS PARA ESTE PRODUCTO.</td>
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
              <h4>{selectedLote ? "EDITAR LOTE" : "NUEVO LOTE"}</h4>
            </div>

            <div className="modal-body">
              <div className="input-group">
                <label>NRO. DE LOTE</label>
                <input
                  type="text"
                  style={{ textTransform: 'uppercase' }}
                  value={formData.nro_lote}
                  onChange={e =>
                    setFormData({ ...formData, nro_lote: e.target.value.toUpperCase() })
                  }
                />
              </div>

              <div className="input-group">
                <label>DEPÓSITO</label>
                <Select
                  options={depositOptions}
                  styles={selectStyles}
                  value={depositOptions.find(o => o.value === Number(formData.id_deposito)) || null}
                  onChange={opt =>
                    setFormData({ ...formData, id_deposito: opt ? opt.value : "" })
                  }
                  placeholder="SELECCIONE UN DEPÓSITO..."
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  CANTIDAD
                  {selectedLote && <Lock size={14} color="#94a3b8" />}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.cantidad}
                  disabled={!!selectedLote}
                  className={selectedLote ? "disabled-input" : ""}
                  style={selectedLote ? { backgroundColor: "#f1f5f9", color: "#64748b", cursor: "not-allowed" } : {}}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").replace(/^0+(?!$)/, "");
                    setFormData({ ...formData, cantidad: value });
                  }}
                  placeholder="EJ: 150"
                />
                {selectedLote && (
                  <small style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px" }}>
                    LA CANTIDAD NO SE PUEDE EDITAR UNA VEZ CREADO EL LOTE.
                  </small>
                )}
              </div>

              <div className="input-group">
                <label>FECHA DE CADUCIDAD</label>
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
                CANCELAR
              </button>
              <button className="btn-primary-solid" onClick={handleSubmit}>
                GUARDAR
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
            <h4>¿ELIMINAR ESTE LOTE?</h4>
            <p style={{ textAlign: 'center', color: '#64748b' }}>
              CONFIRMA QUE DESEAS ELIMINAR EL LOTE: <br/>
              <strong>{selectedLote?.nro_lote.toUpperCase()}</strong>
            </p>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsDeleteModalOpen(false)}>
                CANCELAR
              </button>
              <button className="btn-danger-solid" onClick={handleDeleteLote}>
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListLots;