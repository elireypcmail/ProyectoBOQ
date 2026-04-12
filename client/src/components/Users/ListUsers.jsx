import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, X} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Contexts
import { useAuth } from "../../context/AuthContext";
import { useEntity } from "../../context/EntityContext";

// Components
import UserFormModal from "./Ui/UserFormModal";
import UserDetailModal from "./Ui/UserDetailModal";

// Styles
import "../../styles/components/ListZone.css";

const ListUsers = ({ onClose }) => {
  const { usersList, fetchAllUsers, fetchUserById, createNewUser, editUser, deleteUser } = useAuth();
  const { entities, getAllEntities } = useEntity();

  // --- Estados locales ---
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estados de Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [fetchingId, setFetchingId] = useState(null);

  // --- Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Carga inicial de datos
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAllUsers(),
          getAllEntities("oficinas"),
          getAllEntities("depositos")
        ]);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Reset de página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- Handlers de Usuario ---

  // Abrir Detalle (obtiene data completa por ID)
  const handleOpenDetail = async (id) => {
    try {
      setFetchingId(id);
      const detailedData = await fetchUserById(id);
      if (detailedData) {
        setSelectedUser(detailedData);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Error al obtener detalle:", error);
    } finally {
      setFetchingId(null);
    }
  };

  // Guardar (Crear o Editar)
  const handleSaveUser = async (payload) => {
    try {
      setIsSaving(true);
      if (selectedUser?.id) {
        await editUser(selectedUser.id, payload);
      } else {
        console.log("payload")
        console.log(payload)
        await createNewUser(payload);
      }
      setIsFormOpen(false);
      setSelectedUser(null);
      await fetchAllUsers(); 
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar
  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteUser(id);
        await fetchAllUsers();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // --- Lógica de Filtrado y Paginación ---
  const filteredUsers = useMemo(() => {
    if (!usersList) return [];
    const filtered = usersList.filter((u) =>
      u.nombre?.toUpperCase().includes(searchTerm.toUpperCase()) ||
      u.email?.toUpperCase().includes(searchTerm.toUpperCase())
    );
    return [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [usersList, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentItems = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="pl-main-container">
      {/* HEADER */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Gestión de Usuarios</h2>
          <p>
            {loading ? (
              <span>
                <Loader2 size={14} className="v-spin" /> Cargando...
              </span>
            ) : (
              `${filteredUsers.length} registros encontrados`
            )}
          </p>
        </div>

        <div className="pl-actions-group">
          <button 
            className="pl-btn-action" 
            onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}
          >
            <Plus size={16} /> Nuevo Usuario
          </button>

          {onClose && (
            <button 
              className="pl-btn-close" 
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={16} color="var(--pl-muted)" />
          <input
            placeholder="BUSCAR POR NOMBRE O EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((u) => (
                <tr key={u.id}>
                  <td data-label="Nombre de Usuario" className="pl-sku-cell">{u.nombre}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Rol">
                    <span className="v-role-badge">{u.rol}</span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      className="pl-icon-only-btn"
                      disabled={fetchingId === u.id}
                      onClick={() => handleOpenDetail(u.id)}
                    >
                      {fetchingId === u.id ? (
                        <Loader2 size={16} className="v-spin" />
                      ) : (
                        <SlOptionsVertical size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', color: 'var(--pl-muted)' }}>
                  {loading ? "Cargando datos..." : "No se encontraron registros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="pl-pagination-area">
          <button 
            className="pl-btn-secondary-outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          
          <div className="pl-page-node">{currentPage}</div>
          <span style={{ color: 'var(--pl-muted)', fontSize: '0.85rem' }}>de {totalPages}</span>

          <button 
            className="pl-btn-secondary-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* MODAL: DETALLE (Vista) */}
      <UserDetailModal 
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        onEdit={(userToEdit) => {
          setSelectedUser(userToEdit);
          setIsDetailOpen(false);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteUser}
      />

      {/* MODAL: FORMULARIO (Creación/Edición) */}
      <UserFormModal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setSelectedUser(null); }} 
        onSave={handleSaveUser}
        user={selectedUser} 
        isSaving={isSaving}
        oficinas={entities?.oficinas || []}
        depositos={entities?.depositos || []}
      />
    </div>
  );
};

export default ListUsers;