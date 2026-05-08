// ListStatistics.jsx — con ordenamiento de fechas descendente
import React, { useState } from "react";
import { Plus, X, User, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useHealth } from "../../context/HealtContext";
import ModalDoctors from "./ui/ModalDoctors";
import StatisticDetailModal from "./ui/StatisticDetailModal";
import "../../styles/components/ListZone.css";

const ListStatistics = ({ onClose }) => {
  const { getMedicosStats, medicosStats, clearMedicosStats } = useHealth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filtrosActivos, setFiltrosActivos] = useState(null);
  const [medicoExpandido, setMedicoExpandido] = useState(null);
  const [selectedOperacion, setSelectedOperacion] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSearch = async ({ fecha_inicio, fecha_fin }) => {
    setIsLoading(true);
    setIsModalOpen(false);
    setMedicoExpandido(null);
    await getMedicosStats(null, fecha_inicio, fecha_fin);
    setFiltrosActivos({ fecha_inicio, fecha_fin });
    setIsLoading(false);
  };

  const handleClose = () => {
    clearMedicosStats();
    onClose();
  };

  const toggleDetalle = (medicoId) => {
    setMedicoExpandido((prev) => (prev === medicoId ? null : medicoId));
  };

  const handleOpenDetail = (id) => {
    setSelectedOperacion(id);
    setIsDetailOpen(true);
  };

  const grupos = (() => {
    if (!medicosStats) return [];
    if (Array.isArray(medicosStats)) return medicosStats;
    if (medicosStats.medico) return [medicosStats];
    return [];
  })();

  const totalOperaciones = grupos.reduce((acc, g) => acc + g.operaciones.length, 0);

  return (
    <div className="pl-main-container">
      {/* HEADER */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Estadísticas de Operaciones</h2>
          <p>
            {grupos.length > 0
              ? `${grupos.length} médico(s) — ${totalOperaciones} operación(es) en el rango`
              : "Selecciona un rango de fechas para comenzar"}
          </p>
        </div>
        <div className="pl-actions-group">
          <button className="pl-btn-action" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Nueva Consulta
          </button>
          {onClose && (
            <button className="pl-btn-close" onClick={handleClose} title="Cerrar ventana">
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* RANGO ACTIVO */}
      {filtrosActivos && (
        <div className="pl-toolbar" style={{ gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--pl-muted)" }}>
            <Calendar size={15} />
            <span>{filtrosActivos.fecha_inicio} → {filtrosActivos.fecha_fin}</span>
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      {isLoading ? (
        <div className="pl-table-frame">
          <table className="pl-data-table">
            <tbody>
              <tr><td colSpan="5" className="no-results">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      ) : grupos.length > 0 ? (
        <div className="pl-table-frame">
          <table className="pl-data-table">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Especialidad</th>
                <th style={{ textAlign: "center" }}>Operaciones</th>
                <th style={{ textAlign: "right" }}>Total Acumulado</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {grupos.map(({ medico, operaciones }) => {
                // 1. ORDENAR OPERACIONES POR FECHA DESCENDENTE
                const operacionesOrdenadas = [...operaciones].sort((a, b) => 
                  new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
                );

                const totalAcumulado = operaciones.reduce(
                  (acc, op) => acc + Number(op.total), 0
                );
                const isExpanded = medicoExpandido === medico.id;

                return (
                  <React.Fragment key={medico.id}>
                    <tr
                      onClick={() => toggleDetalle(medico.id)}
                      style={{ cursor: "pointer" }}
                      className={isExpanded ? "row-active" : ""}
                    >
                      <td data-label="Médico" className="bold">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <User size={14} color="var(--pl-muted)" />
                          {medico.nombre}
                        </div>
                      </td>
                      <td data-label="Especialidad">
                        <span className="badge-type">{medico.tipo}</span>
                      </td>
                      <td data-label="Operaciones" style={{ textAlign: "center" }}>
                        <b>{operaciones.length}</b>
                      </td>
                      <td data-label="Total Acumulado" style={{ textAlign: "right" }}>
                        <b>{totalAcumulado.toFixed(2)}</b>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {isExpanded
                          ? <ChevronUp size={16} color="var(--pl-muted)" />
                          : <ChevronDown size={16} color="var(--pl-muted)" />
                        }
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan="5" style={{ padding: "0", background: "var(--pl-surface-alt, #f8fafc)" }}>
                          <div style={{ padding: "12px 16px" }}>
                            <table className="pl-data-table" style={{ fontSize: "12px" }}>
                              <thead>
                                <tr>
                                  <th>Fecha</th>
                                  <th>Nº Factura</th>
                                  <th>Paciente</th>
                                  <th>Clínica</th>
                                  <th>Vendedor</th>
                                  <th>Total Factura</th>
                                  <th>Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* 2. USAR EL ARRAY ORDENADO PARA EL RENDER */}
                                {operacionesOrdenadas.map((op) => (
                                  <tr
                                    key={op.id}
                                    onClick={() => handleOpenDetail(op.id)}
                                    style={{ cursor: "pointer" }}
                                    title="Ver detalle"
                                  >
                                    <td className="bold">{new Date(op.fecha_creacion).toLocaleDateString("es-ES")}</td>
                                    <td>{op.nro_factura}</td>
                                    <td>{op.paciente_nombre || "-"}</td>
                                    <td>{op.clinica_nombre || "-"}</td>
                                    <td>{op.vendedor_nombre || "-"}</td>
                                    <td>{Number(op.total).toFixed(2)}</td>
                                    <td><span className="badge-type">{op.estado_venta}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="pl-table-frame">
          <table className="pl-data-table">
            <tbody>
              <tr>
                <td colSpan="5" className="no-results">
                  Realiza una consulta para ver los resultados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <ModalDoctors
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSearch={handleSearch}
      />

      <StatisticDetailModal
        isOpen={isDetailOpen}
        operacionId={selectedOperacion}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOperacion(null);
        }}
      />
    </div>
  );
};

export default ListStatistics;