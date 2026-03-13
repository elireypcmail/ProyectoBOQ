import React, { useEffect, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Context
import { useSales } from "../../context/SalesContext";

// CSS
import "../../styles/components/ListSellers.css";

const ListBudgets = () => {

  const {
    budgets,
    getAllBudgets
  } = useSales();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    getAllBudgets();
  }, []);

  const filteredBudgets = useMemo(() => {
    return (budgets || []).filter(b =>
      String(b.id).includes(searchTerm) ||
      (b.nombre_paciente || "").toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [budgets, searchTerm]);

  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);

  const currentBudgets = filteredBudgets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="lsu-container">

      {/* HEADER */}
      <div className="lsu-header">
        <div className="lsu-title-section">
          <h2>Gestión de Presupuestos</h2>
          <p>{filteredBudgets.length} presupuestos registrados</p>
        </div>

        <button className="lsu-btn-primary">
          <Plus size={16}/> Nuevo Presupuesto
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="lsu-toolbar">
        <div className="lsu-search-box">
          <Search size={16} className="lsu-search-icon"/>

          <input
            placeholder="Buscar presupuesto..."
            value={searchTerm}
            onChange={(e)=>{
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="lsu-table-wrapper">

        <table className="lsu-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th className="lsu-hide-mobile">Fecha</th>
              <th className="lsu-hide-mobile">Total</th>
              <th className="lsu-text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>

            {currentBudgets.length ? currentBudgets.map(b => (

              <tr key={b.id}>

                <td className="lsu-col-id">
                  #{b.id}
                </td>

                <td className="lsu-col-name">
                  {b.nombre_paciente || "—"}
                </td>

                <td className="lsu-hide-mobile">
                  {b.fecha || "—"}
                </td>

                <td className="lsu-hide-mobile">
                  {b.total ? `$ ${b.total}` : "—"}
                </td>

                <td className="lsu-text-center">
                  <button className="lsu-icon-btn">
                    <SlOptionsVertical size={16}/>
                  </button>
                </td>

              </tr>

            )) : (

              <tr>
                <td colSpan="5" className="lsu-no-results">
                  No se encontraron presupuestos
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* PAGINACIÓN */}

      {totalPages > 1 && (

        <div className="lsu-pagination">

          <button
            className="lsu-page-btn"
            disabled={currentPage === 1}
            onClick={()=>setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={18}/>
          </button>

          <span className="lsu-page-info">
            Página {currentPage} de {totalPages}
          </span>

          <button
            className="lsu-page-btn"
            disabled={currentPage === totalPages}
            onClick={()=>setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={18}/>
          </button>

        </div>

      )}

    </div>
  );
};

export default ListBudgets;