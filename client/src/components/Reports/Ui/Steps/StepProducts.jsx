import React, { useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import "../../../../styles/ui/stepsSales/StepProducts.css";

const StepProducts = ({
  items = [],
  setItems,
  onOpenSearch,
}) => {
  
  const MAX_VALUE = 999999999; 

  // Formateo visual para el input (puntos a comas)
  const formatInitialValue = (value) => {
    if (value === null || value === undefined || value === "") return "";
    let strValue = value.toString();
    if (strValue.includes(".") && !strValue.includes(",")) {
      return strValue.replace(".", ",");
    }
    return strValue;
  };

  // Conversión de string con coma a número para lógica interna
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
      // Ahora la validez solo depende de que la cantidad sea mayor a 0
      const isValid = qty > 0;

      if (item.isValid !== isValid) {
        return { ...item, isValid };
      }
      return item;
    });

    const hasChanges = updatedItems.some((item, index) => item.isValid !== items[index].isValid);
    if (hasChanges) {
      setItems(updatedItems);
    }
  }, [items, setItems]);

  return (
    <section className="step-prod-container">
      <div className="step-prod-header">
        <h2>Gestión de Insumos</h2>
        <p className="step-prod-subtitle">
          * Ingrese las cantidades utilizadas. Use la coma (,) para decimales.
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
          <p>No hay productos agregados al reporte.</p>
        </div>
      ) : (
        <div className="step-prod-table-wrapper">
          <table className="step-prod-table">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>DESCRIPCIÓN</th>
                <th className="step-prod-text-right" style={{ width: "150px" }}>CANTIDAD</th>
                <th className="step-prod-text-center" style={{ width: "100px" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
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

                    <td className="step-prod-text-center">
                      <div className="step-prod-actions">
                        <button 
                          className="step-prod-action-btn step-prod-btn-delete" 
                          onClick={() => removeItem(item.id)}
                        >
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