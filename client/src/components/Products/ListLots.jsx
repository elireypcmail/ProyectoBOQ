import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListLots = ({ id_producto }) => {
  const {
    lotes,
    getAllLotes,
    createNewLote,
    editLote,
    deleteLoteById
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ---------------- MODALES ----------------
  const [selectedLote, setSelectedLote] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // ---------------- FORM ----------------
  const [nroLote, setNroLote] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  useEffect(() => {
    getAllLotes();
  }, []);

  // ---------------- FILTRADO (OBLIGATORIO POR PRODUCTO) ----------------
  const filteredLotes = useMemo(() => {
    return (Array.isArray(lotes) ? lotes : [])
      .filter(l => l.id_producto === id_producto)
      .filter(l =>
        (l.nro_lote ?? "")
          .toUpperCase()
          .includes(searchTerm.toUpperCase())
      );
  }, [lotes, searchTerm, id_producto]);

  const totalPages = Math.ceil(filteredLotes.length / itemsPerPage);
  const currentLotes = filteredLotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ---------------- ACCIONES ----------------
  const resetForm = () => {
    setNroLote("");
    setFechaVencimiento("");
  };

  const openEditModal = (lote) => {
    setSelectedLote(lote);
    setNroLote(lote.nro_lote);
    setFechaVencimiento(lote.fecha_vencimiento?.split("T")[0] || "");
    setIsEditModalOpen(true);
  };

  const handleNroLoteInput = (value) => {
    // Solo números
    return value.replace(/\D/g, "");
  };


  const handleCreate = async () => {
    if (!nroLote) return;

    await createNewLote({
      nro_lote: nroLote.trim(),
      fecha_vencimiento: fechaVencimiento || null,
      id_producto
    });

    setIsCreateModalOpen(false);
    resetForm();
    getAllLotes();
  };

  const handleUpdate = async () => {
    if (!selectedLote) return;

    await editLote(selectedLote.id, {
      nro_lote: nroLote.trim(),
      fecha_vencimiento: fechaVencimiento || null,
      id_producto
    });

    setIsEditModalOpen(false);
    setSelectedLote(null);
    resetForm();
    getAllLotes();
  };

  const handleDelete = async () => {
    if (!selectedLote) return;

    await deleteLoteById(selectedLote.id);
    setIsDeleteModalOpen(false);
    setSelectedLote(null);
    getAllLotes();
  };

  // ---------------- RENDER ----------------
  return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Lotes del Producto</h2>
          <p>{filteredLotes.length} lotes registrados</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={16} /> Nuevo Lote
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar lote..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLA */}
      <table className="orders-table">
        <thead>
          <tr>
            <th className="hide-mobile">ID</th>
            <th>Lote</th>
            <th className="hide-mobile">Vencimiento</th>
            <th className="center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentLotes.length ? currentLotes.map(lote => (
            <tr key={lote.id}>
              <td className="hide-mobile">#{lote.id}</td>
              <td>{lote.nro_lote}</td>
              <td className="hide-mobile">
                {lote.fecha_vencimiento
                  ? new Date(lote.fecha_vencimiento).toLocaleDateString()
                  : "—"}
              </td>
              <td className="center">
                <button
                  className="icon-btn"
                  onClick={() => {
                    setSelectedLote(lote);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <SlOptionsVertical size={16} />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="no-results">
                No se encontraron lotes
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedLote && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalle del Lote</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> #{selectedLote.id}</div>
              <div className="detail-card"><strong>Lote:</strong> {selectedLote.nro_lote}</div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  openEditModal(selectedLote);
                }}
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 size={16} /> Eliminar
              </button>
              <button
                className="btn-secondary"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedLote && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar lote?</h3>
            </div>
            <p>
              Confirma eliminar el lote <strong>{selectedLote.nro_lote}</strong>
            </p>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Lote</h3>

            <div className="form-group">
              <input
                placeholder="Nro de Lote"
                className="modal-input"
                value={nroLote}
                onChange={e => setNroLote(handleNroLoteInput(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label style={{ marginBottom: "20px" }}>Fecha de vencimiento</label>
              <input
                placeholder="Fecha de vencimiento"
                className="modal-input"
                type="date"
                value={fechaVencimiento}
                onChange={e => setFechaVencimiento(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleCreate}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Lote</h3>

            <div className="form-group">
              <label>Nro de Lote</label>
              <input
                className="modal-input"
                placeholder="Nro de Lote"
                value={nroLote}
                onChange={e => setNroLote(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Fecha de vencimiento</label>
              <input
                className="modal-input"
                type="date"
                value={fechaVencimiento}
                onChange={e => setFechaVencimiento(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleUpdate}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListLots;
