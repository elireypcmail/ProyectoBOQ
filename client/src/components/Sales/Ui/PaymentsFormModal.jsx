import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useSales } from '../../../context/SalesContext';
import "../../../styles/ui/PaymentsFormModal.css";

const PaymentsFormModal = ({ isOpen, onClose, sale, onSuccess }) => {
  const { createNewPayment } = useSales();
  const [loading, setLoading] = useState(false);
  
  // Fecha actual para restringir el calendario
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    monto: '',
    notas: '',
    fecha_pago: today
  });

  if (!isOpen) return null;

  // Cálculo preciso del saldo pendiente
  const saldoPendiente = Number(sale?.total || 0) - Number(sale?.abonado || 0);

  const handleMontoChange = (e) => {
    let value = e.target.value;

    // 1. Limitar a 2 decimales (usando punto como separador interno del input number)
    if (value.includes('.')) {
      const [entero, decimal] = value.split('.');
      if (decimal && decimal.length > 2) {
        value = `${entero}.${decimal.slice(0, 2)}`;
      }
    }

    // 2. Impedir montos superiores al saldo pendiente
    if (Number(value) > saldoPendiente) {
      value = saldoPendiente.toFixed(2);
    }

    setFormData({ ...formData, monto: value });
  };

  const handleNotasChange = (e) => {
    // 3. Conversión forzada a MAYÚSCULAS
    setFormData({ ...formData, notas: e.target.value.toUpperCase() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones preventivas
    const montoNum = parseFloat(formData.monto);
    if (!formData.monto || montoNum <= 0) {
      return alert("Por favor, ingrese un monto válido mayor a 0.");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        id_venta: sale.id,
        monto: montoNum
      };

      const res = await createNewPayment(payload);
      
      if (res.status || res.code === 200) {
        // Ejecuta la actualización de datos en los modales padres
        if (onSuccess) await onSuccess(payload); 
        
        // Limpiar formulario y cerrar
        setFormData({ monto: '', notas: '', fecha_pago: today });
        onClose();
      } else {
        alert(res.msg || "Error al registrar el pago");
      }
    } catch (error) {
      console.error("Error en el registro de pago:", error);
      alert("Ocurrió un error inesperado al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payfm-overlay">
      <div className="payfm-card">
        <header className="payfm-header-info">
          <h2 className="payfm-title">NUEVO PAGO</h2>
          <div className="payfm-sale-badge">Ref: #{sale.id}</div>
        </header>

        <div className="payfm-balance-display">
          <span className="payfm-balance-label">Saldo Pendiente:</span>
          <span className="payfm-balance-amount">
            $ {saldoPendiente.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="payfm-form">
          <div className="payfm-group">
            <label className="payfm-label">Fecha de Pago</label>
            <input 
              type="date" 
              className="payfm-input"
              min={today} // Restringe fechas pasadas
              value={formData.fecha_pago}
              onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})}
              required
            />
          </div>

          <div className="payfm-group">
            <label className="payfm-label">Monto a Abonar ($)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0,00"
              className="payfm-input"
              value={formData.monto}
              onChange={handleMontoChange}
              max={saldoPendiente.toFixed(2)}
              required
            />
          </div>

          <div className="payfm-group">
            <label className="payfm-label">Notas / Referencia</label>
            <textarea 
              className="payfm-input payfm-textarea"
              rows="3"
              style={{ textTransform: 'uppercase' }}
              value={formData.notas}
              onChange={handleNotasChange}
              placeholder="EJ: TRANSFERENCIA, EFECTIVO, NRO. DE COMPROBANTE..."
            />
          </div>

          <div className="payfm-actions">
            <button 
              type="button" 
              className="btn-action btn-close" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="payfm-btn-save" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="sdm-spin" size={18} />
              ) : (
                <>
                  <Save size={18} />
                  Guardar Pago
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentsFormModal;