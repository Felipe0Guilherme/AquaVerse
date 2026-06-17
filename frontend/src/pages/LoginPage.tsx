// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fish, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');  // vai para o aquário
    } catch {
      setError('E-mail ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #061824 0%, #0a2a4a 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <Fish className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Aquário Social</h1>
          <p className="text-slate-400 text-sm mt-1">Entre e nade com a comunidade</p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(15,30,50,0.8)', border: '1px solid rgba(100,180,255,0.15)' }}>
          <h2 className="text-lg font-semibold text-white mb-6">Entrar na conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(100,180,255,0.2)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(100,180,255,0.2)' }}
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3"
                style={{ background: 'rgba(220,50,50,0.15)', border: '1px solid rgba(220,50,50,0.3)' }}>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 font-semibold rounded-lg transition flex items-center justify-center gap-2"
              style={{ background: isLoading ? 'rgba(34,211,238,0.5)' : '#22d3ee', color: '#0a1628' }}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Entrando...' : 'Entrar no aquário'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
              Criar conta e virar peixe
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm transition">
            ← Ver o aquário
          </Link>
        </p>
      </div>
    </div>
  );
}
