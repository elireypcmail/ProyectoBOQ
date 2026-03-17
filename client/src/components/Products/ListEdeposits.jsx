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
    getAllKardexDep
  } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [isKardexOpen, setIsKardexOpen] = useState(false);
  const [activeKardexData, setActiveKardexData] = useState(null);
  const [showKardexG, setShowKardexG] = useState(true);
  const [loadingKardex, setLoadingKardex] = useState(false);

  // Efecto inicial para cargar existencias
  useEffect(() => {
    const fetchData = async () => {
      if (id_producto) {
        setSearchTerm("");
        setIsKardexOpen(false);
        setActiveKardexData(null);
        setShowKardexG(true);
        setLoadingKardex(false);

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

  // Memorizar depósitos y ORDENAR ALFABÉTICAMENTE
  const safeProductDeposits = useMemo(() => {
    const data = Array.isArray(productDeposits) ? productDeposits : productDeposits?.data || [];
    return [...data].sort((a, b) => 
      (a.deposito_nombre || "").localeCompare(b.deposito_nombre || "")
    );
  }, [productDeposits]);

  // Filtro de búsqueda de depósitos
  const filteredDeposits = useMemo(() => {
    return safeProductDeposits.filter((d) =>
      (d.deposito_nombre ?? "").toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [safeProductDeposits, searchTerm]);

  // Filtro de seguridad para el Kardex General
  const validKardexG = useMemo(() => {
    const data = Array.isArray(productKardexG) ? productKardexG : productKardexG?.data || [];
    return data.filter(k => k.id_producto === id_producto);
  }, [productKardexG, id_producto]);

  const handleOpenKardex = async (dep) => {
    try {
      setLoadingKardex(true);
      setActiveKardexData(dep);
      await getAllKardexDep(id_producto, dep.id_deposito);
      setIsKardexOpen(true);
    } catch (error) {
      console.error("Error al cargar kardex del depósito:", error);
      alert("NO SE PUDO CARGAR EL HISTORIAL DEL DEPÓSITO.");
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
            <small>EXISTENCIA TOTAL</small>
            <strong style={{ fontSize: '1.2rem' }}>{existenciaGeneral ?? 0} UNIDADES</strong>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: KARDEX GENERAL */}
      <div className="lots-container">
        <div
          className="lots-header-section"
          style={{ cursor: "pointer", background: "#f8fafc" }}
          onClick={() => setShowKardexG(!showKardexG)}
        >
          <div className="title-group">
            <div className="icon-badge" style={{ background: "#eef2ff" }}>
              <History size={20} color="#6366f1" />
            </div>
            <div>
              <h3>KARDEX GENERAL DEL PRODUCTO</h3>
              <p className="subtitle">HISTORIAL CONSOLIDADO (TODAS LAS SEDES)</p>
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
              data={validKardexG} 
              isInline={true} 
            />
          </div>
        )}
      </div>

      {/* SECCIÓN 2: EXISTENCIAS POR DEPÓSITO */}
      <div className="lots-container" style={{ marginTop: "2rem" }}>
        <div className="lots-header-section">
          <div className="title-group">
            <div className="icon-badge" style={{ background: "#fff7ed" }}>
              <Warehouse size={20} color="#f97316" />
            </div>
            <div>
              <h3>EXISTENCIAS POR DEPÓSITO</h3>
              <p className="subtitle">{filteredDeposits.length} UBICACIONES CON STOCK</p>
            </div>
          </div>
          <div className={`search-container ${searchTerm ? "active" : ""}`}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="FILTRAR POR DEPÓSITO..."
              style={{ textTransform: 'uppercase' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="lots-card">
          <table className="lots-custom-table">
            <thead>
              <tr>
                <th>DEPÓSITO</th>
                <th className="text-center">EXISTENCIA</th>
                <th className="text-center">STOCK MÍNIMO</th>
                <th className="text-center">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length > 0 ? (
                filteredDeposits.map((dep) => {
                  const isLowStock = dep.existencia_deposito <= dep.stock_minimo_deposito;
                  return (
                    <tr
                      key={dep.id_deposito}
                      className={`row-interactive ${loadingKardex ? 'loading' : ''}`}
                      onClick={() => !loadingKardex && handleOpenKardex(dep)}
                    >
                      <td><strong style={{ color: "#1e293b" }}>{dep.deposito_nombre.toUpperCase()}</strong></td>
                      <td className="text-center bold">{dep.existencia_deposito}</td>
                      <td className="text-center">{dep.stock_minimo_deposito}</td>
                      <td className="text-center">
                        <span className={`status-tag ${isLowStock ? "is-expired" : "st-active"}`}>
                          {isLowStock ? "BAJO" : "ÓPTIMO"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">NO SE ENCONTRARON DEPÓSITOS CON ESTA BÚSQUEDA</td>
                </tr>
              )}
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