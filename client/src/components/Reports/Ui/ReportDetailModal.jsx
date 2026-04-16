import React, { useState } from "react";
import { X, Trash2, Loader2, FileText, User, Building2, UserCheck } from "lucide-react";
import { useSales } from "../../../context/SalesContext";
import { useSettings } from "../../../context/SettingsContext"; 
import jsPDF from 'jspdf';
import "../../../styles/ui/SalesDetailModal.css";

const ReportDetailModal = ({ isOpen, report, onClose }) => {
  const { deleteBudgetById, getAllBudgets } = useSales();
  const { parametersList, imagesList } = useSettings(); 
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !report) return null;

  // Lógica de estatus
  const usageStatus = report.estatus_uso === 1 ? 'SIN USAR' : report.estatus_uso === 2 ? 'USADO' : 'ANULADO';
  const statusClass = report.estatus_uso === 1 ? 'text-green' : report.estatus_uso === 2 ? 'text-blue' : 'text-red';

  // --- CONFIGURACIÓN DINÁMICA ---
  const rifConfig = parametersList?.find(p => p.descripcion === "Rif")?.valor || "J-40030914-3";
  const direccionConfig = parametersList?.find(p => p.descripcion === "Direccion")?.valor || "Barrio Obrero, San Cristóbal";
  const tlfConfig = parametersList?.find(p => p.descripcion === "NroTlf")?.valor || "0414-0781328";
  const emailConfig = parametersList?.find(p => p.descripcion === "Email")?.valor || "mundoimplantesca22@gmail.com";

  const getImg = (name) => {
    const img = imagesList?.find(i => i.nombre.toLowerCase().includes(name.toLowerCase()));
    return img && img.data ? {
      src: `data:${img.mime_type};base64,${img.data}`,
      type: img.mime_type.split('/')[1].toUpperCase()
    } : null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    // COLORES DEL SISTEMA (Slate & Red)
    const colorPrimary = [30, 41, 59];   // #1e293b
    const colorSecondary = [100, 116, 139]; // #64748b
    const colorAccent = [232, 64, 83];  // Rojo Mundo Implantes
    const colorBg = [248, 250, 252];    // #f8fafc

    // 1. HEADER
    const logo = getImg("Logo");
    if (logo) {
      try { doc.addImage(logo.src, logo.type, margin, y, 40, 15, undefined, 'FAST'); } catch (e) {}
    }

    const infoX = margin + 45;
    doc.setTextColor(...colorPrimary);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("MUNDO IMPLANTES C.A.", infoX, y + 4);
    
    doc.setTextColor(...colorSecondary);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`RIF: ${rifConfig}`, infoX, y + 8);
    const splitAddr = doc.splitTextToSize(direccionConfig, 70);
    doc.text(splitAddr, infoX, y + 12);

    // TÍTULO REPORTE (Alineado derecha)
    doc.setTextColor(...colorAccent);
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE INSTRUMENTACIÓN", pageWidth - margin, y + 5, { align: 'right' });
    
    doc.setTextColor(...colorPrimary);
    doc.setFontSize(10);
    doc.text(`No. ${report.nro_reporte || report.id}`, pageWidth - margin, y + 11, { align: 'right' });
    
    doc.setTextColor(...colorSecondary);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${formatDate(report.fecha_creacion)}`, pageWidth - margin, y + 16, { align: 'right' });

    // 2. SECCIÓN PACIENTE Y CLÍNICA (Cuadro sutil)
    y = 52;
    doc.setDrawColor(226, 232, 240); // #e2e8f0
    doc.line(margin, y - 5, pageWidth - margin, y - 5);

    const col2 = pageWidth - 85;
    
    // Fila 1
    doc.setFontSize(8); doc.setTextColor(...colorSecondary);
    doc.text("PACIENTE", margin, y);
    doc.text("CÉDULA / ID", col2, y);
    
    y += 5;
    doc.setFontSize(10); doc.setTextColor(...colorPrimary); doc.setFont("helvetica", "bold");
    doc.text((report.paciente_nombre || "N/A").toUpperCase(), margin, y);
    doc.text(report.paciente_documento || "N/A", col2, y);

    // Fila 2
    y += 10;
    doc.setFontSize(8); doc.setTextColor(...colorSecondary); doc.setFont("helvetica", "normal");
    doc.text("CLÍNICA / INSTITUCIÓN", margin, y);
    doc.text("REALIZADO POR", col2, y);

    y += 5;
    doc.setFontSize(10); doc.setTextColor(...colorPrimary); doc.setFont("helvetica", "bold");
    doc.text((report.clinica_nombre || "N/A").toUpperCase(), margin, y);
    doc.text((report.realizado_por || "SISTEMA").toUpperCase(), col2, y);

    // 3. PERSONAL MÉDICO (Diseño tipo lista)
    y += 12;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);
    
    doc.setFontSize(8); doc.setTextColor(...colorSecondary); doc.setFont("helvetica", "bold");
    doc.text("PERSONAL MÉDICO ASIGNADO", margin, y);
    
    y += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const medicos = report.personal_asignado || [];
    if (medicos.length > 0) {
      medicos.forEach((p, index) => {
        doc.setTextColor(...colorPrimary);
        doc.setFont("helvetica", "bold");
        const nameWidth = doc.getTextWidth(p.nombre);
        doc.text(p.nombre, margin, y);
        
        doc.setTextColor(...colorSecondary);
        doc.setFont("helvetica", "normal");
        doc.text(` • ${p.tipo}`, margin + nameWidth + 2, y);
        
        // Control de columnas si hay muchos médicos (opcional) o simple salto
        y += 5;
      });
    } else {
      doc.text("SIN PERSONAL ASIGNADO", margin, y);
      y += 5;
    }

    // 4. TABLA DE INSUMOS
    y += 5;
    doc.setFillColor(...colorPrimary); // Encabezado oscuro
    doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN DEL INSUMO", margin + 3, y + 5);
    doc.text("REFERENCIA / SKU", 130, y + 5);
    doc.text("CANT.", pageWidth - margin - 3, y + 5, { align: 'right' });

    y += 12;
    doc.setTextColor(...colorPrimary);
    (report.detalle || []).forEach((item) => {
      if (y > 275) { doc.addPage(); y = 20; }
      
      doc.setFont("helvetica", "bold");
      const desc = (item.descripcion || "SIN DESCRIPCIÓN").toUpperCase();
      const splitDesc = doc.splitTextToSize(desc, 100);
      doc.text(splitDesc, margin + 3, y);
      
      doc.setFont("helvetica", "normal");
      doc.text(item.sku || "-", 130, y);
      
      doc.setFont("helvetica", "bold");
      doc.text(item.cantidad.toString(), pageWidth - margin - 3, y, { align: 'right' });
      
      y += (splitDesc.length * 5) + 3;
      
      // Línea divisoria suave entre items
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y - 2, pageWidth - margin, y - 2);
      y += 2;
    });

    // --- ESTA ES LA LÍNEA QUE FALTA ---
  doc.save(`Reporte_${report.nro_reporte || report.id}.pdf`);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Desea anular este reporte?")) return;
    setIsProcessing(true);
    try {
      const res = await deleteBudgetById(report.id);
      if (res.status) { onClose(); if (getAllBudgets) await getAllBudgets(); }
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
              <p><strong>Estatus:</strong> <span className={statusClass}>{usageStatus}</span></p>
            </div>
          </div>

          <div className="sdm-invoice-client-row">
            <div className="client-info" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label><User size={14} /> Paciente:</label>
                <h4 className="bold">{report.paciente_nombre}</h4>
                <p>Doc: {report.paciente_documento || "N/A"}</p>
              </div>
              <div>
                <label><Building2 size={14} /> Clínica:</label>
                <h4 className="bold">{report.clinica_nombre || "No especificada"}</h4>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>
                  <UserCheck size={12} /> Realizado por: {report.realizado_por || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="sdm-personal-tags">
            <div className="sdm-section-label">Personal Médico Asignado</div>
            
            <div className="personal-list">
              {report.personal_asignado?.map((p, idx) => (
                <div key={idx} className="staff-badge">
                  <span className="staff-name">{p.nombre}</span>
                  <span className="staff-role">{p.tipo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sdm-table-wrapper">
            <table className="sdm-invoice-table">
              <thead>
                <tr>
                  <th>Descripción del Insumo</th>
                  <th className="text-center">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {(report.detalle || []).map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div className="item-name">{item.descripcion}</div>
                      <div className="item-sku">SKU: {item.sku}</div>
                    </td>
                    <td className="text-center bold" style={{ fontSize: '1.1rem' }}>{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="sdm-modal-actions">
          <div className="action-group">
            <button className="btn-action btn-confirm" onClick={generatePDF}>
              <FileText size={16} /> Exportar Reporte
            </button>
            {report.estatus_uso === 1 && (
              <button className="btn-action btn-delete" onClick={handleDelete} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="v-spin" size={16}/> : <Trash2 size={16} />} 
                Anular
              </button>
            )}
          </div>
          <button className="btn-action btn-close" onClick={onClose}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

export default ReportDetailModal;