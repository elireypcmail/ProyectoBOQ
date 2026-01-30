import React, { useState } from "react"
import Sidebar from "../components/Layout/Sidebar"
import ListPatients from "../components/Patients/ListPatients"
import ListInsurances from "../components/Patients/ListInsurances"
import ListStories from "../components/Patients/ListStories"

import ListProducts from "../components/Products/ListProducts"
import ListCategories from "../components/Products/ListCategories"
import ListBrands from "../components/Products/ListBrands"

import ListZones from "../components/Entities/ListZones"
import ListDeposits from "../components/Entities/ListDeposits"
import ListOffices from "../components/Entities/ListOffices"
import ListDoctors from "../components/Patients/ListDoctors"
import ListTypesDoctor from "../components/Patients/ListTypesDoctor"
import { EntityProvider } from "../context/EntityContext"
import { Menu, X } from "lucide-react" // Iconos para el toggle
import "../styles/pages/HomePage.css"

export default function HomePage() {
  const [activeComponent, setActiveComponent] = useState("zones")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <EntityProvider>
      <div className={`home-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
        
        {/* Botón flotante para móvil */}
        <button className="mobile-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Overlay para cerrar el sidebar al tocar fuera en móvil */}
        {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

        <aside className={`sidebar-wrapper ${isSidebarOpen ? "active" : ""}`}>
          <Sidebar
            setActiveComponent={(comp) => {
              setActiveComponent(comp)
              setIsSidebarOpen(false) // Cerrar al seleccionar en móvil
            }}
            activeComponent={activeComponent}
          />
        </aside>

        <main className="main-viewport">
          <header className="top-bar">
            <div className="breadcrumb">
              {/* <span>Dashboard</span> / <span className="current">{activeComponent}</span> */}
            </div>
            <div className="user-profile">
              <div className="avatar">JD</div>
            </div>
          </header>

          <section className="content-area">
            <div className="content-container">
              {activeComponent === "patients" && <ListPatients />}
              {activeComponent === "insurances" && <ListInsurances />}
              {activeComponent === "stories" && <ListStories />}
              {activeComponent === "products" && <ListProducts />}
              {activeComponent === "categories" && <ListCategories />}
              {activeComponent === "brands" && <ListBrands />}
              {activeComponent === "zones" && <ListZones />}
              {activeComponent === "deposits" && <ListDeposits />}
              {activeComponent === "offices" && <ListOffices />}
              {activeComponent === "doctors" && <ListDoctors />}
              {activeComponent === "types-doctors" && <ListTypesDoctor />}
              {/* Aquí irían los demás componentes */}
            </div>
          </section>
        </main>
      </div>
    </EntityProvider>
  )
}