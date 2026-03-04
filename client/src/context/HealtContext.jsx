// Dependencies
import React, { createContext, useState, useContext } from "react";
import Cookies from "js-cookie";
// API unificado
import * as HealthAPI from "../api/health";

// Context
export const HealthContext = createContext();

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) throw new Error("useHealth must be used within a HealthProvider");
  return context;
};

export const HealthProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [tipoMedicos, setTipoMedicos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [seguros, setSeguros] = useState([]);
  const [historias, setHistorias] = useState([]);
  const [errors, setErrors] = useState([]);

  // -------------------- PACIENTES --------------------
  const getAllPacientes = async () => {
    try {
      const res = await HealthAPI.getPacientes();
      setPacientes(res.data.data || []);
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error fetching pacientes"]]);
    }
  };

  const getPacienteById = async (id) => {
    try {
      const res = await HealthAPI.getPacienteById(id);
      const paciente = res.data?.data;

      if (!paciente) return null;

      setPacientes((prevPacientes) => {
        const exists = prevPacientes.find(p => p.id === id);

        if (exists) {
          // 🔄 Actualiza el existente
          return prevPacientes.map(p =>
            p.id === id ? paciente : p
          );
        } else {
          // ➕ Lo agrega si no existe
          return [...prevPacientes, paciente];
        }
      });

      return paciente;

    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data?.msg || "Error fetching paciente by id",
      ]);
      return null;
    }
  };

  const createNewPaciente = async (newPaciente) => {
    try {
      console.log(newPaciente)
      const res = await HealthAPI.createPaciente(newPaciente);
      setPacientes(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error creating paciente"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editedPaciente = async (id, paciente) => {
    try {
      const { files, images, ...cleanPaciente } = paciente;
      const res = await HealthAPI.editPaciente(id, cleanPaciente);
      const updated = res.data.data;
      setPacientes(prev =>
        prev.map(p => (p.id === id ? { ...updated, files: p.files, images: p.images } : p))
      );
      return { status: true, data: updated };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error editing paciente"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deletePacienteById = async (id) => {
    try {
      const res = await HealthAPI.deletePaciente(id);
      setPacientes(prev => prev.filter(p => p.id !== id));
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error deleting paciente"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const saveFilesPaciente = async (id, files, filesJson) => {
    try {
      await HealthAPI.savePacienteFiles(id, files, filesJson);
      const res = await HealthAPI.getPacientes();
      setPacientes(res.data.data || []);
      return { status: true };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error saving paciente files"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- MEDICOS --------------------
  const getAllMedicos = async () => {
    try {
      const res = await HealthAPI.getMedicos();
      setMedicos(res.data.data || []);
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error fetching medicos"]]);
    }
  };

  const createNewMedico = async (newMedico) => {
    try {
      console.log(newMedico)
      const res = await HealthAPI.createMedico(newMedico);
      setMedicos(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error creating medico"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editedMedico = async (id, medico) => {
    try {
      const res = await HealthAPI.editMedico(id, medico);
      const updated = res.data.data;
      setMedicos(prev => prev.map(m => (m.id === id ? updated : m)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error editing medico"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteMedicoById = async (id) => {
    try {
      const res = await HealthAPI.deleteMedico(id);
      setMedicos(prev => prev.filter(m => m.id !== id));
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error deleting medico"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- TIPO MEDICOS --------------------
  const getAllTipoMedicos = async () => {
    try {
      const res = await HealthAPI.getTipoMedicos();
      console.log("tipos medicos")
      console.log(res.data.data)
      setTipoMedicos(res.data.data || []);
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error fetching tipoMedicos"]]);
    }
  };

  const createNewTipoMedico = async (newTipo) => {
    try {
      const res = await HealthAPI.createTipoMedico(newTipo);
      setTipoMedicos(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error creating tipoMedico"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editedTipoMedico = async (id, tipo) => {
    try {
      const res = await HealthAPI.editTipoMedico(id, tipo);
      const updated = res.data.data;
      setTipoMedicos(prev => prev.map(t => (t.id === id ? updated : t)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error editing tipoMedico"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteTipoMedicoById = async (id) => {
    try {
      const res = await HealthAPI.deleteTipoMedico(id);
      setTipoMedicos(prev => prev.filter(t => t.id !== id));
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error deleting tipoMedico"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- PERSONAL --------------------

  const getAllPersonal = async () => {
    try {
      const res = await HealthAPI.getPersonal();
      setPersonal(res.data.data || []);
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error fetching personal"]
      ]);
    }
  };

  const getPersonalById = async (id) => {
    try {
      const res = await HealthAPI.getPersonalById(id);
      const persona = res.data?.data;

      if (!persona) return null;

      setPersonal(prev => {
        const exists = prev.find(p => p.id === id);
        if (exists) {
          return prev.map(p => (p.id === id ? persona : p));
        } else {
          return [...prev, persona];
        }
      });

      return persona;
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data?.msg || "Error fetching personal by id"
      ]);
      return null;
    }
  };

  const createNewPersonal = async (newPersonal) => {
    try {
      const res = await HealthAPI.createPersonal(newPersonal);
      setPersonal(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error creating personal"]
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editedPersonal = async (id, persona) => {
    try {
      const res = await HealthAPI.editPersonal(id, persona);
      const updated = res.data.data;
      setPersonal(prev =>
        prev.map(p => (p.id === id ? updated : p))
      );
      return { status: true, data: updated };
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error editing personal"]
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deletePersonalById = async (id) => {
    try {
      const res = await HealthAPI.deletePersonal(id);
      setPersonal(prev => prev.filter(p => p.id !== id));
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error deleting personal"]
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- SEGUROS --------------------
  const getAllSeguros = async () => {
    try {
      const res = await HealthAPI.getSeguros();
      setSeguros(res.data.data || []);
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error fetching seguros"]]);
    }
  };

  const createNewSeguro = async (newSeguro) => {
    try {
      const res = await HealthAPI.createSeguro(newSeguro);
      setSeguros(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error creating seguro"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editedSeguro = async (id, seguro) => {
    try {
      const res = await HealthAPI.editSeguro(id, seguro);
      const updated = res.data.data;
      setSeguros(prev => prev.map(s => (s.id === id ? updated : s)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error editing seguro"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteSeguroById = async (id) => {
    try {
      const res = await HealthAPI.deleteSeguro(id);
      setSeguros(prev => prev.filter(s => s.id !== id));
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error deleting seguro"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- HISTORIAS --------------------
  const getAllHistorias = async () => {
    try {
      const res = await HealthAPI.getHistorias();
      setHistorias(res.data.data || []);
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error fetching historias"]]);
    }
  };

  const getHistoriasByPacientes = async (pacienteId) => {
    try {
      console.log("Fetching historias for pacienteId:", pacienteId);
      const res = await HealthAPI.getHistoriasByPaciente(pacienteId);
      console.log(res.data)
      setHistorias(res.data.data || []);
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error fetching historias by paciente"]]);
    }
  }

  const getHistoriaById = async (id) => {
    try {
      console.log("Fetching historia by id:", id);
      const res = await HealthAPI.getHistoriaById(id);
      const historia = res.data?.data;

      if (!historia) return null;

      setHistorias((prevHistorias) => {
        // Buscamos si la historia ya existe en el estado local
        const exists = prevHistorias.find((h) => h.id === id);

        if (exists) {
          // 🔄 Actualiza la historia existente
          return prevHistorias.map((h) =>
            h.id === id ? historia : h
          );
        } else {
          // ➕ Agrega la nueva historia si no estaba
          return [...prevHistorias, historia];
        }
      });

      return historia;

    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data?.msg || "Error fetching historia by id",
      ]);
      return null;
    }
  }

  const createNewHistoria = async (newHistoria) => {
    try {
      console.log("newHistoria")
      console.log(newHistoria)
      const res = await HealthAPI.createHistoria(newHistoria);
      setHistorias(prev => [...prev, res.data]);
      return { status: true, data: res.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error creating historia"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editedHistoria = async (id, historia) => {
    try {
      const { files, images, ...cleanHistoria } = historia;
      const res = await HealthAPI.editHistoria(id, cleanHistoria);
      const updated = res.data.data;
      setHistorias(prev =>
        prev.map(h => (h.id === id ? { ...updated, files: h.files, images: h.images } : h))
      );
      return { status: true, data: updated };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error editing historia"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteHistoriaById = async (id) => {
    try {
      const res = await HealthAPI.deleteHistoria(id);
      setHistorias(prev => prev.filter(h => h.id !== id));
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error deleting historia"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const saveFilesHistoria = async (id, files, filesJson) => {
    try {
      await HealthAPI.saveHistoriaFiles(id, files, filesJson);
      const res = await HealthAPI.getHistorias();
      setHistorias(res.data.data || []);
      return { status: true };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || ["Error saving historia files"]]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- LOGOUT --------------------
  const logout = () => Cookies.remove("token");

  return (
    <HealthContext.Provider
      value={{
        pacientes,
        medicos,
        tipoMedicos,
        seguros,
        personal,
        historias,
        errors,

        // Pacientes
        getAllPacientes,
        getPacienteById,
        createNewPaciente,
        editedPaciente,
        deletePacienteById,
        saveFilesPaciente,

        // Medicos
        getAllMedicos,
        createNewMedico,
        editedMedico,
        deleteMedicoById,

        // TipoMedicos
        getAllTipoMedicos,
        createNewTipoMedico,
        editedTipoMedico,
        deleteTipoMedicoById,

        // Personal
        getAllPersonal,
        getPersonalById,
        createNewPersonal,
        editedPersonal,
        deletePersonalById,

        // Seguros
        getAllSeguros,
        createNewSeguro,
        editedSeguro,
        deleteSeguroById,

        // Historias
        getAllHistorias,
        getHistoriasByPacientes,
        getHistoriaById,
        createNewHistoria,
        editedHistoria,
        deleteHistoriaById,
        saveFilesHistoria,

        logout
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};
