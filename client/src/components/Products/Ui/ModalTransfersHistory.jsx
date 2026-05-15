import React, { useEffect, useState } from "react";
import {
  X,
  ArrowRight,
  Package,
  Warehouse,
  Layers,
  Loader2,
  ClipboardList,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import "../../../styles/ui/ModalTransfersHistory.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Fila expandible de un traslado ──────────────────────────────────────────
const TransferRow = ({ transfer, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`mth-row ${expanded ? "mth-row--open" : ""}`} style={{ animationDelay: `${index * 40}ms` }}>
      {/* Cabecera clickeable */}
      <button className="mth-row-header" onClick={() => setExpanded((p) => !p)}>
        <div className="mth-row-id">
          <span className="mth-id-badge">#{transfer.id}</span>
        </div>

        <div className="mth-row-meta">
          <span className="mth-row-motivo">{transfer.motivo || "Sin motivo"}</span>
          <span className="mth-row-user">
            <User size={11} /> {transfer.usuario}
          </span>
        </div>

        <div className="mth-row-date">
          <Calendar size={11} />
          {formatDate(transfer.fecha_creacion)}
        </div>

        <div className="mth-row-items-count">
          <Package size={11} />
          {transfer.items.length} línea{transfer.items.length !== 1 ? "s" : ""}
        </div>

        <div className="mth-row-chevron">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Detalle expandido */}
      {expanded && (
        <div className="mth-row-detail">
          {transfer.items.map((item) => (
            <div key={item.id_detalle} className="mth-item">
              {/* Origen */}
              <div className="mth-side mth-side--origin">
                <div className="mth-side-tag">Origen</div>
                <div className="mth-prod-name">{item.origen.producto}</div>
                <div className="mth-prod-sku">{item.origen.sku}</div>
                <div className="mth-prod-dep">
                  <Warehouse size={11} /> {item.origen.deposito}
                </div>
                {item.origen.lote && (
                  <div className="mth-prod-lote">
                    <Layers size={11} />
                    Lote {item.origen.lote.nro_lote}
                    {item.origen.lote.fecha_vencimiento && (
                      <span className="mth-venc">
                        &nbsp;· Vence {formatDate(item.origen.lote.fecha_vencimiento).split(",")[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Flecha + cantidad */}
              <div className="mth-arrow-col">
                <ArrowRight size={18} className="mth-arrow-icon" />
                <span className="mth-qty-badge">{item.cantidad} u.</span>
              </div>

              {/* Destino */}
              <div className="mth-side mth-side--dest">
                <div className="mth-side-tag mth-side-tag--dest">Destino</div>
                <div className="mth-prod-name">{item.destino.producto}</div>
                <div className="mth-prod-sku">{item.destino.sku}</div>
                <div className="mth-prod-dep">
                  <Warehouse size={11} /> {item.destino.deposito}
                </div>
                {item.destino.nro_lote_destino && (
                  <div className="mth-prod-lote">
                    <Layers size={11} /> Lote {item.destino.nro_lote_destino}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Modal principal ──────────────────────────────────────────────────────────
const ModalTransfersHistory = ({ isOpen, onClose, getTransfers }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ useEffect siempre se ejecuta — sin early return antes de él
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setError(null);
    setLoading(true);

    getTransfers()
      .then((res) => {
        if (cancelled) return;
        if (res.status) setTransfers(res.data || []);
        else setError("No se pudieron cargar los traslados.");
      })
      .catch(() => {
        if (!cancelled) setError("Error de conexión.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen]);

  // ✅ Guard DESPUÉS de todos los hooks
  if (!isOpen) return null;

  return (
    <div className="mth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mth-card">
        {/* Header */}
        <div className="mth-header">
          <div className="mth-header-left">
            <ClipboardList size={18} className="mth-header-icon" />
            <div>
              <h3 className="mth-title">Historial de Traslados</h3>
              {!loading && !error && (
                <p className="mth-subtitle">{transfers.length} registro{transfers.length !== 1 ? "s" : ""} encontrado{transfers.length !== 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
          <button className="mth-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="mth-body">
          {loading && (
            <div className="mth-state-center">
              <Loader2 size={28} className="mth-spin" />
              <p>Cargando traslados...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mth-state-center mth-state-error">
              <AlertTriangle size={28} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && transfers.length === 0 && (
            <div className="mth-state-center">
              <ClipboardList size={32} style={{ opacity: 0.25 }} />
              <p style={{ color: "#94a3b8" }}>No hay traslados registrados.</p>
            </div>
          )}

          {!loading && !error && transfers.length > 0 && (
            <div className="mth-list">
              {transfers.map((t, i) => (
                <TransferRow key={t.id} transfer={t} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mth-footer">
          <button className="mth-btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTransfersHistory;