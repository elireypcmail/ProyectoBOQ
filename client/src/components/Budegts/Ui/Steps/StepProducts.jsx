import React, { useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import "../../../../styles/ui/stepsSales/StepProducts.css";

const StepProducts = ({
  items = [],
  setItems,
  onOpenSearch,
}) => {
  
  const MAX_VALUE = 999999999; 

  const round2 = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  // Corregido para manejar strings con puntos (base de datos) y convertirlos a comas visuales
  const formatInitialValue = (value) => {
    if (value === null || value === undefined || value === "") return "";
    
    let strValue = value.toString();
    // Si viene de la DB con punto (ej: "150.00"), lo pasamos a coma para el input
    if (strValue.includes(".") && !strValue.includes(",")) {
      return strValue.replace(".", ",");
    }
    return strValue;
  };

  const parseToFloat = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;

    let standardNumber = value.toString();
    // Limpieza estricta: quitar puntos de miles y cambiar coma decimal por punto
    if (standardNumber.includes(",") && standardNumber.includes(".")) {
      standardNumber = standardNumber.replace(/\./g, "").replace(",", ".");
    } else if (standardNumber.includes(",")) {
      standardNumber = standardNumber.replace(",", ".");
    }

    return parseFloat(standardNumber) || 0;
  };

  const calculateWidth = (value) => {
    const text = value ? value.toString() : "";
    return `${Math.max(6, text.length + 2)}ch`;
  };

  const handleInputChange = (id, field, value) => {
    if (value === "") {
      updateItemState(id, field, "");
      return;
    }

    // Permitir solo números y una coma decimal
    const regex = /^[0-9]*(,[0-9]{0,2})?$/;
    if (regex.test(value)) {
      const numericValue = parseToFloat(value);
      if (numericValue > MAX_VALUE) return;
      updateItemState(id, field, value);
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

  useEffect(() => {
    const updatedItems = items.map((item) => {
      const qty = parseToFloat(item.cantidad);
      const price = parseToFloat(item.precio_venta);
      const isValid = qty > 0 && price > 0;

      if (item.isValid !== isValid) {
        return { ...item, isValid };
      }
      return item;
    });

    // Solo actualizar si realmente hubo un cambio en la validez para evitar loops
    const hasChanges = updatedItems.some((item, index) => item.isValid !== items[index].isValid);
    if (hasChanges) {
      setItems(updatedItems);
    }
  }, [items, setItems]);

  return (
    <section className="step-prod-container">
      <div className="step-prod-header">
        <h2>Gestión de Productos</h2>
        <p className="step-prod-subtitle">
          * Ingrese la cantidad. Use la coma (,) para decimales.
        </p>
      </div>

      <div className="step-prod-toolbar">
        <div className="step-prod-search-box" onClick={onOpenSearch}>
          <Search size={18} className="step-prod-search-icon" />
          <input type="text" placeholder="Buscar por SKU o descripción..." readOnly />
        </div>
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
                    </td>

                    <td className="step-prod-text-right">
                      <div className="step-prod-currency-wrapper">
                        <input
                          type="text"
                          className="step-prod-input step-prod-input-readonly"
                          style={{ width: calculateWidth(item.precio_venta) }}
                          value={formatInitialValue(item.precio_venta)}
                          readOnly
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
                        <button className="step-prod-action-btn step-prod-btn-delete" onClick={() => removeItem(item.id)}>
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