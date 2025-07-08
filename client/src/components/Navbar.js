"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Calendar, FileText, BarChart3, Settings, LogOut, Menu, X, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard", roles: ["client", "counsellor", "admin"] },
    { path: "/appointments", icon: Calendar, label: "Appointments", roles: ["client", "counsellor", "admin"] },
    { path: "/sessions", icon: FileText, label: "Sessions", roles: ["counsellor", "admin"] },
    { path: "/reports", icon: BarChart3, label: "Reports", roles: ["counsellor", "admin"] },
    { path: "/admin", icon: Settings, label: "Admin Panel", roles: ["admin"] },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role))

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="https://srmap.edu.in/file/2019/12/Logo-2.png" alt="SRM AP Logo" className="navbar-logo" />
          <div className="navbar-title">
            <h3>SRMAP Wellness</h3>
            <span>Counselling Portal</span>
          </div>
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${isOpen ? "navbar-menu-open" : ""}`}>
          <div className="navbar-nav">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`navbar-link ${isActive ? "navbar-link-active" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="navbar-user">
            <div className="user-info">
              <div className="user-avatar">
                {user?.avatar ? <img src={user.avatar || "/placeholder.svg"} alt={user.name} /> : <User size={20} />}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 250px;
          height: 100vh;
          background: var(--white);
          border-right: 1px solid var(--gray-200);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }

        .navbar-brand {
          padding: 20px;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .navbar-logo {
          height: 40px;
          width: auto;
        }

        .navbar-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-800);
        }

        .navbar-title span {
          font-size: 12px;
          color: var(--gray-500);
        }

        .navbar-toggle {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          background: var(--primary-green);
          color: var(--white);
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
        }

        .navbar-menu {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .navbar-nav {
          padding: 20px 0;
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: var(--gray-600);
          text-decoration: none;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .navbar-link:hover {
          background: var(--gray-100);
          color: var(--primary-green);
        }

        .navbar-link-active {
          background: rgba(139, 195, 74, 0.1);
          color: var(--primary-green);
          border-left-color: var(--primary-green);
          font-weight: 500;
        }

        .navbar-user {
          padding: 20px;
          border-top: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-800);
        }

        .user-role {
          font-size: 12px;
          color: var(--gray-500);
          text-transform: capitalize;
        }

        .logout-btn {
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: var(--gray-100);
          color: var(--danger);
        }

        @media (max-width: 768px) {
          .navbar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .navbar-menu-open {
            transform: translateX(0);
          }

          .navbar-toggle {
            display: block;
          }

          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  )
}

export default Navbar
