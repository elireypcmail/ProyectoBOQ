import React from "react";
import { X, FileText, Package } from "lucide-react";
import "../../../styles/ui/steps/StepConfirm.css"; 

const PurchaseDetailModal = ({ isOpen, purchase, onClose, onEdit }) => {
  if (!isOpen || !purchase) return null;

  // --- 1. HELPERS DE FORMATEO ---
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val);
    const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const dateOnly = dateStr.split("T")[0];
    const [year, month, day] = dateOnly.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatNum = (val) => {
    const num = safeParse(val);
    return num.toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // --- 2. EXTRACCIÓN DE DATOS ---
  const totals = purchase.totales_cargos || {};
  const items = purchase.items || [];

  const subtotalBruto = safeParse(totals.subtotal);
  const descuento = safeParse(totals.monto_descuento_fijo);
  const cargos = safeParse(totals.cargos_monto);
  const abono = safeParse(totals.monto_abonado);
  
  const totalFacturaNeto = subtotalBruto - descuento;
  const saldoPendiente = totalFacturaNeto - abono + cargos;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px', width: '95%', padding: 0 }}>
        
        <div className="modal-header" style={{ padding: '15px 25px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Detalle de Compra</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body pconf-step-container" style={{ padding: '25px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* RESUMEN CABECERA */}
          <div className="pconf-summary-grid" style={{ marginBottom: '30px' }}>
            <div className="pconf-summary-card">
              <label>Factura N°</label>
              <span>{purchase.nro_factura || "-"}</span>
            </div>
            <div className="pconf-summary-card">
              <label>Proveedor</label>
              <span>{purchase.proveedor || purchase.proveedor_nombre || "-"}</span>
            </div>
            <div className="pconf-summary-card">
              <label>Emisión</label>
              <span>{formatDate(purchase.fecha_emision)}</span>
            </div>
            <div className="pconf-summary-card">
              <label>Vencimiento</label>
              <span>{formatDate(purchase.fecha_vencimiento)}</span>
            </div>
          </div>

          {/* TABLA DE PRODUCTOS (Estilo de la imagen) */}
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '15px' }}>Detalle de Mercancía</h3>
          <div className="pconf-table-wrapper">
            <table className="pconf-items-table">
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem' }}>DESCRIPCIÓN</th>
                  <th className="pconf-center" style={{ color: '#64748b', fontSize: '0.75rem' }}>CANTIDAD</th>
                  <th className="pconf-center" style={{ color: '#64748b', fontSize: '0.75rem' }}>COSTO</th>
                  <th className="pconf-center" style={{ color: '#64748b', fontSize: '0.75rem' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="pconf-desc" style={{ fontWeight: '500' }}>{item.Producto}</td>
                    <td className="pconf-center">{safeParse(item.Cant).toFixed(2).replace('.', ',')}</td>
                    <td className="pconf-center">{formatNum(item.Costo_Base)}</td>
                    <td className="pconf-center">{formatNum(item.Subtotal_Linea)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PANEL DE TOTALES (Réplica exacta de la imagen) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '450px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '20px',
              backgroundColor: '#ffffff'
            }}>
              <div className="pconf-final-row">
                <span style={{ color: '#475569' }}>Subtotal</span>
                <span style={{ fontWeight: '500' }}>{formatNum(subtotalBruto)}</span>
              </div>
              
              <div className="pconf-final-row">
                <span style={{ color: '#dc2626' }}>Descuento</span>
                <span style={{ color: '#dc2626' }}>- {formatNum(descuento)}</span>
              </div>

              <div style={{ margin: '15px 0', borderTop: '1px solid #f1f5f9' }}></div>

              <div className="pconf-final-row" style={{ alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>TOTAL FACTURA</span>
                <span style={{ color: '#dc2626', fontSize: '1.75rem', fontWeight: '800' }}>
                  {formatNum(totalFacturaNeto)}
                </span>
              </div>

              <div style={{ margin: '15px 0', borderTop: '1px solid #f1f5f9' }}></div>

              <div className="pconf-final-row">
                <span style={{ color: '#475569' }}>Monto Abonado</span>
                <span style={{ color: '#10b981', fontWeight: '500' }}>- {formatNum(abono)}</span>
              </div>

              <div className="pconf-final-row">
                <span style={{ color: '#dc2626' }}>Cargos</span>
                <span style={{ color: '#dc2626' }}>+ {formatNum(cargos)}</span>
              </div>

              <div className="pconf-final-row" style={{ marginTop: '10px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>Total Factura + Cargos</span>
                <span style={{ fontWeight: '800', color: saldoPendiente > 0 ? '#dc2626' : '#0f172a', fontSize: '1.2rem' }}>
                  {formatNum(saldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '15px 25px', borderTop: '1px solid #eee', justifyContent: 'flex-end', gap: '10px' }}>
          {/* <button className="btn-secondary" onClick={onEdit}>Editar Datos</button> */}
          <button className="btn-primary" onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
};

export default PurchaseDetailModal;