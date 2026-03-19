import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { UpdateUserRequest } from "../../types/auth";
import { FormGroup, BackLink } from "../../components";
import { formatDateLong } from "../../utils/date";
import "./styles.css";
import "./styles.css";
import { FollowSocialSection } from "../../components/Follow";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: "",
    lastName: "",
    email: "",
    privacity: "private",
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      privacity: user.privacity.toLowerCase() as "public" | "private",
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return setIsEditing(true);

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUser(formData);
      setSuccess("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        privacity: user.privacity.toLowerCase() as "public" | "private",
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  if (!user)
    return <p style={{ color: "#fff", textAlign: "center" }}>Carregando...</p>;

  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <BackLink to="/" />
      </div>

      {/* FORM */}
      <div className="profile-card">
        <div className="profile-avatar">{getInitials()}</div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <FormGroup label="Nome" htmlFor="firstName">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing || loading}
              />
            </FormGroup>

            <FormGroup label="Sobrenome" htmlFor="lastName">
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing || loading}
              />
            </FormGroup>
          </div>

          <FormGroup label="Email" htmlFor="email">
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing || loading}
            />
          </FormGroup>

          <FormGroup label="Privacidade do Perfil" htmlFor="privacity">
            <select
              name="privacity"
              value={formData.privacity}
              onChange={handleChange}
              disabled={!isEditing || loading}
            >
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </FormGroup>

          <div className="profile-info">
            <div className="profile-info-item">
              <span>Membro desde</span>
              <span>{formatDateLong(user.createdAt)}</span>
            </div>
            <div className="profile-info-item">
              <span>Última atualização</span>
              <span>{formatDateLong(user.updatedAt)}</span>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button type="button" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}>
                  Salvar Alterações
                </button>
              </>
            ) : (
              <button type="submit">Editar Perfil</button>
            )}
          </div>
        </form>
      </div>

      <FollowSocialSection />
    </div>
  );
}
