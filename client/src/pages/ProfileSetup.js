"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { User, Phone, Building, Users } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const ProfileSetup = () => {
  const [loading, setLoading] = useState(false)
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  })

  const residenceType = watch("residenceType")

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await axios.put("/api/users/profile", data)
      updateUser(response.data.user)
      toast.success("Profile completed successfully!")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-setup">
      <div className="profile-setup-container">
        <div className="profile-setup-header">
          <img src="https://srmap.edu.in/file/2019/12/Logo-2.png" alt="SRM AP Logo" className="setup-logo" />
          <h1>Complete Your Profile</h1>
          <p>Please provide the following information to access the wellness portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
          <div className="form-section">
            <h3>
              <User size={20} /> Personal Information
            </h3>

            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("name", { required: "Name is required" })}
                    readOnly
                  />
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </div>
              </div>

              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" {...register("email")} readOnly />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Registration Number / Employee ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("registrationNumber", { required: "Registration/Employee ID is required" })}
                    placeholder="Enter your registration number or employee ID"
                  />
                  {errors.registrationNumber && <span className="error">{errors.registrationNumber.message}</span>}
                </div>
              </div>

              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-control form-select"
                    {...register("gender", { required: "Gender is required" })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <span className="error">{errors.gender.message}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <Phone size={20} /> Contact Information
            </h3>

            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    {...register("mobileNumber", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit mobile number",
                      },
                    })}
                    placeholder="Enter 10-digit mobile number"
                  />
                  {errors.mobileNumber && <span className="error">{errors.mobileNumber.message}</span>}
                </div>
              </div>

              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Residence Type *</label>
                  <select
                    className="form-control form-select"
                    {...register("residenceType", { required: "Residence type is required" })}
                  >
                    <option value="">Select Residence Type</option>
                    <option value="Hosteller">Hosteller</option>
                    <option value="Day Scholar">Day Scholar</option>
                  </select>
                  {errors.residenceType && <span className="error">{errors.residenceType.message}</span>}
                </div>
              </div>
            </div>

            {residenceType === "Day Scholar" && (
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  {...register("address", { required: "Address is required for day scholars" })}
                  placeholder="Enter your complete address"
                />
                {errors.address && <span className="error">{errors.address.message}</span>}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>
              <Building size={20} /> Academic Information
            </h3>

            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-control form-select"
                    {...register("department", { required: "Department is required" })}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Management">Management</option>
                    <option value="Liberal Arts">Liberal Arts</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.department && <span className="error">{errors.department.message}</span>}
                </div>
              </div>

              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">School</label>
                  <select className="form-control form-select" {...register("school")}>
                    <option value="">Select School</option>
                    <option value="School of Engineering">School of Engineering</option>
                    <option value="School of Management">School of Management</option>
                    <option value="School of Liberal Arts">School of Liberal Arts</option>
                    <option value="School of Sciences">School of Sciences</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <Users size={20} /> Emergency Contact
            </h3>

            <div className="row">
              <div className="col-3">
                <div className="form-group">
                  <label className="form-label">Contact Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("emergencyContact.name", { required: "Emergency contact name is required" })}
                    placeholder="Enter contact person name"
                  />
                  {errors.emergencyContact?.name && (
                    <span className="error">{errors.emergencyContact.name.message}</span>
                  )}
                </div>
              </div>

              <div className="col-3">
                <div className="form-group">
                  <label className="form-label">Relationship *</label>
                  <select
                    className="form-control form-select"
                    {...register("emergencyContact.relationship", { required: "Relationship is required" })}
                  >
                    <option value="">Select Relationship</option>
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.emergencyContact?.relationship && (
                    <span className="error">{errors.emergencyContact.relationship.message}</span>
                  )}
                </div>
              </div>

              <div className="col-3">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    {...register("emergencyContact.phone", {
                      required: "Emergency contact phone is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit phone number",
                      },
                    })}
                    placeholder="Enter 10-digit phone number"
                  />
                  {errors.emergencyContact?.phone && (
                    <span className="error">{errors.emergencyContact.phone.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .profile-setup {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-yellow));
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-setup-container {
          background: var(--white);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          width: 100%;
          overflow: hidden;
        }

        .profile-setup-header {
          background: linear-gradient(135deg, var(--primary-green), var(--primary-yellow));
          color: var(--white);
          padding: 40px;
          text-align: center;
        }

        .setup-logo {
          height: 60px;
          margin-bottom: 20px;
          filter: brightness(0) invert(1);
        }

        .profile-setup-header h1 {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .profile-setup-header p {
          opacity: 0.9;
          margin: 0;
        }

        .profile-form {
          padding: 40px;
        }

        .form-section {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid var(--gray-200);
        }

        .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .form-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--gray-700);
          margin-bottom: 20px;
          font-size: 1.2rem;
        }

        .error {
          color: var(--danger);
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .form-actions {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid var(--gray-200);
        }

        .form-actions .btn {
          min-width: 200px;
          font-size: 16px;
          padding: 14px 28px;
        }

        @media (max-width: 768px) {
          .profile-setup {
            padding: 10px;
          }

          .profile-form {
            padding: 20px;
          }

          .profile-setup-header {
            padding: 30px 20px;
          }

          .setup-logo {
            height: 50px;
          }

          .profile-setup-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ProfileSetup
