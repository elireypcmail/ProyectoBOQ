import React, { useState } from "react";
import { Lock, Loader2, X } from "lucide-react";

const ModalAuth = ({ onVerify, onVerifySuccess, onCancel }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await onVerify({ contrasena: password });
      
      if (res && res.status) {
        onVerifySuccess(); 
      } else {
        setError(res?.msg || "Contraseña incorrecta");
      }
    } catch (err) {
      console.error("AUTH ERROR:", err);
      setError("Error de comunicación con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-modal-overlay"> 
      <div className="pl-modal-box" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="pl-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="pl-modal-title" style={{ margin: 0 }}>Acceso Restringido</h3>
          <button onClick={onCancel} className="pl-icon-only-btn">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              padding: '1.25rem', 
              background: 'var(--pl-soft)', 
              borderRadius: '50%',
              border: '2px solid var(--pl-border)'
            }}>
              <Lock size={42} color="var(--pl-secondary)" />
            </div>
          </div>
          
          <p style={{ marginBottom: '1.5rem', color: 'var(--pl-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Esta sección contiene parámetros sensibles. <br/>
            <strong>Ingrese la contraseña maestra.</strong>
          </p>

          <div style={{ textAlign: 'left' }}>
            <label className="pl-modal-label">CONTRASEÑA</label>
            <input
              type="password"
              className="pl-modal-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{ textAlign: 'center', letterSpacing: '0.3em' }}
            />
          </div>

          {error && (
            <div style={{ 
              background: '#fee2e2', 
              color: '#dc2626', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              marginBottom: '1.25rem',
              fontWeight: '600',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <div className="pl-modal-footer-stack">
            <button 
              type="submit" 
              className="pl-btn-secondary" 
              disabled={loading || !password}
            >
              {loading ? <Loader2 className="v-spin" size={18} /> : "Desbloquear Parámetros"}
            </button>
            
            <button 
              type="button" 
              onClick={onCancel} 
              className="pl-btn-secondary-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAuth;