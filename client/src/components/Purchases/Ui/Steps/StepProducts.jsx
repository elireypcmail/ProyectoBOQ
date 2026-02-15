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
      HELPERS PARA NÚMEROS Y REDONDEO
  ========================================= */

  const round2 = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const parseToFloat = (value) => {
    if (!value) return 0;
    const standardNumber = value.toString().replace(/\./g, "").replace(",", ".");
    return parseFloat(standardNumber) || 0;
  };

  const calculateWidth = (value, minWidth) => {
    const length = value ? value.toString().length : 0;
    return `${Math.max(minWidth, length + 1)}ch`;
  };

  /* =========================================
      MANEJO DE INPUTS
  ========================================= */
  
const handleInputChange = (id, field, value) => {
  const currentItem = items.find(item => item.id === id);
  if (!currentItem) return;

  // 1. BLOQUEO Y ALERTA: Máximo 9 caracteres totales (incluyendo la coma)
  if (value.length > 12) {
    alert("Límite excedido: Solo se permiten 9 caracteres en total.");
    return; 
  }

  // 2. VALIDACIÓN DE FORMATO: Solo números y máximo 2 decimales tras la coma
  const regex = /^\d*(,\d{0,2})?$/;

  if (value === "" || regex.test(value)) {
    let finalValue = value;

    // Limpieza de ceros iniciales (opcional, mantiene el 0 si es "0,")
    if (value.length > 1 && value.startsWith("0") && value[1] !== ",") {
      finalValue = value.substring(1);
    }

    const updatedItems = items.map((item) => {
      if (item.id === id) return { ...item, [field]: finalValue };
      return item;
    });
    setItems(updatedItems);
  }
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

    const hasChanges = JSON.stringify(updatedItems) !== JSON.stringify(items);
    if (hasChanges) {
      setItems(updatedItems);
    }
  }, [items, setItems]);

  return (
    <section className="pform-products-step">
      <div className="section-header-alt">
        <h2>Gestión de Productos</h2>
        <p style={{ fontSize: "0.8rem", color: "#666" }}>
          * Máximo 9 caracteres en total y 2 decimales (use la coma ",").
        </p>
      </div>

      <div className="pform-products-toolbar">
        <div
          className="search-container-full"
          onClick={onOpenSearch}
          style={{ cursor: "pointer" }}
        >
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por SKU o descripción..."
            readOnly
          />
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
                            width: calculateWidth(item.cantidad, 6)
                        }}
                        value={qtyVal === 0 && !item.cantidad.toString().includes(',') ? "" : item.cantidad}
                        onChange={(e) => handleInputChange(item.id, "cantidad", e.target.value)}
                        placeholder="0"
                        inputMode="decimal"
                      />
                    </td>

                    <td className="center">
                      <div className="input" style={{ display: 'inline-flex', textAlign: "center", alignItems: 'center' }}>
                        <input
                          type="text"
                          className={`table-input-dynamic ${!costVal ? "input-error" : ""}`}
                          style={{ 
                              textAlign: "left", 
                              width: calculateWidth(item.costo_unitario, 8)
                          }}
                          value={costVal === 0 && !item.costo_unitario.toString().includes(',') ? "" : item.costo_unitario}
                          onChange={(e) => handleInputChange(item.id, "costo_unitario", e.target.value)}
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