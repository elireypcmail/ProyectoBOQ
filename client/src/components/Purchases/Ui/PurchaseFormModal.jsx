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

import ProductFormModal from "../../Ui/ProductFormModal";
import BatchModal from "./SubModals/BatchModal";
import SearchProductModal from "./SubModals/SearchProductModal";
import "../../../styles/ui/PurchaseForm.css";

const PurchaseFormModal = ({ isOpen, onClose, initialData }) => {
  const { categories, brands, getAllProducts, createNewProduct, editProduct } =
    useProducts();

  const { createNewShopping } = useIncExp();

  /* ===============================
      ESTADOS INICIALES
  =============================== */
  const initialFormState = {
    nro_factura: "",
    id_proveedor: "",
    proveedor: "",
    rif: "",
    factor_cambio: "1",
    id_deposito: "",
    fecha_emision: new Date().toISOString().split("T")[0],
    condiciones_pago: "Contado",
    serie_factura: "",
    dias_plazo: "0",
    fecha_vencimiento: new Date().toISOString().split("T")[0],
  };

  const initialTotalsState = {
    subtotal: 0,
    monto_descuento_items: 0,
    cargos_monto: "0",
    descuento_global_extra: "0",
    monto_descuento_fijo: "0",
    monto_descuento_extra: 0,
    monto_abonado: "0",
    total: 0,
    useDefaultRef: false,
    applyAutoGain: true,
    applyAutoRounding: false,
  };

  /* ===============================
      ESTADOS
  =============================== */
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [totals, setTotals] = useState(initialTotalsState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);

  const [processedItems, setProcessedItems] = useState([]);

  /* =========================================
      LÓGICA DE CÁLCULO
  ========================================= */
  const safeParse = (val) => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return val;
    const cleanVal = val.toString().replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanVal) || 0;
  };

  useEffect(() => {
    const round = (num, dec = 2) => {
      const factor = Math.pow(10, dec);
      return Math.round((num + Number.EPSILON) * factor) / factor;
    };

    const subtotalBruto = items.reduce(
      (acc, item) =>
        acc + safeParse(item.cantidad) * safeParse(item.costo_unitario),
      0,
    );

    const porcDescGlobal = safeParse(totals.descuento_global_extra);
    const montoCargosTotales = safeParse(totals.cargos_monto);
    const montoDescFijo = safeParse(totals.monto_descuento_fijo);

    const montoDescuentoGlobal = round(subtotalBruto * (porcDescGlobal / 100));
    const finalTotal = round(
      subtotalBruto - montoDescuentoGlobal - montoDescFijo + montoCargosTotales,
    );

    setTotals((prev) => ({
      ...prev,
      subtotal: round(subtotalBruto),
      monto_descuento_extra: montoDescuentoGlobal,
      total: finalTotal,
    }));

    const cargoPorUnidadGlobal = items.reduce(
      (acc, item) => acc + safeParse(item.cantidad),
      0,
    );
    const cargoUnidad =
      cargoPorUnidadGlobal > 0 ? montoCargosTotales / cargoPorUnidadGlobal : 0;

    const calculatedItems = items.map((item) => {
      const qty = safeParse(item.cantidad);
      const price = safeParse(item.costo_unitario);
      const itemSubtotal = qty * price;
      const descUnitario = price * (porcDescGlobal / 100);
      const precioConDescuento = price - descUnitario;
      const costoFinal = precioConDescuento + cargoUnidad;

      return {
        ...item,
        itemSubtotal: round(itemSubtotal),
        precioConDescuento: round(precioConDescuento, 3),
        cargoUnitario: round(cargoUnidad, 3),
        costo_final: round(costoFinal, 3),
      };
    });

    setProcessedItems(calculatedItems);
  }, [
    items,
    totals.cargos_monto,
    totals.descuento_global_extra,
    totals.monto_descuento_fijo,
  ]);

  /* ===============================
      VALIDACIONES Y HANDLERS
  =============================== */
  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.nro_factura?.trim() !== "" &&
          (formData.id_proveedor !== "" || formData.proveedor !== "") &&
          // formData.id_deposito !== "" &&
          formData.fecha_emision !== ""
        );
      case 2:
        return (
          items.length > 0 &&
          items.every(
            (i) => safeParse(i.cantidad) > 0 && safeParse(i.costo_unitario) > 0,
          )
        );
      case 3:
      case 4:
        return true;
      default:
        return true;
    }
  };

const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Extraemos y parseamos valores globales de configuración
      const porcDescGlobal = safeParse(totals.descuento_global_extra);
      const montoCargosTotales = safeParse(totals.cargos_monto);
      const montoDescFijo = safeParse(totals.monto_descuento_fijo);
      const montoAbonado = safeParse(totals.monto_abonado);

      // 2. Construcción del Payload con formateo decimal estricto
      const shoppingPayload = {
        id_proveedor: formData.id_proveedor,
        nro_factura: formData.nro_factura,
        fecha_emision: formData.fecha_emision,
        dias_plazo: parseInt(formData.dias_plazo) || 0,
        fecha_vencimiento: formData.fecha_vencimiento,
        id_deposito_destino: formData.id_deposito,
        id_usuario: 1, // ID del usuario actual (ajustar según tu auth)
        
        totales_cargos: {
          subtotal: parseFloat(safeParse(totals.subtotal).toFixed(2)),
          porcentaje_descuento_global: parseFloat(porcDescGlobal.toFixed(2)),
          monto_descuento_fijo: parseFloat(montoDescFijo.toFixed(2)),
          // Suma de descuento por % más el descuento fijo
          monto_descuento_extra: parseFloat((safeParse(totals.monto_descuento_extra) + montoDescFijo).toFixed(2)),
          cargos_monto: parseFloat(montoCargosTotales.toFixed(2)),
          monto_abonado: parseFloat(montoAbonado.toFixed(2)),
          total: parseFloat(safeParse(totals.total).toFixed(2)),
          saldo_pendiente: parseFloat((safeParse(totals.total) - montoAbonado).toFixed(2))
        },

        items: processedItems.map(item => {
          const qty = safeParse(item.cantidad);
          const price = safeParse(item.costo_unitario);
          
          // Cálculo del descuento unitario basado en el porcentaje global
          const descUnitario = price * (porcDescGlobal / 100);

          return {
            id_producto: item.id_producto || item.id,
            Producto: item.descripcion || item.nombre,
            // Usamos 3 decimales en costos unitarios para evitar errores de redondeo en masa
            Cant: parseFloat(qty.toFixed(2)),
            Costo_Base: parseFloat(price.toFixed(3)),
            Descuento_Unitario: parseFloat(descUnitario.toFixed(3)),
            Cargo_Unitario: parseFloat(safeParse(item.cargoUnitario).toFixed(3)),
            Costo_Ficha: parseFloat(safeParse(item.costo_final).toFixed(3)),
            Subtotal_Linea: parseFloat(safeParse(item.itemSubtotal).toFixed(2))
          };
        }),

        detalle_lotes: processedItems.flatMap(item => 
          (item.lotes_compra || []).map(l => ({
            id_producto: item.id_producto || item.id,
            Producto: item.descripcion || item.nombre,
            nro_lote: l.nro_lote,
            fecha_vencimiento: l.fecha_vencimiento,
            // Aseguramos decimales también en el desglose de lotes
            cantidad: parseFloat(safeParse(l.cantidad).toFixed(2)),
            costo_lote: parseFloat(safeParse(l.costo_lote || item.costo_final).toFixed(3))
          }))
        )
      };

      // Log para auditoría en consola antes de enviar
      console.log("Payload Final a enviar:", shoppingPayload);

      const res = await createNewShopping(shoppingPayload);

      if (res.status || res.success) {
        alert("Factura de compra registrada exitosamente.");
        if (getAllProducts) await getAllProducts();
        handleClose();
      } else {
        alert("Error al registrar: " + (res.error || res.msg || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error crítico al finalizar el registro:", error);
      alert("Hubo un error al procesar la compra. Revisa la consola para más detalles.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setItems([]);
    setFormData(initialFormState);
    setTotals(initialTotalsState);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSelectProduct = (product) => {
    const exists = items.some((item) => item.id === product.id);
    if (exists) return alert(`El producto ya ha sido agregado.`);
    // Inicializamos con cantidad 1 para facilitar el avance de paso
    setItems([
      ...items,
      {
        ...product,
        cantidad: "1",
        costo_unitario: product.costo_unitario || "0",
        descuento_lineal: "0",
      },
    ]);
    setIsSearchModalOpen(false);
  };

  const handleOpenBatch = (product) => {
    setSelectedProductForBatch(product);
    setIsBatchModalOpen(true);
  };

  const stepsMeta = {
    1: { title: "Información General", pct: "25%" },
    2: { title: "Selección de Productos", pct: "50%" },
    3: { title: "Totales y Cargos", pct: "75%" },
    4: { title: "Revisión Final", pct: "100%" },
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepInfo formData={formData} setFormData={setFormData} />;
      case 2:
        return (
          <StepProducts
            items={items}
            setItems={setItems}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenBatch={handleOpenBatch}
            onOpenCreate={() => setIsCreateProductOpen(true)}
          />
        );
      case 3:
        return <StepTotals totals={totals} setTotals={setTotals} />;
      case 4:
        return (
          <StepConfirm
            formData={formData}
            items={processedItems}
            totals={totals}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pform-overlay">
      <div className="pform-card">
        <header className="pform-header-main">
          <h1>Registrar Compra</h1>
          <button
            className="pform-close-x"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </header>

        <div className="pform-stepper-container">
          <div className="pform-stepper-info">
            <span className="step-badge">{step}</span>
            <strong>{stepsMeta[step].title}</strong>
          </div>
          <div className="pform-progress-bar">
            <div
              className="progress-fill"
              style={{ width: stepsMeta[step].pct }}
            />
          </div>
        </div>

        <div className="pform-body">{renderStep()}</div>

        <footer className="pform-footer-actions-alt">
          <button
            className="btn-cancel-flat"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <div className="nav-buttons">
            {step > 1 && (
              <button
                className="btn-prev-outline"
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
              >
                <ChevronLeft size={18} /> Anterior
              </button>
            )}
            {step < 4 ? (
              <button
                className={`btn-next-step ${!isStepValid() ? "disabled" : ""}`}
                onClick={() => isStepValid() && setStep(step + 1)}
                disabled={!isStepValid() || isSubmitting}
              >
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button
                className="btn-finalizar-compra"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    Finalizar Registro <CheckCircle size={18} />
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

      {isBatchModalOpen && selectedProductForBatch && (
        <BatchModal
          product={selectedProductForBatch}
          onClose={() => setIsBatchModalOpen(false)}
          items={items}
          setItems={setItems}
        />
      )}

      <ProductFormModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        onSubmit={async (data) => {
          if (productToEdit) await editProduct(productToEdit.id, data);
          else await createNewProduct(data);
          setIsCreateProductOpen(false);
        }}
        categories={categories}
        brands={brands}
      />
    </div>
  );
};

export default PurchaseFormModal;
