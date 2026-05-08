import React, { useState } from "react";
import { X, Trash2, Loader2, FileText, User, Building2, UserCheck, Edit3 } from "lucide-react";
import { useSales } from "../../../context/SalesContext";
import { useSettings } from "../../../context/SettingsContext"; 
import { useAuth } from "../../../context/AuthContext";
import jsPDF from 'jspdf';
import ModalConfig from "./ModalConfig";
import "../../../styles/ui/SalesDetailModal.css";

const ReportDetailModal = ({ isOpen, report, onClose, onEdit }) => {
  const { deleteBudgetById, getAllBudgets } = useSales();
  const { parametersList, imagesList } = useSettings(); 
  const { fetchUserById } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  if (!isOpen || !report) return null;

  const usageStatus = report.estatus_uso === 1 ? 'SIN USAR' : report.estatus_uso === 2 ? 'USADO' : 'ANULADO';
  const statusClass = report.estatus_uso === 1 ? 'text-green' : report.estatus_uso === 2 ? 'text-blue' : 'text-red';

  const rifConfig = parametersList?.find(p => p.descripcion === "Rif")?.valor || "J-40030914-3";
  const direccionConfig = parametersList?.find(p => p.descripcion === "Direccion")?.valor || "Barrio Obrero, San Cristóbal";
  
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

  const generatePDF = async (config) => {
    const { includeUserFirma, includeCompanyFirma, includeSello } = config;
    
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    let userDetail = null;
    try {
      const storedUser = localStorage.getItem("UserId");
      if (storedUser) {
        let userId;
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed?.id ?? parsed;
        } catch { userId = storedUser; }
        
        if (userId) {
          const dataUser = await fetchUserById(userId);
          userDetail = dataUser?.data || dataUser;
        }
      }
    } catch (error) {
      console.warn("Error al obtener datos del emisor", error);
    }

    const colorPrimary = [30, 41, 59];
    const colorSecondary = [100, 116, 139];
    const colorAccent = [232, 64, 83];

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

    doc.setTextColor(...colorAccent);
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE INSTRUMENTACIÓN", pageWidth - margin, y + 5, { align: 'right' });
    
    doc.setTextColor(...colorPrimary);
    doc.setFontSize(10);
    doc.text(`No. ${report.nro_reporte || report.id}`, pageWidth - margin, y + 11, { align: 'right' });
    
    doc.setTextColor(...colorSecondary);
    doc.setFontSize(8);
    doc.text(`Fecha: ${formatDate(report.fecha_creacion)}`, pageWidth - margin, y + 16, { align: 'right' });

    // 2. PACIENTE Y CLÍNICA
    y = 52;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);
    const col2 = pageWidth - 85;
    
    doc.setFontSize(8); doc.setTextColor(...colorSecondary);
    doc.text("PACIENTE", margin, y);
    doc.text("CÉDULA / ID", col2, y);
    y += 5;
    doc.setFontSize(10); doc.setTextColor(...colorPrimary); doc.setFont("helvetica", "bold");
    doc.text((report.paciente_nombre || "N/A").toUpperCase(), margin, y);
    doc.text(report.paciente_documento || "N/A", col2, y);

    y += 10;
    doc.setFontSize(8); doc.setTextColor(...colorSecondary); doc.setFont("helvetica", "normal");
    doc.text("CLÍNICA / INSTITUCIÓN", margin, y);
    doc.text("REALIZADO POR", col2, y);
    y += 5;
    doc.setFontSize(10); doc.setTextColor(...colorPrimary); doc.setFont("helvetica", "bold");
    doc.text((report.clinica_nombre || "N/A").toUpperCase(), margin, y);
    doc.text((report.realizado_por || "SISTEMA").toUpperCase(), col2, y);

    // 3. TABLA DE INSUMOS
    y += 15;
    doc.setFillColor(...colorPrimary);
    doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8); doc.text("DESCRIPCIÓN DEL INSUMO", margin + 3, y + 5);
    doc.text("REFERENCIA / SKU", 130, y + 5);
    doc.text("CANT.", pageWidth - margin - 3, y + 5, { align: 'right' });

    y += 12;
    doc.setTextColor(...colorPrimary);
    (report.detalle || []).forEach((item) => {
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      const desc = (item.descripcion || "SIN DESCRIPCIÓN").toUpperCase();
      const splitDesc = doc.splitTextToSize(desc, 100);
      doc.text(splitDesc, margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.text(item.sku || "-", 130, y);
      doc.text(item.cantidad.toString(), pageWidth - margin - 3, y, { align: 'right' });
      y += (splitDesc.length * 5) + 5;
    });

    // 4. SECCIÓN DE FIRMAS — centradas dinámicamente
    y = 265;

    // Recolectar solo los elementos activos con imagen disponible
    const firmaItems = [];

    if (includeUserFirma) {
      const userSignature = userDetail?.firma || userDetail?.images?.[0];
      if (userSignature?.data) {
        firmaItems.push({
          src: `data:${userSignature.mime_type};base64,${userSignature.data}`,
          type: userSignature.mime_type.split("/")[1].toUpperCase(),
          w: 30, h: 15, offsetY: 20,
        });
      }
    }

    if (includeCompanyFirma) {
      const firmaEmpresa = getImg("Firma");
      if (firmaEmpresa) {
        firmaItems.push({ src: firmaEmpresa.src, type: firmaEmpresa.type, w: 28, h: 12, offsetY: 18 });
      }
    }

    if (includeSello) {
      const sello = getImg("Sello");
      if (sello) {
        firmaItems.push({ src: sello.src, type: sello.type, w: 22, h: 22, offsetY: 22 });
      }
    }

    // Centrar el bloque completo de firmas dentro de la zona de 95mm
    const gapBetween = 8;
    const firmasAreaWidth = 95;
    const totalFirmasWidth =
      firmaItems.reduce((acc, f) => acc + f.w, 0) +
      gapBetween * Math.max(firmaItems.length - 1, 0);
    const firmasStartX = margin + (firmasAreaWidth - totalFirmasWidth) / 2;

    let fx = firmasStartX;
    firmaItems.forEach((f) => {
      try {
        doc.addImage(f.src, f.type, fx, y - f.offsetY, f.w, f.h, undefined, "MEDIUM");
      } catch (e) {}
      fx += f.w + gapBetween;
    });

    // Línea y nombre centrados
    doc.setLineWidth(0.4);
    doc.setDrawColor(...colorPrimary);
    doc.line(margin, y, margin + firmasAreaWidth, y);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    const centerX = margin + firmasAreaWidth / 2;
    const emisorNombre = userDetail?.nombre || "FIRMA AUTORIZADA Y SELLO";
    doc.text(emisorNombre.toUpperCase(), centerX, y + 4, { align: "center" });

    doc.save(`Reporte_${report.nro_reporte || report.id}.pdf`);
    setIsConfigModalOpen(false);
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
    <>
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
              <button className="btn-action btn-confirm" onClick={() => setIsConfigModalOpen(true)}>
                <FileText size={16} /> Exportar Reporte
              </button>
              {report.estatus_uso === 1 && (
                <>
                  <button className="btn-action btn-edit" onClick={() => onEdit(report)}>
                    <Edit3 size={16} /> Editar
                  </button>
                  <button className="btn-action btn-delete" onClick={handleDelete} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="v-spin" size={16}/> : <Trash2 size={16} />} 
                    Anular
                  </button>
                </>
              )}
            </div>
            <button className="btn-action btn-close" onClick={onClose}>Cerrar</button>
          </footer>
        </div>
      </div>

      <ModalConfig 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
        onConfirm={generatePDF} 
      />
    </>
  );
};

export default ReportDetailModal;