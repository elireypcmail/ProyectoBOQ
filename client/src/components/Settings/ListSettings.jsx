import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, X, Image as ImageIcon, Settings, Key } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import { useSettings } from "../../context/SettingsContext";
import FormModalSetting from "./Ui/FormModalSetting";
import ModalAuth from "./Ui/ModalAuth"; 
import FormModalPass from "./Ui/FormModalPass"; // Imported the new modal
import "../../styles/components/ListZone.css";

const ListSettings = ({ onClose }) => {
  const { 
    parametersList, fetchAllParameters, createNewParameter, editParameter,
    imagesList, fetchAllImages, uploadImage, deleteImage,
    loginParameters 
  } = useSettings();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("parametros");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false); // New state for ClaveParametro

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        setLoading(true);
        try {
          await Promise.all([fetchAllParameters(), fetchAllImages()]);
        } catch (error) {
          console.error("Error loading settings:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [isAuthenticated]); // Added missing dependency

  const handleSave = async (payload) => {
    try {
      setIsSaving(true);
      
      if (payload.imagesToDelete?.length > 0) {
        for (const id of payload.imagesToDelete) { 
          await deleteImage(id); 
        }
      }

      const imageConfigs = [
        { file: payload.logo, name: "Logo" },
        { file: payload.firmaDigital, name: "Firma" },
        { file: payload.selloDigital, name: "Sello" }
      ];

      for (const img of imageConfigs) {
        if (img.file && img.file instanceof File) {
          const existingImg = imagesList.find(i => 
            i.nombre.toLowerCase().includes(img.name.toLowerCase()) && 
            !payload.imagesToDelete?.includes(i.id)
          );
          
          if (existingImg) await deleteImage(existingImg.id);

          const fData = new FormData();
          fData.append("files", img.file);
          fData.append("files_json", JSON.stringify([{ nombre: img.name, order: 1 }]));
          await uploadImage(fData);
        }
      }

      const textParams = [
        { desc: "Rif", val: payload.rif },
        { desc: "Direccion", val: payload.direccion },
        { desc: "NroTlf", val: payload.telefono },
        { desc: "NotaPresupuesto", val: payload.valor },
        { desc: "Email", val: payload.email }
      ];

      for (const param of textParams) {
        const existing = parametersList.find(p => p.descripcion === param.desc);
        const valueToSave = param.val || "";

        if (!existing && valueToSave.trim() !== "") {
          await createNewParameter({ descripcion: param.desc, valor: valueToSave });
        } else if (existing && existing.valor !== valueToSave) {
          await editParameter(existing.id, { descripcion: param.desc, valor: valueToSave });
        }
      }

      setIsFormOpen(false);
      setSelectedItem(null);
      await Promise.all([fetchAllParameters(), fetchAllImages()]);
      
    } catch (error) {
      console.error("Error saving configurations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    const list = activeTab === "parametros" ? parametersList : imagesList;
    if (!list) return [];
    
    const filtered = list.filter((item) => {
      const searchTarget = activeTab === "parametros" ? item.descripcion : item.nombre;
      return searchTarget?.toUpperCase().includes(searchTerm.toUpperCase());
    });

    return [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [parametersList, imagesList, searchTerm, activeTab]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  if (!isAuthenticated) {
    return (
      <ModalAuth 
        onVerify={loginParameters} 
        onVerifySuccess={() => setIsAuthenticated(true)} 
        onCancel={onClose}
      />
    );
  }

  return (
    <div className="pl-main-container">
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Configuración del Sistema</h2>
        </div>
        <div className="pl-actions-group">
          {/* 1. New Button exclusively for ClaveParametro next to Ajustes Generales */}
          <button 
            className="pl-btn-action pl-btn-secondary" 
            style={{ marginRight: '8px' }}
            onClick={() => setIsPassModalOpen(true)}
          >
            <Key size={16} /> Actualizar Clave
          </button>
          
          <button 
            className="pl-btn-action" 
            onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}
          >
            <Plus size={16} /> Ajustes Generales
          </button>
          {onClose && (
            <button className="pl-btn-close" onClick={onClose}>
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={16} color="var(--pl-muted)" />
          <input
            placeholder={`BUSCAR EN ${activeTab.toUpperCase()}...`}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="v-tab-selector">
          <button 
            className={activeTab === "parametros" ? "active" : ""} 
            onClick={() => { setActiveTab("parametros"); setCurrentPage(1); }}
          >
            <Settings size={14} /> Parámetros
          </button>
          <button 
            className={activeTab === "imagenes" ? "active" : ""} 
            onClick={() => { setActiveTab("imagenes"); setCurrentPage(1); }}
          >
            <ImageIcon size={14} /> Imágenes
          </button>
        </div>
      </div>

      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              {activeTab === "parametros" ? (
                <><th>Descripción</th><th>Valor</th></>
              ) : (
                <><th>Previsualización</th><th>Nombre</th></>
              )}
              <th style={{ width: '80px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.id}>
                  {activeTab === "parametros" ? (
                    <>
                      <td className="pl-sku-cell">{item.descripcion}</td>
                      <td>
                        {/* Optionally mask the password visually in the table */}
                        {item.descripcion === "ClaveParametro" ? "********" : item.valor}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <div className="pl-img-mini-preview">
                          {item.data ? (
                            <img 
                              src={`data:${item.mime_type};base64,${item.data}`} 
                              alt={item.nombre} 
                              style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} 
                            />
                          ) : (
                            <ImageIcon size={20} color="var(--pl-muted)" />
                          )}
                        </div>
                      </td>
                      <td>{item.nombre?.toUpperCase()}</td>
                    </>
                  )}
                  <td>
                    {/* 2. Logic to route ClaveParametro to the unique Modal */}
                    <button 
                      className="pl-icon-only-btn" 
                      onClick={() => { 
                        if (activeTab === "parametros" && item.descripcion === "ClaveParametro") {
                          setIsPassModalOpen(true);
                        } else {
                          setSelectedItem(item); 
                          setIsFormOpen(true); 
                        }
                      }}
                    >
                      <SlOptionsVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--pl-muted)' }}>
                  {loading ? <Loader2 className="v-spin" size={20} /> : "No se encontraron registros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModalSetting 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedItem(null); }}
        onSave={handleSave}
        isSaving={isSaving}
        allParams={parametersList} 
        imagesList={imagesList}
      />

      {/* Unique Modal for ClaveParametro */}
      <FormModalPass 
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
      />
    </div>
  );
};

export default ListSettings;