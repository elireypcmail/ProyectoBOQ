import React, { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  FileText,
  ClipboardList,
  AlertTriangle // Added for the warning modal
} from "lucide-react";

import { useProducts } from "../../../context/ProductsContext";
import { useIncExp } from "../../../context/IncExpContext";

import ProductFormModal from "../../Ui/ProductFormModal";

import StepInfo from "./Steps/StepInfo";
import StepProducts from "./Steps/StepProducts";
import StepTotals from "./Steps/StepTotals";
import StepConfirm from "./Steps/StepConfirm";
import ModalConfirm from "./ModalConfirm";

import SearchProductModal from "./SubModals/SearchProductModal";
import BatchModal from "./SubModals/BatchModal";
import SearchReportModal from "./SubModals/SearchReportModal";
import SearchBudgetModal from "./SubModals/SearchBudgetModal";

import "../../../styles/ui/SalesFormModal.css";

const SalesFormModal = ({ isOpen, onClose, editData = null }) => {
  const { categories, brands, getAllProducts, createNewProduct, editProduct } = useProducts();
  const { createNewSale, editSale, sales, getAllSales } = useIncExp();
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);

  const initialFormState = {
    idUser: "",
    nro_factura: "",
    id_paciente: "",
    nombre_paciente: "",
    personal_asignado: [],
    id_vendedor: "",
    nombre_vendedor: "",
    id_oficina: "",
    nombre_oficina: "",
    id_clinica: "",
    nombre_clinica: "",
    id_deposito: "",
    nombre_deposito: "",
    id_seguro: "",
    nombre_seguro: "",
    id_presupuesto: "",
  };

  const initialTotalsState = {
    subtotal: 0,
    monto_descuento_fijo: "0",
    impuestos_monto: 0,
    total: 0,
    monto_abonado: "0",
    notas_abono: "",
    estado_pago: "Pending",
  };

  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [totals, setTotals] = useState(initialTotalsState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // New states for the stock warning modal
  const [showStockWarningModal, setShowStockWarningModal] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  const [usedReports, setUsedReports] = useState([]);
  const [usedBudgets, setUsedBudgets] = useState([]);

  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);

  const isStep2Valid = items.length > 0 && items.every(item => item.isValid);

  useEffect(() => {
    if (isOpen && editData) {

    const user = JSON.parse(localStorage.getItem("UserId"));
    if (!user) {
      alert("Usuario no autenticado.");
      setIsSubmitting(false);
      return;
    }

      setFormData({
        id: editData.id,
        idUser: user.id,
        nro_factura: editData.nro_factura || "",
        id_paciente: editData.id_paciente || "",
        nombre_paciente: editData.paciente_nombre || "",
        personal_asignado: editData.personal?.map((p) => ({
          id: p.id_medico,
          nombre: p.medico,
          tipo: p.tipo_medico,
        })) || [],
        id_vendedor: editData.id_vendedor || "",
        nombre_vendedor: editData.vendedor_nombre || "",
        id_oficina: editData.id_oficina || "",
        nombre_oficina: editData.oficina_nombre || "",
        id_clinica: editData.id_clinica || "",
        nombre_clinica: editData.clinica_nombre || "",
        id_deposito: editData.id_deposito || "",
        nombre_deposito: editData.deposito_nombre || "",
        id_seguro: editData.id_seguro || "",
        nombre_seguro: editData.seguro_nombre || "",
        id_presupuesto: editData.id_presupuesto || "",
      });

      setItems(editData.items?.map(item => ({
        ...item,
        id: item.id_producto || item.id,
        id_inventario: item.id_inventario || item.inventario_id,
        descripcion: item.producto || item.descripcion,
        sku: item.sku || "",
        cantidad: item.cantidad,
        existencia: item.existencia || item.stock || 0, // Capture stock from editData
        precio_venta: item.precio_venta,
        lotes_compra: item.lotes || [],
        maneja_lotes: item.maneja_lotes || item.usa_lotes || false,
        isValid: true
      })) || []);

      setTotals({
        subtotal: parseFloat(editData.subtotal) || 0,
        porcentaje_impuesto: parseFloat(editData.porcentaje_impuesto) || 0,
        impuesto: parseFloat(editData.impuesto) || 0,
        total: parseFloat(editData.total) || 0,
        abonado: parseFloat(editData.abonado) || 0,
        notas_abono: editData.notas_abono || "",
        estado_pago: editData.estado_pago || "Pending",
        impuestos_monto: parseFloat(editData.impuesto) || 0,
        monto_abonado: parseFloat(editData.abonado) || 0,
        monto_descuento_fijo: editData.descuento?.toString() || "0",
      });

      setUsedReports(editData.reportes_usados || []);
      setUsedBudgets(editData.presupuestos_usados || []);

    } else if (isOpen && !editData) {
      handleReset();
    }
  }, [isOpen, editData]);

  const safeParse = (val) =>
    val !== "" && val !== null && val !== undefined ? parseFloat(val) || 0 : 0;

  const isDuplicateInvoice = () => {
    if (!formData.nro_factura || !sales) return false;
    return sales.some(
      (s) =>
        s.id !== editData?.id &&
        s.nro_factura?.toString().trim().toLowerCase() ===
        formData.nro_factura.trim().toLowerCase(),
    );
  };

  useEffect(() => {
    const subtotalProductos = items.reduce(
      (acc, item) => acc + safeParse(item.cantidad) * safeParse(item.precio_venta),
      0
    );

    const descuentoManual = safeParse(totals.monto_descuento_fijo);
    const impuestoManual = safeParse(totals.impuestos_monto);
    const abonadoManual = safeParse(totals.monto_abonado);

    const itemsConDescuento = items.map((item) => {
      const itemSubtotal = safeParse(item.cantidad) * safeParse(item.precio_venta);
      const proporcion = subtotalProductos > 0 ? itemSubtotal / subtotalProductos : 0;
      const descAsignado = descuentoManual * proporcion;

      return {
        ...item,
        descuento_unitario: safeParse(item.cantidad) > 0 ? descAsignado / safeParse(item.cantidad) : 0,
        precio_con_descuento: safeParse(item.precio_venta) - (safeParse(item.cantidad) > 0 ? descAsignado / safeParse(item.cantidad) : 0)
      };
    });

    setProcessedItems(itemsConDescuento);

    const totalFactura = (subtotalProductos - descuentoManual) + impuestoManual;

    let estado_pago = "Pending";
    if (totalFactura > 0 && abonadoManual >= totalFactura) {
      estado_pago = "Paid";
    } else if (abonadoManual > 0) {
      estado_pago = "Partial Payment";
    }

    setTotals((prev) => ({
      ...prev,
      subtotal: subtotalProductos,
      total: totalFactura,
      estado_pago,
      abonado: abonadoManual
    }));
  }, [items, totals.monto_descuento_fijo, totals.impuestos_monto, totals.monto_abonado]);

  // Validation function before processing the sale
  const handleCheckStockAndSubmit = () => {
    if (isDuplicateInvoice()) {
      alert("Esta factura ya existe.");
      setStep(1);
      return;
    }

    // Filter items where the requested quantity exceeds the available stock
    const missingStockItems = items.filter(
      (item) => safeParse(item.cantidad) > safeParse(item.existencia)
    );

    if (missingStockItems.length > 0) {
      setOutOfStockItems(missingStockItems);
      setShowStockWarningModal(true);
    } else {
      processSale();
    }
  };

  // Renamed from handleFinalSubmit to processSale
  const processSale = async () => {
    setIsSubmitting(true);

    try {
      const infoUser = JSON.parse(localStorage.getItem("UserId"));
      const userId = infoUser?.id || "";

      const payload = {
        ...formData,
        idUser: userId,
        subtotal: parseFloat(totals.subtotal.toFixed(2)),
        descuento: parseFloat(safeParse(totals.monto_descuento_fijo).toFixed(2)),
        porcentaje_impuesto: parseFloat(safeParse(totals.porcentaje_impuesto).toFixed(2)),
        impuesto: parseFloat(safeParse(totals.impuestos_monto).toFixed(2)),
        total: parseFloat(totals.total.toFixed(2)),
        abonado: parseFloat(safeParse(totals.abonado).toFixed(2)),
        notas_abono: totals.notas_abono,
        estado_pago: totals.estado_pago,
        reportes_usados: usedReports,
        presupuestos_usados: usedBudgets,
        detalle: processedItems.map((item) => ({
          id_producto: item.id || item.id_producto,
          id_inventario: item.inventario_id || item.id_inventario,
          descripcion: item.descripcion || item.producto,
          cantidad: parseInt(item.cantidad),
          precio_venta: parseFloat(item.precio_venta),
          descuento_unitario: parseFloat(item.descuento_unitario.toFixed(2)),
          precio_descuento: parseFloat((item.precio_con_descuento * item.cantidad).toFixed(2)),
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
      console.error("Error processing sale:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setItems([]);
    setFormData(initialFormState);
    setTotals(initialTotalsState);
    setUsedReports([]);
    setUsedBudgets([]);
    setShowStockWarningModal(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleReset();
    onClose();
  };

  const handleSelectProduct = (product) => {
    if (items.some((i) => String(i.id || i.id_producto) === String(product.id)))
      return alert("El producto ya fue agregado");

    setItems([
      ...items,
      {
        ...product,
        cantidad: 1,
        existencia: product.existencia || product.stock || 0, // Capture stock from selected product
        precio_venta: product.precio_venta || 0,
        lotes_compra: [],
        isValid: false
      },
    ]);
    setIsSearchModalOpen(false);
  };

  // ✅ LOGICA DE REPORTES
  const handleToggleReport = (report, isRemoving = false) => {
    if (isRemoving) {
      const updatedReports = usedReports.filter((r) => String(r.id) !== String(report.id));
      setUsedReports(updatedReports);

      const fullReportToRemove = usedReports.find(r => String(r.id) === String(report.id)) || report;
      if (fullReportToRemove.detalle) {
        const productIdsToRemove = fullReportToRemove.detalle.map((det) => String(det.id_producto || det.id));
        setItems((prevItems) => prevItems.filter((item) => !productIdsToRemove.includes(String(item.id || item.id_producto))));
      }

      if (updatedReports.length === 0 && usedBudgets.length === 0) {
        setFormData(initialFormState);
      }
      return;
    }

    const repPacienteId = String(report.id_paciente || report.paciente_id || "");
    const formPacienteId = String(formData.id_paciente || "");
    if (formData.id_paciente && repPacienteId && repPacienteId !== formPacienteId) {
      return alert("Este reporte pertenece a un paciente diferente.");
    }

    if (!usedReports.some((r) => String(r.id) === String(report.id))) {
      setUsedReports([...usedReports, report]);
    }

    setFormData((prev) => ({
      ...prev,
      id_paciente: prev.id_paciente || report.id_paciente,
      nombre_paciente: prev.nombre_paciente || report.nombre_paciente || report.paciente_nombre,
      id_vendedor: prev.id_vendedor || report.id_vendedor,
      nombre_vendedor: prev.nombre_vendedor || report.vendedor_nombre,
      id_oficina: prev.id_oficina || report.id_oficina,
      nombre_oficina: prev.nombre_oficina || report.oficina_nombre,
      id_clinica: prev.id_clinica || report.id_clinica,
      nombre_clinica: prev.nombre_clinica || report.clinica_nombre,
      id_deposito: prev.id_deposito || report.id_deposito,
      nombre_deposito: prev.nombre_deposito || report.deposito_nombre,
      id_seguro: prev.id_seguro || report.id_seguro,
      nombre_seguro: prev.nombre_seguro || report.seguro_nombre,
      personal_asignado: [
        ...prev.personal_asignado,
        ...(report.personal_asignado || [])
          .filter(pNew => !prev.personal_asignado.some(pOld => pOld.id === pNew.id_medico))
          .map(p => ({
            id: p.id_medico,
            nombre: p.nombre || p.medico,
            tipo: p.tipo || p.tipo_medico
          }))
      ],
    }));

    if (report.detalle && report.detalle.length > 0) {
      const newItems = report.detalle.map((det) => {
        const exists = items.find(i => String(i.id || i.id_producto) === String(det.id_producto));
        if (exists) return null;

        return {
          id: det.id_producto,
          id_producto: det.id_producto,
          inventario_id: det.id_inventario,
          descripcion: det.descripcion || det.producto,
          sku: det.sku || "",
          cantidad: det.cantidad || 1,
          existencia: det.existencia || det.stock || 0, // Capture stock from report details
          precio_venta: det.precio_venta || 0,
          lotes_compra: [],
          maneja_lotes: det.usa_lotes || det.maneja_lotes || false,
          isValid: false
        };
      }).filter(Boolean);

      setItems((prevItems) => [...prevItems, ...newItems]);
    }
  };

  // ✅ LOGICA DE PRESUPUESTOS 
  const handleToggleBudget = (budget, isRemoving = false) => {
    if (isRemoving) {
      const updatedBudgets = usedBudgets.filter((b) => String(b.id) !== String(budget.id));
      setUsedBudgets(updatedBudgets);

      const fullBudgetToRemove = usedBudgets.find(b => String(b.id) === String(budget.id)) || budget;
      if (fullBudgetToRemove.detalle) {
        const productIdsToRemove = fullBudgetToRemove.detalle.map((det) => String(det.id_producto || det.id));
        setItems((prevItems) => prevItems.filter((item) => !productIdsToRemove.includes(String(item.id || item.id_producto))));
      }

      if (updatedBudgets.length === 0 && usedReports.length === 0) {
        setFormData(initialFormState);
      }
      return;
    }

    const budPacienteId = String(budget.id_paciente || budget.paciente_id || "");
    const formPacienteId = String(formData.id_paciente || "");
    
    if (formData.id_paciente && budPacienteId && budPacienteId !== formPacienteId) {
      return alert("Este presupuesto pertenece a un paciente diferente.");
    }

    if (!usedBudgets.some((b) => String(b.id) === String(budget.id))) {
      setUsedBudgets([...usedBudgets, budget]);
    }

    setFormData((prev) => ({
      ...prev,
      id_paciente: prev.id_paciente || budget.id_paciente,
      nombre_paciente: prev.nombre_paciente || budget.nombre_paciente || budget.paciente_nombre,
      id_vendedor: prev.id_vendedor || budget.id_vendedor,
      nombre_vendedor: prev.nombre_vendedor || budget.vendedor_nombre,
      id_presupuesto: budget.id
    }));

    if (budget.detalle && budget.detalle.length > 0) {
      const newItems = budget.detalle.map((det) => {
        const exists = items.find(i => String(i.id || i.id_producto) === String(det.id_producto));
        if (exists) return null;

        return {
          id: det.id_producto,
          id_inventario: det.id_inventario || det.inventario_id,
          id_producto: det.id_producto,
          descripcion: det.descripcion || det.producto,
          sku: det.sku || "",
          cantidad: det.cantidad || 1,
          existencia: det.existencia || det.stock || 0, // Capture stock from budget details
          precio_venta: det.precio_venta || 0,
          lotes_compra: [],
          maneja_lotes: det.usa_lotes || det.maneja_lotes || false,
          isValid: true 
        };
      }).filter(Boolean);

      setItems((prevItems) => [...prevItems, ...newItems]);
    }
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
              onOpenBatch={(item) => {
                setSelectedProductForBatch(item);
                setIsBatchModalOpen(true);
              }}
            onOpenCreate={() => setIsCreateProductOpen(true)}
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="sform-btn-secondary"
                  onClick={() => setIsReportModalOpen(true)}
                  disabled={isSubmitting}
                  title="Añadir Reportes"
                >
                  <FileText size={18} /> Reportes ({usedReports.length})
                </button>

                <button
                  type="button"
                  className="sform-btn-secondary"
                  onClick={() => setIsBudgetModalOpen(true)}
                  disabled={isSubmitting}
                  title="Añadir Presupuestos"
                >
                  <ClipboardList size={18} /> Presupuestos ({usedBudgets.length})
                </button>

                <button
                  className="sform-btn-next"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !isStep1Valid) ||
                    (step === 2 && !isStep2Valid)
                  }
                >
                  Siguiente <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <button
                className="sform-btn-finish"
                onClick={handleCheckStockAndSubmit}
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

      {/* WARNING MODAL: Insufficient Stock */}
      {showStockWarningModal && (
        <div className="sform-overlay" style={{ zIndex: 1000 }}>
          <div className="sform-main-card" style={{ maxWidth: "450px", height: "auto", margin: "auto", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", color: "#d97706" }}>
              <AlertTriangle size={28} />
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", color: "#1f2937" }}>
                Advertencia de Existencia
              </h2>
            </div>
            
            <p style={{ color: "#4b5563", marginBottom: "16px" }}>
              Los siguientes productos no tienen la existencia requerida para procesar esta venta:
            </p>
            
            <ul style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "24px", padding: "0 16px", background: "#f3f4f6", borderRadius: "8px", border: "1px solid #e5e7eb", listStyle: "none" }}>
              {outOfStockItems.map((item, idx) => (
                <li key={item.id || idx} style={{ padding: "12px 0", borderBottom: idx !== outOfStockItems.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                  <div style={{ fontWeight: "500", color: "#111827", marginBottom: "4px" }}>{item.descripcion}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#4b5563" }}>
                    <span>Requerido: <strong>{item.cantidad}</strong></span>
                    <span>Disponible: <strong>{item.existencia}</strong></span>
                  </div>
                </li>
              ))}
            </ul>
            
            <p style={{ color: "#4b5563", marginBottom: "24px", fontWeight: "500" }}>
              ¿Desea registrar la venta de todas formas?
            </p>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                className="sform-btn-cancel" 
                onClick={() => setShowStockWarningModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="sform-btn-finish" 
                style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}
                onClick={() => {
                  setShowStockWarningModal(false);
                  processSale();
                }}
              >
                Continuar y Vender
              </button>
            </div>
          </div>
        </div>
      )}

      {isSearchModalOpen && (
        <SearchProductModal
          onClose={() => setIsSearchModalOpen(false)}
          onSelect={handleSelectProduct}
        />
      )}

      <ProductFormModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        onSubmit={async (data) => {
          await createNewProduct(data);
          setIsCreateProductOpen(false);
        }}
        categories={categories}
        brands={brands}
      />

      {isBatchModalOpen && (
        <BatchModal
          product={selectedProductForBatch}
          onClose={() => setIsBatchModalOpen(false)}
          items={items}
          setItems={setItems}
        />
      )}

      {isReportModalOpen && (
        <SearchReportModal
          onClose={() => setIsReportModalOpen(false)}
          onToggle={handleToggleReport}
          selectedItems={usedReports}
          filterByPacienteId={formData.id_paciente}
        />
      )}

      {isBudgetModalOpen && (
        <SearchBudgetModal
          onClose={() => setIsBudgetModalOpen(false)}
          onToggle={handleToggleBudget}
          selectedItems={usedBudgets}
          filterByPacienteId={formData.id_paciente}
        />
      )}

      <ModalConfirm
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          handleClose();
        }}
        title={editData ? "Venta Actualizada" : "Venta Registrada"}
        message={editData ? "Cambios guardados exitosamente." : "La venta se registró exitosamente."}
      />
    </div>
  );
};

export default SalesFormModal;