import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { X, FileText, Loader2 } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import jsPDF from 'jspdf';
import '../../styles/ui/ModalCreateCatalog.css';

const ModalCreateCatalog = ({ isOpen, onClose, categories, brands }) => {
  const { 
    getFilteredProducts, 
    lotes, 
    deposits, 
    getAllLotes, 
    getAllDeposits 
  } = useProducts();

  const [loading, setLoading] = useState(false);

  // Estados de filtros
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedLote, setSelectedLote] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const MAX_PRICE_ALLOWED = 999999999;

  // Función para resetear el formulario
  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedLote(null);
    setSelectedDeposit(null);
    setMinPrice('');
    setMaxPrice('');
  };

  // Cargar datos necesarios al abrir
  useEffect(() => {
    if (isOpen) {
      if (!lotes || lotes.length === 0) getAllLotes();
      if (!deposits || deposits.length === 0) getAllDeposits();
    }
  }, [isOpen]);

  // Manejador de cambio de precio con validación de máximo
  const handlePriceChange = (value, setter) => {
    const numValue = parseFloat(value);
    if (numValue > MAX_PRICE_ALLOWED) {
      setter(MAX_PRICE_ALLOWED.toString());
    } else {
      setter(value);
    }
  };

  // Memos con protección contra valores undefined/null
  const categoryOptions = useMemo(() => 
    categories?.map(c => ({ 
      value: c.id, 
      label: (c.nombre || 'SIN CATEGORÍA').toUpperCase() 
    })) || [], [categories]);

  const brandOptions = useMemo(() => 
    brands?.map(b => ({ 
      value: b.id, 
      label: (b.nombre || 'SIN MARCA').toUpperCase() 
    })) || [], [brands]);

  const loteOptions = useMemo(() => 
    lotes?.map(l => ({ 
      value: l.id, 
      label: `LOTE: ${(l.nro_lote || 'N/A').toUpperCase()}` 
    })) || [], [lotes]);

  const depositOptions = useMemo(() => 
    deposits?.map(d => ({ 
      value: d.id, 
      label: (d.nombre || 'SIN DEPÓSITO').toUpperCase() 
    })) || [], [deposits]);

  if (!isOpen) return null;

  const generatePDF = (products) => {
    const doc = new jsPDF();
    let y = 20; 
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;

    doc.setFontSize(20);
    doc.setTextColor(236, 49, 55);
    doc.setFont("helvetica", "bold");
    doc.text("CATÁLOGO PERSONALIZADO", margin, y);
    
    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    const filtroTexto = `Marca: ${selectedBrand?.label || 'TODAS'} | Cat: ${selectedCategory?.label || 'TODAS'}`;
    doc.text(filtroTexto, margin, y);
    
    y += 5;
    doc.setDrawColor(230);
    doc.line(margin, y, 196, y);
    y += 15;

    products.forEach((p) => {
      if (y + 45 > pageHeight) {
        doc.addPage();
        y = 20;
      }

      if (p.images && p.images.length > 0) {
        try {
          const imgData = `data:${p.images[0].mime_type};base64,${p.images[0].data}`;
          doc.addImage(imgData, 'JPEG', margin, y, 30, 30);
        } catch (e) {
          doc.rect(margin, y, 30, 30);
        }
      } else {
        doc.rect(margin, y, 30, 30);
      }

      doc.setTextColor(40);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text((p.descripcion || 'SIN DESCRIPCIÓN').toUpperCase(), 50, y + 5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`SKU: ${p.sku || 'N/A'}`, 50, y + 12);
      doc.text(`MARCA: ${p.marca || 'N/A'}`, 50, y + 17);

      const precioFormateado = p.precio_venta 
        ? parseFloat(p.precio_venta).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
        : '0,00';
      
      doc.setFontSize(14);
      doc.setTextColor(236, 49, 55);
      doc.text(`$ ${precioFormateado}`, 196, y + 10, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(`STOCK: ${p.existencia_general || 0}`, 196, y + 18, { align: 'right' });

      y += 35;
      doc.setDrawColor(240);
      doc.line(margin, y, 196, y);
      y += 10;
    });

    doc.save(`CATALOGO_${Date.now()}.pdf`);
  };

  const handleGenerateClick = async () => {
    setLoading(true);
    try {
      const filters = {
        categoryId: selectedCategory?.value || '',
        brandId: selectedBrand?.value || '',
        loteId: selectedLote?.value || '',
        depositId: selectedDeposit?.value || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || ''
      };

      const result = await getFilteredProducts(filters);
      
      if (result && result.status) {
        generatePDF(result.data);
        resetForm(); // Limpiamos los inputs
        onClose();
      } else {
        alert(result?.msg || "No se encontraron productos");
      }
    } catch (error) {
      console.error("Error al generar el catálogo:", error);
      alert("Error al obtener los productos.");
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    input: (base) => ({ ...base, textTransform: 'uppercase' }),
  };

  return (
    <div className="modal-catalog-overlay">
      <div className="modal-catalog-content max-w-2xl"> 
        <div className="modal-catalog-header">
          <h3>Filtros de Catálogo</h3>
          <button className="modal-catalog-close-btn" onClick={() => { resetForm(); onClose(); }} disabled={loading}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-catalog-body grid-2-columns">
          <div className="modal-catalog-form-group">
            <label>Categoría</label>
            <Select options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} placeholder="TODAS" isClearable styles={customSelectStyles} menuPortalTarget={document.body}/>
          </div>
          <div className="modal-catalog-form-group">
            <label>Marca</label>
            <Select options={brandOptions} value={selectedBrand} onChange={setSelectedBrand} placeholder="TODAS" isClearable styles={customSelectStyles} menuPortalTarget={document.body}/>
          </div>

          <div className="modal-catalog-form-group">
            <label>Lote</label>
            <Select options={loteOptions} value={selectedLote} onChange={setSelectedLote} placeholder="TODOS LOS LOTES" isClearable styles={customSelectStyles} menuPortalTarget={document.body}/>
          </div>
          <div className="modal-catalog-form-group">
            <label>Depósito / Almacén</label>
            <Select options={depositOptions} value={selectedDeposit} onChange={setSelectedDeposit} placeholder="TODOS LOS DEPÓSITOS" isClearable styles={customSelectStyles} menuPortalTarget={document.body}/>
          </div>

          <div className="modal-catalog-form-group">
            <label>Precio Min</label>
            <input 
              type="number" 
              className="catalog-input" 
              value={minPrice} 
              onChange={(e) => handlePriceChange(e.target.value, setMinPrice)} 
              placeholder="0,00" 
              max={MAX_PRICE_ALLOWED}
            />
          </div>
          <div className="modal-catalog-form-group">
            <label>Precio Max</label>
            <input 
              type="number" 
              className="catalog-input" 
              value={maxPrice} 
              onChange={(e) => handlePriceChange(e.target.value, setMaxPrice)} 
              placeholder="0,00" 
              max={MAX_PRICE_ALLOWED}
            />
          </div>
        </div>

        <div className="modal-catalog-footer">
          <button className="catalog-btn-secondary" onClick={() => { resetForm(); onClose(); }} disabled={loading}>Cancelar</button>
          <button className="catalog-btn-primary" onClick={handleGenerateClick} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            {loading ? 'Consultando...' : 'Generar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCreateCatalog;