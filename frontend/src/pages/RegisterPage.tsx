// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fish, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', username: '', full_name: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');  // vai direto para o aquário com seu peixe
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('already') ? 'Este e-mail já está cadastrado.' : 'Erro ao criar conta. Tente novamente.');
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
          <p className="text-slate-400 text-sm mt-1">Crie sua conta e escolha seu peixe</p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: 'rgba(15,30,50,0.8)', border: '1px solid rgba(100,180,255,0.15)' }}>
          <h2 className="text-lg font-semibold text-white mb-6">Criar conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder="seu_username" required
                  className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(100,180,255,0.2)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome</label>
                <input
                  type="text" name="full_name" value={form.full_name} onChange={handleChange}
                  placeholder="Seu Nome"
                  className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(100,180,255,0.2)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                E-mail <span className="text-red-400">*</span>
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="seu@email.com" required
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(100,180,255,0.2)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Senha <span className="text-red-400">*</span>
              </label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Mínimo 8 caracteres" required
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
              type="submit" disabled={isLoading}
              className="w-full py-2.5 px-4 font-semibold rounded-lg transition flex items-center justify-center gap-2"
              style={{ background: isLoading ? 'rgba(34,211,238,0.5)' : '#22d3ee', color: '#0a1628' }}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Criando seu peixe...' : '🐠 Entrar no aquário'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm transition">
            ← Ver o aquário primeiro
          </Link>
        </p>
      </div>
    </div>
  );
}
