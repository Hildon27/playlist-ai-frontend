import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UpdateUserRequest } from '../../types/auth';
import './styles.css';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    privacity: 'private',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        privacity: user.privacity.toLowerCase() as 'public' | 'private',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUser(formData);
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erro ao atualizar perfil');
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
        privacity: user.privacity.toLowerCase() as 'public' | 'private',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p style={{ color: '#fff', textAlign: 'center' }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <Link to="/" className="back-link">
          ← Voltar
        </Link>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {getInitials()}
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nome</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing || loading}
                placeholder="Seu nome"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Sobrenome</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing || loading}
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing || loading}
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="privacity">Privacidade do Perfil</label>
            <select
              id="privacity"
              name="privacity"
              value={formData.privacity}
              onChange={handleChange}
              disabled={!isEditing || loading}
            >
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <div className="profile-info">
            <div className="profile-info-item">
              <span>Membro desde</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="profile-info-item">
              <span>Última atualização</span>
              <span>{formatDate(user.updatedAt)}</span>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </>
            ) : (
              <button type="submit" className="btn-save">
                Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
