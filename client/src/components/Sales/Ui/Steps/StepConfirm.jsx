import React from 'react';
import '../../../../styles/ui/steps/StepSalesConfirm.css';

const StepConfirm = ({ formData, items, totals }) => {
  
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return val;
    const normalized = String(val).replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const formatNum = (val) => {
    return Number(val || 0).toLocaleString('de-DE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const currentDate = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const subtotalBruto = safeParse(totals.subtotal);
  const impuestos = safeParse(totals.impuestos_monto);
  const descFijo = safeParse(totals.monto_descuento_fijo);
  const abono = safeParse(totals.monto_abonado);

  const totalFactura = subtotalBruto - descFijo;
  const totalConImpuestos = totalFactura + impuestos;
  const saldoPendiente = totalConImpuestos - abono;

  return (
    <div className="invoice-container">
      {/* HEADER SUPERIOR */}
      <div className="invoice-top-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <div className="invoice-brand">
          <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: '-1px' }}>RESUMEN</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{formData.nombre_clinica || "Sistema Médico"}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#334155' }}>
          <p style={{ margin: 0 }}>{formData.nombre_oficina}</p>
          <p style={{ margin: 0 }}>Vendedor: {formData.nombre_vendedor}</p>
        </div>
      </div>

      {/* SECCIÓN CLIENTE Y DATOS FACTURA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        <div className="invoice-client-info" style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Factura a:</label>
          <h4 style={{ margin: '5px 0', fontSize: '1.1rem' }}>{formData.nombre_paciente || "Paciente General"}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Depósito: {formData.nombre_deposito}</p>
        </div>
        
        <div className="invoice-meta-info" style={{ textAlign: 'right', flex: 1 }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Factura:</span>
            <span style={{ marginLeft: '10px', minWidth: '80px', display: 'inline-block' }}>{formData.nro_factura || "PENDIENTE"}</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 500 }}>Fecha:</span>
            <span style={{ marginLeft: '10px', minWidth: '80px', display: 'inline-block' }}>{currentDate()}</span>
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="invoice-table-container" style={{ marginTop: '40px' }}>
        <table className="invoice-items-table" style={{ borderTop: '2px solid #334155' }}>
          <thead>
            <tr>
              <th className="text-left" style={{ padding: '15px 10px' }}>Descripción</th>
              <th className="text-right" style={{ padding: '15px 10px' }}>Cantidad</th>
              <th className="text-right" style={{ padding: '15px 10px' }}>Precio</th>
              <th className="text-right" style={{ padding: '15px 10px' }}>Total</th>
            </tr>
          </thead>
          <tbody style={{ borderBottom: '1px solid #e2e8f0' }}>
            {items.map((item, index) => {
              const qty = safeParse(item.cantidad);
              const price = safeParse(item.precio_venta);
              return (
                <tr key={index}>
                  <td style={{ padding: '15px 10px' }}>
                    <div className="bold">{item.descripcion}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SKU: {item.sku}</div>
                  </td>
                  <td className="text-right font-mono" style={{ padding: '15px 10px' }}>{qty}</td>
                  <td className="text-right font-mono" style={{ padding: '15px 10px' }}>{formatNum(price)}</td>
                  <td className="text-right font-mono" style={{ padding: '15px 10px' }}>{formatNum(qty * price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN INFERIOR: PERSONAL Y TOTALES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <div style={{ flex: 1.5 }}>
          {formData.personal_asignado && formData.personal_asignado.length > 0 && (
            <div style={{ paddingRight: '40px' }}>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
                Personal Asignado
              </p>
              {formData.personal_asignado.map((p, i) => (
                <p key={i} style={{ fontSize: '0.8rem', margin: '3px 0' }}>
                  <strong>{p.tipo}:</strong> {p.nombre}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* TOTALES */}
        <div className="invoice-totals-section" style={{ flex: 1 }}>
          <div className="invoice-total-row">
            <span style={{ color: '#64748b' }}>Subtotal sin impuestos</span>
            <span className="font-mono">{formatNum(subtotalBruto)}</span>
          </div>
          <div className="invoice-total-row">
            <span style={{ color: '#64748b' }}>Descuento</span>
            <span className="font-mono text-red">-{formatNum(descFijo)}</span>
          </div>
          <div className="invoice-total-row">
            <span style={{ color: '#64748b' }}>Impuestos</span>
            <span className="font-mono">{formatNum(impuestos)}</span>
          </div>
          <div className="invoice-total-row invoice-grand-total" style={{ borderTop: '1px solid #334155', marginTop: '10px', paddingTop: '10px' }}>
            <span className="bold">Total</span>
            <span className="bold invoice-amount-large font-mono">{formatNum(totalConImpuestos)}</span>
          </div>
          <div className="invoice-total-row" style={{ marginTop: '10px' }}>
            <span style={{ color: '#64748b' }}>Importe pagado</span>
            <span className="font-mono">{formatNum(abono)}</span>
          </div>
          <div className="invoice-total-row" style={{ marginTop: '10px', background: '#f8fafc', padding: '10px' }}>
            <span className="bold">Saldo pendiente</span>
            <span className={`bold font-mono ${saldoPendiente > 0.01 ? 'text-red' : 'text-green'}`}>
              $ {formatNum(saldoPendiente)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepConfirm;