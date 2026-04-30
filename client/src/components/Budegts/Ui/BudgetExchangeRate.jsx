import React, { useState, useEffect } from 'react';
import { X, Calculator, ArrowRight, Loader2 } from 'lucide-react';
import { useSales } from "../../../context/SalesContext";

const BudgetExchangeRate = ({ isOpen, onClose, onConfirm, budgetId, currentTasa }) => {
  const { exportBudgetToPDF } = useSales();
  const [moneda, setMoneda] = useState('USD');
  const [loading, setLoading] = useState(false);

  // 1. Definimos tasaOriginal al inicio para que sea accesible en todo el componente
  const tasaOriginal = parseFloat(currentTasa) || 0;

  // 2. Corregido: Solo una declaración de estado para 'tasa'
  const [tasa, setTasa] = useState(
    currentTasa ? currentTasa.toString().replace('.', ',') : ''
  );

  // 3. Obtener usuario de forma segura
  const user = JSON.parse(localStorage.getItem("UserId") || "{}");

  useEffect(() => {
    if (currentTasa) {
      setTasa(currentTasa.toString().replace('.', ','));
    }
  }, [currentTasa]);

  const handleInputChange = (e) => {
    // Reemplazamos puntos por comas para el formato visual
    let val = e.target.value.replace(/\./g, ',');
    // Validamos que sea un número con hasta 2 decimales
    const regex = /^\d*,?\d{0,2}$/;
    if (val === '' || regex.test(val)) {
      setTasa(val);
    }
  };

  const handleProcess = async () => {
    const tasaNumerica = parseFloat(tasa.replace(',', '.'));

    // Validación básica para BS
    if ((moneda === 'BS' || moneda === 'AMBOS') && (!tasaNumerica || tasaNumerica <= 0)) {
      alert("Por favor ingrese una tasa de cambio válida.");
      return;
    }

    // Si la tasa no ha cambiado, cerramos y confirmamos (evitamos llamada innecesaria al backend)
    if (tasaNumerica === tasaOriginal) {
      onConfirm({ moneda, tasa: tasaNumerica });
      return;
    }

    setLoading(true);
    try {
      // Registramos el cambio de tasa en el backend
      await exportBudgetToPDF(budgetId, {
        tasa: tasaNumerica,
        id_usuario: user.id
      });

      onConfirm({ moneda, tasa: tasaNumerica });
    } catch (error) {
      console.error("Error al registrar exportación:", error);
      alert("Error al procesar la exportación");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sdm-overlay" style={{ zIndex: 1100, backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="sdm-modal-container" style={{ maxWidth: '400px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 className="bold" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Calculator size={18} /> Configurar Exportación
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label className="sdm-section-label">Seleccione Moneda:</label>
            <select 
              className="sdm-input" 
              value={moneda} 
              onChange={(e) => setMoneda(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', marginTop: '5px' }}
            >
              <option value="USD">Solo Dólares (USD)</option>
              <option value="BS">Solo Bolívares (BS)</option>
              <option value="AMBOS">Ambas Monedas (USD + BS)</option>
            </select>
          </div>

          {(moneda === 'BS' || moneda === 'AMBOS') && (
            <div style={{ marginTop: '5px' }}>
              <label className="sdm-section-label">Tasa de Cambio (BCV):</label>
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <input 
                  type="text" 
                  inputMode="decimal"
                  className="sdm-input"
                  value={tasa}
                  onChange={handleInputChange}
                  placeholder="0,00"
                  style={{ width: '100%', padding: '8px 8px 8px 30px', borderRadius: '6px' }}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#666' }}>Bs</span>
              </div>
              <small style={{ color: '#666', fontSize: '11px', marginTop: '8px', display: 'block' }}>
                {tasaOriginal > 0 
                  ? `Tasa actual registrada: ${tasaOriginal.toString().replace('.', ',')}` 
                  : "No hay tasa registrada para este presupuesto."}
              </small>
            </div>
          )}

          <button 
            className="btn-action btn-confirm" 
            onClick={handleProcess}
            disabled={loading}
            style={{ 
              width: '100%', 
              marginTop: '10px', 
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {loading ? <Loader2 className="v-spin" size={16} /> : <ArrowRight size={16} />}
            Confirmar y Exportar
          </button>
        </div>
      </div>
    </div>
  );
}

export default BudgetExchangeRate;