import React, { useState } from "react";
import { X, Trash2, Loader2, FileText, User } from "lucide-react";
import { useSales } from "../../../context/SalesContext";
import { useSettings } from "../../../context/SettingsContext"; 
import jsPDF from 'jspdf';
import "../../../styles/ui/SalesDetailModal.css";

const BudgetDetailModal = ({ isOpen, budget, onClose }) => {
  const { deleteBudgetById, getAllBudgets } = useSales();
  const { parametersList, imagesList } = useSettings(); 
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !budget) return null;

  const isActive = budget.estatus_uso !== 0;
  const esParticular = budget.es_particular || budget.particular || !budget.id_seguro;

  // --- DATOS DINÁMICOS DESDE SETTINGS ---
  const rifConfig = parametersList?.find(p => p.descripcion === "Rif")?.valor || "J-40030914-3";
  const direccionConfig = parametersList?.find(p => p.descripcion === "Direccion")?.valor || "Barrio Obrero, San Cristóbal";
  const tlfConfig = parametersList?.find(p => p.descripcion === "NroTlf")?.valor || "0414-0781328";
  const emailConfig = parametersList?.find(p => p.descripcion === "Email")?.valor || "mundoimplantesca22@gmail.com";
  const notaConfigurada = parametersList?.find(p => p.descripcion === "NotaPresupuesto")?.valor;

  // --- BUSCADOR DE IMÁGENES (EVITA DEFORMACIÓN) ---
  const getImg = (name) => {
    const img = imagesList?.find(i => i.nombre.toLowerCase().includes(name.toLowerCase()));
    return img && img.data ? {
      src: `data:${img.mime_type};base64,${img.data}`,
      type: img.mime_type.split('/')[1].toUpperCase()
    } : null;
  };

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

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    // 1. HEADER - LOGO
    const logo = getImg("Logo");
    if (logo) {
      try {
        // Redimensionado proporcional para evitar que se vea "feo"
        doc.addImage(logo.src, logo.type, margin, y, 40, 15, undefined, 'FAST');
      } catch (e) { console.warn("Error logo", e); }
    }

    // DATOS EMPRESA
    const infoX = margin + 45;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("MUNDO IMPLANTES C.A.", infoX, y + 4);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`RIF: ${rifConfig}`, infoX, y + 8);
    
    const splitAddr = doc.splitTextToSize(direccionConfig, 80);
    doc.text(splitAddr, infoX, y + 12);
    
    const contactY = y + 12 + (splitAddr.length * 3.5);
    doc.text(`Telf: ${tlfConfig} | Email: ${emailConfig}`, infoX, contactY);

    // TÍTULO COTIZACIÓN
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(232, 64, 83); // Rojo Mundo Implantes
    doc.text("COTIZACIÓN", pageWidth - margin - 45, y + 5);
    doc.setFontSize(10);
    doc.text(`No. ${budget.nro_presupuesto || budget.id}`, pageWidth - margin - 45, y + 11);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Emisión: ${formatDate(budget.fecha_creacion)}`, pageWidth - margin - 45, y + 16);

    // 2. PACIENTE
    y = 52;
    doc.setDrawColor(235);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PACIENTE:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text((budget.paciente_nombre || "PÚBLICO GENERAL").toUpperCase(), margin + 20, y);
    
    doc.setFont("helvetica", "bold");
    doc.text("CÉDULA:", pageWidth - 75, y);
    doc.setFont("helvetica", "normal");
    doc.text(budget.paciente_documento || "N/A", pageWidth - 58, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("CONDICIÓN:", margin, y);
    doc.setFont("helvetica", "normal");
    const cond = esParticular ? "PARTICULAR" : `SEGURO: ${budget.seguro_nombre}`;
    doc.text(cond.toUpperCase(), margin + 22, y);

    // 3. TABLA DE PRODUCTOS
    y += 10;
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, y - 4, pageWidth - (margin * 2), 6, 'F');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCIÓN", margin + 2, y);
    doc.text("CANT.", 135, y, { align: 'center' });
    doc.text("P/UNT.", 165, y, { align: 'right' });
    doc.text("TOTAL", 195, y, { align: 'right' });

    y += 7;
    doc.setFont("helvetica", "normal");
    const items = budget.items || budget.detalle || [];
    items.forEach((item) => {
      if (y > 240) { doc.addPage(); y = 20; }
      const desc = (item.descripcion || item.producto || "").toUpperCase();
      const splitDesc = doc.splitTextToSize(desc, 110);
      doc.text(splitDesc, margin + 2, y);
      doc.text(parseFloat(item.cantidad).toString(), 135, y, { align: 'center' });
      doc.text(formatNum(item.precio_venta), 165, y, { align: 'right' });
      doc.text(formatNum(item.cantidad * item.precio_venta), 195, y, { align: 'right' });
      y += (splitDesc.length * 4.5) + 1.5;
    });

    // TOTAL
    y += 5;
    doc.setDrawColor(0);
    doc.line(145, y, 195, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL USD:", 145, y);
    doc.text(`$ ${formatNum(budget.total)}`, 195, y, { align: 'right' });

    // 4. OBSERVACIONES
    y += 15;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(7.5);
    doc.text("OBSERVACIONES / TÉRMINOS:", margin, y);
    doc.setFont("helvetica", "normal");
    y += 4;
    const terminos = (notaConfigurada || "DOCUMENTO VÁLIDO POR 2 DÍAS HÁBILES.").toUpperCase();
    const splitTerm = doc.splitTextToSize(terminos, pageWidth - (margin * 2));
    doc.text(splitTerm, margin, y);

    // 5. FIRMA Y SELLO
    y = 265;
    const firma = getImg("Firma");
    const sello = getImg("Sello");

    if (firma) {
      try {
        doc.addImage(firma.src, firma.type, margin + 5, y - 16, 30, 12, undefined, 'MEDIUM');
      } catch (e) {}
    }
    if (sello) {
      try {
        doc.addImage(sello.src, sello.type, margin + 40, y - 22, 22, 22, undefined, 'MEDIUM');
      } catch (e) {}
    }

    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + 65, y);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("FIRMA AUTORIZADA Y SELLO", margin + 10, y + 4);

    doc.save(`COTIZACION_${budget.nro_presupuesto || budget.id}.pdf`);
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Desea eliminar esta cotización?")) return;
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
              <h2 className="sdm-main-title">COTIZACIÓN</h2>
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
              <p>Cédula: {budget.paciente_documento || "N/A"}</p>
              <p>Condición: <span className="bold">{esParticular ? "PARTICULAR" : budget.seguro_nombre}</span></p>
            </div>
            <div className="status-info">
               <div className={`sdm-badge ${isActive ? 'confirmed' : 'pending'}`}>
                 {isActive ? 'SIN USAR' : 'USADA'}
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
                {(budget.items || budget.detalle || []).map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div className="item-name">{item.descripcion || item.producto}</div>
                    </td>
                    <td className="text-right">{item.cantidad}</td>
                    <td className="text-right font-mono">${formatNum(item.precio_venta)}</td>
                    <td className="text-right font-mono bold">${formatNum(item.cantidad * item.precio_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sdm-invoice-footer-grid">
            <div className="sdm-footer-left">
               {budget.notas && budget.notas.trim() !== "" && (
                 <div className="sdm-notes-box">
                    <label className="sdm-section-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', marginBottom: '5px' }}>
                      <FileText size={14} /> NOTAS / OBSERVACIONES
                    </label>
                    <p className="notes-text" style={{ whiteSpace: 'pre-wrap', textTransform: 'uppercase' }}>
                      {budget.notas}
                    </p>
                 </div>
               )}
            </div>
            <div className="sdm-totals-box">
              <div className="sdm-total-row sdm-grand-total">
                <span className="bold">Total</span>
                <span className="bold amount font-mono text-red">${formatNum(budget.total)}</span>
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