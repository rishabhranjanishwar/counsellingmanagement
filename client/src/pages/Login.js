"use client"
import { LogIn, Shield, Heart, Users } from "lucide-react"

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay">
          <div className="login-content">
            <div className="login-header">
              <img src="https://srmap.edu.in/file/2019/12/White.png" alt="SRM AP Logo" className="login-logo" />
              <h1 className="login-title">SRMAP Wellness Center</h1>
              <p className="login-subtitle">Counselling Portal</p>
            </div>

            <div className="login-features">
              <div className="feature-item">
                <Heart className="feature-icon" />
                <span>Mental Health Support</span>
              </div>
              <div className="feature-item">
                <Users className="feature-icon" />
                <span>Professional Counsellors</span>
              </div>
              <div className="feature-item">
                <Shield className="feature-icon" />
                <span>Confidential & Secure</span>
              </div>
            </div>

            <div className="login-form">
              <button onClick={handleGoogleLogin} className="google-login-btn">
                <LogIn size={20} />
                Sign in with SRMAP Google Account
              </button>

              <p className="login-note">Only @srmap.edu.in accounts are allowed</p>
            </div>

            <div className="login-footer">
              <p>&copy; 2024 SRM University-AP. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-background {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-yellow));
          position: relative;
        }

        .login-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-content {
          background: var(--white);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .login-header {
          margin-bottom: 40px;
        }

        .login-logo {
          height: 80px;
          margin-bottom: 20px;
        }

        .login-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--gray-800);
          margin-bottom: 10px;
        }

        .login-subtitle {
          font-size: 1.2rem;
          color: var(--gray-600);
          margin: 0;
        }

        .login-features {
          display: flex;
          justify-content: space-around;
          margin-bottom: 40px;
          padding: 20px 0;
          border-top: 1px solid var(--gray-200);
          border-bottom: 1px solid var(--gray-200);
        }

        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--gray-600);
          font-size: 14px;
        }

        .feature-icon {
          color: var(--primary-green);
        }

        .google-login-btn {
          width: 100%;
          padding: 16px 24px;
          background: var(--white);
          border: 2px solid var(--gray-300);
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .google-login-btn:hover {
          border-color: var(--primary-green);
          background: var(--gray-50);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .login-note {
          font-size: 14px;
          color: var(--gray-500);
          margin: 0;
        }

        .login-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--gray-200);
          font-size: 12px;
          color: var(--gray-500);
        }

        @media (max-width: 768px) {
          .login-content {
            padding: 30px 20px;
            margin: 20px;
          }

          .login-title {
            font-size: 2rem;
          }

          .login-features {
            flex-direction: column;
            gap: 20px;
          }

          .feature-item {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
