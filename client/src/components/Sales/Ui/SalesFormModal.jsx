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

const SalesFormModal = ({ isOpen, onClose }) => {
  const { getAllProducts } = useProducts();
  const { createNewSale, sales, getAllSales } = useIncExp();

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
    porcentaje_impuesto: 0, // ✅ ahora editable
    impuesto: 0,
    total: 0,
    abonado: 0,
    estado_pago: "Pendiente",
  };

  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [totals, setTotals] = useState(initialTotalsState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);

  const safeParse = (val) =>
    val !== "" && val !== null && val !== undefined ? parseFloat(val) || 0 : 0;

  const isDuplicateInvoice = () => {
    if (!formData.nro_factura || !sales) return false;
    return sales.some(
      (s) =>
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
    ENVIO FINAL (SIMULADO)
==========================*/
  const handleFinalSubmit = async () => {
    if (isDuplicateInvoice()) {
      alert("Esta factura ya existe.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      /* // Lógica de guardado (Comentada temporalmente)
    const payload = {
      ...formData,
      subtotal: parseFloat(totals.subtotal.toFixed(2)),
      porcentaje_impuesto: parseFloat(
        safeParse(totals.porcentaje_impuesto).toFixed(2)
      ),
      impuesto: parseFloat(totals.impuesto.toFixed(2)),
      total: parseFloat(totals.total.toFixed(2)),
      abonado: parseFloat(safeParse(totals.abonado).toFixed(2)),
      estado_pago: totals.estado_pago,
      detalle: items.map((item) => ({
        id_inventario: item.id,
        cantidad: parseInt(item.cantidad),
        precio_venta: parseFloat(item.precio_venta),
        descuento1: 0,
        descuento2: 0,
        precio_descuento:
          parseFloat(item.precio_venta) *
          parseInt(item.cantidad),
      })),
    };

    const res = await createNewSale(payload);

    if (res.success || res.status) {
      if (getAllSales) await getAllSales();
      if (getAllProducts) await getAllProducts();
      setShowSuccessModal(true);
    }
    */

      // Simulación de espera de red (1 segundo)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mostramos el modal de éxito directamente
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al simular la venta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     RESET
  ==========================*/
  const handleClose = () => {
    if (isSubmitting) return;
    setStep(1);
    setItems([]);
    setFormData(initialFormState);
    setTotals(initialTotalsState);
    onClose();
  };

  const handleSelectProduct = (product) => {
    if (items.some((i) => i.id === product.id))
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
            <h1 className="sform-title">Registrar Venta</h1>
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
                    Finalizar Venta
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
        title="Venta Registrada"
        message="La venta fue registrada exitosamente."
      />
    </div>
  );
};

export default SalesFormModal;
