import React from 'react';
import '../../../../styles/ui/steps/StepSalesConfirm.css';

const StepConfirm = ({ formData, items, totals }) => {
  
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val);
    const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatNum = (val) => {
    const num = safeParse(val);
    return num.toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const subtotalBruto = safeParse(totals.subtotal);
  const descuento = safeParse(totals.monto_descuento_fijo);
  const cargos = safeParse(totals.cargos_monto);
  const abono = safeParse(totals.monto_abonado);
  
  const totalFacturaNeto = subtotalBruto - descuento;
  const saldoPendiente = totalFacturaNeto - abono + cargos;

  return (
    <div className="invoice-container">
      <div className="invoice-header-section">
        <h3 className="invoice-title">Resumen de la Compra</h3>
        <p className="invoice-subtitle">Verifique los datos contra su factura física.</p>
      </div>
      
      <div className="invoice-info-grid">
        <div className="invoice-grid-item">
          <label>Factura N°</label>
          <span>{formData.nro_factura || "-"}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Proveedor</label>
          <span>{formData.proveedor || "-"}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Emisión</label>
          <span>{formatDate(formData.fecha_emision)}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Vencimiento</label>
          <span>{formatDate(formData.fecha_vencimiento)}</span>
        </div>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th className="text-left">Descripción</th>
              <th className="text-right">Cantidad</th>
              <th className="text-right">Costo</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = safeParse(item.cantidad);
              const price = safeParse(item.costo_unitario);
              const itemSubtotal = qty * price;
              
              return (
                <tr key={index}>
                  <td className="desc">{item.descripcion || item.nombre}</td>
                  <td className="text-right font-mono">{qty.toFixed(2).replace('.', ',')}</td>
                  <td className="text-right font-mono">{formatNum(price)}</td>
                  <td className="text-right font-mono">{formatNum(itemSubtotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="invoice-totals-section">
        <div className="invoice-total-row">
          <span>Subtotal</span>
          <span className="font-mono">{formatNum(subtotalBruto)}</span>
        </div>
        <div className="invoice-total-row text-red">
          <span>Descuento</span>
          <span className="font-mono">- {formatNum(descuento)}</span>
        </div>
        <div className="invoice-total-row invoice-grand-total">
          <span className="bold">TOTAL FACTURA</span>
          <span className="invoice-amount-large font-mono">{formatNum(totalFacturaNeto)}</span>
        </div>
        <div className="invoice-total-row border-top">
          <span>Monto Abonado</span>
          <span className="text-green font-mono">- {formatNum(abono)}</span>
        </div>
        <div className="invoice-total-row text-red">
          <span>Cargos</span>
          <span className="font-mono">+ {formatNum(cargos)}</span>
        </div>
        <div className="invoice-total-row invoice-final-balance">
          <span>Saldo Pendiente</span>
          <span className={`font-mono ${saldoPendiente > 0.01 ? 'text-red' : ''}`}>
            {formatNum(saldoPendiente)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepConfirm;