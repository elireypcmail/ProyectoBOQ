import React, { useState, useEffect } from "react";
import { X, Calculator, ArrowRight, Loader2, Check } from "lucide-react";

import { useSales } from "../../../context/SalesContext";
import { useSettings } from "../../../context/SettingsContext";
import { useAuth } from "../../../context/AuthContext";

const BudgetExchangeRate = ({
  isOpen,
  onClose,
  onConfirm,
  budgetId,
  currentTasa,
}) => {
  const { exportBudgetToPDF } = useSales();
  const { imagesList } = useSettings();
  const { fetchUserById } = useAuth();

  const [moneda, setMoneda] = useState("USD");
  const [loading, setLoading] = useState(false);

  const [tasa, setTasa] = useState(
    currentTasa ? currentTasa.toString().replace(".", ",") : "",
  );

  // =========================
  // SELECCIÓN DE FIRMAS
  // =========================
  const [includeUserFirma, setIncludeUserFirma] = useState(true);
  const [includeCompanyFirma, setIncludeCompanyFirma] = useState(true);
  const [includeSello, setIncludeSello] = useState(true);

  // =========================
  // PREVIEWS
  // =========================
  const [previews, setPreviews] = useState({
    user: null,
    company: null,
    sello: null,
  });

  const tasaOriginal = parseFloat(currentTasa) || 0;

  const user = JSON.parse(localStorage.getItem("UserId") || "{}");

  // =========================
  // CARGAR PREVIEWS
  // =========================
  useEffect(() => {
    const loadSignatures = async () => {
      // =========================
      // FIRMA EMPRESA
      // =========================
      const imgEmpresa = imagesList?.find((i) =>
        i.nombre.toLowerCase().includes("firma"),
      );

      const companySrc = imgEmpresa?.data
        ? `data:${imgEmpresa.mime_type};base64,${imgEmpresa.data}`
        : null;

      // =========================
      // SELLO
      // =========================
      const imgSello = imagesList?.find((i) =>
        i.nombre.toLowerCase().includes("sello"),
      );

      const selloSrc = imgSello?.data
        ? `data:${imgSello.mime_type};base64,${imgSello.data}`
        : null;

      // =========================
      // FIRMA USUARIO
      // =========================
      let userSrc = null;

      try {
        const userId = user?.id || user;

        if (userId) {
          const res = await fetchUserById(userId);

          const userData = res?.data || res;

          const userSig = userData?.firma || userData?.images?.[0];

          if (userSig?.data) {
            userSrc = `data:${userSig.mime_type};base64,${userSig.data}`;
          }
        }
      } catch (e) {
        console.warn("Error preview firma usuario", e);
      }

      setPreviews({
        user: userSrc,
        company: companySrc,
        sello: selloSrc,
      });
    };

    if (isOpen) {
      loadSignatures();
    }
  }, [isOpen, imagesList]);

  // =========================
  // ACTUALIZAR TASA
  // =========================
  useEffect(() => {
    if (currentTasa) {
      setTasa(currentTasa.toString().replace(".", ","));
    }
  }, [currentTasa]);

  // =========================
  // INPUT TASA
  // =========================
  const handleInputChange = (e) => {
    let val = e.target.value.replace(/\./g, ",");

    const regex = /^\d*,?\d{0,2}$/;

    if (val === "" || regex.test(val)) {
      setTasa(val);
    }
  };

  // =========================
  // EXPORTAR
  // =========================
  const handleProcess = async () => {
    const tasaNumerica = parseFloat(tasa.replace(",", "."));

    // Validación
    if (
      (moneda === "BS" || moneda === "AMBOS") &&
      (!tasaNumerica || tasaNumerica <= 0)
    ) {
      alert("Por favor ingrese una tasa válida.");

      return;
    }

    setLoading(true);

    try {
      // Guardar exportación si cambió tasa
      if (tasaNumerica !== tasaOriginal) {
        await exportBudgetToPDF(budgetId, {
          tasa: tasaNumerica,
          id_usuario: user.id || user,
        });
      }

      // =========================
      // CONFIRMAR EXPORTACIÓN
      // =========================
      onConfirm({
        moneda,
        tasa: tasaNumerica,
        includeUserFirma,
        includeCompanyFirma,
        includeSello,
      });
    } catch (error) {
      console.error(error);

      alert("Error al procesar la exportación");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // =========================
  // COMPONENTE CARD FIRMA
  // =========================
  const SignatureOption = ({ label, isSelected, onToggle, src, fallback }) => (
    <div
      onClick={onToggle}
      style={{
        flex: 1,
        border: `2px solid ${isSelected ? "#e84053" : "#eee"}`,
        borderRadius: "10px",
        padding: "10px",
        cursor: "pointer",
        position: "relative",
        backgroundColor: isSelected ? "#fffafa" : "#fff",
        transition: "all .2s ease",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#666",
          textAlign: "center",
        }}
      >
        {label}
      </div>

      <div
        style={{
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9f9f9",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: "9px",
              color: "#999",
              textAlign: "center",
              padding: "5px",
            }}
          >
            {fallback}
          </span>
        )}
      </div>

      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            background: "#e84053",
            color: "#fff",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </div>
  );

  return (
    <div
      className="sdm-overlay"
      style={{
        zIndex: 1100,
        backgroundColor: "rgba(0,0,0,.6)",
      }}
    >
      <div
        className="sdm-modal-container"
        style={{
          maxWidth: "450px",
          padding: "20px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3
            className="bold"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
            }}
          >
            <Calculator size={18} />
            Configurar Exportación
          </h3>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            <X />
          </button>
        </div>

        {/* CONTENIDO */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {/* MONEDA */}
          <div>
            <label className="sdm-section-label">Moneda:</label>

            <select
              className="sdm-input"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                marginTop: "5px",
              }}
            >
              <option value="USD">Solo Dólares (USD)</option>

              <option value="BS">Solo Bolívares (BS)</option>

              <option value="AMBOS">Ambas Monedas (USD + BS)</option>
            </select>
          </div>

          {/* TASA */}
          {(moneda === "BS" || moneda === "AMBOS") && (
            <div>
              <label className="sdm-section-label">Tasa de Cambio (BCV):</label>

              <div
                style={{
                  position: "relative",
                  marginTop: "5px",
                }}
              >
                <input
                  type="text"
                  inputMode="decimal"
                  className="sdm-input"
                  value={tasa}
                  onChange={handleInputChange}
                  placeholder="0,00"
                  style={{
                    width: "100%",
                    padding: "8px 8px 8px 30px",
                    borderRadius: "6px",
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  Bs
                </span>
              </div>

              <small
                style={{
                  color: "#666",
                  fontSize: "11px",
                  marginTop: "8px",
                  display: "block",
                }}
              >
                {tasaOriginal > 0
                  ? `Tasa actual registrada: ${tasaOriginal.toString().replace(".", ",")}`
                  : "No hay tasa registrada."}
              </small>
            </div>
          )}

          {/* FIRMAS */}
          <div
            style={{
              borderTop: "1px solid #eee",
              paddingTop: "15px",
              marginTop: "5px",
            }}
          >
            <label
              className="sdm-section-label"
              style={{
                marginBottom: "12px",
                display: "block",
              }}
            >
              Firmas y sello a incluir:
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <SignatureOption
                label="MI FIRMA"
                isSelected={includeUserFirma}
                onToggle={() => setIncludeUserFirma(!includeUserFirma)}
                src={previews.user}
                fallback="Sin firma personal"
              />

              <SignatureOption
                label="EMPRESA"
                isSelected={includeCompanyFirma}
                onToggle={() => setIncludeCompanyFirma(!includeCompanyFirma)}
                src={previews.company}
                fallback="Sin firma empresa"
              />

              <SignatureOption
                label="SELLO"
                isSelected={includeSello}
                onToggle={() => setIncludeSello(!includeSello)}
                src={previews.sello}
                fallback="Sin sello"
              />
            </div>
          </div>

          {/* BOTÓN */}
          <button
            className="btn-action btn-confirm"
            onClick={handleProcess}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "10px",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {loading ? (
              <Loader2 className="v-spin" size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
            Confirmar y Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetExchangeRate;
