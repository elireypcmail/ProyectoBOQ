import React, { useState } from "react";
import { X, Trash2, Loader2, FileText } from "lucide-react";
import { useSales } from "../../../context/SalesContext";
import jsPDF from 'jspdf';
import "../../../styles/ui/SalesDetailModal.css";

const ReportDetailModal = ({ isOpen, report, onClose }) => {
  const { deleteBudgetById, getAllBudgets } = useSales();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !report) return null;

  const isActive = report.estatus_uso !== 0;

  // --- HELPERS ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // --- LÓGICA GENERACIÓN PDF (ENFOQUE OPERATIVO) ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // 1. HEADER: Branding Operativo
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE INSTRUMENTACIÓN", margin, 25);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("CONTROL DE CONSUMO Y PERSONAL MÉDICO", margin, 32);

    // Bloque de Referencia
    doc.setFillColor(51, 65, 85); // Slate-700
    doc.rect(pageWidth - 70, 0, 70, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("NÚMERO DE REPORTE", pageWidth - 65, 15);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(report.nro_reporte || `REP-${report.id}`, pageWidth - 65, 25);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Registro: ${formatDate(report.fecha_creacion)}`, pageWidth - 65, 33);

    // 2. DATOS DEL PACIENTE Y EQUIPO
    y = 55;
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DE LA CIRUGÍA / PROCEDIMIENTO", margin, y);
    
    y += 6;
    doc.setDrawColor(230);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 10;
    doc.setTextColor(40);
    doc.setFontSize(11);
    doc.text(`PACIENTE: ${(report.paciente_nombre || "N/A").toUpperCase()}`, margin, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(80);
    const medicos = (report.personal_asignado || []).map(p => `${p.nombre} (${p.tipo})`).join(", ");
    doc.text("PERSONAL ASIGNADO:", margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    const splitMedicos = doc.splitTextToSize(medicos || "Sin asignar", pageWidth - (margin * 2) - 40);
    doc.text(splitMedicos, margin + 40, y);

    // 3. TABLA DE CONSUMO (SIN PRECIOS)
    y += (splitMedicos.length * 5) + 10;
    doc.setFillColor(248, 250, 252); 
    doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("INSUMO / PRODUCTO UTILIZADO", margin + 3, y + 6.5);
    doc.text("CANTIDAD", 185, y + 6.5, { align: 'right' });

    y += 16;
    doc.setFont("helvetica", "normal");
    
    (report.detalle || []).forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const desc = (item.descripcion || "SIN DESCRIPCIÓN").toUpperCase();
      const splitDesc = doc.splitTextToSize(desc, 140);
      
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);

      doc.setTextColor(40);
      doc.text(splitDesc, margin + 3, y);
      
      doc.setFont("helvetica", "bold");
      doc.text(item.cantidad.toString(), 185, y, { align: 'right' });
      doc.setFont("helvetica", "normal");

      y += (splitDesc.length * 5) + 5;
    });

    // 4. FOOTER
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Este documento certifica el uso de los materiales arriba descritos en el procedimiento médico.", margin, 285);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, margin, 290);

    doc.save(`REPORTE_${report.nro_reporte}.pdf`);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Desea anular este reporte de instrumentación?")) return;
    setIsProcessing(true);
    try {
      const res = await deleteBudgetById(report.id);
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
              <h2 className="sdm-main-title">REPORTE INSTRUM.</h2>
              <p className="sdm-brand-sub">{report.nro_reporte}</p>
            </div>
            <div className="sdm-meta-top">
              <p><strong>Registro:</strong> {formatDate(report.fecha_creacion)}</p>
              <p><strong>Status:</strong> <span className={isActive ? 'text-green' : 'text-red'}>
                {isActive ? 'ACTIVO' : 'ANULADO'}
              </span></p>
            </div>
          </div>

          <div className="sdm-invoice-client-row">
            <div className="client-info">
              <label>Paciente:</label>
              <h4 className="bold">{report.paciente_nombre}</h4>
              <div className="sdm-personal-tags">
                <label>Personal Médico:</label>
                <div className="personal-list">
                  {report.personal_asignado?.map((p, idx) => (
                    <span key={idx} className="personal-badge">{p.nombre} ({p.tipo})</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sdm-table-wrapper">
            <table className="sdm-invoice-table">
              <thead>
                <tr>
                  <th>Descripción del Insumo</th>
                  <th className="text-center">Cantidad Utilizada</th>
                </tr>
              </thead>
              <tbody>
                {(report.detalle || []).map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div className="item-name">{item.descripcion}</div>
                      <div className="item-sku">{item.sku}</div>
                    </td>
                    <td className="text-center bold" style={{ fontSize: '1.1rem' }}>{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sdm-invoice-footer-grid">
            <div className="sdm-footer-left">
              {/* <p className="disclaimer">Total de ítems registrados: {report.detalle?.length}</p> */}
            </div>
          </div>
        </div>

        <footer className="sdm-modal-actions">
          <div className="action-group">
            <button className="btn-action btn-confirm" onClick={generatePDF}>
              <FileText size={16} /> Exportar Reporte
            </button>
          </div>
          <button className="btn-action btn-close" onClick={onClose}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

export default ReportDetailModal;