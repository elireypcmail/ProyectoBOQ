import React from 'react';
import { X, History, FileText, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import "../../styles/components/KardexDep.css"; // Reutilizamos estilos de Kardex

const KardexG = ({ id_producto, onClose }) => {
  // Aquí cargarás los datos de tu tabla 'kardexg' filtrando por id_producto
  const movimientos = []; 

  const formatCurrency = (value) => 
    new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(value);

  return (
    <div className="kdx-modal-overlay">
      <div className="kdx-container-wide">
        <div className="kdx-header kdx-header-general">
          <div className="kdx-title">
            <div className="kdx-icon-box kdx-icon-general"><History size={20} /></div>
            <div>
              <h3>Kardex General del Producto</h3>
              <p>Historial Consolidado | ID: <strong>{id_producto}</strong></p>
            </div>
          </div>
          <button className="kdx-close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        <div className="kdx-body">
          <div className="kdx-table-responsive">
            <table className="kdx-main-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Detalle / Concepto</th>
                  <th className="text-center">Inicial</th>
                  <th className="text-center">Entrada</th>
                  <th className="text-center">Salida</th>
                  <th className="text-center">Stock Final</th>
                  <th>Costo Prom.</th>
                  <th>Precio</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length > 0 ? (
                  movimientos.map((m) => (
                    <tr key={m.id} className={`kdx-row ${!m.estatus ? 'kdx-disabled' : ''}`}>
                      <td className="kdx-date">{new Date(m.fecha).toLocaleDateString()}</td>
                      <td className="kdx-doc"><code>{m.documento}</code></td>
                      <td className="kdx-detail">{m.detalle}</td>
                      <td className="text-center kdx-neutral">{m.existencia_inicial}</td>
                      <td className="text-center kdx-entry">
                        {m.entrada > 0 ? <span className="entry-val">+{m.entrada}</span> : '-'}
                      </td>
                      <td className="text-center kdx-exit">
                        {m.salida > 0 ? <span className="exit-val">-{m.salida}</span> : '-'}
                      </td>
                      <td className="text-center kdx-final"><strong>{m.existencia_final}</strong></td>
                      <td className="kdx-money">{formatCurrency(m.costo)}</td>
                      <td className="kdx-money">{formatCurrency(m.precio)}</td>
                      <td>
                        <span className={`kdx-type-tag ${m.tipo.toLowerCase()}`}>
                          {m.tipo}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="kdx-empty-state">
                      <FileText size={48} />
                      <p>No hay movimientos consolidados en el Kardex General.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="kdx-footer">
          <div className="kdx-legend">
            <span className="leg-entry">■ Entradas Totales</span>
            <span className="leg-exit">■ Salidas Totales</span>
          </div>
          <button className="btn-close-kdx" onClick={onClose}>Cerrar Historial</button>
        </div>
      </div>
    </div>
  );
};

export default KardexG;