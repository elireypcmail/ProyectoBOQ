import React, { useState } from "react";
import {
  Menu, X, ChevronLeft, ChevronRight,
  Package, Tags, BadgeCheck, Stethoscope,
  HeartPulse, Map, Building2, Warehouse, Users,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import "../../styles/layout/Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth(); 

  const menuItems = [
    { name: "Productos", key: "products", icon: <Package size={22} /> },
    { name: "Categorías", key: "categories", icon: <Tags size={22} /> },
    { name: "Marcas", key: "brands", icon: <BadgeCheck size={22} /> },
    { name: "Médicos", key: "doctors", icon: <Stethoscope size={22} /> },
    { name: "Pacientes", key: "patients", icon: <HeartPulse size={22} /> },
    { name: "Zonas", key: "zones", icon: <Map size={22} /> },
    { name: "Oficinas", key: "offices", icon: <Building2 size={22} /> },
    { name: "Depósitos", key: "deposits", icon: <Warehouse size={22} /> },
    { name: "Usuarios", key: "users", icon: <Users size={22} /> },
  ];

  const handleNavigation = (key) => {
    setActiveComponent(key);  // 🔹 Cambiamos la sección activa
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/")
  };

  return (
    <>
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setIsOpen(true)}>
          <Menu size={28} />
        </button>
      </header>

      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="logo-container">
              {/* <img src={logo} alt="Logo" className="sidebar-logo-img" /> */}
            </div>
          )}

          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button className="close-btn-mobile" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(item => (
              <li key={item.key} className="nav-item">
                <button
                  className={`nav-link ${activeComponent === item.key ? "active" : ""}`}
                  onClick={() => handleNavigation(item.key)}
                  title={isCollapsed ? item.name : ""}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-text">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={22} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
