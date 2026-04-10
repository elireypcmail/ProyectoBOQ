import React, { useState, useEffect } from "react";
import {
  X, Trash2, Edit3, CheckCircle2, Loader2, Clipboard, CreditCard
} from "lucide-react";
import { useIncExp } from "../../../context/IncExpContext";
import ModalConfirmSale from "./ModalConfirmSale";
import PaymentsDetailModal from "./PaymentsDetailModal";
import "../../../styles/ui/SalesDetailModal.css";

const SaleDetailModal = ({ isOpen, sale, onClose, onEdit }) => {
  const { confirmSale, getAllSales, deleteSaleById, sales } = useIncExp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModalResult, setShowModalResult] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: "", message: "", type: "success" });
  
  // 🔥 ESTADO SOLO PARA EL ABONO (Sincronización reactiva)
  const [currentAbonado, setCurrentAbonado] = useState(sale?.abonado || 0);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);

  // 🔄 Sincronizar abono cuando se abre el modal o cambia la lista global de ventas
  useEffect(() => {
    if (isOpen && sale?.id) {
      const updatedSale = sales?.find(s => s.id === sale.id);
      setCurrentAbonado(updatedSale ? updatedSale.abonado : sale.abonado);
    }
  }, [sales, isOpen, sale]);

  if (!isOpen || !sale) return null;

  // --- LÓGICA DE ESTADO ---
  const isActive = sale.estatus !== false;
  const isPending = sale.estado_venta?.toLowerCase() === "pendiente";
  const canModify = isActive && isPending;

  // Cálculos dinámicos basados en el abono actualizado
  const totalNeto = Number(sale.total || 0);
  const saldoPendiente = totalNeto - Number(currentAbonado || 0);
  const esPagado = saldoPendiente <= 0.01;

  // --- HELPERS ---
  const formatNum = (val) => {
    return Number(val || 0).toLocaleString('es-ES', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  // --- ACCIONES ---
  const handleConfirm = async () => {
    if (!canModify) return;
    
    setIsProcessing(true);
    
    try {
      const res = await confirmSale(sale.id);
      console.log("Respuesta del servidor:", res);

      // Verificamos el status que definimos en el backend
      if (res.status) {
        setModalConfig({
          title: "VENTA CONFIRMADA",
          message: res.msg || "EL INVENTARIO SE HA ACTUALIZADO CORRECTAMENTE.",
          type: "success",
        });
        setShowModalResult(true);
        
        // Refrescar la lista de ventas si la función existe
        if (getAllSales) await getAllSales();
        
      } else {
        // Corregido: message ahora recibe el string directamente
        setModalConfig({ 
          title: "ERROR AL CONFIRMAR", 
          message: res.msg || "NO SE PUDO COMPLETAR LA OPERACIÓN.", 
          type: "error" 
        });
        setShowModalResult(true);
      }
    } catch (error) {
      console.error("Error en handleConfirm:", error);
      setModalConfig({ 
        title: "ERROR DE RED", 
        message: "HUBO UN FALLO AL COMUNICAR CON EL SERVIDOR.", 
        type: "error" 
      });
      setShowModalResult(true);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDelete = async () => {
    if (!canModify || !window.confirm("¿Desea eliminar esta venta permanentemente?")) return;
    setIsProcessing(true);
    try {
      const res = await deleteSaleById(sale.id);
      if (res.status || res.code === 200) {
        onClose();
        if (getAllSales) await getAllSales();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="sdm-overlay">
      <div className="sdm-modal-container">
        <button className="sdm-close-floating" onClick={onClose}><X size={20} /></button>

        <div className="sdm-invoice-paper">
          <div className="sdm-invoice-top-header">
            <div className="invoice-brand">
              <h2 className="sdm-main-title">DETALLE DE VENTA</h2>
              <p className="sdm-brand-sub">Ref: #{sale.id}</p>
            </div>
            <div className="sdm-meta-top">
              <p><strong>Factura:</strong> {sale.nro_factura || "PENDIENTE"}</p>
              <p><strong>Fecha:</strong> {formatDate(sale.fecha_creacion)}</p>
            </div>
          </div>

          <div className="sdm-invoice-client-row">
            <div className="client-info">
              <label>Factura a:</label>
              <h4>{sale.paciente_nombre || "Paciente General"}</h4>
              <p>Seguro: {sale.seguro_nombre || "N/A"}</p>
            </div>
            <div className="status-info">
              <div className={`sdm-badge ${!isActive ? "cancelled" : isPending ? "pending" : "confirmed"}`}>
                {!isActive ? "ANULADA" : isPending ? "PENDIENTE" : "CONFIRMADA"}
              </div>
              <div className={`sdm-badge ${esPagado ? "paid" : "unpaid"}`}>
                {esPagado ? "PAGADO" : "SALDO PENDIENTE"}
              </div>
            </div>
          </div>

          <div className="sdm-table-wrapper">
            <table className="sdm-invoice-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th className="text-right">Cant.</th>
                  <th className="text-right">Precio</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(sale.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="item-name">{item.producto}</div>
                      <div className="item-sku">SKU: {item.sku || "N/A"}</div>
                    </td>
                    <td className="text-right">{parseFloat(item.cantidad)}</td>
                    <td className="text-right font-mono">$ {formatNum(item.precio_venta)}</td>
                    <td className="text-right font-mono">$ {formatNum(item.cantidad * item.precio_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sdm-invoice-footer-grid">
            <div className="sdm-footer-left">
              {sale.personal?.length > 0 && (
                <div className="sdm-staff-box">
                  <p className="sdm-section-label">Personal Asignado</p>
                  {sale.personal.map((p, i) => (
                    <p key={i} className="staff-item">
                      <strong>{p.tipo_medico}:</strong> {p.medico}
                    </p>
                  ))}
                </div>
              )}
              {sale.notas_abono && (
                <div className="sdm-notes-box">
                  <p className="sdm-section-label"><Clipboard size={12} /> Notas</p>
                  <p className="notes-text">{sale.notas_abono}</p>
                </div>
              )}
            </div>

            <div className="sdm-totals-box">
              <div className="sdm-total-row">
                <span>Subtotal</span>
                <span className="font-mono">$ {formatNum(sale.subtotal1)}</span>
              </div>
              <div className="sdm-total-row text-red">
                <span>Descuento ({sale.descuentopor}%)</span>
                <span className="font-mono">-$ {formatNum(sale.descuento)}</span>
              </div>
              <div className="sdm-total-row sdm-grand-total">
                <span className="bold">Total Neto</span>
                <span className="bold amount font-mono">$ {formatNum(totalNeto)}</span>
              </div>
              
              <div className={`sdm-balance-card ${esPagado ? 'bg-green-light' : ''}`}>
                <span className="bold">Saldo Pendiente</span>
                <span className={`bold font-mono ${esPagado ? 'text-green' : 'text-red'}`}>
                  $ {formatNum(saldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer className="sdm-modal-actions">
          <div className="action-group">
            <button className="btn-action btn-payments" onClick={() => setShowPaymentsModal(true)}>
              <CreditCard size={16} /> Ver Pagos
            </button>
            
            {canModify && (
              <>
                <button className="btn-action btn-delete" onClick={handleDelete} disabled={isProcessing}>
                  <Trash2 size={16} /> Eliminar
                </button>
                <button className="btn-action btn-edit" onClick={() => onEdit(sale)} disabled={isProcessing}>
                  <Edit3 size={16} /> Editar
                </button>
              </>
            )}
          </div>
          <div className="action-group">
            <button className="btn-action btn-close" onClick={onClose}>Cerrar</button>
            {canModify && (
              <button className="btn-action btn-confirm" onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="sdm-spin" size={16} /> : <CheckCircle2 size={16} />}
                Confirmar Transacción
              </button>
            )}
          </div>
        </footer>
      </div>

      <ModalConfirmSale
        isOpen={showModalResult}
        onClose={() => {
          setShowModalResult(false);
          if (modalConfig.type === "success") onClose();
        }}
        {...modalConfig}
      />

      <PaymentsDetailModal 
        isOpen={showPaymentsModal} 
        onClose={() => setShowPaymentsModal(false)} 
        sale={sale} 
      />
    </div>
  );
};

export default SaleDetailModal;