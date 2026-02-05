import React from 'react';
import { History, FileText } from 'lucide-react';
import "../../styles/components/ListLots.css"; // Usamos el mismo CSS

const KardexG = ({ id_producto, onClose, isInline = false }) => {
  // Aquí cargarías los datos de tu API
  const movimientos = []; 

  const formatCurrency = (val) => 
    new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(val);

  const tableContent = (
    <div className="table-container-inline">
      <table className="lots-custom-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Documento</th>
            <th>Detalle / Concepto</th>
            <th className="text-center">Stock Inicial</th>
            <th className="text-center">Entrada</th>
            <th className="text-center">Salida</th>
            <th className="text-center">Stock Final</th>
            <th className="text-center">Costo Prom.</th>
            <th className="text-center">Precio</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length > 0 ? (
            movimientos.map((m) => (
              <tr key={m.id}>
                <td className="col-date">{new Date(m.fecha).toLocaleDateString()}</td>
                <td><code>{m.documento}</code></td>
                <td>{m.detalle}</td>
                <td className="text-center">{m.existencia_inicial}</td>
                <td className="text-center" style={{ color: '#10b981', fontWeight: 'bold' }}>
                    {m.entrada > 0 ? `+${m.entrada}` : '-'}
                </td>
                <td className="text-center" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    {m.salida > 0 ? `-${m.salida}` : '-'}
                </td>
                <td className="text-center"><strong>{m.existencia_final}</strong></td>
                <td className="text-center">{formatCurrency(m.costo)}</td>
                <td className="text-center">{formatCurrency(m.precio)}</td>
                <td>
                    <span className={`status-tag ${m.tipo === 'ENTRADA' ? 'st-active' : 'is-expired'}`}>
                        {m.tipo}
                    </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <FileText size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p>No hay movimientos consolidados para este producto.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (isInline) return tableContent;

  return (
    <div className="modal-overlay-blur">
      <div className="modal-card" style={{ maxWidth: '90%', width: '1200px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
                <h4>Kardex General</h4>
                <p>Producto ID: {id_producto}</p>
            </div>
            <button className="act-btn delete" onClick={onClose}>&times;</button>
          </div>
        </div>
        <div className="modal-body">
          {tableContent}
        </div>
      </div>
    </div>
  );
};

export default KardexG;