import React from 'react';
import '../../../../styles/ui/stepsSales/StepConfirm.css';

const StepConfirm = ({ formData, items, totals }) => {
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "" || val === false) return 0;
    if (typeof val === "number") return val;
    let sVal = String(val);
    const cleanVal = sVal.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
  };

  const currentDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
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
  const impuesto = safeParse(totals.impuesto); 
  const totalConImpuesto = safeParse(totals.total);
  const abono = safeParse(totals.abonado);
  const saldoPendiente = totalConImpuesto - abono;

  return (
    <div className="stconf-v2-container">
      
      <div className="stconf-v2-header">
        <h3>Resumen de la Venta</h3>
        <p>Verifique la información antes de finalizar el registro.</p>
      </div>
      
      <div className="stconf-v2-summary-grid">
        <div className="stconf-v2-info-card">
          <label>Factura N°</label>
          <span>{formData.nro_factura || "PENDIENTE"}</span>
        </div>
        <div className="stconf-v2-info-card">
          <label>Paciente</label>
          <span>{formData.nombre_paciente || "-"}</span>
        </div>
        <div className="stconf-v2-info-card">
          <label>Vendedor</label>
          <span>{formData.nombre_vendedor || "-"}</span>
        </div>
        <div className="stconf-v2-info-card">
          <label>Clínica / Ubicación</label>
          <span className="stconf-v2-text-truncate">
            {formData.nombre_clinica || "-"} <small>({formData.nombre_oficina})</small>
          </span>
        </div>
        <div className="stconf-v2-info-card">
          <label>Depósito Salida</label>
          <span>{formData.nombre_deposito || "-"}</span>
        </div>
        <div className="stconf-v2-info-card">
          <label>Fecha Registro</label>
          <span>{currentDate()}</span>
        </div>
      </div>

      {formData.personal_asignado && formData.personal_asignado.length > 0 && (
        <div className="stconf-v2-staff-box">
          <h4 className="stconf-v2-sub-title">Personal Asignado / Médicos</h4>
          <div className="stconf-v2-staff-grid">
            {formData.personal_asignado.map((p, i) => (
              <div key={i} className="stconf-v2-staff-item">
                <div className="stconf-v2-avatar">{p.nombre.charAt(0)}</div>
                <div className="stconf-v2-staff-details">
                  <p className="stconf-v2-staff-name">{p.nombre}</p>
                  <p className="stconf-v2-staff-role">{p.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stconf-v2-header" style={{ marginTop: '30px' }}>
        <h3>Detalle de Productos</h3>
      </div>
      
<div className="stconf-v2-table-area">
  <table className="stconf-v2-table">
    <thead>
      <tr>
        <th className="stconf-v2-txt-left">Descripción</th>
        <th className="stconf-v2-txt-center">Cant.</th>
        <th className="stconf-v2-txt-center">Precio</th>
        <th className="stconf-v2-txt-center">Total</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, index) => {
        const qty = safeParse(item.cantidad);
        const price = safeParse(item.precio_venta);
        const itemSubtotal = qty * price;

        return (
          <tr key={index}>
            <td className="stconf-v2-td-desc">
              <span className="stconf-v2-sku-tag">{item.sku}</span>
              <span className="stconf-v2-item-text">{item.descripcion}</span>
            </td>
            <td className="stconf-v2-txt-center">{qty}</td>
            <td className="stconf-v2-txt-center">{formatNum(price)}</td>
            <td className="stconf-v2-txt-center">{formatNum(itemSubtotal)}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

      <div className="stconf-v2-totals-box">
        <div className="stconf-v2-row">
          <span>Subtotal</span>
          <span className="stconf-v2-val-bold">{formatNum(subtotalBruto)}</span>
        </div>

        <div className="stconf-v2-row">
          <span>Impuestos</span>
          <span className="stconf-v2-val-bold">+ {formatNum(impuesto)}</span>
        </div>

        <div className="stconf-v2-row stconf-v2-main-total">
          <span className="stconf-v2-label-lg">TOTAL VENTA</span>
          <span className="stconf-v2-amount-lg">$ {formatNum(totalConImpuesto)}</span>
        </div>

        <div className="stconf-v2-row stconf-v2-paid-row">
          <span>Monto Abonado</span>
          <span className="stconf-v2-paid-val">- {formatNum(abono)}</span>
        </div>

        <div className="stconf-v2-row stconf-v2-balance-row">
          <span>Saldo Final</span>
          <span className={saldoPendiente > 0.01 ? 'stconf-v2-pending' : 'stconf-v2-ok'}>
            $ {formatNum(saldoPendiente)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepConfirm;