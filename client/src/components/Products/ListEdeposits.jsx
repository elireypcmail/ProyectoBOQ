import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  Warehouse,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import KardexDep from "./KardexDep";
import KardexG from "./KardexG";
import "../../styles/components/ListLots.css";

const ListEdeposits = ({ id_producto }) => {
  const { productDeposits, getAllDeposits, getEDepositsByProduct } =
    useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [isKardexOpen, setIsKardexOpen] = useState(false);
  const [activeKardexData, setActiveKardexData] = useState(null);
  const [showKardexG, setShowKardexG] = useState(true);

  useEffect(() => {
    if (id_producto) {
      getEDepositsByProduct(id_producto);
      getAllDeposits();
    }
  }, [id_producto]);

  const safeProductDeposits = useMemo(
    () =>
      Array.isArray(productDeposits)
        ? productDeposits
        : productDeposits?.data || [],
    [productDeposits],
  );

  const filteredDeposits = useMemo(() => {
    return safeProductDeposits.filter((d) =>
      (d.deposito_nombre ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [safeProductDeposits, searchTerm]);

  const handleOpenKardex = (dep) => {
    setActiveKardexData(dep);
    setIsKardexOpen(true);
  };

  return (
    <div className="list-deposits-wrapper">
      {/* SECCIÓN 2: KARDEX GENERAL (DEBAJO) */}
      <div className="lots-container">
        <div
          className="lots-header-section"
          style={{ cursor: "pointer" }}
          onClick={() => setShowKardexG(!showKardexG)}
        >
          <div className="title-group">
            <div className="icon-badge" style={{ background: "#eef2ff" }}>
              <History size={20} color="#6366f1" />
            </div>
            <div>
              <h3>Kardex General del Producto</h3>
              <p className="subtitle">
                Historial consolidado de todos los depósitos
              </p>
            </div>
          </div>
          <div className="actions-group">
            {showKardexG ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </div>
        </div>

        {showKardexG && (
          <div
            className="lots-card"
            style={{ borderTop: "none", borderRadius: "0 0 12px 12px" }}
          >
            <KardexG id_producto={id_producto} isInline={true} />
          </div>
        )}
      </div>

      {/* SECCIÓN 1: EXISTENCIAS POR DEPÓSITO */}
      <div className="lots-container" style={{ marginTop: "2rem" }}>
        <div className="lots-header-section">
          <div className="title-group">
            <div className="icon-badge">
              <Warehouse size={20} />
            </div>
            <div>
              <h3>Existencias por Depósito</h3>
              <p className="subtitle">
                {filteredDeposits.length} ubicaciones activas
              </p>
            </div>
          </div>
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
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.map((dep) => {
                const isLowStock =
                  dep.existencia_deposito <= dep.stock_minimo_deposito;
                return (
                  <tr
                    key={dep.id_deposito}
                    className="row-interactive"
                    onClick={() => handleOpenKardex(dep)}
                  >
                    <td>
                      <strong>{dep.deposito_nombre}</strong>
                    </td>
                    <td>{dep.existencia_deposito}</td>
                    <td>{dep.stock_minimo_deposito}</td>
                    <td>
                      <span
                        className={`status-tag ${isLowStock ? "is-expired" : "st-active"}`}
                      >
                        {isLowStock ? "Bajo" : "Óptimo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isKardexOpen && (
        <KardexDep
          deposito={activeKardexData}
          onClose={() => setIsKardexOpen(false)}
        />
      )}
    </div>
  );
};

export default ListEdeposits;
