import React, { useState, useRef, useEffect } from "react"
import Sidebar           from "../components/Layout/Sidebar"
import ListUsers         from "../components/Users/ListUsers"
import ListPatients      from "../components/Patients/ListPatients"
import ListInsurances    from "../components/Patients/ListInsurances"
import ListStories       from "../components/Patients/ListStories"
import ListProducts      from "../components/Products/ListProducts"
import ListCategories    from "../components/Products/ListCategories"
import ListBrands        from "../components/Products/ListBrands"
import ListLots          from "../components/Products/ListLots"
import ListSellers       from "../components/Sales/ListSellers"
import ListSales         from "../components/Sales/ListSales"
import ListSuppliers     from "../components/Purchases/ListSuplliers"
import ListPurchases     from "../components/Purchases/ListPurchases"
import ListZones         from "../components/Entities/ListZones"
import ListDeposits      from "../components/Entities/ListDeposits"
import ListOffices       from "../components/Entities/ListOffices"
import ListDoctors       from "../components/Patients/ListDoctors"
import ListTypesDoctor   from "../components/Patients/ListTypesDoctor"
import ListClinics       from "../components/Clinics/ListClinics"
import ListBudgets       from "../components/Budegts/ListBudgets"
import ListReports       from "../components/Reports/ListReports"

import { EntityProvider } from "../context/EntityContext"
import { Menu, X } from "lucide-react"

import "../styles/pages/HomePage.css"
import fondoHorizontal from "../assets/images/fondoHorizontal.jpeg"
import fondoApp from "../assets/images/fondoApp.jpeg"
import logo from "../assets/images/logo.png"

export default function HomePage() {
  // 1. Obtener datos del usuario y su rol desde LocalStorage
  const storedUser = localStorage.getItem("UserId");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const userRole = userData?.rol; // Ejemplo: "OPRI", "admin"

  // 2. Definir componente activo inicial basado en el rol
  const [activeComponent, setActiveComponent] = useState(
    userRole === "OPRI" ? "reports" : "products"
  );
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false)
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isSidebarOpen])

  return (
    <EntityProvider>
      <div className={`home-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>

        {/* Fondo */}
        <div
          className="home-background"
          style={{
            "--bg-desktop": `url(${fondoHorizontal})`,
            "--bg-mobile": `url(${fondoApp})`,
          }}
        />
        <div className="home-overlay" />

        {/* LOGO FLOTANTE DERECHA */}
        <img src={logo} alt="Logo" className="floating-logo" />

        {/* Botón móvil */}
        <button className="mobile-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`sidebar-wrapper ${isSidebarOpen ? "is-open" : ""}`}
        >
          <Sidebar
            activeComponent={activeComponent}
            userRole={userRole} // Pasamos el rol al sidebar para que oculte los menús
            setActiveComponent={(comp) => {
              setActiveComponent(comp)
              setIsSidebarOpen(false)
            }}
          />
        </aside>

        {/* Contenido */}
        <main className="main-viewport">
          <section className="content-area">
            {/* Si el rol es OPRI, solo permitimos ver reports */}
            {userRole === "OPRI" ? (
              <>
                {activeComponent === "reports" && <ListReports />}
              </>
            ) : (
              /* Acceso total para otros roles (admin, etc.) */
              <>
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
                {activeComponent === "sellers" && <ListSellers />}
                {activeComponent === "sales" && <ListSales />}
                {activeComponent === "clinics" && <ListClinics />}
                {activeComponent === "budgets" && <ListBudgets />}
                {activeComponent === "reports" && <ListReports />}
                {activeComponent === "users" && <ListUsers />}
              </>
            )}
          </section>
        </main>

      </div>
    </EntityProvider>
  )
}