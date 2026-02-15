import React from "react";
import '../../../../styles/ui/steps/StepTotals.css';

const StepTotals = ({ totals, setTotals }) => {
  
  // --- HELPERS DE REDONDEO Y FORMATO ---

  const round2 = (num) => {
    return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Helper para tratar inputs vacíos como 0 en cálculos
  const safeParse = (val) => parseFloat(val) || 0;

  // --- LÓGICA DE CÁLCULO ---

  // Calcula el porcentaje que representa el TOTAL de descuentos sobre el subtotal
  const calculateTotalDiscountPercentage = () => {
    const subtotal = safeParse(totals.subtotal);
    if (subtotal <= 0) return "0.00";
    
    // Sumamos descuento por items + descuento fijo manual
    const totalDescontado = safeParse(totals.monto_descuento_items) + safeParse(totals.monto_descuento_fijo);
    
    const percentage = (totalDescontado / subtotal) * 100;
    return percentage.toFixed(2);
  };

  const calculateCargoPercentage = () => {
    const baseEfectiva = (totals.subtotal || 0) - (totals.monto_descuento_items || 0);
    if (baseEfectiva <= 0) return "0.00";
    const percentage = (safeParse(totals.cargos_monto) / baseEfectiva) * 100;
    return percentage.toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 1. Limite de caracteres general
    if (value.length > 12) return;

    // 2. Permitir borrar el input completo
    if (value === "") {
      setTotals((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // 3. VALIDACIÓN DE DECIMALES (Regex)
    // Solo permite números positivos con máximo 2 decimales
    // Explicación: ^\d* (dígitos inicio) \.? (punto opcional) \d{0,2} (0 a 2 dígitos decimales) $ (fin)
    const regex = /^\d*\.?\d{0,2}$/;
    
    if (regex.test(value)) {
        let finalValue = value; // Mantenemos el string para permitir escribir "10."
        const numValue = parseFloat(value);

        // 4. VALIDACIÓN DE TOPES MÁXIMOS

        // A) Descuento Fijo
        if (name === "monto_descuento_fijo") {
            const baseNetoItems = (totals.subtotal || 0) - (totals.monto_descuento_items || 0);
            const cargos = safeParse(totals.cargos_monto);
            // El descuento no puede ser mayor a lo que se debe cobrar antes del descuento manual
            const maximoDisponible = round2(baseNetoItems + cargos);
            
            if (numValue > maximoDisponible) {
                finalValue = maximoDisponible.toString(); // Forzamos el tope
            }
        }

        // B) Monto Abonado
        if (name === "monto_abonado") {
            // El abono no puede superar el Total de la factura
            const totalActual = round2(totals.total || 0);
            
            if (numValue > totalActual) {
                finalValue = totalActual.toString(); // Forzamos el tope
            }
        }

        // Actualizamos el estado con el valor validado
        setTotals((prev) => ({ ...prev, [name]: finalValue }));
    }
    // Si no pasa el regex (ej: usuario intenta escribir 3 decimales), no hace nada.
  };

  // --- VALORES PARA EL RESUMEN ---
  const subtotalBruto = round2(totals.subtotal || 0);
  const cargosAdicionales = round2(safeParse(totals.cargos_monto));
  const descPorItems = round2(totals.monto_descuento_items || 0);
  const descFijoManual = round2(safeParse(totals.monto_descuento_fijo));
  
  // Total de descuentos acumulados
  const totalTodosLosDescuentos = round2(descPorItems + descFijoManual);
  
  const totalFactura = round2(totals.total || 0);
  const montoAbonado = round2(safeParse(totals.monto_abonado));
  const saldoPendiente = round2(totalFactura - montoAbonado);

  return (
    <div className="ptotals-container">
      <div className="ptotals-header">
        <h3>Finalizar Compra</h3>
        <p>Revisión de Costos, Pagos y Cargos</p>
      </div>

      <div className="ptotals-main-grid">
        <div className="ptotals-column">
          
          <div className="ptotals-card ptotals-card-discount">
            <h4 className="ptotals-card-title">💰 Descuentos y Pagos</h4>
            
            {/* Solo mostramos el input de Monto Fijo */}
            <div className="ptotals-group">
              <label className="ptotals-label">Descuento</label>
              <input
                type="number"
                name="monto_descuento_fijo"
                placeholder="0.00"
                step="0.01"
                value={totals.monto_descuento_fijo === 0 || totals.monto_descuento_fijo === "0" ? "" : totals.monto_descuento_fijo}
                onChange={handleInputChange}
                className="ptotals-input ptotals-input-success"
              />
              <small style={{ color: "#64748b", fontSize: "0.7rem" }}>
                Ingrese el monto directo a descontar.
              </small>
            </div>

            <div className="ptotals-group" style={{ marginTop: '15px' }}>
              <label className="ptotals-label">Monto Abonado</label>
              <input
                type="number"
                name="monto_abonado"
                placeholder="0.00"
                step="0.01"
                value={totals.monto_abonado === 0 || totals.monto_abonado === "0" ? "" : totals.monto_abonado}
                onChange={handleInputChange}
                className="ptotals-input"
                style={{ border: '1px solid #3b82f6' }}
              />
              <small style={{ color: "#64748b", fontSize: "0.7rem" }}>
                * Máximo permitido: $ {formatCurrency(totalFactura)}
              </small>
            </div>
          </div>

          <div className="ptotals-card ptotals-card-logistics">
            <h4 className="ptotals-card-title">🚚 Logística y Cargos</h4>
            <div className="ptotals-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label className="ptotals-label" style={{ margin: 0 }}>Cargo Adicional</label>
              </div>
              <input
                type="number"
                name="cargos_monto"
                placeholder="0.00"
                step="0.01"
                value={totals.cargos_monto === 0 || totals.cargos_monto === "0" ? "" : totals.cargos_monto}
                onChange={handleInputChange}
                className="ptotals-input"
              />
            </div>
          </div>
        </div>

        <div className="ptotals-column">
          <div className="ptotals-card ptotals-card-summary">
            <h4 className="ptotals-card-title">Resumen de Factura</h4>
            
            <div className="ptotals-summary-row">
              <span>Subtotal Bruto</span>
              <span>$ {formatCurrency(subtotalBruto)}</span>
            </div>

            <div className="ptotals-summary-row">
              <span>Cargos Adicionales ( {calculateCargoPercentage()} % )</span>
              <span className="ptotals-value-blue">+ $ {formatCurrency(cargosAdicionales)}</span>
            </div>

            <div className="ptotals-summary-row" style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Título modificado para mostrar el porcentaje calculado */}
                <span>Descuentos ( {calculateTotalDiscountPercentage()}% )</span>
                {descPorItems > 0 && (
                  <small style={{ fontSize: '0.65rem', color: '#64748b' }}>Incluye desc. por productos</small>
                )}
              </div>
              <span className="ptotals-value-red">
                - $ {formatCurrency(totalTodosLosDescuentos)}
              </span>
            </div>

            <div className="ptotals-footer">
              <div className="ptotals-footer-top">
                <span className="ptotals-total-text">Total Factura</span>
                <span className="ptotals-currency">USD</span>
              </div>
              <div className="ptotals-grand-total">{formatCurrency(totalFactura)}</div>
            </div>

            <div className="ptotals-summary-row" style={{ marginTop: '10px' }}>
              <span>Abonado</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>- $ {formatCurrency(montoAbonado)}</span>
            </div>

            <div className="ptotals-summary-row" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <span>Saldo Pendiente</span>
              <span style={{ color: saldoPendiente > 0 ? '#ef4444' : '#1e293b' }}>
                $ {formatCurrency(saldoPendiente)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTotals;