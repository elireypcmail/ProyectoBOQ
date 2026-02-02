import React, { useState } from "react";
import {
  Menu, X, ChevronLeft, ChevronRight, ChevronDown,
  Package, Tags, BadgeCheck, Box, Stethoscope,
  HeartPulse, Map, Building2, Warehouse, Users,
  LogOut, UserPlus, FileText, Shield
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import "../../styles/layout/Sidebar.css";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  const navigate = useNavigate();
  const { logout } = useAuth();

  // -------------------- MENU ITEMS --------------------
  const menuItems = [
    { 
      name: "Gestión Productos", 
      key: "products-group", 
      icon: <Package size={22} />,
      children: [
        { name: "Productos", key: "products", icon: <Package size={18} /> },
        { name: "Categorías", key: "categories", icon: <Tags size={18} /> },
        { name: "Marcas", key: "brands", icon: <BadgeCheck size={18} /> },
        // { name: "Lotes", key: "lots", icon: <Box size={18} /> },
      ]
    },

    { 
      name: "Gestión Médica", 
      key: "medicos-group", 
      icon: <Stethoscope size={22} />,
      children: [
        { name: "Personal Médico", key: "doctors", icon: <UserPlus size={18} /> },
        { name: "Tipos de Médico", key: "types-doctors", icon: <Tags size={18} /> }
      ]
    },

    { 
      name: "Gestión Clientes", 
      key: "pacientes-group", 
      icon: <HeartPulse size={22} />,
      children: [
        { name: "Pacientes", key: "patients", icon: <Users size={18} /> },
        { name: "Seguros", key: "insurances", icon: <Shield size={18} /> }
        // { name: "Historias", key: "stories", icon: <FileText size={18} /> }
      ]
    },

    // 🔹 NUEVO GRUPO
    { 
      name: "Gestión Operativa", 
      key: "operativa-group", 
      icon: <Map size={22} />,
      children: [
        { name: "Zonas", key: "zones", icon: <Map size={18} /> },
        { name: "Oficinas", key: "offices", icon: <Building2 size={18} /> },
        { name: "Depósitos", key: "deposits", icon: <Warehouse size={18} /> },
        { name: "Usuarios", key: "users", icon: <Users size={18} /> },
      ]
    },
  ];

  // -------------------- NAVIGATION --------------------
  const handleNavigation = (key) => {
    setActiveComponent(key);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // -------------------- SUBMENU --------------------
  const toggleSubmenu = (key) => {
    if (isCollapsed && !isOpen) {
      setIsCollapsed(false);
      setTimeout(() => {
        setExpandedMenus(prev => ({ ...prev, [key]: true }));
      }, 100);
    } else {
      setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const showText = isOpen || !isCollapsed;

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
          {showText && (
            <div className="logo-container">
              <span style={{fontWeight: 'bold', color: '#2563eb'}}>Panel de Operaciones</span>
            </div>
          )}

          <button className="collapse-btn" onClick={() => setIsCollapsed(prev => !prev)}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button className="close-btn-mobile" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(item => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus[item.key];

              return (
                <li key={item.key} className={`nav-item ${hasChildren ? "has-submenu" : ""}`}>
                  <button
                    className={`nav-link ${activeComponent === item.key ? "active" : ""} ${hasChildren && isExpanded ? "group-open" : ""}`}
                    onClick={() => hasChildren ? toggleSubmenu(item.key) : handleNavigation(item.key)}
                    title={isCollapsed && !isOpen ? item.name : ""}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {showText && (
                      <>
                        <span className="nav-text">{item.name}</span>
                        {hasChildren && <span className={`chevron-icon ${isExpanded ? "rotate" : ""}`}><ChevronDown size={16} /></span>}
                      </>
                    )}
                  </button>

                  {hasChildren && showText && (
                    <div className={`submenu-container ${isExpanded ? "expanded" : ""}`}>
                      <ul className="submenu-list">
                        {item.children.map(child => (
                          <li key={child.key}>
                            <button
                              className={`submenu-link ${activeComponent === child.key ? "active" : ""}`}
                              onClick={() => handleNavigation(child.key)}
                            >
                              {child.icon && <span className="sub-icon">{child.icon}</span>}
                              <span>{child.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={22} />
            {showText && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
