import React, { useEffect } from "react";
import { Search, Plus, Trash2, Edit2, Layers } from "lucide-react";
import "../../../../styles/ui/stepsSales/StepProducts.css";

const StepProducts = ({
  items = [],
  setItems,
  onOpenSearch,
  onOpenCreate,
  onOpenBatch,
  onEditProduct,
}) => {

  console.log("items")
  console.log(items)
  
  const MAX_VALUE = 999999999; 

  const round2 = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const formatInitialValue = (value) => {
    if (value === null || value === undefined || value === "") return "";
    
    if (typeof value === "number" || (typeof value === "string" && value.includes(".") && !value.includes(","))) {
      return value.toString().replace(".", ",");
    }
    return value.toString();
  };

  const parseToFloat = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;

    let standardNumber = value.toString();
    
    if (standardNumber.includes(",") && standardNumber.includes(".")) {
      standardNumber = standardNumber.replace(/\./g, "").replace(",", ".");
    } else if (standardNumber.includes(",")) {
      standardNumber = standardNumber.replace(",", ".");
    }

    return parseFloat(standardNumber) || 0;
  };

  const calculateWidth = (value) => {
    const text = value ? value.toString() : "";
    const length = text.length; 
    return `${Math.max(6, length + 2)}ch`;
  };

  const handleInputChange = (id, field, value) => {
    if (value === "") {
      updateItemState(id, field, "");
      return;
    }

    let valToProcess = value;
    if (value.includes(".") && !value.includes(",")) {
       const parts = value.split(".");
       if (parts.length === 2) {
          valToProcess = value.replace(".", ",");
       }
    }

    const regex = /^[0-9.]*(,[0-9]{0,2})?$/;

    if (regex.test(valToProcess)) {
      const numericValue = parseToFloat(valToProcess);

      if (numericValue > MAX_VALUE) {
        alert("El valor no puede superar 999.999.999,00");
        return; 
      }

      let finalValue = valToProcess;
      if (valToProcess.length > 1 && valToProcess.startsWith("0") && valToProcess[1] !== ",") {
        finalValue = valToProcess.substring(1);
      }

      updateItemState(id, field, finalValue);
    }
  };

  const updateItemState = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) return { ...item, [field]: value };
      return item;
    });
    setItems(updatedItems);
  };

  const handleBlurFormat = (id, field, value) => {
    if (!value) return;

    const number = parseToFloat(value);
    const formatted = number.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    updateItemState(id, field, formatted);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  /* =========================================
      VALIDATION EFFECTS
  ========================================= */

  useEffect(() => {
    const updatedItems = items.map((item) => {
      const qty = parseToFloat(item.cantidad);
      const price = parseToFloat(item.precio_venta);
      
      const lotesAsignados = (item.lotes_compra || item.lotes || []).reduce((acc, l) => acc + parseToFloat(l.cantidad), 0);
      
      // Verificamos si usa lotes. Se omite si estatus_lotes es falso Y no tiene lotes pre-cargados.
      const usaLotes = Boolean(item.estatus_lotes || item.usa_lotes || (item.lotes_compra && item.lotes_compra.length > 0));
      
      // Si el producto maneja lotes, exigimos validación estricta. Si no, `lotesCompletos` es true por defecto.
      const lotesCompletos = usaLotes ? (Math.abs(qty - lotesAsignados) < 0.0001) : true;
      const isValid = qty > 0 && price > 0 && lotesCompletos;

      if (item.isValid !== isValid) {
        return { ...item, isValid };
      }
      return item;
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      setItems(updatedItems);
    }
  }, [items, setItems]);

  return (
    <section className="step-prod-container">
      <div className="step-prod-header">
        <h2>Gestión de Productos</h2>
        <p className="step-prod-subtitle">
          * Ingrese la cantidad. Use la coma (,) para decimales. Límite: 999.999.999,00
        </p>
      </div>

      <div className="step-prod-toolbar">
        <div className="step-prod-search-box" onClick={onOpenSearch}>
          <Search size={18} className="step-prod-search-icon" />
          <input type="text" placeholder="Buscar por SKU o descripción..." readOnly />
        </div>
        <button className="step-prod-btn-add" onClick={onOpenCreate}>
          <Plus size={18} /> Crear producto nuevo
        </button>
      </div>

      {items.length === 0 ? (
        <div className="step-prod-empty-state">
          <p>No hay productos agregados.</p>
        </div>
      ) : (
        <div className="step-prod-table-wrapper">
          <table className="step-prod-table">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>DESCRIPCIÓN</th>
                <th className="step-prod-text-right">CANTIDAD</th>
                <th className="step-prod-text-right">PRECIO</th>
                <th className="step-prod-text-right">TOTAL</th>
                <th className="step-prod-text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const qtyVal = parseToFloat(item.cantidad);
                const priceVal = parseToFloat(item.precio_venta);
                const totalLine = round2(qtyVal * priceVal);
                
                const hasError = !item.isValid;
                
                // Determinamos la razón del error para mostrar un mensaje más preciso
                const isQtyError = qtyVal <= 0;
                const usaLotes = Boolean(item.estatus_lotes || item.usa_lotes || (item.lotes_compra && item.lotes_compra.length > 0));
                const lotesAsignados = (item.lotes_compra || item.lotes || []).reduce((acc, l) => acc + parseToFloat(l.cantidad), 0);
                const isLotesError = usaLotes && Math.abs(qtyVal - lotesAsignados) > 0.0001;

                return (
                  <tr key={item.id} className={hasError ? "step-prod-row-error" : "step-prod-row-valid"}>
                    <td className="step-prod-sku">{item.sku?.substring(0, 10) || "S/C"}</td>
                    <td className="step-prod-desc">{item.descripcion || item.producto}</td>

                    <td className="step-prod-text-right">
                      <input
                        type="text"
                        className={`step-prod-input ${hasError ? "step-prod-input-error" : ""}`}
                        style={{ width: calculateWidth(item.cantidad) }}
                        value={formatInitialValue(item.cantidad)}
                        onChange={(e) => handleInputChange(item.id, "cantidad", e.target.value)}
                        onBlur={(e) => handleBlurFormat(item.id, "cantidad", e.target.value)}
                        placeholder="0,00"
                        inputMode="decimal"
                      />
                      {/* Mensajes de error dinámicos */}
                      {isQtyError && <div style={{ fontSize: '10px', color: '#ec3137' }}>Cant. inválida</div>}
                      {isLotesError && !isQtyError && <div style={{ fontSize: '10px', color: '#ec3137' }}>Lotes incompletos</div>}
                    </td>

                    <td className="step-prod-text-right">
                      <div className="step-prod-currency-wrapper">
                        <input
                          type="text"
                          className={`step-prod-input step-prod-input-readonly ${!priceVal ? "step-prod-input-error" : ""}`}
                          style={{ width: calculateWidth(item.precio_venta) }}
                          value={formatInitialValue(item.precio_venta)}
                          readOnly
                          placeholder="0,00"
                        />
                      </div>
                    </td>

                    <td className="step-prod-text-right step-prod-total">
                      {totalLine.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="step-prod-text-center">
                      <div className="step-prod-actions">
                        {/* Ocultamos el botón de lotes si el producto no los maneja */}
                        {usaLotes && (
                          <button className="step-prod-action-btn step-prod-btn-batch" title="Lotes" onClick={() => onOpenBatch?.(item)}>
                            <Layers size={16} />
                          </button>
                        )}
                        {/* <button className="step-prod-action-btn step-prod-btn-edit" title="Editar" onClick={() => onEditProduct?.(item)}>
                          <Edit2 size={16} />
                        </button> */}
                        <button className="step-prod-action-btn step-prod-btn-delete" title="Quitar" onClick={() => removeItem(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default StepProducts;