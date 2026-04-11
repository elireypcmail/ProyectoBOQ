import React, { useEffect, useState, useMemo } from "react";
import { useClinics } from "../../context/ClinicsContext";
import { useEntity } from "../../context/EntityContext";
import { 
  Search, Plus, AlertTriangle, Loader2, 
  ChevronLeft, ChevronRight, MapPin
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Componentes UI
import ClinicFormModal from "./Ui/ClinicFormModal";
import ModalDetailedClinic from "./Ui/ModalDetailedClinic";
import ModalDeleteConfirm from "./Ui/ModalDeleteConfirm";
import StatusModal from "./Ui/StatusModal";

import "../../styles/components/ListClinics.css";

const ListClinics = () => {
  const {
    clinics,
    getAllClinics,
    getClinicById,
    createNewClinic,
    editedClinic,
    deleteClinicById,
  } = useClinics();

  const { entities, getAllEntities } = useEntity();
  const zones = entities.zonas || [];

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Estados de Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({ 
    isOpen: false, 
    type: "success", 
    message: "" 
  });

  // Estados de Datos y Carga
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(null);

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "SIN DIRECCIÓN";
    const upperText = text.toUpperCase();
    return upperText.length > maxLength
      ? upperText.slice(0, maxLength) + "..."
      : upperText;
  };

  useEffect(() => {
    getAllClinics();
    getAllEntities("zonas");
  }, []);

  // -------------------- Filtrado y Ordenación --------------------
  const filteredClinics = useMemo(() => {
    const list = clinics || [];
    const filtered = list.filter((c) =>
      c.nombre?.toUpperCase().includes(searchTerm.toUpperCase()) ||
      c.rif?.toUpperCase().includes(searchTerm.toUpperCase())
    );

    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      return nameA.localeCompare(nameB);
    });
  }, [clinics, searchTerm]);

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const currentClinics = filteredClinics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Handlers --------------------
  const handleOpenDetails = async (id) => {
    setIsLoadingDetails(id);
    try {
      const res = await getClinicById(id);
      const clinicData = res?.data || res;
      setSelectedClinic(clinicData);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadingDetails(null);
    }
  };

  const handleSaveClinic = async (payload) => {
    setIsSaving(true);
    try {
      const formattedPayload = {
        ...payload,
        nombre: payload.nombre?.toUpperCase(),
        rif: payload.rif?.toUpperCase(),
        direccion: payload.direccion?.toUpperCase()
      };

      if (selectedClinic?.id) {
        await editedClinic(selectedClinic.id, formattedPayload);
      } else {
        await createNewClinic(formattedPayload);
      }
      
      setIsFormModalOpen(false);
      await getAllClinics();
      
      setStatusModal({
        isOpen: true,
        type: "success",
        message: "LA CLÍNICA HA SIDO REGISTRADA/ACTUALIZADA CORRECTAMENTE."
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        message: "HUBO UN PROBLEMA AL PROCESAR EL REGISTRO."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClinic) return;
    try {
      await deleteClinicById(selectedClinic.id);
      setIsDeleteModalOpen(false);
      await getAllClinics();
      
      setStatusModal({
        isOpen: true,
        type: "success",
        message: "EL REGISTRO SE ELIMINÓ CON ÉXITO."
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        message: "NO SE PUDO ELIMINAR EL REGISTRO."
      });
    }
  };

  return (
    <div className="cl-main-container">
      {/* CABECERA */}
      <div className="cl-header-section">
        <div className="cl-title-group">
          <h2>Gestión de Clínicas</h2>
          <p>{filteredClinics.length} INSTITUCIONES REGISTRADAS</p>
        </div>
        <button 
          className="cl-btn-add" 
          onClick={() => { setSelectedClinic(null); setIsFormModalOpen(true); }}
        >
          <Plus size={20} /> NUEVA CLÍNICA
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="cl-toolbar">
        <div className="cl-search-wrapper">
          <Search size={18} style={{ color: 'var(--cl-muted)' }} />
          <input 
            placeholder="BUSCAR POR NOMBRE O RIF..." 
            value={searchTerm} 
            onChange={(e) => { 
              setSearchTerm(e.target.value.toUpperCase()); 
              setCurrentPage(1); 
            }} 
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="cl-table-frame">
        <table className="cl-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Institución / Dirección</th>
              <th>RIF</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentClinics.length > 0 ? (
              currentClinics.map((c) => (
                <tr key={c.id}>
                  <td data-label="ID" className="cl-id-cell">#{c.id}</td>

                  <td data-label="Institución" style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 800, color: 'var(--cl-text-main)' }}>
                        {c.nombre?.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cl-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {c.direccion || 'SIN DIRECCIÓN'}
                      </span>
                    </div>
                  </td>

                  <td data-label="RIF">
                    <span className="cl-rif-badge">{c.rif?.toUpperCase() || "N/A"}</span>
                  </td>

                  <td data-label="Acciones">
                    <button 
                      className="cl-icon-btn" 
                      onClick={() => handleOpenDetails(c.id)}
                      disabled={isLoadingDetails !== null}
                    >
                      {isLoadingDetails === c.id ? (
                        <Loader2 size={16} className="cln-loader-spin" />
                      ) : (
                        <SlOptionsVertical size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', color: 'var(--cl-muted)', fontWeight: 600 }}>
                  NO SE ENCONTRARON CLÍNICAS REGISTRADAS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="cl-pagination">
          <button 
            className="cl-page-node"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={18} />
          </button>

          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--cl-secondary)' }}>
            {currentPage} / {totalPages}
          </span>

          <button 
            className="cl-page-node"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODALES */}
      <ClinicFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveClinic}
        clinic={selectedClinic}
        isSaving={isSaving}
        zones={zones}
      />

      <ModalDetailedClinic
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        clinic={selectedClinic}
        onEdit={(c) => { 
          setIsDetailsModalOpen(false); 
          setSelectedClinic(c); 
          setIsFormModalOpen(true); 
        }}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      <ModalDeleteConfirm 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        clinicName={selectedClinic?.nombre}
      />

      <StatusModal 
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        message={statusModal.message}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
      />
    </div>
  );
};

export default ListClinics;