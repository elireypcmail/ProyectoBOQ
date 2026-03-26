import React from 'react';
import '../../../../styles/ui/steps/StepSalesConfirm.css';

const StepConfirm = ({ formData, items, totals }) => {
  
  console.log("formData recibida:", formData);

  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val);
    const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
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
  const impuestos = safeParse(totals.impuestos_monto);
  const totalFinal = (subtotalBruto - descuento) + impuestos;

  return (
    <div className="invoice-container">
      <div className="invoice-header-section">
        <h3 className="invoice-title">Resumen de Proforma</h3>
        <p className="invoice-subtitle">Confirme los detalles antes de finalizar el registro.</p>
      </div>
      
      <div className="invoice-info-grid">
        <div className="invoice-grid-item">
          <label>Paciente</label>
          <span className="bold">{formData.nombre_paciente || "No asignado"}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Seguro / Pagador</label>
          <span>{formData.nombre_seguro || "Particular"}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Clínica / Centro</label>
          <span>{formData.nombre_clinica || "No especificada"}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Estado</label>
          <span className="text-blue">{totals.estado || "Pendiente"}</span>
        </div>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th className="text-left">Descripción</th>
              <th className="text-right">Cant.</th>
              <th className="text-right">Precio Unit.</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = safeParse(item.cantidad);
              const price = safeParse(item.precio_venta);
              const itemSubtotal = qty * price;
              
              return (
                <tr key={index}>
                  <td className="desc">
                    <div className="sku-text">{item.sku}</div>
                    {item.descripcion || item.producto}
                  </td>
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
          <span>Subtotal Productos</span>
          <span className="font-mono">{formatNum(subtotalBruto)}</span>
        </div>
        
        <div className="invoice-total-row invoice-grand-total">
          <span className="bold">TOTAL PROFORMA</span>
          <span className="invoice-amount-large font-mono">
             $ {formatNum(totalFinal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepConfirm;