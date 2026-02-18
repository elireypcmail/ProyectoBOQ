import React from "react";
import '../../../../styles/ui/steps/StepTotals.css';

const StepTotals = ({ totals, setTotals }) => {
  
  // --- HELPERS (Mantenidos intactos) ---

  const round2 = (num) => {
    return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const safeParse = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    const normalized = String(val).replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const displayValue = (val) => {
    if (val === "" || val === null || val === undefined || parseFloat(val) === 0) {
      return "";
    }
    return String(val).replace('.', ',');
  };

  // --- LÓGICA DE ETIQUETAS ---

  const calculateTotalDiscountPercentage = () => {
    const subtotal = safeParse(totals.subtotal);
    if (subtotal <= 0) return "0,00";
    const totalDescontado = safeParse(totals.monto_descuento_fijo);
    const percentage = (totalDescontado / subtotal) * 100;
    return percentage.toFixed(2).replace('.', ',');
  };

  const calculateCargoPercentage = () => {
    const subtotal = safeParse(totals.subtotal);
    if (subtotal <= 0) return "0,00";
    const percentage = (safeParse(totals.cargos_monto) / subtotal) * 100;
    return percentage.toFixed(2).replace('.', ',');
  };

  // --- LÓGICA DE CÁLCULOS (Ajustada) ---
  const subtotalBruto = safeParse(totals.subtotal);
  const cargosAdicionales = safeParse(totals.cargos_monto);
  const descFijoManual = safeParse(totals.monto_descuento_fijo);
  
  // Lo que es abonable: Subtotal menos el descuento
  const subtotalNetoAbonable = round2(subtotalBruto - descFijoManual);

  // El Total Factura que muestra el diseño (Subtotal + Cargos - Descuento)
  const totalFactura = round2(subtotalBruto - descFijoManual);
  const montoAbonado = safeParse(totals.monto_abonado);
  const saldoPendiente = round2(totalFactura + cargosAdicionales - montoAbonado);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value.length > 12) return;
    if (value === "") {
      setTotals((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    const regex = /^\d*[.,]?\d{0,2}$/;
    if (regex.test(value)) {
        let finalValue = value;
        const numValue = parseFloat(value.replace(',', '.'));

        if (name === "monto_descuento_fijo") {
            const subtotal = safeParse(totals.subtotal);
            if (numValue > subtotal) {
                finalValue = subtotal.toString().replace('.', ',');
            }
        }

        if (name === "monto_abonado") {
            // AJUSTE: El límite ahora es el subtotal neto, no el total con cargos
            if (numValue > subtotalNetoAbonable) {
                finalValue = subtotalNetoAbonable.toString().replace('.', ',');
            }
        }
        setTotals((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  return (
    <div className="ptotals-container">
      <div className="ptotals-header">
        <h3>Finalizar Compra</h3>
        <p>Revisión de Costos, Pagos y Cargos</p>
      </div>

      <div className="ptotals-main-grid">
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="ptotals-column">
          <div className="ptotals-card ptotals-card-discount">
            <h4 className="ptotals-card-title">💰 Descuentos y Pagos</h4>
            <div className="ptotals-group">
              <label className="ptotals-label">Monto de Descuento</label>
              <input
                type="text" 
                name="monto_descuento_fijo"
                placeholder="0,00"
                value={displayValue(totals.monto_descuento_fijo)}
                onChange={handleInputChange}
                className="ptotals-input ptotals-input-success"
              />
              <small style={{ color: "#64748b", fontSize: "0.7rem" }}>
                Monto directo a descontar del total.
              </small>
            </div>

            <div className="ptotals-group" style={{ marginTop: '15px' }}>
              <label className="ptotals-label">Monto Abonado</label>
              <input
                type="text"
                name="monto_abonado"
                placeholder="0,00"
                value={displayValue(totals.monto_abonado)}
                onChange={handleInputChange}
                className="ptotals-input"
                style={{ border: '1px solid #ec3137' }}
              />
              <small style={{ color: "#64748b", fontSize: "0.7rem" }}>
                * Máximo permitido (sin cargos): {formatCurrency(subtotalNetoAbonable)}
              </small>
            </div>
          </div>

          <div className="ptotals-card ptotals-card-logistics">
            <h4 className="ptotals-card-title">🚚 Logística y Cargos</h4>
            <div className="ptotals-group">
              <label className="ptotals-label">Cargo</label>
              <input
                type="text"
                name="cargos_monto"
                placeholder="0,00"
                value={displayValue(totals.cargos_monto)}
                onChange={handleInputChange}
                className="ptotals-input"
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (AJUSTADO A LA IMAGEN) */}
        <div className="ptotals-column">
          <div className="ptotals-card ptotals-card-summary" style={{ padding: '24px' }}>
            <h4 style={{ 
              color: '#64748b', 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '20px' 
            }}>
              Resumen de Factura
            </h4>
            
            <div className="ptotals-summary-row" style={{ marginBottom: '12px' }}>
              <span style={{ color: '#475569', fontSize: '0.95rem' }}>Subtotal</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatCurrency(subtotalBruto)}</span>
            </div>

            <div className="ptotals-summary-row" style={{ marginBottom: '20px' }}>
              <span style={{ color: '#475569', fontSize: '0.95rem' }}>Descuento ( {calculateTotalDiscountPercentage()}% )</span>
              <span style={{ color: '#f43f5e', fontWeight: '500' }}>- {formatCurrency(descFijoManual)}</span>
            </div>

            {/* SECCIÓN TOTAL FACTURA */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>Total Factura</span>
               </div>
               <div style={{ 
                 textAlign: 'right', 
                 fontSize: '2.6rem', 
                 fontWeight: '800', 
                 color: '#ec3137', 
                 lineHeight: '1',
                 marginTop: '4px'
               }}>
                 {formatCurrency(totalFactura)}
               </div>
            </div>

            {/* BLOQUE GRIS: ABONADO Y CARGOS */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              margin: '24px -24px 0 -24px', 
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div className="ptotals-summary-row" style={{ marginBottom: '12px' }}>
                <span style={{ color: '#475569' }}>Abonado</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>- {formatCurrency(montoAbonado)}</span>
              </div>
              <div className="ptotals-summary-row">
                <span style={{ color: '#475569' }}>Cargos ( {calculateCargoPercentage()}% )</span>
                <span style={{ color: '#ec3137', fontWeight: '700' }}>+ {formatCurrency(cargosAdicionales)}</span>
              </div>
            </div>

            {/* SALDO PENDIENTE */}
            <div className="ptotals-summary-row" style={{ marginTop: '20px' }}>
              <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>Total Factura + Cargos</span>
              <span style={{ 
                color: '#ef4444', 
                fontWeight: '800', 
                fontSize: '1.25rem' 
              }}>
                {formatCurrency(saldoPendiente)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTotals;