import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Layout/Sidebar";
import ListUsers from "../components/Users/ListUsers";
import ListSettings from "../components/Settings/ListSettings";
import ListPatients from "../components/Patients/ListPatients";
import ListInsurances from "../components/Patients/ListInsurances";
import ListStories from "../components/Patients/ListStories";
import ListProducts from "../components/Products/ListProducts";
import ListCategories from "../components/Products/ListCategories";
import ListBrands from "../components/Products/ListBrands";
import ListLots from "../components/Products/ListLots";
import ListSellers from "../components/Sales/ListSellers";
import ListSales from "../components/Sales/ListSales";
import ListSuppliers from "../components/Purchases/ListSuplliers";
import ListPurchases from "../components/Purchases/ListPurchases";
import ListZones from "../components/Entities/ListZones";
import ListDeposits from "../components/Entities/ListDeposits";
import ListOffices from "../components/Entities/ListOffices";
import ListDoctors from "../components/Patients/ListDoctors";
import ListTypesDoctor from "../components/Patients/ListTypesDoctor";
import ListClinics from "../components/Clinics/ListClinics";
import ListBudgets from "../components/Budegts/ListBudgets";
import ListReports from "../components/Reports/ListReports";
import { EntityProvider } from "../context/EntityContext";
import { Menu, X } from "lucide-react";

import "../styles/pages/HomePage.css";
import fondoHorizontal from "../assets/images/fondoHorizontal.jpeg";
import fondoApp from "../assets/images/fondoApp.jpeg";
import logo from "../assets/images/logoBlanco.png";

export default function HomePage() {
  const storedUser = localStorage.getItem("UserId");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const userRole = userData?.rol;

  const [activeComponent, setActiveComponent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0); 
  const sidebarRef = useRef(null);
  const clickTimerRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const closeComponent = () => setActiveComponent(null);

  const handleLogoAction = () => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    const newCount = clickCount + 1;
    
    if (newCount === 7) {
      setActiveComponent("settings");
      setClickCount(0);
    } else {
      setClickCount(newCount);
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);
    }
  };

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
        <div
          className="home-background"
          style={{
            "--bg-desktop": `url(${fondoHorizontal})`,
            "--bg-mobile": `url(${fondoApp})`,
          }}
        />
        <div className="home-overlay" />

        {activeComponent && (
          <img 
            src={logo} 
            alt="Logo Mundo Implantes" 
            className="floating-logo" 
            onClick={handleLogoAction}
          />
        )}

        <button className="mobile-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <aside
          ref={sidebarRef}
          className={`sidebar-wrapper ${isSidebarOpen ? "is-open" : ""}`}
        >
          <Sidebar
            activeComponent={activeComponent}
            userRole={userRole}
            setActiveComponent={(comp) => {
              setActiveComponent(comp);
              setIsSidebarOpen(false);
            }}
          />
        </aside>

        <main className="main-viewport">
          <section className="content-area">
            
            {!activeComponent && (
              <div className="welcome-container">
                <img 
                  src={logo} 
                  alt="Mundo Implantes" 
                  className="central-welcome-logo" 
                  onClick={handleLogoAction}
                />
              </div>
            )}

            <div className="rendered-content">
              {/* Componentes accesibles para TODOS (incluido OPRI) */}
              {activeComponent === "reports" && (
                <ListReports onClose={closeComponent} />
              )}
              
              {activeComponent === "products" && (
                <ListProducts onClose={closeComponent} />
              )}

              {/* Componentes restringidos: Solo si NO es OPRI */}
              {userRole !== "OPRI" && activeComponent && (
                <>
                  {activeComponent === "patients" && <ListPatients onClose={closeComponent} />}
                  {activeComponent === "settings" && <ListSettings onClose={closeComponent} />}
                  {activeComponent === "insurances" && <ListInsurances onClose={closeComponent} />}
                  {activeComponent === "stories" && <ListStories onClose={closeComponent} />}
                  {activeComponent === "categories" && <ListCategories onClose={closeComponent} />}
                  {activeComponent === "brands" && <ListBrands onClose={closeComponent} />}
                  {activeComponent === "lots" && <ListLots onClose={closeComponent} />}
                  {activeComponent === "zones" && <ListZones onClose={closeComponent} />}
                  {activeComponent === "deposits" && <ListDeposits onClose={closeComponent} />}
                  {activeComponent === "offices" && <ListOffices onClose={closeComponent} />}
                  {activeComponent === "doctors" && <ListDoctors onClose={closeComponent} />}
                  {activeComponent === "types-doctors" && <ListTypesDoctor onClose={closeComponent} />}
                  {activeComponent === "suppliers" && <ListSuppliers onClose={closeComponent} />}
                  {activeComponent === "purchases" && <ListPurchases onClose={closeComponent} />}
                  {activeComponent === "sellers" && <ListSellers onClose={closeComponent} />}
                  {activeComponent === "sales" && <ListSales onClose={closeComponent} />}
                  {activeComponent === "clinics" && <ListClinics onClose={closeComponent} />}
                  {activeComponent === "budgets" && <ListBudgets onClose={closeComponent} />}
                  {activeComponent === "users" && <ListUsers onClose={closeComponent} />}
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </EntityProvider>
  );
}