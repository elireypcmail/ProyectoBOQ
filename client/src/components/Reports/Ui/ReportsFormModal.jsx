import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import { useSales } from "../../../context/SalesContext"; 

import StepInfo from "./Steps/StepInfo";
import StepProducts from "./Steps/StepProducts";
import StepConfirm from "./Steps/StepConfirm";
import ModalConfirm from "./ModalConfirm";
import SearchProductModal from "./SubModals/SearchProductModal";

import "../../../styles/ui/SalesFormModal.css";

const ReportsFormModal = ({ isOpen, onClose, editData = null }) => {
  const { createNewReport, editReport, getAllReports } = useSales();
  
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  
  const initialFormState = {
    id_paciente: "",
    nombre_paciente: "",
    personal_asignado: [], 
  };

  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  /**
   * Helper para convertir strings con coma decimal a números reales.
   * Maneja casos como "1.250,50" o "12,5" o números puros.
   */
  const parseQuantity = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;

    let cleanValue = value.toString();
    // Si tiene puntos de miles y coma decimal (ej: 1.250,50)
    if (cleanValue.includes(",") && cleanValue.includes(".")) {
      cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
    } else {
      // Si solo tiene coma (ej: 12,5)
      cleanValue = cleanValue.replace(",", ".");
    }
    return parseFloat(cleanValue) || 0;
  };

  // Validación Paso 2: Al menos un producto y todos con cantidad > 0
  const isStep2Valid = items.length > 0 && items.every(item => parseQuantity(item.cantidad) > 0);

  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        id: editData.id,
        id_paciente: editData.id_paciente || "",
        nombre_paciente: editData.paciente_nombre || "",
        personal_asignado: editData.personal?.map((p) => ({
          id: p.id_medico,
          nombre: p.medico,
          tipo: p.tipo_medico,
        })) || [],
      });

      setItems(editData.items?.map(item => ({
        ...item,
        id: item.id_producto || item.id,
        descripcion: item.producto || item.descripcion,
        sku: item.sku || "",
        cantidad: item.cantidad || 1,
        isValid: true
      })) || []);
    } else if (isOpen) {
      handleReset();
    }
  }, [isOpen, editData]);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        detalle: items.map((item) => ({
          id_producto: item.id || item.id_producto,
          id_inventario: item.inventario_id || item.id_inventario,
          nombre_producto: item.descripcion || item.producto,
          // Convertimos a número real antes de enviar al API
          cantidad: parseQuantity(item.cantidad),
        })),
      };

      const res = editData 
        ? await editReport(editData.id, payload) 
        : await createNewReport(payload);

      if (res.status || res.success) {
        if (getAllReports) await getAllReports();
        setShowSuccessModal(true);
      } else {
        alert(res.error || res.msg || "Error al procesar el reporte.");
      }
    } catch (error) { 
      console.error("Error al enviar el reporte:", error); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleReset = () => {
    setStep(1);
    setItems([]);
    setFormData(initialFormState);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleReset();
    onClose();
  };

  const handleSelectProduct = (product) => {
    if (items.some((i) => i.id === product.id)) return alert("Producto ya agregado");
    setItems([...items, { ...product, cantidad: 1, isValid: true }]);
    setIsSearchModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="sform-overlay">
      <div className="sform-main-card">
        <header className="sform-header">
          <div className="sform-header-info">
            <h1 className="sform-title">{editData ? "Editar Reporte" : "Nuevo Reporte"}</h1>
            <p className="sform-subtitle">Paso {step} de 3</p>
          </div>
          <button className="sform-btn-close-x" onClick={handleClose} disabled={isSubmitting}>
            <X size={24} />
          </button>
        </header>

        <div className="sform-body-scroll">
          {step === 1 && (
            <StepInfo 
              formData={formData} 
              setFormData={setFormData} 
              onValidationChange={setIsStep1Valid} 
            />
          )}
          {step === 2 && (
            <StepProducts 
              items={items} 
              setItems={setItems} 
              onOpenSearch={() => setIsSearchModalOpen(true)} 
              showPrices={false} 
            />
          )}
          {step === 3 && (
            <StepConfirm 
              formData={formData} 
              items={items} 
              showTotals={false} 
            />
          )}
        </div>

        <footer className="sform-footer-nav">
          <button className="sform-btn-cancel" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <div className="sform-nav-group">
            {step > 1 && (
              <button className="sform-btn-back" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
                <ChevronLeft size={18} /> Anterior
              </button>
            )}
            {step < 3 ? (
              <button 
                className="sform-btn-next" 
                onClick={() => setStep(step + 1)} 
                disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
              >
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button className="sform-btn-finish" onClick={handleFinalSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 size={18} className="sform-spin" /> Procesando...</>
                ) : (
                  <><CheckCircle size={18} /> {editData ? "Guardar Cambios" : "Finalizar Reporte"}</>
                )}
              </button>
            )}
          </div>
        </footer>
      </div>

      {isSearchModalOpen && (
        <SearchProductModal 
          onClose={() => setIsSearchModalOpen(false)} 
          onSelect={handleSelectProduct} 
        />
      )}
      
      <ModalConfirm 
        isOpen={showSuccessModal} 
        onClose={() => { setShowSuccessModal(false); handleClose(); }} 
        title={editData ? "Actualizado" : "Registrado"} 
        message="El reporte de instrumentación se procesó con éxito." 
      />
    </div>
  );
};

export default ReportsFormModal;