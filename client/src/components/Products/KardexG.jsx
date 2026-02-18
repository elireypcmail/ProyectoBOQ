import React from 'react';
import { History, FileText, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import "../../styles/components/ListLots.css";

const KardexG = ({ id_producto, data, onClose, isInline = false }) => {
  
  console.log("data")
  console.log(data)

  const movimientos = Array.isArray(data) ? data : (data?.data || []);

  // Ajustado a Dólares (USD)
  const formatCurrency = (val) => {
    const number = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    }).format(number);
  };

  const tableContent = (
    <div className="table-container-inline" style={{ overflowX: 'auto' }}>
      <table className="lots-custom-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Documento</th>
            <th>Detalle / Concepto</th>
            <th className="text-center">Existencia Inicial</th>
            <th className="text-center">Entrada</th>
            <th className="text-center">Salida</th>
            <th className="text-center">Existencia Final</th>
            <th className="text-right">Costo Prom.</th>
            <th className="text-right">Precio</th>
            <th className="text-center">Tipo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length > 0 ? (
            movimientos.map((m) => (
              <tr key={m.id}>
                <td className="col-date">
                  <div style={{ fontSize: '0.85rem' }}>
                    {new Date(m.fecha).toLocaleDateString()}
                  </div>
                  <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                    {new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </td>
                <td>
                  <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', color: '#475569' }}>
                    {m.documento}
                  </code>
                </td>
                <td style={{ maxWidth: '200px', fontSize: '0.9rem' }}>{m.detalle}</td>
                <td className="text-center" style={{ color: '#64748b' }}>{m.existencia_inicial}</td>
                
                <td className="text-center" style={{ color: '#10b981', fontWeight: '600' }}>
                  {m.entrada > 0 ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <ArrowUpCircle size={14} /> {m.entrada}
                    </span>
                  ) : '-'}
                </td>

                <td className="text-center" style={{ color: '#ef4444', fontWeight: '600' }}>
                  {m.salida > 0 ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <ArrowDownCircle size={14} /> {m.salida}
                    </span>
                  ) : '-'}
                </td>

                <td className="text-center">
                  <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{m.existencia_final}</strong>
                </td>
                
                <td className="text-right">{formatCurrency(m.costo)}</td>
                <td className="text-right">{formatCurrency(m.precio)}</td>
                
                <td className="text-center">
                  <span className={`status-tag ${m.tipo === 'ENTRADA' ? 'st-active' : 'is-expired'}`}>
                    {m.tipo}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                <FileText size={48} style={{ marginBottom: '12px', opacity: 0.3, display: 'block', margin: '0 auto' }} />
                <p style={{ fontWeight: '500' }}>No hay movimientos registrados.</p>
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
      <div className="modal-card" style={{ maxWidth: '95%', width: '1300px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="icon-badge" style={{ background: '#eef2ff' }}>
                  <History size={20} color="#6366f1" />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Kardex General Consolidado</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Valores expresados en USD
                  </p>
                </div>
            </div>
            <button className="act-btn delete" onClick={onClose} style={{ fontSize: '24px' }}>&times;</button>
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