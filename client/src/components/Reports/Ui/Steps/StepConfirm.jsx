import React from 'react';
import '../../../../styles/ui/steps/StepSalesConfirm.css';

const StepConfirm = ({ formData, items }) => {
  
  // Función simple para parsear cantidades
  const safeParseQty = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val);
    const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header-section">
        <h3 className="invoice-title">Resumen del Reporte</h3>
        <p className="invoice-subtitle">Revise los insumos y el personal asignado antes de finalizar.</p>
      </div>
      
      <div className="invoice-info-grid">
        <div className="invoice-grid-item">
          <label>Paciente</label>
          <span className="bold">{formData.nombre_paciente || "No asignado"}</span>
        </div>
        
        <div className="invoice-grid-item col-span-2">
          <label>Equipo Médico Asignado</label>
          <div className="confirm-doctors-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
            {formData.personal_asignado?.length > 0 ? (
              formData.personal_asignado.map((doc) => (
                <span key={doc.id} style={{ 
                  fontSize: '0.75rem', 
                  backgroundColor: '#f1f5f9', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0'
                }}>
                  {doc.nombre} ({doc.tipo})
                </span>
              ))
            ) : (
              <span className="text-muted">Sin personal asignado</span>
            )}
          </div>
        </div>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th className="text-left">Descripción de Insumos</th>
              <th className="text-right" style={{ width: '120px' }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = safeParseQty(item.cantidad);
              
              return (
                <tr key={index}>
                  <td className="desc">
                    <div className="sku-text">{item.sku || "S/C"}</div>
                    {item.descripcion || item.producto}
                  </td>
                  <td className="text-right font-mono" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {qty.toLocaleString('de-DE', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sección de totales eliminada o convertida en conteo simple si se desea */}
      {/* <div className="invoice-totals-section">
        <div className="invoice-total-row">
          <span>Total de Ítems</span>
          <span className="font-mono">{items.length}</span>
        </div>
      </div> */}
    </div>
  );
};

export default StepConfirm;