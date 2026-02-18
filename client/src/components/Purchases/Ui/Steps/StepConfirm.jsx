import React from 'react';
import '../../../../styles/ui/steps/StepConfirm.css';

const StepConfirm = ({ formData, items, totals }) => {
  
  // 1. Helper de Parseo Robusto
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val);
    const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
  };

  // 2. Helper para formatear fechas
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // 3. Formateador de Moneda (Mantiene la coma decimal)
  const formatNum = (val) => {
    const num = safeParse(val);
    return num.toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Cálculos base para el resumen
  const subtotalBruto = safeParse(totals.subtotal);
  const descuento = safeParse(totals.monto_descuento_fijo);
  const cargos = safeParse(totals.cargos_monto);
  const abono = safeParse(totals.monto_abonado);
  
  // Total Factura (Neto abonable)
  const totalFacturaNeto = subtotalBruto - descuento;
  
  // Saldo Pendiente (Total Factura - Abono + Cargos)
  const saldoPendiente = totalFacturaNeto - abono + cargos;

  return (
    <div className="pconf-step-container">
      
      <div className="pconf-section-header">
        <h3>Resumen de la Compra</h3>
        <p>Verifique que los montos y fechas coincidan con su factura física.</p>
      </div>
      
      <div className="pconf-summary-grid">
        <div className="pconf-summary-card">
          <label>Factura N°</label>
          <span>{formData.nro_factura || "-"}</span>
        </div>
        <div className="pconf-summary-card">
          <label>Proveedor</label>
          <span>{formData.proveedor || "-"}</span>
        </div>
        <div className="pconf-summary-card">
          <label>Emisión</label>
          <span>{formatDate(formData.fecha_emision)}</span>
        </div>
        <div className="pconf-summary-card">
          <label>Vencimiento</label>
          <span>{formatDate(formData.fecha_vencimiento)}</span>
        </div>
      </div>

      <div className="pconf-section-header" style={{ marginTop: '30px' }}>
        <h3>Detalle de Mercancía</h3>
      </div>
      
      <div className="pconf-table-wrapper">
        <table className="pconf-items-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th className="pconf-center">Cantidad</th>
              {/* <th className="pconf-center">Precio Base</th> */}
              <th className="pconf-center">Costo</th>
              {/* <th className="pconf-center">Costo Ficha</th> */}
              <th className="pconf-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = safeParse(item.cantidad);
              const price = safeParse(item.costo_unitario);
              const itemSubtotal = qty * price;
              const costoFicha = safeParse(item.costo_final);
              
              return (
                <tr key={index}>
                  <td className="pconf-desc">{item.descripcion || item.nombre}</td>
                  <td className="pconf-center">{qty.toFixed(2).replace('.', ',')}</td>
                  <td className="pconf-center">{formatNum(price)}</td>
                  {/* <td className="pconf-center" style={{ fontWeight: '600', color: '#1e293b' }}>
                    {formatNum(costoFicha)}
                  </td> */}
                  <td className="pconf-center">
                    {formatNum(itemSubtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pconf-totals-pane">
        <div className="pconf-final-row">
          <span>Subtotal</span>
          <span>{formatNum(subtotalBruto)}</span>
        </div>
        
        <div className="pconf-final-row" style={{ color: '#dc2626' }}>
          <span>Descuento</span>
          <span>- {formatNum(descuento)}</span>
        </div>

        <div className="pconf-final-row pconf-grand-total">
          <span className="pconf-total-label">TOTAL FACTURA</span>
          <span className="pconf-total-amount">{formatNum(totalFacturaNeto)}</span>
        </div>

        <div className="pconf-final-row" style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <span>Monto Abonado</span>
          <span style={{ color: '#10b981', fontWeight: '600' }}>- {formatNum(abono)}</span>
        </div>

        <div className="pconf-final-row" style={{ color: '#ec3137' }}>
          <span>Cargos</span>
          <span>+ {formatNum(cargos)}</span>
        </div>

        <div className="pconf-final-row" style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '5px' }}>
          <span>Total Factura + Cargos</span>
          <span style={{ color: saldoPendiente > 0.01 ? '#ef4444' : '#1e293b' }}>
            {formatNum(saldoPendiente)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepConfirm;