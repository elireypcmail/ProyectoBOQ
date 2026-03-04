import React, { useEffect, useState, useMemo } from "react";
import { useClinics } from "../../context/ClinicsContext";
import { useEntity } from "../../context/EntityContext";
import { 
  Search, Plus, Trash2, AlertTriangle, Loader2, 
  ChevronLeft, ChevronRight, Building2, MapPin
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Componentes UI
import ClinicFormModal from "./Ui/ClinicFormModal";
import ModalDetailedClinic from "./Ui/ModalDetailedClinic";

// Estilos
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

  // 🔹 Helper para truncar texto a 50 caracteres
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

  const filteredClinics = useMemo(() => {
    return (clinics || []).filter((c) =>
      c.nombre?.toUpperCase().includes(searchTerm.toUpperCase()) ||
      c.rif?.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [clinics, searchTerm]);

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage);
  const currentClinics = filteredClinics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      if (selectedClinic?.id) {
        await editedClinic(selectedClinic.id, payload);
      } else {
        await createNewClinic(payload);
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
      
      {/* HEADER */}
      <div className="cln-top-bar">
        <div className="cln-info-header">
          <div>
            <h1>GESTIÓN DE CLÍNICAS</h1>
            <span>{filteredClinics.length} REGISTROS EN TOTAL</span>
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

      {/* FILTROS */}
      <div className="cln-filter-bar">
        <div className="cln-search-wrapper">
          <Search size={18} className="cln-search-icon" />
          <input 
            placeholder="BUSCAR POR NOMBRE O RAZÓN SOCIAL..." 
            value={searchTerm} 
            onChange={(e) => { 
              setSearchTerm(e.target.value.toUpperCase()); 
              setCurrentPage(1); 
            }} 
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="cln-table-container">
        <table className="cln-data-table">
          <thead>
            <tr>
              <th className="cln-th-id">ID</th>
              <th className="cln-th-main">INSTITUCIÓN / DIRECCIÓN</th>
              <th className="cln-th-razon">RIF</th>
              <th className="cln-th-actions">OPCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentClinics.length > 0 ? (
              currentClinics.map((c) => (
                <tr key={c.id} className="cln-tr-row">
                  <td className="cln-td-id">#{c.id}</td>

                  <td className="cln-td-main">
                    <div className="cln-clinic-cell">
                      <strong 
                        className="cln-name-text" 
                        title={c.nombre?.toUpperCase()}
                      >
                        {c.nombre?.toUpperCase()}
                      </strong>

                      <span 
                        className="cln-address-text" 
                        title={c.direccion?.toUpperCase()}
                      >
                        <MapPin size={12} style={{ flexShrink: 0 }} /> 
                        <span className="cln-address-truncate">
                          {truncateText(c.direccion, 50)}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="cln-td-razon">
                    <span 
                      className="cln-razon-truncate" 
                      title={c.rif?.toUpperCase()}
                    >
                      {c.rif?.toUpperCase()}
                    </span>
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
                        <SlOptionsVertical size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="cln-empty-state">
                  NO SE ENCONTRARON CLÍNICAS REGISTRADAS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="cln-footer-pagination">
          <button 
            className="cln-nav-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={20} /> ANTERIOR
          </button>

          <div className="cln-page-counter">
            PÁGINA <strong>{currentPage}</strong> DE {totalPages}
          </div>

          <button 
            className="cln-nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            SIGUIENTE <ChevronRight size={20} />
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

      {isDeleteModalOpen && (
        <div className="cln-overlay-delete">
          <div className="cln-delete-card">
            <div className="cln-delete-icon-box">
              <AlertTriangle size={40} />
            </div>
            <h2>¿ELIMINAR ESTE REGISTRO?</h2>
            <p>
              ESTA ACCIÓN ELIMINARÁ PERMANENTEMENTE A:<br/>
              <strong>{selectedClinic?.nombre?.toUpperCase()}</strong>
            </p>
            <div className="cln-delete-footer">
              <button 
                className="cln-cancel-btn" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                CANCELAR
              </button>
              <button 
                className="cln-confirm-btn" 
                onClick={handleDeleteConfirm}
              >
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