import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import { useSales } from "../../../context/SalesContext";

import StepInfo from "./Steps/StepInfo";
import StepProducts from "./Steps/StepProducts";
import StepConfirm from "./Steps/StepConfirm";
import ModalConfirm from "./ModalConfirm";
import SearchProductModal from "./SubModals/SearchProductModal";

import "../../../styles/ui/SalesFormModal.css";

const BudgetsFormModal = ({ isOpen, onClose, editData = null }) => {
  const { createNewBudget, editBudget, getAllBudgets } = useSales();
  
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  
  // 1. Estado inicial extendido con datos de médico
  const initialFormState = {
    id_paciente: "",
    nombre_paciente: "",
    particular: false,
    id_seguro: null,
    nombre_seguro: "",
    id_clinica: null,
    nombre_clinica: "",
    // Campos de médico agregados
    id_medico: null,
    nombre_medico: "",
    tipo_medico: "", 
    notas: "" 
  };

  const initialTotalsState = {
    subtotal: 0,
    monto_descuento_fijo: "0",
    impuestos_monto: 0,
    total: 0,
    estado: "Pendiente",
  };

  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [totals, setTotals] = useState(initialTotalsState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const isStep2Valid = items.length > 0 && items.every(item => item.isValid);

  // 2. Carga de datos en modo Edición (Mapeo de médico)
  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        id: editData.id,
        id_paciente: editData.id_paciente || "",
        nombre_paciente: editData.nombre_paciente || editData.paciente_nombre || "",
        particular: !!editData.particular,
        id_seguro: editData.id_seguro || null,
        nombre_seguro: editData.nombre_seguro || editData.seguro_nombre || "",
        id_clinica: editData.id_clinica || null,
        nombre_clinica: editData.nombre_clinica || editData.clinica_nombre || "",
        // Traer datos del médico desde editData
        id_medico: editData.id_medico || null,
        nombre_medico: editData.nombre_medico || editData.medico_nombre || "",
        tipo_medico: editData.tipo_medico || "",
        notas: editData.notas || "" 
      });

      setItems(editData.items?.map(item => ({
        ...item,
        id: item.id_producto || item.id,
        descripcion: item.producto || item.descripcion,
        cantidad: item.cantidad,
        precio_venta: item.precio_venta,
        isValid: true
      })) || []);

      setTotals({
        subtotal: parseFloat(editData.subtotal) || 0,
        impuestos_monto: parseFloat(editData.impuesto) || 0,
        total: parseFloat(editData.total) || 0,
        monto_descuento_fijo: editData.descuento?.toString() || "0",
        estado: editData.estado || "Pendiente",
      });
    } else if (isOpen) {
      handleReset();
    }
  }, [isOpen, editData]);

  const safeParse = (val) => (val !== "" && val !== null && val !== undefined ? parseFloat(val) || 0 : 0);

  useEffect(() => {
    const subtotalProductos = items.reduce((acc, item) => acc + safeParse(item.cantidad) * safeParse(item.precio_venta), 0);
    const descuentoManual = safeParse(totals.monto_descuento_fijo);
    const impuestoManual = safeParse(totals.impuestos_monto);
    const totalPresupuesto = (subtotalProductos - descuentoManual) + impuestoManual;

    setTotals((prev) => ({ ...prev, subtotal: subtotalProductos, total: totalPresupuesto }));
  }, [items, totals.monto_descuento_fijo, totals.impuestos_monto]);

  // 3. Envío del payload con información del médico
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        // Limpieza de seguros si es particular
        ...(formData.particular ? { id_seguro: null, nombre_seguro: "" } : {}),
        subtotal: parseFloat(totals.subtotal.toFixed(2)),
        descuento: parseFloat(safeParse(totals.monto_descuento_fijo).toFixed(2)),
        impuesto: parseFloat(safeParse(totals.impuestos_monto).toFixed(2)),
        total: parseFloat(totals.total.toFixed(2)),
        detalle: items.map((item) => ({
          id_producto: item.id || item.id_producto,
          id_inventario: item.inventario_id || item.id_inventario,
          nombre_producto: item.descripcion || item.producto,
          cantidad: parseFloat(item.cantidad),
          precio_venta: parseFloat(item.precio_venta)
        })),
      };

      const res = editData ? await editBudget(editData.id, payload) : await createNewBudget(payload);

      if (res.success || res.status) {
        if (getAllBudgets) await getAllBudgets();
        setShowSuccessModal(true);
      } else {
        alert(res.msg || "Error al procesar la proforma.");
      }
    } catch (error) { 
      console.error("Error al enviar la proforma:", error); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleReset = () => {
    setStep(1);
    setItems([]);
    setFormData(initialFormState);
    setTotals(initialTotalsState);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleReset();
    onClose();
  };

  const handleSelectProduct = (product) => {
    if (items.some((i) => i.id === product.id)) return alert("Producto ya agregado");
    setItems([...items, { ...product, cantidad: 1, precio_venta: product.precio_venta || 0, isValid: true }]);
    setIsSearchModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="sform-overlay">
      <div className="sform-main-card">
        <header className="sform-header">
          <div className="sform-header-info">
            <h1 className="sform-title">{editData ? "Editar Proforma" : "Nueva Proforma"}</h1>
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
            />
          )}
          {step === 3 && (
            <StepConfirm 
              formData={formData} 
              items={items} 
              totals={totals} 
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
                  <><CheckCircle size={18} /> {editData ? "Guardar Cambios" : "Finalizar Proforma"}</>
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
        title={editData ? "Actualizada" : "Registrada"} 
        message="La proforma se procesó con éxito." 
      />
    </div>
  );
};

export default BudgetsFormModal;