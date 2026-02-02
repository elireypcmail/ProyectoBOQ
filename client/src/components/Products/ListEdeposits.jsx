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

const ListEdeposits = ({ id_producto }) => {
  const {
    productDeposits,
    deposits,
    getAllDeposits,
    getEDepositsByProduct,
    createEDepositByProduct,
    editEDepositByProduct,
    deleteEDepositByProduct
  } = useProducts();

  console.log(productDeposits)

  // ---------------- STATE ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedDeposit, setSelectedDeposit] = useState(null);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form
  const [idDeposito, setIdDeposito] = useState("");
  const [existencia, setExistencia] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");

  // ---------------- ARRAYS SEGUROS ----------------
  const safeDeposits = useMemo(() => {
    if (Array.isArray(deposits)) return deposits;
    if (deposits && Array.isArray(deposits.data)) return deposits.data; 
    return [];
  }, [deposits]);

  const safeProductDeposits = useMemo(() => {
    if (Array.isArray(productDeposits)) return productDeposits;
    if (productDeposits && Array.isArray(productDeposits.data)) return productDeposits.data;
    return [];
  }, [productDeposits]);

  // ---------------- LOAD ----------------
  useEffect(() => {
    if (id_producto) {
      getEDepositsByProduct(id_producto);
      getAllDeposits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_producto]);

  // ---------------- FILTER ----------------
  const filteredDeposits = useMemo(() => {
    return safeProductDeposits.filter(d =>
      (d.deposito_nombre ?? "")
        .toUpperCase()
        .includes(searchTerm.toUpperCase())
    );
  }, [safeProductDeposits, searchTerm]);

  // Evita crear existencia duplicada por depósito
  const availableDeposits = useMemo(() => {
    const usedIds = safeProductDeposits.map(d => d.id_deposito);
    return safeDeposits.filter(d => !usedIds.includes(d.id));
  }, [safeDeposits, safeProductDeposits]);

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const currentDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ---------------- HELPERS ----------------
  const resetForm = () => {
    setIdDeposito("");
    setExistencia("");
    setStockMinimo("");
  };

const openEditModal = (dep) => {
  setSelectedDeposit(dep);
  setIdDeposito(dep.id_deposito); // <-- asignamos el depósito correcto
  setExistencia(dep.existencia_deposito);
  setStockMinimo(dep.stock_minimo_deposito);
  setIsEditModalOpen(true);
};

  // ---------------- ACTIONS ----------------
const handleCreate = async () => {
  if (!idDeposito || existencia === "" || stockMinimo === "") return;

  const existenciaNum = Number(existencia);
  const stockMinimoNum = Number(stockMinimo);

  if (existenciaNum < stockMinimoNum) {
    alert("La existencia inicial no puede ser menor que el stock mínimo.");
    return;
  }

  try {
    await createEDepositByProduct(id_producto, {
      id_deposito: Number(idDeposito),
      existencia_deposito: existenciaNum,
      stock_minimo_deposito: stockMinimoNum
    });

    setIsCreateModalOpen(false);
    resetForm();
    getEDepositsByProduct(id_producto);
  } catch (error) {
    console.error("Error al crear existencia:", error);
  }
};


const handleUpdate = async () => {
  if (!selectedDeposit) return;

  const existenciaNum = Number(existencia);
  const stockMinimoNum = Number(stockMinimo);

  if (existenciaNum < stockMinimoNum) {
    alert("La existencia inicial no puede ser menor que el stock mínimo.");
    return;
  }

  const payload = {
    id_deposito: Number(idDeposito),
    existencia_deposito: existenciaNum,
    stock_minimo_deposito: stockMinimoNum
  };

  try {
    await editEDepositByProduct(selectedDeposit.id_producto, payload);

    setIsEditModalOpen(false);
    setSelectedDeposit(null);
    resetForm();
    getEDepositsByProduct(id_producto);
  } catch (error) {
    console.error("Error al actualizar:", error);
  }
};



  const handleDelete = async () => {
    if (!selectedDeposit?.id) {
        console.error("No hay ID para eliminar");
        return;
    }

    try {
      await deleteEDepositByProduct(selectedDeposit.id);
  
      setIsDeleteModalOpen(false);
      setSelectedDeposit(null);
      getEDepositsByProduct(id_producto);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Depósitos del Producto</h2>
          <p>{filteredDeposits.length} registros</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* SEARCH */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar depósito..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="orders-table">
        <thead>
          <tr>
            <th className="hide-mobile">ID</th>
            <th>Depósito</th>
            <th className="center">Existencia</th>
            <th className="center">Stock mínimo</th>
            <th className="center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentDeposits.length ? currentDeposits.map(dep => {
            const lowStock = dep.existencia_deposito < dep.stock_minimo_deposito;

            return (
              <tr key={dep.id || Math.random()} className={lowStock ? "row-warning" : ""}>
                <td className="hide-mobile">#{dep.id_deposito}</td>
                <td>{dep.deposito_nombre}</td>
                <td className="center">{dep.existencia_deposito}</td>
                <td className="center">{dep.stock_minimo_deposito}</td>
                <td className="center">
                  <button
                    className="icon-btn"
                    onClick={() => {
                      setSelectedDeposit(dep);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="5" className="no-results">
                No hay depósitos registrados para este producto
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
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

      {/* DETAILS MODAL */}
      {isDetailsModalOpen && selectedDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedDeposit.deposito_nombre}</h3>

            <div className="modal-info-body">
              <div className="detail-card">
                <strong>Existencia:</strong> {selectedDeposit.existencia_deposito}
              </div>
              <div className="detail-card">
                <strong>Stock mínimo:</strong> {selectedDeposit.stock_minimo_deposito}
              </div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  // Pasamos selectedDeposit explícitamente para asegurar la referencia
                  openEditModal(selectedDeposit);
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

      {/* DELETE MODAL */}
      {isDeleteModalOpen && selectedDeposit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar existencia?</h3>
            </div>
            <p>
              Depósito <strong>{selectedDeposit.deposito_nombre}</strong>
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nueva existencia por depósito</h3>

            <div className="form-group">
              <label>Depósito</label>
              <select
                className="modal-input"
                value={idDeposito}
                onChange={e => setIdDeposito(e.target.value)}
              >
                <option value="">Seleccione depósito</option>
                {availableDeposits.length > 0 ? (
                    availableDeposits.map(dep => (
                    <option key={dep.id} value={dep.id}>
                        {dep.nombre}
                    </option>
                    ))
                ) : (
                    <option disabled>No hay depósitos disponibles</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Existencia Inicial</label>
              <input
                className="modal-input"
                type="text"
                value={existencia}
                onChange={e => setExistencia(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Stock mínimo</label>
              <input
                className="modal-input"
                type="text"
                value={stockMinimo}
                onChange={e => setStockMinimo(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
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

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar existencia</h3>
            {/* Mostrar ID en pequeñito para debug si es necesario */}
            {selectedDeposit && <small style={{color:'#888'}}>Ref ID: {selectedDeposit.id}</small>}

            <div className="form-group">
              <label>Existencia</label>
              <input
                className="modal-input"
                value={existencia}
                onChange={e => setExistencia(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="form-group">
              <label>Stock mínimo</label>
              <input
                className="modal-input"
                value={stockMinimo}
                onChange={e => setStockMinimo(e.target.value.replace(/\D/g, ""))}
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

export default ListEdeposits;