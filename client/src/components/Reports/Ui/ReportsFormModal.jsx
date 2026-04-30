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
    documento_paciente: "", 
    id_clinica: "",
    nombre_clinica: "",
    personal_asignado: [], 
  };

  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // 🧹 Limpieza y formateo de cantidades
  const parseQuantity = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;
    let cleanValue = value.toString();
    if (cleanValue.includes(",") && cleanValue.includes(".")) {
      cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
    } else {
      cleanValue = cleanValue.replace(",", ".");
    }
    return parseFloat(cleanValue) || 0;
  };

  const isStep2Valid = items.length > 0 && items.every(item => parseQuantity(item.cantidad) > 0);

  // 📥 Efecto para cargar los datos en modo Edición
  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        id: editData.id,
        id_paciente: editData.id_paciente || "",
        nombre_paciente: editData.paciente_nombre || "",
        documento_paciente: editData.paciente_documento || editData.cedula || "",
        id_clinica: editData.id_clinica || "",
        nombre_clinica: editData.clinica_nombre || "",
        personal_asignado: editData.personal_asignado?.map((p) => ({
          id: p.id_medico,
          nombre: p.nombre,
          tipo: p.tipo,
        })) || [],
      });

      // Mapeo seguro para los items del detalle
      setItems(editData.detalle?.map(item => ({
        ...item,
        id: item.id_producto || item.id,
        id_inventario: item.inventario_id || item.id_inventario,
        descripcion: item.producto || item.descripcion,
        sku: item.sku || "",
        cantidad: item.cantidad || 1,
        isValid: true
      })) || []);
    } else if (isOpen) {
      handleReset();
    }
  }, [isOpen, editData]);

  // 🚀 Envío del formulario (Crear o Editar)
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 🔑 Obtener el usuario del localStorage de forma segura
      const userStorage = localStorage.getItem("UserId");
      const userData = userStorage ? JSON.parse(userStorage) : null;
      const idUsuario = userData?.id || null;

      const payload = {
        ...formData,
        id_usuario: idUsuario, // Inyectamos el ID del usuario logueado para auditoría
        detalle: items.map((item) => ({
          id_producto: item.id || item.id_producto,
          // Evita el error FK usando siempre el ID real del inventario:
          id_inventario: item.inventario_id || item.id_inventario || item.id, 
          nombre_producto: item.descripcion || item.producto,
          cantidad: parseQuantity(item.cantidad),
          backorder: item.backorder || 0
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
      alert("Error de conexión con el servidor");
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
    // Verificamos si el producto ya está en la lista para no duplicar
    if (items.some((i) => (i.id_inventario || i.id) === (product.inventario_id || product.id))) {
      return alert("Producto ya agregado");
    }
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