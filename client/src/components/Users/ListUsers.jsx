import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";
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
  const { 
    usersList, 
    fetchAllUsers, 
    fetchUserById, 
    createNewUser, 
    editUser, 
    deleteUser,
    saveUserSignature // 🔥 NUEVO: Función de tu contexto para subir la firma
  } = useAuth();
  
  const { entities, getAllEntities } = useEntity();

  // Recuperar rol del usuario logueado para permisos
  const storedUser = localStorage.getItem("UserId");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const userRole = userData?.rol;

  // --- Estados locales ---
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estados de Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  // 🔥 NUEVO: Ajustado para recibir (payload, file)
  const handleSaveUser = async (payload, file) => {
    try {
      setIsSaving(true);
      let userId = selectedUser?.id;

      // 1. Crear o Editar Usuario
      if (userId) {
        await editUser(userId, payload);
      } else {
        const res = await createNewUser(payload);
        // Captura el ID según cómo lo devuelve tu backend (ajusta si es necesario)
        userId = res?.data?.data?.id || res?.data?.id || res?.id; 
      }

      // 2. Subir Firma si existe un archivo y tenemos el ID del usuario
      if (file && userId) {
        await saveUserSignature(userId, file);
      }

      // 3. Limpiar y Refrescar
      setIsFormOpen(false);
      setSelectedUser(null);
      await fetchAllUsers(); 
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedUser?.id) {
        await deleteUser(selectedUser.id);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        await fetchAllUsers();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // --- Lógica de Filtrado y Paginación ---
  const filteredUsers = useMemo(() => {
    if (!usersList) return [];
    const upperTerm = searchTerm.toUpperCase();
    
    return usersList
      .filter((u) =>
        u.nombre?.toUpperCase().includes(upperTerm) ||
        u.email?.toUpperCase().includes(upperTerm)
      )
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [usersList, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="pl-main-container">
      {/* HEADER */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Gestión de Usuarios</h2>
          <p>
            {loading ? (
              <span><Loader2 size={14} className="v-spin" /> Cargando...</span>
            ) : (
              `${filteredUsers.length} registros encontrados`
            )}
          </p>
        </div>

        <div className="pl-actions-group">
          {/* Ejemplo de restricción por rol igual que en productos */}
          {userRole !== "OPRI" && (
            <button 
              className="pl-btn-action" 
              onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}
            >
              <Plus size={16} /> Nuevo Usuario
            </button>
          )}

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
          <Search size={16} />
          <input
            placeholder="Buscar por nombre o email..."
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
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => (
                <tr key={u.id}>
                  <td data-label="Nombre de Usuario" className="pl-sku-cell">{u.nombre}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Rol">
                    <span className="v-role-badge">{u.rol}</span>
                  </td>
                  <td data-label="Acciones" className="pl-actions-cell" style={{ textAlign: "center" }}>
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
                <td colSpan="4" style={{ padding: '3rem', color: 'var(--pl-muted)', textAlign: 'center' }}>
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
            className="pl-page-node"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="pl-muted">
            Página {currentPage} de {totalPages}
          </span>

          <button 
            className="pl-page-node"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL: DETALLE */}
      <UserDetailModal 
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        onEdit={(userToEdit) => {
          setSelectedUser(userToEdit);
          setIsDetailOpen(false);
          setIsFormOpen(true);
        }}
        onDelete={() => {
            setIsDetailOpen(false);
            setIsDeleteModalOpen(true);
        }}
      />

      {/* MODAL: FORMULARIO */}
      <UserFormModal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setSelectedUser(null); }} 
        onSave={handleSaveUser} // 🔥 Pasa la función actualizada a tu formulario
        user={selectedUser} 
        isSaving={isSaving}
        oficinas={entities?.oficinas || []}
        depositos={entities?.depositos || []}
      />

      {/* MODAL: ELIMINACIÓN */}
      {isDeleteModalOpen && selectedUser && (
        <div className="modalProd-overlay">
          <div className="modalProd-content">
            <div className="modalProd-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar usuario?</h3>
            </div>
            <p>
              Confirma que deseas eliminar al usuario: <br />
              <strong>{selectedUser.nombre}</strong> ({selectedUser.email})
            </p>
            <div className="modalProd-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUsers;