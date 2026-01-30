import React, { useEffect, useState, useMemo } from "react";
import { useHealth } from "../../context/HealtContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Plus
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListStories = () => {
  const {
    historias,
    pacientes,
    medicos,
    getAllHistorias,
    getAllPacientes,
    getAllMedicos,
    createNewHistoria,
    editedHistoria,
    deleteHistoriaById
  } = useHealth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modales
  const [selectedHistoria, setSelectedHistoria] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form
  const [selectedPacienteId, setSelectedPacienteId] = useState("");
  const [selectedMedicoId, setSelectedMedicoId] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editDetalle, setEditDetalle] = useState("");

  useEffect(() => {
    getAllHistorias();
    getAllPacientes();
    getAllMedicos();
  }, []);

  const resetForm = () => {
    setSelectedPacienteId("");
    setSelectedMedicoId("");
    setEditFecha("");
    setEditDetalle("");
  };

  // -------------------- Filtrado --------------------
  const filteredHistorias = useMemo(() => {
    return historias.filter(h =>
      h.detalle.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [historias, searchTerm]);

  const totalPages = Math.ceil(filteredHistorias.length / itemsPerPage);
  const currentHistorias = filteredHistorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -------------------- Acciones --------------------
  const openEditModal = (historia) => {
    setSelectedHistoria(historia);
    setSelectedPacienteId(historia.id_paciente);
    setSelectedMedicoId(historia.id_medico);
    setEditFecha(historia.fecha);
    setEditDetalle(historia.detalle);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (historia) => {
    setSelectedHistoria(historia);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!selectedPacienteId || !selectedMedicoId || !editFecha || !editDetalle) return;

    await createNewHistoria({
      id_paciente: selectedPacienteId,
      id_medico: selectedMedicoId,
      fecha: editFecha,
      detalle: editDetalle
    });

    setIsCreateModalOpen(false);
    resetForm();
    getAllHistorias();
  };

  const handleUpdate = async () => {
    if (!selectedHistoria) return;

    await editedHistoria(selectedHistoria.id, {
      id_paciente: selectedPacienteId,
      id_medico: selectedMedicoId,
      fecha: editFecha,
      detalle: editDetalle
    });

    setIsEditModalOpen(false);
    setSelectedHistoria(null);
    resetForm();
    getAllHistorias();
  };

  const handleDelete = async () => {
    if (!selectedHistoria) return;

    await deleteHistoriaById(selectedHistoria.id);
    setIsDeleteModalOpen(false);
    setSelectedHistoria(null);
    getAllHistorias();
  };

  // -------------------- Helpers --------------------
  const getPacienteNombre = (id) =>
    pacientes.find(p => p.id === id)?.nombre || "-";

  const getMedicoNombre = (id) =>
    medicos.find(m => m.id === id)?.nombre || "-";

  // -------------------- Render --------------------
  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Historias Clínicas</h2>
          <p>Total historias: {filteredHistorias.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Nueva Historia
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar por detalle..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th>Médico</th>
              {/* <th>Fecha</th> */}
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentHistorias.length > 0 ? currentHistorias.map(h => (
              <tr key={h.id}>
                <td>#{h.id}</td>
                <td>{getPacienteNombre(h.id_paciente)}</td>
                <td>{getMedicoNombre(h.id_medico)}</td>
                {/* <td>{h.fecha}</td> */}
                <td className="center">
                  <button
                    className="icon-btn"
                    onClick={() => { setSelectedHistoria(h); setIsDetailsModalOpen(true); }}
                  >
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No se encontraron historias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isCreateModalOpen ? "Crear Historia Clínica" : "Editar Historia Clínica"}</h3>

            <select
              className="modal-input"
              value={selectedPacienteId}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
            >
              <option value="">Selecciona un paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>

            <select
              className="modal-input"
              value={selectedMedicoId}
              onChange={(e) => setSelectedMedicoId(e.target.value)}
            >
              <option value="">Selecciona un médico</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>

            <input
              type="date"
              className="modal-input"
              value={editFecha}
              onChange={(e) => setEditFecha(e.target.value)}
            />

            <textarea
              className="modal-input"
              placeholder="Detalle clínico"
              value={editDetalle}
              onChange={(e) => setEditDetalle(e.target.value)}
            />

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={isCreateModalOpen ? handleCreate : handleUpdate}
              >
                <Save size={16} /> {isCreateModalOpen ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedHistoria && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalle de Historia #{selectedHistoria.id}</h3>
            <div className="modal-info-body">
              <div className="detail-card"><strong>Paciente:</strong> {getPacienteNombre(selectedHistoria.id_paciente)}</div>
              <div className="detail-card"><strong>Médico:</strong> {getMedicoNombre(selectedHistoria.id_medico)}</div>
              {/* <div className="detail-card"><strong>Fecha:</strong> {selectedHistoria.fecha}</div> */}
              <div className="detail-card"><strong>Detalle:</strong> {selectedHistoria.detalle}</div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn-primary" onClick={() => {
                setIsDetailsModalOpen(false);
                openEditModal(selectedHistoria);
              }}>
                <Pencil size={16} /> Editar
              </button>
              <button className="btn-danger" onClick={() => {
                setIsDetailsModalOpen(false);
                openDeleteModal(selectedHistoria);
              }}>
                <Trash2 size={16} /> Eliminar
              </button>
              <button className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedHistoria && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar historia clínica?</h3>
            </div>
            <p>Esta acción no se puede deshacer</p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListStories;
