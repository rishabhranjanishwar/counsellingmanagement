"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, FileText, TrendingUp, Plus } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import axios from "axios"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [recentAppointments, setRecentAppointments] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, sessionsRes, statsRes] = await Promise.all([
        axios.get("/api/appointments?limit=5"),
        user.role !== "client" ? axios.get("/api/sessions?limit=5") : Promise.resolve({ data: [] }),
        user.role !== "client" ? axios.get("/api/reports/stats") : Promise.resolve({ data: {} }),
      ])

      setRecentAppointments(appointmentsRes.data)
      setRecentSessions(sessionsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: "badge-warning", text: "Pending" },
      accepted: { class: "badge-info", text: "Accepted" },
      completed: { class: "badge-success", text: "Completed" },
      cancelled: { class: "badge-danger", text: "Cancelled" },
    }

    const config = statusConfig[status] || { class: "badge-secondary", text: status }
    return <span className={`badge ${config.class}`}>{config.text}</span>
  }

  const getProgressBadge = (progress) => {
    const progressConfig = {
      "Not Started": { class: "badge-secondary", text: "Not Started" },
      Ongoing: { class: "badge-info", text: "Ongoing" },
      Resolved: { class: "badge-success", text: "Resolved" },
      "Follow-Up Required": { class: "badge-warning", text: "Follow-Up" },
    }

    const config = progressConfig[progress] || { class: "badge-secondary", text: progress }
    return <span className={`badge ${config.class}`}>{config.text}</span>
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what's happening with your wellness journey today.</p>
        </div>
        {user?.role === "client" && (
          <Link to="/appointments" className="btn btn-primary">
            <Plus size={20} />
            Book Appointment
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      {user?.role !== "client" && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Calendar className="icon-primary" />
            </div>
            <div className="stat-content">
              <h3>{stats.overview?.totalAppointments || 0}</h3>
              <p>Total Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FileText className="icon-success" />
            </div>
            <div className="stat-content">
              <h3>{stats.overview?.totalSessions || 0}</h3>
              <p>Sessions Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock className="icon-warning" />
            </div>
            <div className="stat-content">
              <h3>{stats.overview?.pendingAppointments || 0}</h3>
              <p>Pending Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp className="icon-info" />
            </div>
            <div className="stat-content">
              <h3>{stats.overview?.followUpRequired || 0}</h3>
              <p>Follow-ups Required</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* Recent Appointments */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Appointments</h2>
              <Link to="/appointments" className="btn btn-outline">
                View All
              </Link>
            </div>

            {recentAppointments.length > 0 ? (
              <div className="appointments-list">
                {recentAppointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="appointment-info">
                      <h4>{appointment.category}</h4>
                      <p className="appointment-meta">
                        {user?.role === "client" ? (
                          appointment.counsellor ? (
                            <>Counsellor: {appointment.counsellor.name}</>
                          ) : (
                            <>Waiting for assignment</>
                          )
                        ) : (
                          <>
                            Client: {appointment.client.name} ({appointment.client.registrationNumber})
                          </>
                        )}
                      </p>
                      <p className="appointment-date">
                        <Clock size={14} />
                        {new Date(appointment.preferredDate).toLocaleDateString()} at {appointment.preferredTime}
                      </p>
                    </div>
                    <div className="appointment-status">{getStatusBadge(appointment.status)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <p>No appointments found</p>
                {user?.role === "client" && (
                  <Link to="/appointments" className="btn btn-primary">
                    Book Your First Appointment
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sessions - Only for counsellors and admins */}
        {user?.role !== "client" && (
          <div className="dashboard-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Sessions</h2>
                <Link to="/sessions" className="btn btn-outline">
                  View All
                </Link>
              </div>

              {recentSessions.length > 0 ? (
                <div className="sessions-list">
                  {recentSessions.map((session) => (
                    <div key={session._id} className="session-item">
                      <div className="session-info">
                        <h4>{session.client.name}</h4>
                        <p className="session-meta">
                          {session.appointment.category} • {session.client.registrationNumber}
                        </p>
                        <p className="session-date">
                          <Clock size={14} />
                          {new Date(session.sessionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="session-progress">{getProgressBadge(session.progress)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>No sessions recorded yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions for Clients */}
        {user?.role === "client" && (
          <div className="dashboard-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>

              <div className="quick-actions">
                <Link to="/appointments" className="quick-action-card">
                  <Calendar size={32} />
                  <h3>Book Appointment</h3>
                  <p>Schedule a counselling session</p>
                </Link>

                <Link to="/sessions" className="quick-action-card">
                  <FileText size={32} />
                  <h3>View Sessions</h3>
                  <p>Check your session history</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          color: var(--gray-800);
          margin-bottom: 5px;
        }

        .dashboard-header p {
          color: var(--gray-600);
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--white);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--gray-200);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-primary { color: var(--primary-green); background: rgba(139, 195, 74, 0.1); }
        .icon-success { color: var(--success); background: rgba(40, 167, 69, 0.1); }
        .icon-warning { color: var(--warning); background: rgba(255, 193, 7, 0.1); }
        .icon-info { color: var(--info); background: rgba(23, 162, 184, 0.1); }

        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-800);
          margin: 0;
        }

        .stat-content p {
          color: var(--gray-600);
          margin: 0;
          font-size: 14px;
        }

        .dashboard-content {
          display: grid;
          gap: 30px;
        }

        .dashboard-section {
          width: 100%;
        }

        .appointments-list,
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .appointment-item,
        .session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .appointment-item:hover,
        .session-item:hover {
          border-color: var(--primary-green);
          box-shadow: 0 2px 8px rgba(139, 195, 74, 0.1);
        }

        .appointment-info h4,
        .session-info h4 {
          margin: 0 0 4px 0;
          color: var(--gray-800);
          font-size: 16px;
        }

        .appointment-meta,
        .session-meta {
          color: var(--gray-600);
          font-size: 14px;
          margin: 0 0 4px 0;
        }

        .appointment-date,
        .session-date {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--gray-500);
          font-size: 13px;
          margin: 0;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--gray-500);
        }

        .empty-state svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state p {
          margin-bottom: 20px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .quick-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px;
          border: 2px solid var(--gray-200);
          border-radius: 12px;
          text-decoration: none;
          color: var(--gray-700);
          transition: all 0.3s ease;
        }

        .quick-action-card:hover {
          border-color: var(--primary-green);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(139, 195, 74, 0.2);
        }

        .quick-action-card svg {
          color: var(--primary-green);
          margin-bottom: 12px;
        }

        .quick-action-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .quick-action-card p {
          margin: 0;
          font-size: 14px;
          color: var(--gray-600);
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 15px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .dashboard-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .appointment-item,
          .session-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
