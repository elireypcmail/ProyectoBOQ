import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import {
  Search,
  Warehouse,
  History,
  ChevronDown,
  ChevronUp,
  Hash
} from "lucide-react";
import KardexDep from "./KardexDep";
import KardexG from "./KardexG";
import "../../styles/components/ListLots.css";

const ListEdeposits = ({ id_producto, existenciaGeneral, onRefreshProducts }) => {
  const { 
    productDeposits, 
    getEDepositsByProduct, 
    getKardexGByProd, 
    productKardexG,
    getAllKardexDep,
    kardexDep
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [isKardexOpen, setIsKardexOpen] = useState(false);
  const [activeKardexData, setActiveKardexData] = useState(null);
  const [showKardexG, setShowKardexG] = useState(true);
  const [loadingKardex, setLoadingKardex] = useState(false);

  console.log("kardexDep")
  console.log(kardexDep)

  // Efecto inicial para cargar existencias por depósito y kardex general
  useEffect(() => {
    const fetchData = async () => {
      if (id_producto) {
        try {
          await Promise.all([
            getEDepositsByProduct(id_producto),
            getKardexGByProd(id_producto)
          ]);
          
          if (onRefreshProducts) {
            await onRefreshProducts();
          }
        } catch (error) {
          console.error("Error actualizando existencias:", error);
        }
      }
    };
    fetchData();
  }, [id_producto]); 

  // Memorizar depósitos para evitar re-renders innecesarios
  const safeProductDeposits = useMemo(
    () => (Array.isArray(productDeposits) ? productDeposits : productDeposits?.data || []),
    [productDeposits],
  );

  // Filtro de búsqueda
  const filteredDeposits = useMemo(() => {
    return safeProductDeposits.filter((d) =>
      (d.deposito_nombre ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeProductDeposits, searchTerm]);

  // FUNCIÓN CORREGIDA: Carga el kardex específico antes de abrir el modal
  const handleOpenKardex = async (dep) => {
    try {
      setLoadingKardex(true);
      setActiveKardexData(dep);
      
      // Llamada a la API usando los dos IDs requeridos
      await getAllKardexDep(id_producto, dep.id_deposito);
      
      setIsKardexOpen(true);
    } catch (error) {
      console.error("Error al cargar kardex del depósito:", error);
      alert("No se pudo cargar el historial del depósito.");
    } finally {
      setLoadingKardex(false);
    }
  };

  return (
    <div className="list-deposits-wrapper">
      
      {/* SECCIÓN 0: RESUMEN */}
      <div className="pdm-stats-grid" style={{ marginBottom: '1.5rem', width: "fit-content" }}>
        <div className="pdm-stat-card inventory">
          <div className="pdm-stat-icon"><Hash size={18} /></div>
          <div className="pdm-stat-content">
            <small>Existencia Total</small>
            <strong>{existenciaGeneral ?? 0} unidades</strong>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: KARDEX GENERAL */}
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
              <p className="subtitle">Historial consolidado (Todas las sedes)</p>
            </div>
          </div>
          <div className="actions-group">
            {showKardexG ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </div>
        </div>

        {showKardexG && (
          <div className="lots-card" style={{ borderTop: "none", borderRadius: "0 0 12px 12px" }}>
            <KardexG 
              id_producto={id_producto} 
              data={productKardexG} 
              isInline={true} 
            />
          </div>
        )}
      </div>

      {/* SECCIÓN 2: EXISTENCIAS POR DEPÓSITO */}
      <div className="lots-container" style={{ marginTop: "2rem" }}>
        <div className="lots-header-section">
          <div className="title-group">
            <div className="icon-badge">
              <Warehouse size={20} />
            </div>
            <div>
              <h3>Existencias por Depósito</h3>
              <p className="subtitle">{filteredDeposits.length} ubicaciones con stock</p>
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
                const isLowStock = dep.existencia_deposito <= dep.stock_minimo_deposito;
                return (
                  <tr
                    key={dep.id_deposito}
                    className={`row-interactive ${loadingKardex ? 'loading' : ''}`}
                    onClick={() => !loadingKardex && handleOpenKardex(dep)}
                  >
                    <td><strong>{dep.deposito_nombre}</strong></td>
                    <td>{dep.existencia_deposito}</td>
                    <td>{dep.stock_minimo_deposito}</td>
                    <td>
                      <span className={`status-tag ${isLowStock ? "is-expired" : "st-active"}`}>
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

      {/* MODAL DE KARDEX POR DEPÓSITO */}
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