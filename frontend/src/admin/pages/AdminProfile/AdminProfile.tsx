import { useEffect, useState, type SyntheticEvent } from "react";

import AdminNavbar from "../../components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  type AdminProfile as AdminProfileType,
} from "../../services/adminProfileService";

import "./AdminProfile.css";

function AdminProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState<AdminProfileType | null>(null);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================
  // LOAD PROFILE
  // =========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminProfile();

        setProfile(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error ? error.message : "Failed to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =========================================
  // UPDATE PROFILE
  // =========================================

  const handleProfileSubmit = async (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const data = await updateAdminProfile(name, email);

      // =====================================
      // UPDATE STATE
      // =====================================

      setProfile({
        id: data.admin.id,
        name: data.admin.name,
        email: data.admin.email,
        role: "Administrator",
      });

      setName(data.admin.name);
      setEmail(data.admin.email);

      // =====================================
      // UPDATE LOCAL STORAGE
      // =====================================

      const existingAdmin = localStorage.getItem("admin");

      let adminData: {
        id?: string;
        name?: string;
        email?: string;
      } = {};

      try {
        adminData = existingAdmin
          ? (JSON.parse(existingAdmin) as {
              id?: string;
              name?: string;
              email?: string;
            })
          : {};
      } catch {
        adminData = {};
      }

      localStorage.setItem(
        "admin",
        JSON.stringify({
          ...adminData,
          id: data.admin.id,
          name: data.admin.name,
          email: data.admin.email,
        }),
      );

      setSuccess("Profile updated successfully.");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================
  // CHANGE PASSWORD
  // =========================================

  const handlePasswordSubmit = async (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");

      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");

      return;
    }

    try {
      setSavingPassword(true);

      await changeAdminPassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Password changed successfully.");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to change password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-profile-page">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="admin-profile-content">
          <div className="admin-profile-loading">
            <i className="bi bi-arrow-repeat" />

            <span>Loading profile...</span>
          </div>
        </main>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="admin-profile-page">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-profile-content">
        <div className="admin-profile-main">
          {/* =================================
              HEADER
          ================================= */}

          <div className="admin-profile-header">
            <div>
              <p>ACCOUNT</p>

              <h1>My Profile</h1>

              <span>Manage your administrator account.</span>
            </div>
          </div>

          {/* =================================
              MESSAGES
          ================================= */}

          {error && (
            <div className="profile-message error">
              <i className="bi bi-exclamation-circle" />

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="profile-message success">
              <i className="bi bi-check-circle" />

              <span>{success}</span>
            </div>
          )}

          {/* =================================
              GRID
          ================================= */}

          <div className="admin-profile-grid">
            {/* =================================
                PROFILE SUMMARY
            ================================= */}

            <section className="admin-profile-card">
              <div className="profile-card-top">
                <div className="profile-large-avatar">
                  {(profile?.name || "A").charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{profile?.name || "Admin"}</strong>

                  <span>Administrator</span>
                </div>
              </div>

              <div className="profile-info-list">
                <div>
                  <span>Account email</span>

                  <strong>{profile?.email || "—"}</strong>
                </div>

                <div>
                  <span>Role</span>

                  <strong>Administrator</strong>
                </div>

                {profile?.createdAt && (
                  <div>
                    <span>Account created</span>

                    <strong>
                      {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                )}
              </div>
            </section>

            {/* =================================
                PROFILE INFORMATION
            ================================= */}

            <section className="admin-profile-card">
              <div className="profile-card-heading">
                <div className="profile-section-icon purple">
                  <i className="bi bi-person" />
                </div>

                <div>
                  <h2>Profile Information</h2>

                  <p>Update your name and email address.</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <label>
                  <span>Full Name</span>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>Email</span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <i className="bi bi-arrow-repeat" />

                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" />

                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* =================================
                CHANGE PASSWORD
            ================================= */}

            <section className="admin-profile-card password-card">
              <div className="profile-card-heading">
                <div className="profile-section-icon orange">
                  <i className="bi bi-lock" />
                </div>

                <div>
                  <h2>Change Password</h2>

                  <p>Make sure your new password is secure.</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handlePasswordSubmit}>
                <label>
                  <span>Current Password</span>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>New Password</span>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={6}
                    required
                  />
                </label>

                <label>
                  <span>Confirm New Password</span>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={6}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="profile-password-button"
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <>
                      <i className="bi bi-arrow-repeat" />

                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check" />

                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminProfile;
