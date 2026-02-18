import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Layout/Sidebar";
import ListPatients from "../components/Patients/ListPatients";
import ListInsurances from "../components/Patients/ListInsurances";
import ListStories from "../components/Patients/ListStories";
import ListProducts from "../components/Products/ListProducts";
import ListCategories from "../components/Products/ListCategories";
import ListBrands from "../components/Products/ListBrands";
import ListLots from "../components/Products/ListLots";
import ListSuppliers from "../components/Purchases/ListSuplliers";
import ListPurchases from "../components/Purchases/ListPurchases";
import ListZones from "../components/Entities/ListZones";
import ListDeposits from "../components/Entities/ListDeposits";
import ListOffices from "../components/Entities/ListOffices";
import ListDoctors from "../components/Patients/ListDoctors";
import ListTypesDoctor from "../components/Patients/ListTypesDoctor";

import { EntityProvider } from "../context/EntityContext";
import { Menu, X } from "lucide-react";

// Estilos y recursos visuales
import "../styles/pages/HomePage.css";
import fondoHorizontal from "../assets/images/fondoHorizontal.jpeg";
import fondoApp from "../assets/images/fondoApp.jpeg";

export default function HomePage() {
  const [activeComponent, setActiveComponent] = useState("products");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <EntityProvider>
      <div className={`home-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
        
        {/* Capas de fondo dinámico */}
        <div 
          className="home-background" 
          style={{ 
            '--bg-desktop': `url(${fondoHorizontal})`,
            '--bg-mobile': `url(${fondoApp})`
          }} 
        />
        <div className="home-overlay" />

        <button className="mobile-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <aside ref={sidebarRef} className={`sidebar-wrapper ${isSidebarOpen ? "is-open" : ""}`}>
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            activeComponent={activeComponent}
            setActiveComponent={(comp) => {
              setActiveComponent(comp);
              setIsSidebarOpen(false);
            }}
          />
        </aside>

        <main className="main-viewport">
          <header className="top-bar">
            
          </header>

          <section className="content-area">
            {/* Sin glass-container, el contenido va directo */}
            {activeComponent === "patients" && <ListPatients />}
            {activeComponent === "insurances" && <ListInsurances />}
            {activeComponent === "stories" && <ListStories />}
            {activeComponent === "products" && <ListProducts />}
            {activeComponent === "categories" && <ListCategories />}
            {activeComponent === "brands" && <ListBrands />}
            {activeComponent === "lots" && <ListLots />}
            {activeComponent === "zones" && <ListZones />}
            {activeComponent === "deposits" && <ListDeposits />}
            {activeComponent === "offices" && <ListOffices />}
            {activeComponent === "doctors" && <ListDoctors />}
            {activeComponent === "types-doctors" && <ListTypesDoctor />}
            {activeComponent === "suppliers" && <ListSuppliers />}
            {activeComponent === "purchases" && <ListPurchases />}
          </section>
        </main>
      </div>
    </EntityProvider>
  );
}