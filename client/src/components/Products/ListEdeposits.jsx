import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  Warehouse,
  Boxes,
  X,
  TrendingDown
} from "lucide-react";
import "../../styles/components/ListLots.css"; // Reutilizamos tus estilos de lotes

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mantenemos tus campos originales
  const [formData, setFormData] = useState({
    id_deposito: "",
    existencia_deposito: "",
    stock_minimo_deposito: "",
  });

  useEffect(() => {
    if (id_producto) {
      getEDepositsByProduct(id_producto);
      getAllDeposits();
    }
  }, [id_producto]);

  const safeProductDeposits = useMemo(() => 
    Array.isArray(productDeposits) ? productDeposits : productDeposits?.data || []
  , [productDeposits]);

  const filteredDeposits = useMemo(() => {
    return safeProductDeposits.filter(d =>
      (d.deposito_nombre ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeProductDeposits, searchTerm]);

  // Depósitos que aún no han sido asignados a este producto
  const availableDeposits = useMemo(() => {
    const safeDeps = Array.isArray(deposits) ? deposits : deposits?.data || [];
    const usedIds = safeProductDeposits.map(d => d.id_deposito);
    return safeDeps.filter(d => !usedIds.includes(d.id));
  }, [deposits, safeProductDeposits]);

  const handleOpenForm = (dep = null) => {
    if (dep) {
      setSelectedDeposit(dep);
      setFormData({
        id_deposito: dep.id_deposito,
        existencia_deposito: dep.existencia_deposito,
        stock_minimo_deposito: dep.stock_minimo_deposito,
      });
    } else {
      setSelectedDeposit(null);
      setFormData({ id_deposito: "", existencia_deposito: "", stock_minimo_deposito: "" });
    }
    setIsFormModalOpen(true);
  };

  const handleSubmit = async () => {
    const { id_deposito, existencia_deposito, stock_minimo_deposito } = formData;

    if (!id_deposito || existencia_deposito === "" || stock_minimo_deposito === "") {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const payload = {
      id_deposito: Number(id_deposito),
      existencia_deposito: Number(existencia_deposito),
      stock_minimo_deposito: Number(stock_minimo_deposito)
    };

    if (selectedDeposit) {
      await editEDepositByProduct(id_producto, payload);
    } else {
      await createEDepositByProduct(id_producto, payload);
    }

    setIsFormModalOpen(false);
    getEDepositsByProduct(id_producto);
  };

  return (
    <div className="lots-container">
      <div className="lots-header-section">
        <div className="title-group">
          <div className="icon-badge"><Warehouse size={20} /></div>
          <div>
            <h3>Existencias por Depósito</h3>
            <p className="subtitle">{filteredDeposits.length} depósitos vinculados</p>
          </div>
        </div>
        {/* <button className="btn-add-main" onClick={() => handleOpenForm()}>
          <Plus size={18} /> <span>Asignar Depósito</span>
        </button> */}
      </div>

      <div className="lots-filter-bar">
        <div className={`search-container ${searchTerm ? "active" : ""}`}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar depósito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}><X size={14} /></button>
          )}
        </div>
      </div>

      <div className="lots-card">
        <table className="lots-custom-table">
          <thead>
            <tr>
              <th>Nombre del Depósito</th>
              <th><Boxes size={14} /> Existencia Actual</th>
              <th><TrendingDown size={14} /> Stock Mínimo</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.length > 0 ? (
              filteredDeposits.map((dep) => {
                const isLowStock = dep.existencia_deposito <= dep.stock_minimo_deposito;
                return (
                  <tr key={dep.id_deposito}>
                    <td className="col-depo"><strong>{dep.deposito_nombre}</strong></td>
                    <td>{dep.existencia_deposito}</td>
                    <td>{dep.stock_minimo_deposito}</td>
                    <td>
                      <span className={`status-tag ${isLowStock ? 'is-expired' : 'st-active'}`}>
                        {isLowStock ? "Stock Bajo" : "Óptimo"}
                      </span>
                    </td>
                    <td>
                      <div className="actions-group">
                        <button className="act-btn edit" onClick={() => handleOpenForm(dep)}><Pencil size={15} /></button>
                        <button className="act-btn delete" onClick={() => { setSelectedDeposit(dep); setIsDeleteModalOpen(true); }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="5" className="table-empty">No hay depósitos asociados a este producto.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORMULARIO */}
      {isFormModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card">
            <div className="modal-header">
              <h4>{selectedDeposit ? "Editar Existencias" : "Asignar a Depósito"}</h4>
              <p>Configure los niveles de inventario para esta ubicación.</p>
            </div>
            <div className="modal-body">
              {!selectedDeposit && (
                <div className="input-group">
                  <label>Depósito</label>
                  <select
                    value={formData.id_deposito}
                    onChange={(e) => setFormData({ ...formData, id_deposito: e.target.value })}
                  >
                    <option value="">Seleccionar depósito...</option>
                    {availableDeposits.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="input-group">
                <label>Existencia Actual</label>
                <input
                  type="number"
                  value={formData.existencia_deposito}
                  onChange={(e) => setFormData({ ...formData, existencia_deposito: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="input-group">
                <label>Stock Mínimo</label>
                <input
                  type="number"
                  value={formData.stock_minimo_deposito}
                  onChange={(e) => setFormData({ ...formData, stock_minimo_deposito: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsFormModalOpen(false)}>Cancelar</button>
              <button className="btn-primary-solid" onClick={handleSubmit}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card modal-danger">
            <div className="danger-icon"><AlertTriangle size={32} /></div>
            <h4>¿Desvincular depósito?</h4>
            <p>Se eliminará el registro de existencia en <strong>{selectedDeposit?.deposito_nombre}</strong>.</p>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger-solid" onClick={async () => {
                await deleteEDepositByProduct(selectedDeposit.id);
                setIsDeleteModalOpen(false);
                getEDepositsByProduct(id_producto);
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListEdeposits;