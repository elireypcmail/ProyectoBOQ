import React, { useEffect, useState, useMemo } from "react";
import { useClinics } from "../../context/ClinicsContext";
import { useEntity } from "../../context/EntityContext";
import { 
  Search, Plus, Trash2, AlertTriangle, Loader2, 
  ChevronLeft, ChevronRight, MapPin
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

import ClinicFormModal from "./Ui/ClinicFormModal";
import ModalDetailedClinic from "./Ui/ModalDetailedClinic";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  // -------------------- Filtrado y Ordenación Alfabética --------------------
  const filteredClinics = useMemo(() => {
    const list = clinics || [];
    
    // 1. Filtrar por Nombre o RIF
    const filtered = list.filter((c) =>
      c.nombre?.toUpperCase().includes(searchTerm.toUpperCase()) ||
      c.rif?.toUpperCase().includes(searchTerm.toUpperCase())
    );

    // 2. Ordenar A-Z por Nombre
    return [...filtered].sort((a, b) => {
      const nameA = (a.nombre || "").toUpperCase();
      const nameB = (b.nombre || "").toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [clinics, searchTerm]);

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const currentClinics = filteredClinics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
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
      // Forzamos mayúsculas en los campos críticos antes de enviar
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
    } catch (error) {
      console.error("Error al guardar:", error);
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
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="cln-main-container">
      
      <div className="cln-top-bar">
        <div className="cln-info-header">
          <div className="cln-main-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="cln-title-group">
            <h1>GESTIÓN DE CLÍNICAS</h1>
            <span className="cln-stats">{filteredClinics.length} REGISTROS TOTALES</span>
          </div>
        </div>
        
        <button 
          className="cln-add-button" 
          onClick={() => { 
            setSelectedClinic(null); 
            setIsFormModalOpen(true); 
          }}
        >
          <Plus size={20} /> NUEVA CLÍNICA
        </button>
      </div>

      <div className="cln-filter-bar">
        <div className="cln-search-wrapper">
          <Search size={18} className="cln-search-icon" />
          <input 
            className="cln-search-input"
            placeholder="BUSCAR POR NOMBRE O RIF..." 
            value={searchTerm} 
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => { 
              setSearchTerm(e.target.value.toUpperCase()); 
              setCurrentPage(1); 
            }} 
          />
        </div>
      </div>

      <div className="cln-table-container">
        <table className="cln-data-table">
          <thead>
            <tr>
              <th className="cln-th-id">ID</th>
              <th className="cln-th-main">INSTITUCIÓN / DIRECCIÓN</th>
              <th className="cln-th-razon">RIF</th>
              <th className="cln-th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentClinics.length > 0 ? (
              currentClinics.map((c) => (
                <tr key={c.id} className="cln-tr-row">
                  <td className="cln-td-id">#{c.id}</td>

                  <td className="cln-td-main">
                    <div className="cln-clinic-cell">
                      <span className="cln-name-text bold">
                        {c.nombre?.toUpperCase()}
                      </span>
                      <span className="cln-address-text">
                        <MapPin size={12} className="cln-pin-icon" /> 
                        {truncateText(c.direccion, 50)}
                      </span>
                    </div>
                  </td>

                  <td className="cln-td-razon">
                    <span className="cln-rif-badge">{c.rif?.toUpperCase() || "N/A"}</span>
                  </td>

                  <td className="cln-td-actions">
                    <button 
                      className="cln-options-btn" 
                      disabled={isLoadingDetails !== null}
                      onClick={() => handleOpenDetails(c.id)}
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
                <td colSpan="4" className="cln-td-empty">
                  NO SE ENCONTRARON CLÍNICAS REGISTRADAS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="cln-footer-pagination">
          <button 
            className="cln-nav-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={18} /> ANTERIOR
          </button>

          <div className="cln-page-counter">
            PÁGINA <strong>{currentPage}</strong> DE {totalPages}
          </div>

          <button 
            className="cln-nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            SIGUIENTE <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODALS */}
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

      {isDeleteModalOpen && (
        <div className="cln-overlay-delete">
          <div className="cln-delete-card">
            <div className="cln-delete-icon-box">
              <AlertTriangle size={40} />
            </div>
            <h2>¿ELIMINAR REGISTRO?</h2>
            <p>
              ESTA ACCIÓN ELIMINARÁ PERMANENTEMENTE A:<br/>
              <strong className="cln-delete-target">
                {selectedClinic?.nombre?.toUpperCase()}
              </strong>
            </p>
            <div className="cln-delete-footer">
              <button className="cln-cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>CANCELAR</button>
              <button className="cln-confirm-btn" onClick={handleDeleteConfirm}>
                <Trash2 size={18} /> CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListClinics;