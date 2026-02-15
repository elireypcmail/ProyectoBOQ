/* PurchaseForm.css - Diseño Optimizado Completo y Responsive */

/* --- Contenedores Principales --- */
.pform-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 40px 20px;
  overflow-y: auto;
}

.pform-card {
  background: #fdfdfd;
  width: 100%;
  max-width: 1300px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: pform-slideIn 0.3s ease-out;
}

/* --- Cabecera Principal --- */
.pform-header-main {
  padding: 30px 40px 10px 40px;
  position: relative;
}

.pform-header-main h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #000;
  margin: 0;
}

.pform-header-main p {
  color: #777;
  font-size: 1.1rem;
  margin-top: 5px;
}

.pform-close-x {
  position: absolute;
  top: 30px;
  right: 40px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.pform-close-x:hover { color: #333; }

/* --- Stepper (Barra de Progreso) --- */
.pform-stepper-container {
  margin: 20px 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
}

.pform-stepper-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.step-badge {
  background: #3a86ff;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: bold;
}

.step-percentage {
  margin-left: auto;
  color: #3a86ff;
  font-weight: 600;
  font-size: 0.9rem;
}

.pform-progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: #3a86ff;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.pform-step-names {
  display: flex;
  justify-content: space-between;
}

.pform-step-names span {
  font-size: 0.8rem;
  color: #999;
}

.pform-step-names span.active {
  color: #3a86ff;
  font-weight: 600;
  border-bottom: 2px solid #3a86ff;
}

/* --- Cuerpo del Formulario --- */
.pform-body {
  padding: 0 40px 30px 40px;
}

.pform-section-white {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 30px;
}

.section-header { margin-bottom: 25px; }
.section-header h3 { font-size: 1.3rem; font-weight: 700; margin: 0; }
.section-header p { color: #666; font-size: 0.9rem; margin-top: 4px; }

/* --- Grid de Formulario --- */
.pform-form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }

.pform-group { display: flex; flex-direction: column; gap: 8px; }
.pform-group label { font-size: 0.9rem; font-weight: 700; color: #000; }
.required { color: #d0021b; margin-left: 2px; }

.pform-group input, 
.pform-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #333;
  box-sizing: border-box;
}

.input-disabled { background-color: #f9f9f9 !important; color: #999; cursor: not-allowed; }

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon svg { position: absolute; left: 12px; color: #999; }
.input-with-icon input { padding-left: 40px; }

/* --- Etapa 2: Gestión de Productos --- */
.section-header-alt h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 25px;
}

.pform-products-toolbar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-container-full {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-container-full .search-icon { position: absolute; left: 12px; color: #aaa; }

.search-container-full input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.btn-add-new-product {
  background-color: #6da3c7;
  color: white;
  border: none;
  padding: 0 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  cursor: pointer;
}

.pform-empty-table-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  background: #fcfcfc;
}

/* --- CONTENEDOR RESPONSIVE PARA TABLAS --- */
/* IMPORTANTE: Debes envolver tus <table> en el HTML/React con un div que use esta clase */
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* --- TABLA DE ITEMS SELECCIONADOS --- */
.pform-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  min-width: 800px; /* Asegura que la tabla no se aplaste en móviles */
}

.pform-items-table th {
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #eee;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

.pform-items-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
  color: #444;
}

.center { text-align: center !important; }
.sku-cell { font-weight: 700; color: #3a86ff; }
.desc-cell { font-weight: 500; }

.table-input-qty {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-weight: 700;
  color: #333;
}

.pform-actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-edit-row, .btn-delete-row, .btn-batch-row {
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.btn-batch-row { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
.btn-batch-row:hover { background: #0369a1; color: #fff; }
.btn-edit-row { background: #f0f7ff; color: #3a86ff; border: 1px solid #cce5ff; }
.btn-edit-row:hover { background: #3a86ff; color: #fff; }
.btn-delete-row { background: #fff5f5; color: #e03131; border: 1px solid #ffc9c9; }
.btn-delete-row:hover { background: #e03131; color: #fff; }

/* --- SUB-MODAL DE BÚSQUEDA --- */
.pform-submodal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.pform-search-box-modal {
  background: #fff;
  width: 100%;
  max-width: 550px;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.psbm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.psbm-header h3 { font-size: 1.2rem; font-weight: 700; margin: 0; }
.btn-close-sub { background: none; border: none; color: #999; cursor: pointer; }

.psbm-input-wrapper { position: relative; margin-bottom: 15px; }
.psbm-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #3a86ff; }
.psbm-input-wrapper input {
  width: 100%;
  padding: 14px 14px 14px 45px;
  border: 2px solid #3a86ff;
  border-radius: 10px;
  outline: none;
}

.psbm-results { max-height: 350px; overflow-y: auto; }
.psbm-item {
  padding: 12px 15px;
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}
.psbm-item:hover { border-color: #3a86ff; background-color: #f0f6ff; }
.psbm-item-main { display: flex; flex-direction: column; gap: 2px; }
.psbm-item-code { font-size: 0.85rem; font-weight: 700; color: #3a86ff; }
.psbm-item-name { font-size: 0.95rem; color: #333; font-weight: 500; }
.psbm-item-details { text-align: right; font-size: 0.8rem; color: #777; display: flex; flex-direction: column; gap: 2px; }
.psbm-item-details strong { color: #333; }
.psbm-no-results { text-align: center; color: #999; padding: 20px; }

/* --- REGISTRO DE LOTES (BATTERY REGISTRATION) --- */
.pform-batch-modal {
  background: #fff;
  width: 100%;
  max-width: 950px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.pbatch-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pbatch-header h3 { font-size: 1.3rem; font-weight: 800; color: #000; margin: 0; }

.pbatch-content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 25px;
  padding: 30px;
}

.pbatch-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
}

.pbatch-card h4 {
  margin: 0 0 20px 0;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
}

.pbatch-form-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.btn-add-batch {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  background: #3a86ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 0.95rem;
}
.summary-row.success { background: #f0fdf4; color: #16a34a; }
.summary-row.success strong { font-size: 1.1rem; }
.summary-row.info { background: #f0f9ff; color: #0284c7; }
.summary-row.info strong { font-size: 1.1rem; }

.pbatch-table-container { padding: 0 30px 30px 30px; }
.pbatch-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.btn-delete-all {
  background: none;
  border: none;
  color: #e03131;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
}

.pbatch-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.pbatch-table th { background: #f8fafc; text-align: left; padding: 12px; font-size: 0.8rem; color: #666; border-bottom: 1px solid #eee; }
.pbatch-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }

.btn-del-mini { background: none; border: none; color: #999; cursor: pointer; transition: color 0.2s; }
.btn-del-mini:hover { color: #e03131; }

.table-hint { font-size: 0.8rem; color: #aaa; text-align: center; margin-top: 15px; font-style: italic; }

/* --- Footer de Acciones --- */
.pform-footer-actions-alt {
  padding: 25px 40px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-buttons { display: flex; gap: 12px; }

.btn-cancel-flat { padding: 12px 35px; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-weight: 700; color: #555; cursor: pointer; }
.btn-prev-outline { padding: 12px 25px; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.btn-next-step { padding: 12px 35px; background-color: #3a86ff; color: white; border: none; border-radius: 8px; font-weight: 700; display: flex; align-items: center; gap: 10px; cursor: pointer; }
.btn-next-step.disabled { background-color: #b3d1e4; cursor: not-allowed; opacity: 0.7; }

/* --- ESTILOS ADICIONALES PARA PASO 3 Y 4 --- */
.input-total-highlight {
  background-color: #f0f6ff !important;
  border-color: #3a86ff !important;
  color: #3a86ff !important;
  font-weight: 800 !important;
  font-size: 1.1rem !important;
}

.pform-confirmation-step { animation: pform-fadeIn 0.4s ease; }

.pform-summary-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1px;
  background: #eee;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 25px;
}

.summary-card-item { background: #f8fafc; padding: 15px; display: flex; flex-direction: column; gap: 5px; }
.summary-card-item label { font-size: 0.75rem; text-transform: uppercase; color: #888; font-weight: 700; }
.summary-card-item span { font-size: 1rem; font-weight: 600; color: #333; }

.pform-final-summary-pane {
  margin-top: 30px;
  background: #fff;
  border: 2px solid #3a86ff;
  border-radius: 12px;
  padding: 25px;
  max-width: 420px;
  margin-left: auto;
  box-shadow: 0 4px 15px rgba(58, 134, 255, 0.1);
}

.final-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #eee; }
.final-row:last-of-type { border-bottom: none; }
.final-row span:first-child { color: #666; font-weight: 500; }
.final-row span:last-child { color: #333; font-weight: 700; }
.final-row.total-text { border-bottom: none; padding-top: 15px; }
.final-row.total-text span:last-child { color: #3a86ff; font-size: 1.5rem; font-weight: 800; }

.btn-finalizar-compra {
  padding: 12px 40px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-finalizar-compra:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.table-input-dynamic {
  min-width: 100px;
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-weight: 700;
  color: #333;
  outline: none;
  font-family: inherit;
  transition: width 0.2s ease-out, border-color 0.2s ease, box-shadow 0.2s ease;
}

.table-input-dynamic:focus { border-color: #3a86ff !important; box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.15); }
.table-input-dynamic::-webkit-outer-spin-button,
.table-input-dynamic::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.table-input-dynamic[type=number] { -moz-appearance: textfield; }

@keyframes pform-slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pform-fadeIn { from { opacity: 0; } to { opacity: 1; } }


/* ========================================================= */
/* MEDIA QUERIES RESPONSIVE                */
/* ========================================================= */

/* --- TABLETS Y PANTALLAS MEDIANAS (Hasta 1024px) --- */
@media (max-width: 1024px) {
  .pform-form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .col-span-3 { grid-column: span 2; }
  
  .pbatch-content-grid {
    grid-template-columns: 1fr; /* Apilamos los lotes */
  }
}

/* --- MÓVILES (Hasta 768px) --- */
@media (max-width: 768px) {
  
  /* 1. Reducir márgenes y paddings globales para ganar espacio */
  .pform-overlay { padding: 10px; }
  .pform-header-main { padding: 20px 20px 10px 20px; }
  .pform-close-x { top: 20px; right: 20px; }
  .pform-stepper-container { margin: 15px 20px; padding: 15px; }
  .pform-body { padding: 0 20px 20px 20px; }
  .pform-section-white { padding: 20px; }
  
  /* 2. Formularios a 1 sola columna */
  .pform-form-grid { grid-template-columns: 1fr; }
  .col-span-1, .col-span-2, .col-span-3 { grid-column: span 1; }
  .pbatch-form-inputs { grid-template-columns: 1fr; }

  /* 3. Textos un poco más pequeños */
  .pform-header-main h1 { font-size: 1.8rem; }
  .section-header-alt h2 { font-size: 1.5rem; }
  
  /* 4. Toolbar de productos en columna */
  .pform-products-toolbar { flex-direction: column; }
  .btn-add-new-product { width: 100%; justify-content: center; padding: 12px; }

  /* 5. Modales responsivos */
  .pform-search-box-modal { padding: 15px; }
  .pbatch-header { padding: 15px 20px; }
  .pbatch-content-grid { padding: 20px; }
  .pbatch-table-container { padding: 0 20px 20px 20px; }

  /* 6. Footer botones de navegación a 100% de ancho */
  .pform-footer-actions-alt { 
    flex-direction: column-reverse; /* Cancelar abajo, Seguir arriba */
    gap: 15px; 
    padding: 20px; 
  }
  .nav-buttons { 
    width: 100%; 
    display: flex; 
    flex-direction: column; 
    gap: 10px; 
  }
  .btn-cancel-flat, .btn-prev-outline, .btn-next-step, .btn-finalizar-compra { 
    width: 100%; 
    justify-content: center; 
  }

  /* 7. Panel de total final (Paso 4) centrado a 100% */
  .pform-final-summary-pane {
    margin-left: 0;
    max-width: 100%;
  }
}

/* --- MÓVILES MUY PEQUEÑOS (Hasta 480px) --- */
@media (max-width: 480px) {
  /* Ocultamos los nombres de los pasos que no estén activos para que no se amontone el texto */
  .pform-step-names span:not(.active) {
    display: none;
  }
  .pform-step-names span.active {
    width: 100%;
    text-align: center;
  }
  
  .pform-header-main h1 { font-size: 1.5rem; }
}