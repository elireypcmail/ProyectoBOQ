import React, { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { useProducts } from "../../../context/ProductsContext";
import { useIncExp } from "../../../context/IncExpContext";

import StepInfo from "./Steps/StepInfo";
import StepProducts from "./Steps/StepProducts";
import StepTotals from "./Steps/StepTotals";
import StepConfirm from "./Steps/StepConfirm";
import ModalConfirm from "./ModalConfirm";

import SearchProductModal from "./SubModals/SearchProductModal";
import BatchModal from "./SubModals/BatchModal";

import "../../../styles/ui/SalesFormModal.css";

const SalesFormModal = ({ isOpen, onClose, editData = null }) => {
  const { getAllProducts } = useProducts();
  const { createNewSale, editSale, sales, getAllSales } = useIncExp();

  const initialFormState = {
    nro_factura: "",
    id_paciente: "",
    id_personal: "",
    id_vendedor: "",
    id_oficina: "",
    id_seguro: "",
    id_presupuesto: "",
  };

  const initialTotalsState = {
    subtotal: 0,
    porcentaje_impuesto: 0,
    impuesto: 0,
    total: 0,
    abonado: 0,
    notas_abono: "",
    estado_pago: "Pendiente",
  };

  // --- ESTADOS ---
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [totals, setTotals] = useState(initialTotalsState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);

  // --- EFECTO: CARGAR DATA PARA EDICIÓN ---
  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        id: editData.id,
        nro_factura: editData.nro_factura || "",
        id_paciente: editData.id_paciente || "",
        id_personal: editData.id_personal || "",
        id_vendedor: editData.id_vendedor || "",
        id_oficina: editData.id_oficina || "",
        id_seguro: editData.id_seguro || "",
        id_presupuesto: editData.id_presupuesto || "",
      });
      // Normalizamos los items para que coincidan con la estructura del formulario
      setItems(editData.items?.map(item => ({
        ...item,
        id: item.id_producto, // El formulario usa 'id' para la referencia
        cantidad: item.cantidad,
        precio_venta: item.precio_venta
      })) || []);
      setTotals({
        subtotal: parseFloat(editData.subtotal) || 0,
        porcentaje_impuesto: parseFloat(editData.porcentaje_impuesto) || 0,
        impuesto: parseFloat(editData.impuesto) || 0,
        total: parseFloat(editData.total) || 0,
        abonado: parseFloat(editData.abonado) || 0,
        notas_abono: editData.notas_abono || "",
        estado_pago: editData.estado_pago || "Pendiente",
      });
    } else if (isOpen && !editData) {
      handleReset(); // Limpiar si es creación nueva
    }
  }, [isOpen, editData]);

  // --- HELPERS ---
  const safeParse = (val) =>
    val !== "" && val !== null && val !== undefined ? parseFloat(val) || 0 : 0;

  const isDuplicateInvoice = () => {
    if (!formData.nro_factura || !sales) return false;
    // Si estamos editando, ignoramos el nro_factura de la venta actual
    return sales.some(
      (s) =>
        s.id !== editData?.id &&
        s.nro_factura?.toString().trim().toLowerCase() ===
        formData.nro_factura.trim().toLowerCase(),
    );
  };

  /* =========================
      CALCULO AUTOMATICO
  ==========================*/
  useEffect(() => {
    const subtotal = items.reduce(
      (acc, item) =>
        acc + safeParse(item.cantidad) * safeParse(item.precio_venta),
      0,
    );

    const porcentaje = safeParse(totals.porcentaje_impuesto);
    const impuesto = subtotal * (porcentaje / 100);
    const total = subtotal + impuesto;
    const abonado = safeParse(totals.abonado);

    let estado_pago = "Pendiente";
    if (abonado >= total && total > 0) estado_pago = "Pagado";
    else if (abonado > 0) estado_pago = "Abono Parcial";

    setTotals((prev) => ({
      ...prev,
      subtotal,
      impuesto,
      total,
      estado_pago,
    }));
  }, [items, totals.abonado, totals.porcentaje_impuesto]);

  /* =========================
      ENVIO FINAL
  ==========================*/
  const handleFinalSubmit = async () => {
    if (isDuplicateInvoice()) {
      alert("Esta factura ya existe.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        subtotal: parseFloat(totals.subtotal.toFixed(2)),
        porcentaje_impuesto: parseFloat(safeParse(totals.porcentaje_impuesto).toFixed(2)),
        impuesto: parseFloat(totals.impuesto.toFixed(2)),
        total: parseFloat(totals.total.toFixed(2)),
        abonado: parseFloat(safeParse(totals.abonado).toFixed(2)),
        notas_abono: totals.notas_abono,
        estado_pago: totals.estado_pago,
        detalle: items.map((item) => ({
          id_producto: item.id || item.id_producto,
          id_inventario: item.inventario_id || item.id_inventario,
          cantidad: parseInt(item.cantidad),
          precio_venta: parseFloat(item.precio_venta),
          precio_descuento: parseFloat(item.precio_venta) * parseInt(item.cantidad),
          lotes: item.lotes_compra || [],
        })),
      };

      const res = editData 
        ? await editSale(editData.id, payload)
        : await createNewSale(payload);

      if (res.success || res.status) {
        if (getAllSales) await getAllSales();
        if (getAllProducts) await getAllProducts();
        setShowSuccessModal(true);
      } else {
        alert(res.msg || "Ocurrió un error al procesar la venta.");
      }
    } catch (error) {
      console.error("Error al procesar la venta:", error);
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
    if (items.some((i) => (i.id || i.id_producto) === product.id))
      return alert("Producto ya agregado");

    setItems([
      ...items,
      {
        ...product,
        cantidad: 1,
        precio_venta: product.precio_venta || 0,
      },
    ]);
    setIsSearchModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="sform-overlay">
      <div className="sform-main-card">
        <header className="sform-header">
          <div className="sform-header-info">
            <h1 className="sform-title">
              {editData ? "Editar Venta" : "Registrar Venta"}
            </h1>
            <p className="sform-subtitle">Paso {step} de 4</p>
          </div>

          <button
            className="sform-btn-close-x"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </header>

        <div className="sform-body-scroll">
          {step === 1 && (
            <StepInfo formData={formData} setFormData={setFormData} />
          )}

          {step === 2 && (
            <StepProducts
              items={items}
              setItems={setItems}
              onOpenSearch={() => setIsSearchModalOpen(true)}
              onOpenBatch={(item) => {
                setSelectedProductForBatch(item);
                setIsBatchModalOpen(true);
              }}
            />
          )}

          {step === 3 && <StepTotals totals={totals} setTotals={setTotals} />}

          {step === 4 && (
            <StepConfirm formData={formData} items={items} totals={totals} />
          )}
        </div>

        <footer className="sform-footer-nav">
          <button
            className="sform-btn-cancel"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <div className="sform-nav-group">
            {step > 1 && (
              <button
                className="sform-btn-back"
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
              >
                <ChevronLeft size={18} /> Anterior
              </button>
            )}

            {step < 4 ? (
              <button
                className="sform-btn-next"
                onClick={() => setStep(step + 1)}
              >
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button
                className="sform-btn-finish"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="sform-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {editData ? "Guardar Cambios" : "Finalizar Venta"}
                  </>
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

      {isBatchModalOpen && (
        <BatchModal
          product={selectedProductForBatch}
          onClose={() => setIsBatchModalOpen(false)}
          items={items}
          setItems={setItems}
        />
      )}

      <ModalConfirm
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          handleClose();
        }}
        title={editData ? "Venta Actualizada" : "Venta Registrada"}
        message={editData ? "Los cambios se guardaron correctamente." : "La venta fue registrada exitosamente."}
      />
    </div>
  );
};

export default SalesFormModal;