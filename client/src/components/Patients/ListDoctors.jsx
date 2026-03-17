import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Modals Refactorizados
import DoctorFormModal from './ui/DoctorFormModal';
import ModalDetailedDoctor from './ui/ModalDetailedDoctor'; 

import "../../styles/components/ListZone.css";

const ListDoctors = () => {
  const { 
    medicos,
    tipoMedicos,
    getAllMedicos,
    getAllTipoMedicos,
    createNewMedico,
    editedMedico,
    deleteMedicoById,
    createNewTipoMedico
  } = useHealth();

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Estados de Modales
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    getAllMedicos();
    getAllTipoMedicos();
  }, []);

  // -------------------- Filtrado y Ordenación Alfabética --------------------
  const filteredMedicos = useMemo(() => {
    const list = medicos || [];

    // 1. Filtrar por término de búsqueda
    const filtered = list.filter(m =>
      m.nombre.toUpperCase().includes(searchTerm.toUpperCase())
    );

    // 2. Ordenar alfabéticamente por nombre
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [medicos, searchTerm]);

  const totalPages = Math.ceil(filteredMedicos.length / itemsPerPage);
  const currentMedicos = filteredMedicos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones Core --------------------
  const handleSaveDoctor = async (formData) => {
    try {
      const payload = {
        nombre: formData.nombre.toUpperCase(), // Guardamos en mayúsculas para consistencia
        telefono: formData.telefono,
        id_tipoMedico: Number(formData.id_tipomedico),
        estatus: true
      };

      if (selectedMedico) {
        await editedMedico(selectedMedico.id, payload);
      } else {
        await createNewMedico(payload);
      }
      
      setIsFormModalOpen(false);
      setSelectedMedico(null);
      getAllMedicos();
    } catch (error) {
      console.error("Error al guardar médico:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedico) return;
    try {
      await deleteMedicoById(selectedMedico.id);
      setIsDeleteModalOpen(false);
      setSelectedMedico(null);
      getAllMedicos();
    } catch (error) {
      console.error("Error eliminando médico:", error);
    }
  };

  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Gestión de Personal Médico</h2>
          <p>Personal médico registrado: {filteredMedicos.length}</p>
        </div>
        <button className="btn-primary" onClick={() => { 
          setSelectedMedico(null); 
          setIsFormModalOpen(true); 
        }}>
          <Plus size={16} /> Nuevo Médico
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="BUSCAR PERSONAL MÉDICO..."
            value={searchTerm}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => { 
              setSearchTerm(e.target.value.toUpperCase()); 
              setCurrentPage(1); 
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="hide-mobile">Teléfono</th>
              <th className="hide-mobile">Tipo</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentMedicos.length > 0 ? currentMedicos.map(medico => (
              <tr key={medico.id}>
                <td className="bold">{medico.nombre.toUpperCase()}</td>
                <td className="hide-mobile">{medico.telefono ? `+${medico.telefono}` : "-"}</td>
                <td className="hide-mobile">
                  <span className="badge-type">
                    {medico.tipo?.toUpperCase()}
                  </span>
                </td>
                <td className="center">
                  <button className="icon-btn" onClick={() => { 
                    setSelectedMedico(medico); 
                    setIsDetailsModalOpen(true); 
                  }}>
                    <SlOptionsVertical size={16}/>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="no-results">No se encontraron médicos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR */}
      <DoctorFormModal 
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedMedico(null); }}
        onSave={handleSaveDoctor}
        tipoMedicos={tipoMedicos}
        selectedMedico={selectedMedico}
        onCreateTipoMedico={createNewTipoMedico}
      />

      {/* MODAL: DETALLES */}
      <ModalDetailedDoctor 
        isOpen={isDetailsModalOpen}
        doctor={selectedMedico}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={() => { setIsDetailsModalOpen(false); setIsFormModalOpen(true); }}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {/* MODAL: ELIMINAR */}
      {isDeleteModalOpen && selectedMedico && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar médico?</h3>
            </div>
            <p>¿Estás seguro de eliminar a <strong>{selectedMedico.nombre.toUpperCase()}</strong>?</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListDoctors;