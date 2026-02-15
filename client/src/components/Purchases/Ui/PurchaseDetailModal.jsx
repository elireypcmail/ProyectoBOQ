import React from "react";
import { X, FileText, Calendar, User, Clock } from "lucide-react";

const PurchaseDetailModal = ({ isOpen, purchase, onClose, onEdit }) => {
  if (!isOpen || !purchase) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3>Detalles de la Compra</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ padding: '20px' }}>
          <div className="detail-item" style={{ marginBottom: '15px' }}>
             <small style={{ color: '#666', display: 'block' }}>Nro. Factura</small>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <FileText size={18} className="text-primary" /> {purchase.nro_factura}
             </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <small style={{ color: '#666' }}><Calendar size={12} /> Emisión</small>
              <p>{purchase.fecha_emision}</p>
            </div>
            <div>
              <small style={{ color: '#666' }}><Clock size={12} /> Vencimiento</small>
              <p>{purchase.fecha_vencimiento}</p>
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
             <small style={{ color: '#666' }}><User size={12} /> Proveedor</small>
             <p>{purchase.proveedor_nombre}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onEdit}>Editar Datos</button>
          <button className="btn-primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;