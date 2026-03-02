import React, { useEffect } from "react";
import { Search, Plus, Trash2, Edit2, Layers } from "lucide-react";
import "../../../../styles/ui/steps/StepProducts.css";

const StepProducts = ({
  items = [],
  setItems,
  onOpenSearch,
  onOpenCreate,
  onOpenBatch,
  onEditProduct,
}) => {
  
  /* =========================================
      CONSTANTES Y HELPERS
  ========================================= */
  
  const MAX_VALUE = 999999999; 

  const round2 = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  /**
   * Ajuste clave: Si el valor viene de la DB como 123.00 (puntos),
   * lo visualizamos con coma para que sea editable por nuestra lógica.
   */
  const formatInitialValue = (value) => {
    if (value === null || value === undefined || value === "") return "";
    
    // Si detectamos que es un número puro o un string con punto decimal (tipo 123.50)
    if (typeof value === "number" || (typeof value === "string" && value.includes(".") && !value.includes(","))) {
      return value.toString().replace(".", ",");
    }
    return value.toString();
  };

  const parseToFloat = (value) => {
    if (!value) return 0;
    if (typeof value === "number") return value;

    const standardNumber = value
      .toString()
      .replace(/\./g, "") 
      .replace(",", "."); 
    
    return parseFloat(standardNumber) || 0;
  };

  const calculateWidth = (value) => {
    const text = value ? value.toString() : "";
    const length = text.length; 
    return `${Math.max(6, length + 2)}ch`;
  };

  /* =========================================
      MANEJO DE INPUTS
  ========================================= */

  const handleInputChange = (id, field, value) => {
    if (value === "") {
      updateItemState(id, field, "");
      return;
    }

    // Normalización: Si el usuario pega o el sistema trae un valor con punto decimal
    // lo convertimos a coma para que pase la validación de la Regex
    let valToProcess = value;
    if (value.includes(".") && !value.includes(",")) {
       const parts = value.split(".");
       if (parts.length === 2) {
          valToProcess = value.replace(".", ",");
       }
    }

    // Regex: Permite dígitos, puntos y una sola coma (máximo 2 decimales)
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
      EFECTOS DE VALIDACIÓN
  ========================================= */

  useEffect(() => {
    const updatedItems = items.map((item) => {
      const qty = parseToFloat(item.cantidad);
      const cost = parseToFloat(item.costo_unitario);
      const isValid = qty > 0 && cost > 0;

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
    <section className="pform-products-step">
      <div className="section-header-alt">
        <h2>Gestión de Productos</h2>
        <p style={{ fontSize: "0.8rem", color: "#666" }}>
          * Ingrese cantidad y costo. Use la coma (,) para decimales. Límite: 999.999.999,00
        </p>
      </div>

      <div className="pform-products-toolbar">
        <div className="search-container-full" onClick={onOpenSearch} style={{ cursor: "pointer" }}>
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar por SKU o descripción..." readOnly />
        </div>
        <button className="btn-add-new-product" onClick={onOpenCreate}>
          <Plus size={18} /> Crear producto nuevo
        </button>
      </div>

      {items.length === 0 ? (
        <div className="pform-empty-table-container">
          <p>No hay productos agregados.</p>
        </div>
      ) : (
        <div className="pform-items-table-container">
          <table className="pform-items-table">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>DESCRIPCIÓN</th>
                <th className="center">CANTIDAD</th>
                <th className="center">COSTO</th>
                <th className="center">TOTAL</th>
                <th className="center">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const qtyVal = parseToFloat(item.cantidad);
                const costVal = parseToFloat(item.costo_unitario);
                const totalLine = round2(qtyVal * costVal);
                
                const hasError = !item.cantidad || !item.costo_unitario || qtyVal <= 0 || costVal <= 0;

                return (
                  <tr key={item.id} style={{ backgroundColor: hasError ? "#fffafb" : "transparent" }}>
                    <td className="sku-cell">{item.sku?.substring(0, 10) || "S/C"}</td>
                    <td className="desc-cell">{item.descripcion}</td>

                    <td className="center">
                      <input
                        type="text"
                        className={`table-input-dynamic ${!qtyVal ? "input-error" : ""}`}
                        style={{
                          textAlign: "center",
                          width: calculateWidth(item.cantidad),
                          minWidth: "60px"
                        }}
                        // Se aplica el formateo inicial por si vienen datos de la DB
                        value={formatInitialValue(item.cantidad)}
                        onChange={(e) => handleInputChange(item.id, "cantidad", e.target.value)}
                        onBlur={(e) => handleBlurFormat(item.id, "cantidad", e.target.value)}
                        placeholder="0,00"
                        inputMode="decimal"
                      />
                    </td>

                    <td className="center">
                      <div className="input" style={{ display: 'inline-flex', justifyContent: "center", alignItems: 'center' }}>
                        <input
                          type="text"
                          className={`table-input-dynamic ${!costVal ? "input-error" : ""}`}
                          style={{
                            textAlign: "center",
                            width: calculateWidth(item.costo_unitario),
                            minWidth: "80px"
                          }}
                          // Se aplica el formateo inicial por si vienen datos de la DB
                          value={formatInitialValue(item.costo_unitario)}
                          onChange={(e) => handleInputChange(item.id, "costo_unitario", e.target.value)}
                          onBlur={(e) => handleBlurFormat(item.id, "costo_unitario", e.target.value)}
                          placeholder="0,00"
                          inputMode="decimal"
                        />
                      </div>
                    </td>

                    <td className="center total-cell" style={{ fontWeight: "700", color: "#333" }}>
                      {totalLine.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="center">
                      <div className="pform-actions-cell">
                        <button className="btn-batch-row" title="Lotes" onClick={() => onOpenBatch(item)}>
                          <Layers size={16} />
                        </button>
                        <button className="btn-edit-row" title="Editar" onClick={() => onEditProduct(item)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-delete-row" title="Quitar" onClick={() => removeItem(item.id)}>
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