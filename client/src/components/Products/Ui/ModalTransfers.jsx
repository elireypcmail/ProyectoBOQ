import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeftRight,
  Package,
  Warehouse,
  Layers,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Search,
  AlertTriangle,
  Plus,
  Trash2,
  History,
  ClipboardList,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useProducts } from "../../../context/ProductsContext";

import "../../../styles/ui/ModalTransfers.css";
import "../../../styles/ui/ModalTransfersHistory.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeParse = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  return parseFloat(v.toString().replace(",", ".")) || 0;
};

// ─── Subcomponente: Selector con búsqueda ─────────────────────────────────────
const SearchSelect = ({
  label,
  icon: Icon,
  placeholder,
  value,
  options,
  onSelect,
  displayKey = "descripcion",
  subKey = null,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((o) =>
    (o?.[displayKey] || "").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <label className="mt-label">
          {Icon && <Icon size={12} style={{ marginRight: 4 }} />}
          {label}
        </label>
      )}

      <div style={{ position: "relative" }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            pointerEvents: "none",
          }}
        />
        <input
          className="mt-input"
          style={{ paddingLeft: "32px" }}
          placeholder={value ? value[displayKey] || placeholder : placeholder}
          value={open ? query : value ? value[displayKey] : ""}
          onFocus={() => { setOpen(true); setQuery(""); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {open && (
        <div className="mt-drop-list">
          {filtered.length === 0 ? (
            <div style={{ padding: "12px 14px", color: "#94a3b8", fontSize: "0.82rem" }}>
              Sin resultados
            </div>
          ) : (
            filtered.map((opt, i) => (
              <div
                key={opt.id || i}
                className="mt-drop-item"
                onMouseDown={() => { onSelect(opt); setOpen(false); }}
              >
                <div className="mt-drop-item-title">{opt[displayKey]}</div>
                {subKey && opt[subKey] !== undefined && (
                  <div className="mt-drop-item-sub">{subKey}: {opt[subKey]}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Helpers historial ────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-VE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─── Fila expandible ──────────────────────────────────────────────────────────
const TransferRow = ({ transfer, index }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`mth-row ${expanded ? "mth-row--open" : ""}`} style={{ animationDelay: `${index * 40}ms` }}>
      <button className="mth-row-header" onClick={() => setExpanded((p) => !p)}>
        <div className="mth-row-id"><span className="mth-id-badge">#{transfer.id}</span></div>
        <div className="mth-row-meta">
          <span className="mth-row-motivo">{transfer.motivo || "Sin motivo"}</span>
          <span className="mth-row-user"><User size={11} /> {transfer.usuario}</span>
        </div>
        <div className="mth-row-date"><Calendar size={11} />{formatDate(transfer.fecha_creacion)}</div>
        <div className="mth-row-items-count">
          <Package size={11} />{transfer.items.length} línea{transfer.items.length !== 1 ? "s" : ""}
        </div>
        <div className="mth-row-chevron">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {expanded && (
        <div className="mth-row-detail">
          {transfer.items.map((item) => (
            <div key={item.id_detalle} className="mth-item">
              <div className="mth-side mth-side--origin">
                <div className="mth-side-tag">Origen</div>
                <div className="mth-prod-name">{item.origen.producto}</div>
                <div className="mth-prod-sku">{item.origen.sku}</div>
                <div className="mth-prod-dep"><Warehouse size={11} /> {item.origen.deposito}</div>
                {item.origen.lote && (
                  <div className="mth-prod-lote">
                    <Layers size={11} /> Lote {item.origen.lote.nro_lote}
                    {item.origen.lote.fecha_vencimiento && (
                      <span className="mth-venc">
                        &nbsp;· Vence {formatDate(item.origen.lote.fecha_vencimiento).split(",")[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="mth-arrow-col">
                <ArrowRight size={18} className="mth-arrow-icon" />
                <span className="mth-qty-badge">{item.cantidad} u.</span>
              </div>
              <div className="mth-side mth-side--dest">
                <div className="mth-side-tag mth-side-tag--dest">Destino</div>
                <div className="mth-prod-name">{item.destino.producto}</div>
                <div className="mth-prod-sku">{item.destino.sku}</div>
                <div className="mth-prod-dep"><Warehouse size={11} /> {item.destino.deposito}</div>
                {item.destino.nro_lote_destino && (
                  <div className="mth-prod-lote"><Layers size={11} /> Lote {item.destino.nro_lote_destino}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ModalTransfers = ({ isOpen, onClose }) => {
  const {
    products,
    productDeposits,
    getAllProducts,
    getEDepositsByProduct,
    getAllLotesByProd,
    createTransfer,
    getTransfers,  // 👈 función del contexto
  } = useProducts();

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const emptyItem = () => ({
    _key: crypto.randomUUID(),
    producto_origen: null,
    deposito_origen: null,
    lote_origen: null,
    producto_destino: null,
    deposito_destino: null,
    lote_destino: null,
    cantidad: "",
    lotes_origen_disponibles: [],
    lotes_destino_disponibles: [],
    depositos_origen_disponibles: [],
    depositos_destino_disponibles: [],
  });

  // ─── States ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [historyTransfers, setHistoryTransfers] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // ─── Reset modal ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMotivo("");
      setItems([emptyItem()]);
      setIsSubmitting(false);
      setShowHistory(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ─── Helpers de actualización ──────────────────────────────────────────────
  const updateItem = (idx, patch) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const setLoading = (idx, key, val) =>
    setLoadingIdx((prev) => ({ ...prev, [`${idx}_${key}`]: val }));

  const isLoading = (idx, key) => !!loadingIdx[`${idx}_${key}`];

  // ─── Producto origen ───────────────────────────────────────────────────────
  const handleSelectProductoOrigen = async (idx, producto) => {
    updateItem(idx, {
      producto_origen: producto,
      deposito_origen: null,
      lote_origen: null,
      lotes_origen_disponibles: [],
      depositos_origen_disponibles: [],
    });
    setLoading(idx, "dep_origen", true);
    try {
      const deps = await getEDepositsByProduct(producto.id);
      updateItem(idx, { depositos_origen_disponibles: deps });
    } finally {
      setLoading(idx, "dep_origen", false);
    }
  };

  // ─── Depósito origen ───────────────────────────────────────────────────────
  const handleSelectDepositoOrigen = async (idx, deposito) => {
    const item = items[idx];
    updateItem(idx, { deposito_origen: deposito, lote_origen: null, lotes_origen_disponibles: [] });
    if (!item.producto_origen?.estatus_lotes) return;

    setLoading(idx, "lotes", true);
    try {
      const todosLotes = await getAllLotesByProd(item.producto_origen.id);
      const depositoId = deposito.id_deposito ?? deposito.id;
      const lotesFiltrados = todosLotes.filter((l) => {
        const loteDepositoId = l.id_deposito ?? l.deposito_id;
        return Number(loteDepositoId) === Number(depositoId);
      });
      updateItem(idx, { lotes_origen_disponibles: lotesFiltrados });
    } finally {
      setLoading(idx, "lotes", false);
    }
  };

  // ─── Producto destino ──────────────────────────────────────────────────────
  const handleSelectProductoDestino = async (idx, producto) => {
    updateItem(idx, {
      producto_destino: producto,
      deposito_destino: null,
      lote_destino: null,
      lotes_destino_disponibles: [],
      depositos_destino_disponibles: [],
    });
    setLoading(idx, "dep_destino", true);
    try {
      const deps = await getEDepositsByProduct(producto.id);
      updateItem(idx, { depositos_destino_disponibles: deps });
    } finally {
      setLoading(idx, "dep_destino", false);
    }
  };

  // ─── Depósito destino ──────────────────────────────────────────────────────
  const handleSelectDepositoDestino = async (idx, deposito) => {
    const item = items[idx];
    updateItem(idx, { deposito_destino: deposito, lote_destino: null, lotes_destino_disponibles: [] });
    if (!item.producto_destino?.estatus_lotes) return;

    setLoading(idx, "lotes_destino", true);
    try {
      const todosLotes = await getAllLotesByProd(item.producto_destino.id);
      const depositoId = deposito.id_deposito ?? deposito.id;
      const lotesFiltrados = todosLotes.filter((l) => {
        const loteDepositoId = l.id_deposito ?? l.deposito_id;
        return Number(loteDepositoId) === Number(depositoId);
      });
      updateItem(idx, { lotes_destino_disponibles: lotesFiltrados });
    } finally {
      setLoading(idx, "lotes_destino", false);
    }
  };

  // ─── Validación ────────────────────────────────────────────────────────────
  const isItemValid = (it) => {
    if (!it.producto_origen || !it.deposito_origen) return false;
    if (!it.producto_destino || !it.deposito_destino) return false;
    const cantidad = safeParse(it.cantidad);
    if (!cantidad || cantidad <= 0) return false;
    if (it.producto_origen?.estatus_lotes) {
      if (!it.lote_origen) return false;
      if (cantidad > Number(it.lote_origen.cantidad || 0)) return false;
    }
    if (it.producto_destino?.estatus_lotes) {
      if (!it.lote_destino) return false;
    }
    return true;
  };

  const allItemsValid = items.every(isItemValid) && items.length > 0;

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const userStorage = localStorage.getItem("UserId");
    const userData = userStorage ? JSON.parse(userStorage) : null;
    const idUsuario = userData?.id || null;

    try {
      const payload = {
        motivo,
        id_usuario: idUsuario,
        items: items.map((it) => ({
          id_producto_origen: it.producto_origen.id,
          id_deposito_origen: it.deposito_origen.id_deposito ?? it.deposito_origen.id,
          id_lote_origen: it.lote_origen?.id || null,
          id_producto_destino: it.producto_destino.id,
          id_deposito_destino: it.deposito_destino.id_deposito ?? it.deposito_destino.id,
          id_lote_destino: it.lote_destino?.id || null,
          cantidad: safeParse(it.cantidad),
        })),
      };
      await createTransfer(payload);
      await getAllProducts();
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Abrir historial ───────────────────────────────────────────────────────
  const handleOpenHistory = async () => {
    setShowHistory(true);
    setHistoryError(null);
    setHistoryLoading(true);
    try {
      const res = await getTransfers();
      if (res.status) setHistoryTransfers(res.data || []);
      else setHistoryError("No se pudieron cargar los traslados.");
    } catch {
      setHistoryError("Error de conexión.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // ─── Depositos flat ────────────────────────────────────────────────────────
  const depositos_flat = (productDeposits || []).map((d) => ({
    ...d,
    id_deposito: d.id_deposito ?? d.id,
    deposito_nombre: d.deposito_nombre ?? d.nombre,
  }));

  return (
    <div className="mt-overlay">
      <div className="mt-card">

        {/* ══════════════════════════════════════════════════════════════════
            VISTA: HISTORIAL
        ══════════════════════════════════════════════════════════════════ */}
        {showHistory ? (
          <>
            <div className="mt-header">
              <h3 className="mt-header-title">
                <ClipboardList size={18} color="#e84053" />
                Historial de Traslados
                {!historyLoading && !historyError && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#64748b", marginLeft: 8 }}>
                    {historyTransfers.length} registro{historyTransfers.length !== 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              <button onClick={onClose} className="mt-header-close"><X size={20} /></button>
            </div>

            <div className="mt-body">
              {historyLoading && (
                <div className="mth-state-center">
                  <Loader2 size={28} className="mt-spin" />
                  <p>Cargando traslados...</p>
                </div>
              )}
              {!historyLoading && historyError && (
                <div className="mth-state-center" style={{ color: "#f87171" }}>
                  <AlertTriangle size={28} />
                  <p>{historyError}</p>
                </div>
              )}
              {!historyLoading && !historyError && historyTransfers.length === 0 && (
                <div className="mth-state-center">
                  <ClipboardList size={32} style={{ opacity: 0.25 }} />
                  <p style={{ color: "#94a3b8" }}>No hay traslados registrados.</p>
                </div>
              )}
              {!historyLoading && !historyError && historyTransfers.length > 0 && (
                <div className="mth-list">
                  {historyTransfers.map((t, i) => (
                    <TransferRow key={t.id} transfer={t} index={i} />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-footer">
              <button className="mt-btn-secondary" onClick={() => setShowHistory(false)}>
                <ChevronLeft size={16} /> Volver
              </button>
            </div>
          </>

        ) : (
        /* ══════════════════════════════════════════════════════════════════
            VISTA: FORMULARIO DE TRASLADO
        ══════════════════════════════════════════════════════════════════ */
          <>
            {/* ── HEADER ── */}
            <div className="mt-header">
              <h3 className="mt-header-title">
                <ArrowLeftRight size={18} color="#e84053" />
                Traslado de Existencia
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="mt-btn-history" onClick={handleOpenHistory} title="Ver historial de traslados">
                  <History size={16} /> Historial
                </button>
                <button onClick={onClose} className="mt-header-close"><X size={20} /></button>
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="mt-body">
              {/* Steps */}
              <div className="mt-steps">
                {[
                  { n: 1, label: "Líneas de traslado" },
                  { n: 2, label: "Confirmar" },
                ].map(({ n, label }, i, arr) => (
                  <React.Fragment key={n}>
                    <div className={`mt-step ${step > n ? "mt-step-done" : step === n ? "mt-step-active" : ""}`}>
                      <div className={`mt-step-dot ${step > n ? "mt-step-dot-done" : step === n ? "mt-step-dot-active" : ""}`}>
                        {step > n ? <CheckCircle size={13} /> : n}
                      </div>
                      {label}
                    </div>
                    {i < arr.length - 1 && <div className="mt-step-divider" />}
                  </React.Fragment>
                ))}
              </div>

              {/* ══ PASO 1 ═══════════════════════════════════════════════════ */}
              {step === 1 && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <label className="mt-label">Motivo del traslado</label>
                    <input
                      className="mt-input"
                      placeholder="Ej: Reubicación de stock..."
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                    />
                  </div>

                  {items.map((item, idx) => (
                    <div key={item._key} className="mt-item-card">
                      <div className="mt-line-header">
                        <span className="mt-line-title">Línea #{idx + 1}</span>
                        {items.length > 1 && (
                          <button className="mt-btn-danger" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* ── ORIGEN ── */}
                      <div className="mt-section-title mt-source-title"><Package size={12} /> Origen</div>
                      <div className="mt-grid-3">
                        <SearchSelect label="Producto" icon={Package} placeholder="Buscar producto..."
                          value={item.producto_origen} options={products}
                          onSelect={(p) => handleSelectProductoOrigen(idx, p)} displayKey="descripcion" subKey="sku" />

                        <div>
                          <label className="mt-label"><Warehouse size={12} style={{ marginRight: 4 }} /> Depósito</label>
                          {isLoading(idx, "dep_origen") ? (
                            <div className="mt-input"><Loader2 size={14} className="mt-spin" /> Cargando...</div>
                          ) : (
                            <SearchSelect placeholder={item.producto_origen ? "Seleccionar..." : "Primero elige producto"}
                              value={item.deposito_origen}
                              options={item.producto_origen ? item.depositos_origen_disponibles : depositos_flat}
                              onSelect={(d) => handleSelectDepositoOrigen(idx, d)}
                              displayKey="deposito_nombre" subKey="existencia_deposito" />
                          )}
                        </div>

                        <div>
                          <label className="mt-label"><Layers size={12} style={{ marginRight: 4 }} /> Lote origen</label>
                          {isLoading(idx, "lotes") ? (
                            <div className="mt-input"><Loader2 size={14} className="mt-spin" /> Cargando...</div>
                          ) : item.lotes_origen_disponibles.length > 0 ? (
                            <SearchSelect placeholder="Seleccionar lote..." value={item.lote_origen}
                              options={item.lotes_origen_disponibles}
                              onSelect={(l) => updateItem(idx, { lote_origen: l })}
                              displayKey="nro_lote" subKey="cantidad" />
                          ) : (
                            <input className="mt-input"
                              value={item.producto_origen?.estatus_lotes ? "Sin lotes disponibles" : "No maneja lotes"} disabled />
                          )}
                        </div>
                      </div>

                      {item.lote_origen && (
                        <div style={{ marginTop: "8px" }}>
                          <span className="mt-badge"><CheckCircle size={11} /> Disponible en lote: {item.lote_origen.cantidad} u.</span>
                        </div>
                      )}
                      {item.producto_origen && !item.producto_origen.estatus_lotes && (
                        <div style={{ marginTop: "8px" }}>
                          <span className="mt-badge"><CheckCircle size={11} /> Existencia general: {item.producto_origen.existencia_general} u.</span>
                        </div>
                      )}

                      <div style={{ marginTop: "14px", maxWidth: "180px" }}>
                        <label className="mt-label">Cantidad a trasladar</label>
                        <input type="number" min="1" className="mt-input" placeholder="0"
                          value={item.cantidad} onChange={(e) => updateItem(idx, { cantidad: e.target.value })} />
                      </div>

                      {item.lote_origen && safeParse(item.cantidad) > Number(item.lote_origen.cantidad || 0) && (
                        <div className="mt-alert-box"><AlertTriangle size={13} /> La cantidad excede el stock del lote.</div>
                      )}

                      {/* ── DESTINO ── */}
                      <div className="mt-divider-arrow"></div>
                      <div className="mt-section-title mt-dest-title"><Package size={12} /> Destino</div>
                      <div className="mt-grid-3">
                        <SearchSelect label="Producto" icon={Package} placeholder="Buscar producto..."
                          value={item.producto_destino}
                          options={products.filter((p) => p.id !== item.producto_origen?.id)}
                          onSelect={(p) => handleSelectProductoDestino(idx, p)} displayKey="descripcion" subKey="sku" />

                        <div>
                          <label className="mt-label"><Warehouse size={12} style={{ marginRight: 4 }} /> Depósito</label>
                          {isLoading(idx, "dep_destino") ? (
                            <div className="mt-input"><Loader2 size={14} className="mt-spin" /> Cargando...</div>
                          ) : (
                            <SearchSelect placeholder={item.producto_destino ? "Seleccionar..." : "Primero elige producto"}
                              value={item.deposito_destino}
                              options={item.producto_destino ? item.depositos_destino_disponibles : depositos_flat}
                              onSelect={(d) => handleSelectDepositoDestino(idx, d)}
                              displayKey="deposito_nombre" subKey="existencia_deposito" />
                          )}
                        </div>

                        <div>
                          <label className="mt-label"><Layers size={12} style={{ marginRight: 4 }} /> Lote destino</label>
                          {isLoading(idx, "lotes_destino") ? (
                            <div className="mt-input"><Loader2 size={14} className="mt-spin" /> Cargando...</div>
                          ) : item.producto_destino?.estatus_lotes ? (
                            item.lotes_destino_disponibles.length > 0 ? (
                              <SearchSelect placeholder="Seleccionar lote..." value={item.lote_destino}
                                options={item.lotes_destino_disponibles}
                                onSelect={(l) => updateItem(idx, { lote_destino: l })}
                                displayKey="nro_lote" subKey="cantidad" />
                            ) : (
                              <input className="mt-input" value="Sin lotes disponibles" disabled />
                            )
                          ) : (
                            <input className="mt-input" value="No maneja lotes" disabled />
                          )}
                        </div>
                      </div>

                      {!isItemValid(item) && item.cantidad && (
                        <div className="mt-alert-box"><AlertTriangle size={13} /> Completa todos los campos requeridos.</div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* ══ PASO 2 ═══════════════════════════════════════════════════ */}
              {step === 2 && (
                <div>
                  {items.map((it, idx) => (
                    <div key={it._key} className="mt-item-card">
                      <div className="mt-line-title">Línea #{idx + 1}</div>
                      <div className="mt-confirm-card">
                        <div className="mt-confirm-box">
                          <div className="mt-confirm-prod">{it.producto_origen?.descripcion}</div>
                          <div className="mt-confirm-detail">{it.deposito_origen?.deposito_nombre}</div>
                          {it.lote_origen && <div className="mt-confirm-detail">Lote: {it.lote_origen.nro_lote}</div>}
                        </div>
                        <div className="mt-confirm-arrow">
                          <ArrowRight size={20} color="#e84053" />
                          <span className="mt-badge">{it.cantidad} u.</span>
                        </div>
                        <div className="mt-confirm-box">
                          <div className="mt-confirm-prod">{it.producto_destino?.descripcion}</div>
                          <div className="mt-confirm-detail">{it.deposito_destino?.deposito_nombre}</div>
                          {it.lote_destino && <div className="mt-confirm-detail">Lote: {it.lote_destino.nro_lote}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="mt-footer">
              <button className="mt-btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
              <div style={{ display: "flex", gap: "10px" }}>
                {step === 2 && (
                  <button className="mt-btn-ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
                    <ChevronLeft size={16} /> Atrás
                  </button>
                )}
                {step === 1 && (
                  <button className="mt-btn-primary" disabled={!allItemsValid} onClick={() => setStep(2)}>
                    Revisar traslado <ChevronRight size={16} />
                  </button>
                )}
                {step === 2 && (
                  <button className="mt-btn-primary success" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting
                      ? <><Loader2 size={16} className="mt-spin" /> Procesando...</>
                      : <><CheckCircle size={16} /> Confirmar traslado</>
                    }
                  </button>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ModalTransfers;