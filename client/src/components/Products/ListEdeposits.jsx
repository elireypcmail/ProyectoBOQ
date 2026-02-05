import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Warehouse,
  X,
  History
} from "lucide-react";
import KardexDep from "./KardexDep";
import KardexG from "./KardexG"; // Importamos el nuevo componente
import "../../styles/components/ListLots.css";

const ListEdeposits = ({ id_producto }) => {
  const {
    productDeposits,
    deposits,
    getAllDeposits,
    getEDepositsByProduct,
    editEDepositByProduct,
    deleteEDepositByProduct
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estados para Kardex Individual y General
  const [isKardexOpen, setIsKardexOpen] = useState(false);
  const [isKardexGOpen, setIsKardexGOpen] = useState(false);
  const [activeKardexData, setActiveKardexData] = useState(null);

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

  const handleOpenKardex = (dep) => {
    setActiveKardexData(dep);
    setIsKardexOpen(true);
  };

  const handleOpenForm = (dep) => {
    setSelectedDeposit(dep);
    setFormData({
      id_deposito: dep.id_deposito,
      existencia_deposito: dep.existencia_deposito,
      stock_minimo_deposito: dep.stock_minimo_deposito,
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      id_deposito: Number(formData.id_deposito),
      existencia_deposito: Number(formData.existencia_deposito),
      stock_minimo_deposito: Number(formData.stock_minimo_deposito)
    };
    await editEDepositByProduct(id_producto, payload);
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
            <p className="subtitle">{filteredDeposits.length} ubicaciones activas</p>
          </div>
        </div>
        {/* BOTÓN REEMPLAZADO: AHORA KARDEX GENERAL */}
        <button className="btn-add-main" onClick={() => setIsKardexGOpen(true)}>
          <History size={18} /> <span>Kardex General</span>
        </button>
      </div>

      <div className="lots-filter-bar">
        <div className={`search-container ${searchTerm ? "active" : ""}`}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Filtrar por depósito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="lots-card">
        <table className="lots-custom-table">
          <thead>
            <tr>
              <th>Depósito</th>
              <th>Existencia</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              {/* <th className="text-center">Acciones</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.map((dep) => {
              const isLowStock = dep.existencia_deposito <= dep.stock_minimo_deposito;
              return (
                <tr 
                  key={dep.id_deposito} 
                  className="row-interactive" 
                  onClick={() => handleOpenKardex(dep)}
                >
                  <td><strong>{dep.deposito_nombre}</strong></td>
                  <td>{dep.existencia_deposito}</td>
                  <td>{dep.stock_minimo_deposito}</td>
                  <td>
                    <span className={`status-tag ${isLowStock ? 'is-expired' : 'st-active'}`}>
                      {isLowStock ? "Bajo" : "Óptimo"}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="actions-group">
                      {/* <button className="act-btn edit" onClick={() => handleOpenForm(dep)}>
                        <Pencil size={15} />
                      </button>
                      <button className="act-btn delete" onClick={() => { 
                        setSelectedDeposit(dep); 
                        setIsDeleteModalOpen(true); 
                      }}>
                        <Trash2 size={15} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL KARDEX POR DEPÓSITO */}
      {isKardexOpen && (
        <KardexDep 
          deposito={activeKardexData} 
          onClose={() => setIsKardexOpen(false)} 
        />
      )}

      {/* MODAL KARDEX GENERAL */}
      {isKardexGOpen && (
        <KardexG 
          id_producto={id_producto}
          onClose={() => setIsKardexGOpen(false)} 
        />
      )}

      {/* MODAL FORMULARIO (EDITAR) */}
      {isFormModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card">
            <div className="modal-header">
              <h4>Ajustar Existencias</h4>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Existencia Actual</label>
                <input
                  type="number"
                  value={formData.existencia_deposito}
                  onChange={(e) => setFormData({ ...formData, existencia_deposito: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Stock Mínimo</label>
                <input
                  type="number"
                  value={formData.stock_minimo_deposito}
                  onChange={(e) => setFormData({ ...formData, stock_minimo_deposito: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsFormModalOpen(false)}>Cancelar</button>
              <button className="btn-primary-solid" onClick={handleSubmit}>Actualizar</button>
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
            <p>Se borrarán los registros de <strong>{selectedDeposit?.deposito_nombre}</strong>.</p>
            <div className="modal-actions">
              <button className="btn-secondary-link" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger-solid" onClick={async () => {
                await deleteEDepositByProduct(selectedDeposit.id);
                setIsDeleteModalOpen(false);
                getEDepositsByProduct(id_producto);
              }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListEdeposits;