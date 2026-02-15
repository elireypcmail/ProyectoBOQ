import React from 'react';
import { useProducts } from "../../context/ProductsContext";
import { X, History, FileText } from 'lucide-react';
import "../../styles/components/KardexDep.css";

const KardexDep = ({ deposito, onClose }) => {
  // Usamos la variable exacta que mostraste en el console.log
  const { kardexDep } = useProducts(); 

  // Formateador para dólares (USD)
  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "$0.00";
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
    }).format(number);
  };

  return (
    <div className="kdx-modal-overlay">
      <div className="kdx-container-wide">
        <div className="kdx-header">
          <div className="kdx-title">
            <div className="kdx-icon-box"><History size={20} /></div>
            <div>
              <h3>Kardex Detallado por Sede</h3>
              <p>
                Depósito: <strong>{deposito?.deposito_nombre}</strong> | 
                Producto: <strong>{kardexDep[0]?.producto_nombre || 'Cargando...'}</strong>
              </p>
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
                  <th className="text-center">E. Inicial</th>
                  <th className="text-center">Entrada</th>
                  <th className="text-center">Salida</th>
                  <th className="text-center">E. Final</th>
                  <th>Costo</th>
                  <th>Precio</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {kardexDep && kardexDep.length > 0 ? (
                  kardexDep.map((m, index) => (
                    <tr key={m.id || index} className="kdx-row">
                      <td className="kdx-date">
                        {new Date(m.fecha).toLocaleDateString()}
                      </td>
                      <td className="kdx-doc"><code>{m.documento}</code></td>
                      <td className="kdx-detail">{m.detalle}</td>
                      <td className="text-center kdx-neutral">{m.existencia_inicial}</td>
                      <td className="text-center kdx-entry">
                        {m.entrada > 0 ? `+${m.entrada}` : '-'}
                      </td>
                      <td className="text-center kdx-exit">
                        {m.salida > 0 ? `-${m.salida}` : '-'}
                      </td>
                      <td className="text-center kdx-final">
                        <strong>{m.existencia_final}</strong>
                      </td>
                      <td className="kdx-money">{formatCurrency(m.costo)}</td>
                      <td className="kdx-money">{formatCurrency(m.precio)}</td>
                      <td>
                        <span className={`kdx-type-tag ${m.tipo?.toLowerCase()}`}>
                          {m.tipo}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="kdx-empty-state">
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <FileText size={48} color="#cbd5e1" />
                        <p>No hay movimientos en este depósito.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="kdx-footer">
          <div className="kdx-legend">
            <span className="leg-entry">■ Entrada</span>
            <span className="leg-exit">■ Salida</span>
          </div>
          <button className="btn-close-kdx" onClick={onClose}>Cerrar Kardex</button>
        </div>
      </div>
    </div>
  );
};

export default KardexDep;