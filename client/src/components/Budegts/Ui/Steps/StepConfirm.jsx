import React from 'react';
import '../../../../styles/ui/steps/StepSalesConfirm.css';

const StepConfirm = ({ formData, items, totals }) => {
  
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val).trim();
    if (sVal.includes(',')) {
      const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
      return parseFloat(cleanVal) || 0;
    }
    return parseFloat(sVal) || 0;
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
        <div className="invoice-title-group">
          <h3 className="invoice-title">RESUMEN DE PROFORMA</h3>
          <p className="invoice-subtitle">Confirme los valores antes de finalizar el registro.</p>
        </div>
      </div>
      
      <div className="invoice-info-grid">
        <div className="invoice-grid-item">
          <label>Paciente</label>
          <span className="bold uppercase">{(formData.nombre_paciente || "No asignado").toUpperCase()}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Seguro / Pagador</label>
          <span className="uppercase">{(formData.nombre_seguro || "Particular").toUpperCase()}</span>
        </div>
        <div className="invoice-grid-item">
          <label>Clínica / Centro</label>
          <span className="uppercase">{(formData.nombre_clinica || "No especificada").toUpperCase()}</span>
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
                    <div className="sku-text">SKU: {item.sku || 'N/A'}</div>
                    <div className="product-name">{(item.descripcion || item.producto || "").toUpperCase()}</div>
                    <div className="brand-text" style={{fontSize: '0.7rem', color: '#64748b', marginTop: '2px'}}>
                      MARCA: {(item.marca || 'N/A').toUpperCase()}
                    </div>
                  </td>
                  <td className="text-right font-mono">
                    {qty.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right font-mono">{formatNum(price)}</td>
                  <td className="text-right font-mono">{formatNum(itemSubtotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="invoice-footer-layout">
        <div className="invoice-notes-section">
          {formData.notas && formData.notas.trim() !== "" ? (
            <div className="notes-content">
              <label className="notes-label">NOTAS / OBSERVACIONES:</label>
              <p className="notes-text">{(formData.notas).toUpperCase()}</p>
            </div>
          ) : (
            <div className="notes-placeholder">Sin observaciones adicionales.</div>
          )}
        </div>

        <div className="invoice-totals-section">
          <div className="invoice-total-row">
            <span>Subtotal Bruto</span>
            <span className="font-mono">{formatNum(subtotalBruto)}</span>
          </div>

          <div className="invoice-total-row invoice-grand-total">
            <span className="bold">TOTAL</span>
            <div className="invoice-amount-large font-mono">
              {formatNum(totalFinal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepConfirm;