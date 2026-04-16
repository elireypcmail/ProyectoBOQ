import React, { useState, useMemo, useEffect } from "react";
import { X, Plus, Trash2, Save, Edit2, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useSettings } from "../../../../context/SettingsContext";
import "../../../../styles/ui/NotesModal.css";

const NotesModal = ({ isOpen, onClose }) => {
  const { 
    parametersList, 
    createNewParameter, 
    editParameter, 
    removeParameter, 
    loading,
    fetchAllParameters
  } = useSettings();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllParameters();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({ 
    titulo: "NotaPresupuesto", 
    contenido: "" 
  });

  // Filtramos las notas
  const notesList = useMemo(() => {
    return parametersList.filter(p => p.descripcion === "NotaPresupuesto");
  }, [parametersList]);

  // Verificamos si ya existe una nota
  const hasExistingNote = notesList.length > 0;

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ titulo: "NotaPresupuesto", contenido: "" });
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setFormData({ titulo: note.descripcion, contenido: note.valor });
    setIsAdding(true);
  };

  const handleAddNew = () => {
    if (hasExistingNote) return; // Validación de seguridad
    setIsAdding(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      descripcion: formData.titulo,
      valor: formData.contenido,
      tipo: "NOTA_PRESUPUESTO"
    };

    try {
      if (editingId) {
        await editParameter(editingId, data);
      } else {
        await createNewParameter(data);
      }
      resetForm();
    } catch (error) {
      console.error("Error al procesar la nota:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notes-modal-overlay">
      <div className="notes-modal-container">
        <header className="notes-modal-header">
          <div className="header-left">
            {isAdding && (
              <button className="btn-back" onClick={resetForm}><ArrowLeft size={20} /></button>
            )}
            <h2>{isAdding ? (editingId ? "Editar Nota" : "Nueva Nota") : "Notas de Presupuesto"}</h2>
          </div>
          <button onClick={onClose} className="btn-close-modal"><X size={20} /></button>
        </header>

        <div className="notes-modal-content">
          {!isAdding ? (
            <div className="notes-list-view">
              {/* ✅ Botón deshabilitado si ya existe una nota */}
              <button 
                className={`btn-add-note-action ${hasExistingNote ? 'disabled' : ''}`} 
                onClick={handleAddNew}
                disabled={hasExistingNote}
                title={hasExistingNote ? "Ya existe una nota configurada" : ""}
              >
                {hasExistingNote ? (
                  <><AlertCircle size={18} /> Solo se permite una nota de presupuesto</>
                ) : (
                  <><Plus size={18} /> Nueva Nota Predefinida</>
                )}
              </button>
              
              <div className="notes-scroll-area">
                {notesList.length === 0 ? (
                  <p className="empty-notes-text">No hay notas configuradas.</p>
                ) : (
                  notesList.map((note) => (
                    <div key={note.id} className="note-parameter-card">
                      <div className="note-content">
                        <h4>{note.descripcion}</h4>
                        <p>{note.valor}</p>
                      </div>
                      <div className="note-actions">
                        <button onClick={() => handleEdit(note)} className="edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => removeParameter(note.id)} className="delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="note-parameter-form">
              <div className="form-field">
                <label>Identificador del Parámetro</label>
                <input
                  type="text"
                  value={formData.titulo}
                  readOnly
                  className="lp-modal-input readonly-field"
                  style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
                />
              </div>

              <div className="form-field">
                <label>Texto de la Nota (Valor)</label>
                <textarea
                  className="lp-modal-input"
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  placeholder="Escriba el contenido legal o nota que aparecerá en la proforma..."
                  rows={10}
                  required
                  autoFocus
                />
              </div>

              <div className="form-btns">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
                  Guardar Nota
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesModal;