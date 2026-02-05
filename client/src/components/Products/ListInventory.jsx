import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import { useEntity } from "../../context/EntityContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  Save
} from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListZone.css";

const ListInventory = ({ id_producto }) => {
  const {
    getInventoryByProduct,
    inventory,
    editInventory,
    deleteInventoryById,
    createNewInventory,
    lotes,
    getAllLotesByProd
  } = useProducts();

  const { entities, getAllEntities } = useEntity();
  const offices = entities.oficinas || [];

  // ---------------- STATE ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedItem, setSelectedItem] = useState(null);

  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form
  const [idLote, setIdLote] = useState("");
  const [idOffice, setIdOffice] = useState("");
  const [nroSerie, setSku] = useState("");
  const [existencia, setExistencia] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [margenGanancia, setMargenGanancia] = useState("");
  const [estatus, setEstatus] = useState(true);

  // ---------------- ARRAYS SEGUROS ----------------
  const safelotes = useMemo(() => Array.isArray(lotes) ? lotes : (lotes?.data ?? []), [lotes]);
  const safeOffices = useMemo(() => Array.isArray(offices) ? offices : (offices?.data ?? []), [offices]);

  // ---------------- LOAD ----------------
  useEffect(() => {
    if (id_producto) {
      getInventoryByProduct(id_producto);
      getAllLotesByProd(id_producto);
      getAllEntities("oficinas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_producto]);

  // ---------------- CORRECCIÓN 2: CALCULO AUTOMATICO PRECIO ----------------
  useEffect(() => {
    const costo = parseFloat(costoUnitario);
    const margen = parseFloat(margenGanancia);

    if (!isNaN(costo) && !isNaN(margen)) {
      const precioCalculado = costo + (costo * (margen / 100));
      setPrecioVenta(precioCalculado.toFixed(2));
    } else if (!isNaN(costo)) {
      setPrecioVenta(costo.toString());
    }
  }, [costoUnitario, margenGanancia]);

  const productLotes = useMemo(() => {
    return safelotes.filter(lote => lote.id_producto === id_producto);
  }, [safelotes, id_producto]);


  // ---------------- FILTER ----------------
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory
      .filter(item => item.id_producto === id_producto) // <-- FILTRO POR PRODUCTO
      .filter(item =>
        (item.producto_descripcion ?? "")
          .toUpperCase()
          .includes(searchTerm.toUpperCase())
      );
  }, [inventory, searchTerm, id_producto]);


  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const currentItems = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ---------------- HELPERS ----------------
  const resetForm = () => {
    setIdLote("");
    setIdOffice("");
    setSku("");
    setExistencia("");
    setStockMinimo("");
    setPrecioVenta("");
    setCostoUnitario("");
    setMargenGanancia("");
    setEstatus(true);
  };

  // RESET FORM AL CAMBIAR DE PRODUCTO
  useEffect(() => {
    resetForm();
    setSelectedItem("");
    setCurrentPage(1); // opcional: resetear paginación
  }, [id_producto]);


  const openEditModal = (item) => {
    setSelectedItem(item);
    setIdLote(item.id_lote);
    setIdOffice(item.id_oficina);
    setSku(item.sku ?? "");
    setExistencia(item.existencia_general);
    setStockMinimo(item.stock_minimo_general);
    setPrecioVenta(item.precio_venta);
    setCostoUnitario(item.costo_unitario);
    setMargenGanancia(item.margen_ganancia);
    setEstatus(item.estatus);
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  // ---------------- ACTIONS ----------------
  const handleCreate = async () => {
    if (!idLote || !idOffice) {
      alert("Debes seleccionar lote y oficina");
      return;
    }

    // CORRECCIÓN 1: VALIDACIÓN
    if (Number(existencia) <= Number(stockMinimo)) {
      alert("Error: La existencia siempre debe ser mayor que el stock mínimo.");
      return;
    }

    const payload = {
      id_producto,
      id_lote: Number(idLote),
      id_oficina: Number(idOffice),
      sku: nroSerie,
      existencia_general: Number(existencia),
      stock_minimo_general: Number(stockMinimo),
      precio_venta: Number(precioVenta),
      costo_unitario: Number(costoUnitario),
      margen_ganancia: Number(margenGanancia),
      estatus
    };

    try {
      await createNewInventory(payload);
      setIsCreateModalOpen(false);
      resetForm();
      getInventoryByProduct(id_producto);
    } catch (error) {
      console.error("Error creando inventario:", error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    if (!idLote || !idOffice) {
      alert("Debes seleccionar lote y oficina");
      return;
    }

    // CORRECCIÓN 1: VALIDACIÓN
    if (Number(existencia) <= Number(stockMinimo)) {
      alert("Error: La existencia siempre debe ser mayor que el stock mínimo.");
      return;
    }

    const payload = {
      id_lote: Number(idLote),
      id_oficina: Number(idOffice),
      sku: nroSerie,
      existencia_general: Number(existencia),
      stock_minimo_general: Number(stockMinimo),
      precio_venta: Number(precioVenta),
      costo_unitario: Number(costoUnitario),
      margen_ganancia: Number(margenGanancia),
      estatus
    };

    try {
      await editInventory(selectedItem.inventario_id, payload);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      resetForm();
      getInventoryByProduct(id_producto);
    } catch (error) {
      console.error("Error al actualizar inventario:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem?.id) return;
    try {
      await deleteInventoryById(selectedItem.inventario_id);
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      getInventoryByProduct(id_producto);
    } catch (error) {
      console.error("Error al eliminar inventario:", error);
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h2>Inventario del Producto</h2>
          <p>{filteredInventory.length} registros</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Nuevo inventario
        </button>
      </div>

      {/* SEARCH */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="orders-table">
        <thead>
          <tr>
            <th className="hide-mobile">ID</th>
            <th>Lote</th>
            <th>Oficina</th>
            <th className="center">Nro Serie</th>
            <th className="center">Existencia</th>
            <th className="center">Stock mínimo</th>
            <th className="center">Precio venta</th>
            <th className="center">Estatus</th>
            <th className="center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length ? currentItems.map(item => {
            const lowStock = item.existencia_general < item.stock_minimo_general;
            return (
              <tr key={item.id} className={lowStock ? "row-warning" : ""}>
                <td className="hide-mobile">#{item.inventario_id}</td>
                <td>{item.nro_lote}</td>
                <td>{item.oficina_nombre}</td>
                <td className="center">{item.sku}</td>
                <td className="center">{item.existencia_general}</td>
                <td className="center">{item.stock_minimo_general}</td>
                <td className="center">{item.precio_venta}</td>
                <td className="center">
                  <span className={`status-badge ${item.estatus ? "active" : "inactive"}`}>
                    {item.inventario_estatus ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="center">
                  <button
                    className="icon-btn"
                    onClick={() => { setSelectedItem(item); setIsDetailsModalOpen(true); }}
                  >
                    <SlOptionsVertical size={16} />
                  </button>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="9" className="no-results">
                No hay inventario registrado para este producto
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
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

      {/* -------------------- MODALES -------------------- */}

      {/* MODAL DETALLES (ESTILO ListLots) */}
      {isDetailsModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles del Inventario</h3>
            
            <div className="modal-info-body">
              <div className="detail-card"><strong>ID:</strong> #{selectedItem.inventario_id}</div>
              <div className="detail-card"><strong>Lote:</strong> {selectedItem.nro_lote}</div>
              <div className="detail-card"><strong>Oficina:</strong> {selectedItem.oficina_nombre}</div>
              <div className="detail-card"><strong>Nro Serie:</strong> {selectedItem.sku}</div>
              <div className="detail-card"><strong>Existencia:</strong> {selectedItem.existencia_general}</div>
              <div className="detail-card"><strong>Stock Mín:</strong> {selectedItem.stock_minimo_general}</div>
              <div className="detail-card"><strong>Costo Unit:</strong> {selectedItem.costo_unitario}</div>
              <div className="detail-card"><strong>Margen:</strong> {selectedItem.margen_ganancia}%</div>
              <div className="detail-card"><strong>Precio Venta:</strong> {selectedItem.precio_venta}</div>
              <div className="detail-card"><strong>Estatus:</strong> {selectedItem.inventario_estatus ? "Activo" : "Inactivo"}</div>
            </div>

            <div className="modal-footer" style={{ flexDirection: "column", gap: "0.75rem" }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  openEditModal(selectedItem);
                }}
              >
                <Pencil size={16} /> Editar
              </button>
              
              <button
                className="btn-danger"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 size={16} /> Eliminar
              </button>

              <button
                className="btn-secondary"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {isDeleteModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-danger">
              <AlertTriangle size={28} />
              <h3>¿Eliminar inventario?</h3>
            </div>
            <p>
              Estás a punto de eliminar el registro de inventario ID <strong>#{selectedItem.id}</strong> del lote <strong>{selectedItem.nro_lote}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={16} /> Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo inventario</h3>

            <div className="form-group">
              <label>Lote</label>
              <select
                className="modal-input"
                value={idLote}
                onChange={e => setIdLote(e.target.value)}
              >
                <option value="">Seleccione lote</option>
                {productLotes.length > 0 ? (
                  productLotes.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.nro_lote}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay lotes disponibles para este producto</option>
                )}
              </select>
            </div>


            <div className="form-group">
              <label>Oficina</label>
              <select className="modal-input" value={idOffice} onChange={e => setIdOffice(e.target.value)}>
                <option value="">Seleccione oficina</option>
                {safeOffices.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Nro Serie (Solo números)</label>
              {/* CORRECCIÓN 3: SOLO NUMEROS */}
              <input
                className="modal-input"
                value={nroSerie}
                onChange={e => setSku(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 12345"
              />
            </div>

            <div className="form-row" style={{display: 'flex', gap: '10px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Existencia</label>
                <input className="modal-input" type="number" value={existencia} onChange={e => setExistencia(e.target.value.replace(/\D/g, ""))}/>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Stock mínimo</label>
                <input className="modal-input" type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value.replace(/\D/g, ""))}/>
              </div>
            </div>

            <div className="form-row" style={{display: 'flex', gap: '10px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Costo Unit.</label>
                <input className="modal-input" type="number" value={costoUnitario} onChange={e => setCostoUnitario(e.target.value)}/>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Margen %</label>
                <input className="modal-input" type="number" value={margenGanancia} onChange={e => setMargenGanancia(e.target.value)}/>
              </div>
            </div>
            
            <div className="form-group">
              <label>Precio Venta (Calculado)</label>
              <input
                className="modal-input"
                value={precioVenta}
                readOnly
                style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}
              />
            </div>

            <div className="form-group">
              <label>Estatus</label>
              <select className="modal-input" value={estatus} onChange={e => setEstatus(e.target.value === "true")}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCreate}>
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar inventario</h3>

            <div className="form-group">
              <label>Lote</label>
              <select
                className="modal-input"
                value={idLote}
                onChange={e => setIdLote(e.target.value)}
              >
                <option value="">Seleccione lote</option>
                {productLotes.length > 0 ? (
                  productLotes.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.nro_lote}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay lotes disponibles para este producto</option>
                )}
              </select>
            </div>


            <div className="form-group">
              <label>Oficina</label>
              <select className="modal-input" value={idOffice} onChange={e => setIdOffice(e.target.value)}>
                <option value="">Seleccione oficina</option>
                {safeOffices.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Nro Serie (Solo números)</label>
              <input
                className="modal-input"
                value={nroSerie}
                onChange={e => setSku(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="form-row" style={{display: 'flex', gap: '10px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Existencia</label>
                <input className="modal-input" type="number" value={existencia} onChange={e => setExistencia(e.target.value.replace(/\D/g, ""))}/>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Stock mínimo</label>
                <input className="modal-input" type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value.replace(/\D/g, ""))}/>
              </div>
            </div>

            <div className="form-row" style={{display: 'flex', gap: '10px'}}>
               <div className="form-group" style={{flex: 1}}>
                <label>Costo Unit.</label>
                <input className="modal-input" type="number" value={costoUnitario} onChange={e => setCostoUnitario(e.target.value)}/>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Margen %</label>
                <input className="modal-input" type="number" value={margenGanancia} onChange={e => setMargenGanancia(e.target.value)}/>
              </div>
            </div>

            <div className="form-group">
              <label>Precio Venta (Calculado)</label>
              <input
                className="modal-input"
                value={precioVenta}
                readOnly
                style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}
              />
            </div>

            <div className="form-group">
              <label>Estatus</label>
              <select className="modal-input" value={estatus} onChange={e => setEstatus(e.target.value === "true")}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListInventory;