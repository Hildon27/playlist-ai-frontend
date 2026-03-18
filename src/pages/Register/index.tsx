import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Privacity } from '../../types/auth';
import { AuthLayout, FormGroup } from '../../components';
import '../../styles/auth.css';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacity, setPrivacity] = useState<Privacity>('public');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        privacity,
      });
      navigate('/login', {
        state: {
          message: 'Conta criada com sucesso! Faça login para continuar.',
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Playlist AI"
      subtitle="Crie sua conta"
      footer={
        <p>
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <FormGroup label="Nome" htmlFor="firstName">
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="João"
            required
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup label="Sobrenome" htmlFor="lastName">
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Silva"
            required
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup label="Senha" htmlFor="password">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup label="Confirmar Senha" htmlFor="confirmPassword">
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua senha"
            required
            disabled={isLoading}
          />
        </FormGroup>

        <FormGroup label="Privacidade do Perfil" htmlFor="privacity">
          <select
            id="privacity"
            value={privacity}
            onChange={(e) => setPrivacity(e.target.value as Privacity)}
            disabled={isLoading}
          >
            <option value="public">Público</option>
            <option value="private">Privado</option>
          </select>
        </FormGroup>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
