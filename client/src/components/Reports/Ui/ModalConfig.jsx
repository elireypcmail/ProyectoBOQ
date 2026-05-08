import React, { useEffect, useState } from "react";
import { X, Check, ArrowRight, Loader2, FileText } from "lucide-react";

import { useSettings } from "../../../context/SettingsContext";
import { useAuth } from "../../../context/AuthContext";

const ModalConfig = ({ isOpen, onClose, onConfirm }) => {
  const { imagesList } = useSettings();

  const { fetchUserById } = useAuth();

  const [loading, setLoading] = useState(false);

  // =========================================
  // ESTADOS
  // =========================================

  const [includeUserFirma, setIncludeUserFirma] = useState(true);

  const [includeCompanyFirma, setIncludeCompanyFirma] = useState(true);

  const [includeSello, setIncludeSello] = useState(true);

  const [previews, setPreviews] = useState({
    user: null,
    company: null,
    sello: null,
  });

  // =========================================
  // CARGAR PREVIEWS
  // =========================================

  useEffect(() => {
    const loadAssets = async () => {
      // =========================================
      // FIRMA EMPRESA
      // =========================================

      const imgEmpresa = imagesList?.find((i) =>
        i.nombre.toLowerCase().includes("firma"),
      );

      const companySrc = imgEmpresa?.data
        ? `data:${imgEmpresa.mime_type};base64,${imgEmpresa.data}`
        : null;

      // =========================================
      // SELLO
      // =========================================

      const imgSello = imagesList?.find((i) =>
        i.nombre.toLowerCase().includes("sello"),
      );

      const selloSrc = imgSello?.data
        ? `data:${imgSello.mime_type};base64,${imgSello.data}`
        : null;

      // =========================================
      // FIRMA USUARIO
      // =========================================

      let userSrc = null;

      try {
        const storedUser = localStorage.getItem("UserId");

        if (storedUser) {
          let userId;

          try {
            const parsed = JSON.parse(storedUser);

            userId = parsed?.id ?? parsed;
          } catch {
            userId = storedUser;
          }

          if (userId) {
            const res = await fetchUserById(userId);

            const userData = res?.data || res;

            const userSig = userData?.firma || userData?.images?.[0];

            if (userSig?.data) {
              userSrc = `data:${userSig.mime_type};base64,${userSig.data}`;
            }
          }
        }
      } catch (e) {
        console.warn("Error preview firma usuario", e);
      }

      // =========================================
      // SET PREVIEWS
      // =========================================

      setPreviews({
        user: userSrc,
        company: companySrc,
        sello: selloSrc,
      });
    };

    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, imagesList]);

  // =========================================
  // CONFIRMAR
  // =========================================

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm({
        includeUserFirma,
        includeCompanyFirma,
        includeSello,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // =========================================
  // COMPONENTE OPCIÓN
  // =========================================

  const SignatureOption = ({ label, isSelected, onToggle, src, fallback }) => (
    <div
      onClick={onToggle}
      style={{
        flex: 1,
        border: `2px solid ${isSelected ? "#e84053" : "#e5e7eb"}`,
        borderRadius: "10px",
        padding: "10px",
        cursor: "pointer",
        position: "relative",
        backgroundColor: isSelected ? "#fff5f6" : "#fff",
        transition: "all .2s ease",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: "#555",
          textAlign: "center",
        }}
      >
        {label}
      </div>

      <div
        style={{
          height: "55px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
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
              fontSize: "10px",
              color: "#999",
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
            color: "white",
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
        zIndex: 1200,
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
    >
      <div
        className="sdm-modal-container"
        style={{
          maxWidth: "550px",
          padding: "20px",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            <FileText size={18} />
            Configurar PDF
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
            gap: "18px",
          }}
        >
          <div>
            <label
              className="sdm-section-label"
              style={{
                marginBottom: "12px",
                display: "block",
              }}
            >
              Elementos a incluir:
            </label>

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <SignatureOption
                label="MI FIRMA"
                isSelected={includeUserFirma}
                onToggle={() => setIncludeUserFirma(!includeUserFirma)}
                src={previews.user}
                fallback="Sin firma"
              />

              <SignatureOption
                label="EMPRESA"
                isSelected={includeCompanyFirma}
                onToggle={() => setIncludeCompanyFirma(!includeCompanyFirma)}
                src={previews.company}
                fallback="Sin firma"
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
            onClick={handleConfirm}
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            {loading ? (
              <Loader2 className="v-spin" size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
            Confirmar y Generar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfig;
