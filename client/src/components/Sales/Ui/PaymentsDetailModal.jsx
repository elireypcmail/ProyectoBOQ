import React, { useEffect, useState } from 'react';
import { Loader2, Plus, CheckCircle2 } from 'lucide-react';
import { useSales } from '../../../context/SalesContext';
import { useIncExp } from '../../../context/IncExpContext';
import PaymentsFormModal from './PaymentsFormModal';
import "../../../styles/ui/PaymentsModalDetailed.css";

const PaymentsDetailModal = ({ isOpen, onClose, sale }) => {
  const { getPaymentById, payments } = useSales();
  const { getAllSales } = useIncExp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 🔥 ESTADO LOCAL (CLAVE DEL FIX)
  const [localSale, setLocalSale] = useState(sale);

  // 🔄 sincroniza cuando cambia el prop
  useEffect(() => {
    setLocalSale(sale);
  }, [sale]);

  // ✅ cálculo con estado local
  const isFullyPaid =
    Number(localSale?.abonado || 0) >= Number(localSale?.total || 0);

  const salePayments = payments.filter(
    (p) => p.id_venta === localSale?.id
  );

  const fetchPayments = async () => {
    if (!localSale?.id) return;

    setIsLoading(true);
    setError(null);

    await getPaymentById(localSale.id);

    // 🔥 refrescar ventas y actualizar SOLO esta venta
    if (getAllSales) {
      const updatedSales = await getAllSales();

      const updatedSale = updatedSales?.find(
        (s) => s.id === localSale.id
      );

      if (updatedSale) {
        setLocalSale(updatedSale);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && sale?.id) {
      fetchPayments();
    } else {
      setError(null);
    }
  }, [isOpen, sale?.id]);

  if (!isOpen || !localSale) return null;

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
    });

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("es-ES") : "-";

  return (
    <div className="paydm-overlay">
      <div className="paydm-container">
        <header className="paydm-header">
          <div className="paydm-title-group">
            <h2>HISTORIAL DE PAGOS</h2>
            <span>Venta Ref: #{localSale.id}</span>
          </div>

          <button
            className={`paydm-btn-add ${isFullyPaid ? 'paydm-btn-disabled' : ''}`}
            onClick={() => !isFullyPaid && setShowForm(true)}
            disabled={isFullyPaid}
          >
            {isFullyPaid ? (
              <><CheckCircle2 size={16} /> Pago Completado</>
            ) : (
              <><Plus size={16} /> Registrar Pago</>
            )}
          </button>
        </header>

        <div className="paydm-body">
          {/* 🔥 RESUMEN DINÁMICO */}
          <div style={{
            marginBottom: '15px',
            padding: '12px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: isFullyPaid ? '#f0fdf4' : '#f8fafc'
          }}>
            <p><strong>Total:</strong> $ {formatAmount(localSale.total)}</p>
            <p><strong>Abonado:</strong> $ {formatAmount(localSale.abonado)}</p>
            <p style={{ fontWeight: 'bold' }}>
              {isFullyPaid
                ? 'TOTALMENTE PAGADO'
                : `Pendiente: $ ${formatAmount(
                    Number(localSale.total) - Number(localSale.abonado)
                  )}`}
            </p>
          </div>

          <table className="paydm-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Notas</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && salePayments.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 className="sdm-spin" />
                  </td>
                </tr>
              ) : salePayments.length === 0 ? (
                <tr>
                  <td colSpan="3">No hay pagos</td>
                </tr>
              ) : (
                salePayments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.fecha_pago)}</td>
                    <td>{p.notas}</td>
                    <td style={{ textAlign: 'right' }}>
                      $ {formatAmount(p.monto)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="paydm-footer">
          <button className='btn-action btn-close' onClick={onClose}>Cerrar</button>
        </footer>
      </div>

      {/* 🔥 FORM CON UPDATE INMEDIATO */}
      <PaymentsFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        sale={localSale}
        onSuccess={(newPayment) => {
          // ⚡ actualización instantánea (UX PRO)
          setLocalSale((prev) => ({
            ...prev,
            abonado:
              Number(prev.abonado || 0) +
              Number(newPayment.monto),
          }));

          // 🔄 sync real con backend
          fetchPayments();
        }}
      />
    </div>
  );
};

export default PaymentsDetailModal;