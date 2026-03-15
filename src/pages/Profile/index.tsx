import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UpdateUserRequest } from '../../types/auth';
import './styles.css';
import { FollowSocialSection } from '../../components/Follow';

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
    if (!user) return;

    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      privacity: user.privacity.toLowerCase() as 'public' | 'private',
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (!user) return <p style={{ color: '#fff', textAlign: 'center' }}>Carregando...</p>;

  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <Link to="/" className="back-link">← Voltar</Link>
      </div>

      {/* FORM */}
      <div className="profile-card">
        <div className="profile-avatar">{getInitials(user.firstName, user.lastName)}</div>
        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Nome</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} disabled={!isEditing || loading} />
            </div>
            <div className="form-group">
              <label>Sobrenome</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} disabled={!isEditing || loading} />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing || loading} />
          </div>

          <div className="form-group">
            <label>Privacidade</label>
            <select name="privacity" value={formData.privacity} onChange={handleChange} disabled={!isEditing || loading}>
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <div className="profile-info">
            <span>Membro desde: {formatDate(user.createdAt)}</span>
            <span>Última atualização: {formatDate(user.updatedAt)}</span>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button type="button" onClick={handleCancel} disabled={loading}>Cancelar</button>
                <button type="submit" disabled={loading}>Salvar Alterações</button>
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