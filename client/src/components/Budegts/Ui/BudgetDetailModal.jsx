import React, { useState } from "react";
import { X, Trash2, Loader2, FileText } from "lucide-react";
import { useSales } from "../../../context/SalesContext";
import jsPDF from 'jspdf';
import "../../../styles/ui/SalesDetailModal.css";

const BudgetDetailModal = ({ isOpen, budget, onClose }) => {
  const { deleteBudgetById, getAllBudgets } = useSales();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !budget) return null;

  const isActive = budget.estatus_uso !== 0;

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
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  // --- LÓGICA GENERACIÓN PDF (ESTILO FACTURA) ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // 1. HEADER: Branding y Título
    doc.setFillColor(30, 41, 59); // Color oscuro Slate-800
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PRESUPUESTO", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("DOCUMENTO NO VÁLIDO COMO FACTURA", margin, 32);

    // Bloque de Referencia (Esquina superior derecha)
    doc.setFillColor(236, 49, 55); // Rojo corporativo
    doc.rect(pageWidth - 65, 0, 65, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("NÚMERO DE CONTROL", pageWidth - 60, 15);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(budget.nro_presupuesto || `PRO-${budget.id}`, pageWidth - 60, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Emisión: ${formatDate(budget.fecha_creacion)}`, pageWidth - 60, 33);

    // 2. DATOS DEL CLIENTE / PACIENTE
    y = 55;
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL PACIENTE", margin, y);
    
    y += 6;
    doc.setDrawColor(230);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 10;
    doc.setTextColor(40);
    doc.setFontSize(12);
    doc.text((budget.paciente_nombre || "PACIENTE GENERAL").toUpperCase(), margin, y);
    
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Clínica: ${budget.clinica_nombre || "N/A"}`, margin, y);
    doc.text(`Seguro: ${budget.seguro_nombre || "N/A"}`, margin + 80, y);

    // 3. TABLA DE PRODUCTOS
    y += 20;
    const tableHeaderY = y;
    doc.setFillColor(248, 250, 252); // Background gris muy claro
    doc.rect(margin, tableHeaderY, pageWidth - (margin * 2), 10, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("DESCRIPCIÓN DEL PRODUCTO / SERVICIO", margin + 3, tableHeaderY + 6.5);
    doc.text("CANT.", 135, tableHeaderY + 6.5, { align: 'right' });
    doc.text("PRECIO U.", 160, tableHeaderY + 6.5, { align: 'right' });
    doc.text("TOTAL", 195, tableHeaderY + 6.5, { align: 'right' });

    y += 16;
    doc.setFont("helvetica", "normal");
    
    (budget.items || []).forEach((item, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const desc = (item.descripcion || "SIN DESCRIPCIÓN").toUpperCase();
      const splitDesc = doc.splitTextToSize(desc, 90);
      
      // Zebra striping o líneas tenues
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);

      doc.setTextColor(40);
      doc.text(splitDesc, margin + 3, y);
      
      doc.setTextColor(80);
      doc.text(parseFloat(item.cantidad).toString(), 135, y, { align: 'right' });
      doc.text(`${formatNum(item.precio_venta)}`, 160, y, { align: 'right' });
      
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text(`${formatNum(item.cantidad * item.precio_venta)}`, 195, y, { align: 'right' });
      doc.setFont("helvetica", "normal");

      y += (splitDesc.length * 5) + 5;
    });

    // 4. BLOQUE DE TOTALES
    y += 10;
    const totalBoxWidth = 70;
    const totalBoxX = pageWidth - margin - totalBoxWidth;

    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(totalBoxX, y, pageWidth - margin, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("SUBTOTAL", totalBoxX, y);
    doc.text(formatNum(budget.total), pageWidth - margin, y, { align: 'right' });

    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(236, 49, 55); // Rojo para resaltar el total
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", totalBoxX, y);
    doc.text(`${formatNum(budget.total)}`, pageWidth - margin, y, { align: 'right' });

    // 5. FOOTER / NOTAS
    y = 275;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text("Este presupuesto tiene una validez de 15 días continuos a partir de la fecha de emisión.", margin, y);
    doc.text("Los precios están sujetos a cambios sin previo aviso según disponibilidad de inventario.", margin, y + 4);
    
    doc.setFont("helvetica", "bold");
    doc.text("Página 1 de 1", pageWidth - margin, y + 4, { align: 'right' });

    // Guardar
    doc.save(`PRESUPUESTO_${budget.nro_presupuesto || budget.id}.pdf`);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Desea eliminar este presupuesto?")) return;
    setIsProcessing(true);
    try {
      const res = await deleteBudgetById(budget.id);
      if (res.status) {
        onClose();
        if (getAllBudgets) await getAllBudgets();
      }
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="sdm-overlay">
      <div className="sdm-modal-container">

        <div className="sdm-invoice-paper">
          <div className="sdm-invoice-top-header">
            <div className="invoice-brand">
              <h2 className="sdm-main-title">PRESUPUESTO</h2>
              <p className="sdm-brand-sub">Ref: {budget.nro_presupuesto}</p>
            </div>
            <div className="sdm-meta-top">
              <p><strong>Fecha:</strong> {formatDate(budget.fecha_creacion)}</p>
              <p><strong>ID:</strong> #{budget.id}</p>
            </div>
          </div>

          <div className="sdm-invoice-client-row">
            <div className="client-info">
              <label>Paciente:</label>
              <h4 className="bold">{budget.paciente_nombre || "General"}</h4>
              <p>Clínica: {budget.clinica_nombre || "N/A"}</p>
            </div>
            <div className="status-info">
               <div className={`sdm-badge ${isActive ? 'confirmed' : 'pending'}`}>
                 {isActive ? 'SIN USAR' : 'USADO'}
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
                {(budget.items || []).map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div className="item-name">{item.descripcion}</div>
                      <div className="item-sku">SKU: {item.sku}</div>
                    </td>
                    <td className="text-right">{item.cantidad}</td>
                    <td className="text-right font-mono">{formatNum(item.precio_venta)}</td>
                    <td className="text-right font-mono bold">{formatNum(item.cantidad * item.precio_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sdm-invoice-footer-grid">
            <div className="sdm-footer-left">
               <div className="sdm-notes-box">
                  {/* <p className="notes-text">Este documento no representa una factura fiscal.</p> */}
               </div>
            </div>
            <div className="sdm-totals-box">
              <div className="sdm-total-row sdm-grand-total">
                <span className="bold">Total</span>
                <span className="bold amount font-mono text-red">{formatNum(budget.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="sdm-modal-actions">
          <div className="action-group">
            <button className="btn-action btn-confirm" onClick={generatePDF}>
              <FileText size={16} /> Exportar PDF
            </button>
            {isActive && (
              <button className="btn-action btn-delete" onClick={handleDelete} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="v-spin" size={16}/> : <Trash2 size={16} />} 
                Eliminar
              </button>
            )}
          </div>
          <button className="btn-action btn-close" onClick={onClose}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

export default BudgetDetailModal;