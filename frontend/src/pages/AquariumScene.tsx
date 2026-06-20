// src/pages/AquariumScene.tsx
// Página principal — aquário social com peixes reais da API
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';

interface AquaUser {
  username: string;
  full_name: string | null;
  created_at: string;
}

// ── Definições dos tipos de criatura ───────────────────────────
type CreatureKind = 'fish' | 'crab' | 'octopus';
type DrawFn = (size: number, flipped: boolean, phase: number) => string;

const FISH: DrawFn[] = [
  // 0 — Clownfish (laranja)
  (s, f) => `<svg width="${s*2.2}" height="${s}" viewBox="0 0 44 20" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="22" cy="10" rx="16" ry="8" fill="#e8620a"/>
    <rect x="14" y="3" width="3" height="14" fill="white" opacity="0.9"/>
    <rect x="24" y="4" width="2.5" height="12" fill="white" opacity="0.9"/>
    <ellipse cx="10" cy="10" rx="5" ry="6" fill="#d45800"/>
    <circle cx="7" cy="9" r="1.5" fill="white"/><circle cx="7.4" cy="9" r="0.7" fill="#111"/>
    <path d="M38 10 L44 5 L44 15 Z" fill="#e8620a"/>
  </svg>`,
  // 1 — Blue Tang (azul)
  (s, f) => `<svg width="${s*2.2}" height="${s}" viewBox="0 0 44 20" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="22" cy="10" rx="15" ry="9" fill="#1a6bb5"/>
    <path d="M15 6 Q20 10 15 14" stroke="#ffd700" stroke-width="2" fill="none"/>
    <ellipse cx="10" cy="10" rx="4.5" ry="6.5" fill="#1560a0"/>
    <circle cx="7" cy="9" r="1.5" fill="white"/><circle cx="7.4" cy="9" r="0.7" fill="#111"/>
    <path d="M38 10 L44 4 L43 10 L44 16 Z" fill="#ffd700"/>
  </svg>`,
  // 2 — Angelfish (amarelo)
  (s, f) => `<svg width="${s*1.8}" height="${s*1.4}" viewBox="0 0 36 28" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="18" cy="16" rx="10" ry="10" fill="#f5c842"/>
    <path d="M18 6 L12 0 L18 8 L24 0 Z" fill="#f5c842"/>
    <path d="M18 26 L12 34 L18 28 L24 34 Z" fill="#f5c842"/>
    <rect x="13" y="7" width="2" height="18" fill="#333" opacity="0.4"/>
    <rect x="18" y="7" width="2" height="18" fill="#333" opacity="0.4"/>
    <ellipse cx="10" cy="14" rx="4" ry="5" fill="#e6b830"/>
    <circle cx="7.5" cy="13" r="1.5" fill="white"/><circle cx="7.9" cy="13" r="0.7" fill="#111"/>
    <path d="M29 16 L36 11 L36 21 Z" fill="#f5c842"/>
  </svg>`,
  // 3 — Betta (roxo)
  (s, f) => `<svg width="${s*2.5}" height="${s*1.2}" viewBox="0 0 50 24" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="20" cy="12" rx="14" ry="7" fill="#8b1a6b"/>
    <path d="M8 6 Q4 12 8 18 Q6 18 4 22 Q6 16 8 18" fill="#6d0d54" opacity="0.8"/>
    <path d="M34 8 Q44 2 50 6 Q44 12 50 18 Q44 14 34 16 Z" fill="#a020c0" opacity="0.7"/>
    <ellipse cx="9" cy="12" rx="4" ry="5.5" fill="#7a1560"/>
    <circle cx="6" cy="11" r="1.5" fill="white"/><circle cx="6.4" cy="11" r="0.7" fill="#111"/>
  </svg>`,
  // 4 — Peixe verde
  (s, f) => `<svg width="${s*2.2}" height="${s}" viewBox="0 0 44 20" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="22" cy="10" rx="16" ry="7" fill="#1a8c6a"/>
    <ellipse cx="10" cy="10" rx="4.5" ry="5.5" fill="#158055"/>
    <circle cx="7" cy="9" r="1.5" fill="white"/><circle cx="7.4" cy="9" r="0.7" fill="#111"/>
    <path d="M38 10 L44 5 L44 15 Z" fill="#1a8c6a"/>
    <path d="M22 4 L24 16" stroke="#0a5a40" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M28 4 L30 16" stroke="#0a5a40" stroke-width="1" fill="none" opacity="0.5"/>
  </svg>`,
  // 5 — Baiacu (rosa)
  (s, f) => `<svg width="${s*1.5}" height="${s}" viewBox="0 0 30 20" style="transform:scaleX(${f?-1:1})">
    <circle cx="13" cy="10" r="9" fill="#e87070"/>
    <circle cx="8" cy="8" r="2" fill="white"/><circle cx="8.5" cy="8" r="1" fill="#111"/>
    <path d="M22 10 L30 6 L30 14 Z" fill="#e87070"/>
    <circle cx="13" cy="13" r="1" fill="#c05050" opacity="0.5"/>
    <circle cx="17" cy="11" r="0.8" fill="#c05050" opacity="0.4"/>
  </svg>`,
  // 6 — Peixe prata/cinza
  (s, f) => `<svg width="${s*2}" height="${s}" viewBox="0 0 40 20" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="20" cy="10" rx="14" ry="7" fill="#8ab4c8"/>
    <ellipse cx="20" cy="10" rx="14" ry="7" fill="none" stroke="#6a94a8" stroke-width="0.5"/>
    <path d="M18 4 Q22 10 18 16" stroke="#6a94a8" stroke-width="1" fill="none"/>
    <ellipse cx="9" cy="10" rx="4" ry="5.5" fill="#7aa4b8"/>
    <circle cx="6.5" cy="9" r="1.5" fill="white"/><circle cx="6.9" cy="9" r="0.7" fill="#111"/>
    <path d="M34 10 L40 5 L40 15 Z" fill="#8ab4c8"/>
  </svg>`,
  // 7 — Peixe dourado
  (s, f) => `<svg width="${s*2.2}" height="${s}" viewBox="0 0 44 20" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="22" cy="10" rx="16" ry="7.5" fill="#d4a017"/>
    <ellipse cx="22" cy="10" rx="16" ry="7.5" fill="none" stroke="#a07800" stroke-width="0.5"/>
    <ellipse cx="10" cy="10" rx="5" ry="6" fill="#c49010"/>
    <circle cx="7" cy="9" r="1.5" fill="white"/><circle cx="7.4" cy="9" r="0.7" fill="#111"/>
    <path d="M38 10 L44 5 L44 15 Z" fill="#d4a017"/>
    <path d="M20 3 Q22 10 20 17" stroke="#a07800" stroke-width="1" fill="none" opacity="0.6"/>
  </svg>`,
  // 8 — Peixe-borboleta (preto e branco)
  (s, f) => `<svg width="${s*2}" height="${s*1.3}" viewBox="0 0 40 26" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="20" cy="13" rx="15" ry="9" fill="#1a1a1a"/>
    <rect x="10" y="4" width="3" height="18" fill="white"/>
    <rect x="20" y="4" width="3" height="18" fill="white"/>
    <ellipse cx="9" cy="13" rx="4.5" ry="5.5" fill="#000"/>
    <circle cx="6.5" cy="12" r="1.5" fill="white"/><circle cx="6.9" cy="12" r="0.7" fill="#111"/>
    <path d="M34 13 L40 7 L40 19 Z" fill="#1a1a1a"/>
  </svg>`,
  // 9 — Néon (corpo fino, faixa azul neon + vermelha)
  (s, f) => `<svg width="${s*2.4}" height="${s*0.8}" viewBox="0 0 48 16" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="24" cy="8" rx="18" ry="5" fill="#0a3d62"/>
    <rect x="6" y="7" width="36" height="2" fill="#00e5ff"/>
    <rect x="6" y="9.5" width="36" height="1.5" fill="#e02424"/>
    <ellipse cx="9" cy="8" rx="3.5" ry="4" fill="#082c47"/>
    <circle cx="6.5" cy="7.3" r="1.2" fill="white"/><circle cx="6.8" cy="7.3" r="0.6" fill="#111"/>
    <path d="M40 8 L48 4 L48 12 Z" fill="#0a3d62"/>
  </svg>`,
  // 10 — Imperador (listras azul/amarelo)
  (s, f) => `<svg width="${s*1.9}" height="${s*1.2}" viewBox="0 0 38 24" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="19" cy="12" rx="12" ry="9" fill="#1a3a8c"/>
    <path d="M9 4 Q19 8 29 4" stroke="#f5c842" stroke-width="2" fill="none"/>
    <path d="M8 10 Q19 14 30 10" stroke="#f5c842" stroke-width="2" fill="none"/>
    <path d="M9 17 Q19 20 29 17" stroke="#f5c842" stroke-width="2" fill="none"/>
    <ellipse cx="9" cy="12" rx="4" ry="5.5" fill="#142e70"/>
    <circle cx="6.5" cy="11" r="1.5" fill="white"/><circle cx="6.9" cy="11" r="0.7" fill="#111"/>
    <path d="M30 12 L38 6 L37 12 L38 18 Z" fill="#f5c842"/>
  </svg>`,
  // 11 — Peixe-leão (espinhos longos, listras vermelho/branco)
  (s, f) => `<svg width="${s*2.3}" height="${s*1.6}" viewBox="0 0 46 32" style="transform:scaleX(${f?-1:1})">
    <path d="M14 8 L12 0 M18 7 L17 0 M22 7 L23 0 M26 8 L28 0" stroke="#c81e3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="22" cy="16" rx="14" ry="8" fill="#e8e0d8"/>
    <rect x="13" y="9" width="2.5" height="14" fill="#c81e3a"/>
    <rect x="20" y="9" width="2.5" height="14" fill="#c81e3a"/>
    <rect x="27" y="9" width="2.5" height="14" fill="#c81e3a"/>
    <path d="M8 20 L4 28 M11 22 L8 30 M14 23 L12 31" stroke="#c81e3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="10" cy="16" rx="4.5" ry="5.5" fill="#d8c8b8"/>
    <circle cx="7" cy="15" r="1.5" fill="white"/><circle cx="7.4" cy="15" r="0.7" fill="#111"/>
    <path d="M36 16 L46 9 L46 23 Z" fill="#e8e0d8"/>
  </svg>`,
];

// ── Caranguejo — anda de lado na areia, corpo sempre de frente p/ câmera (não precisa flip) ──
const drawCrab: DrawFn = (s, _flipped, phase) => {
  const legs = [0, 1, 2].map(i => {
    const baseX = 9 - i * 5;
    const swing = Math.sin(phase + i * 1.3) * 3;
    return `
      <path d="M${baseX} 11 L${baseX - 4} ${22 + swing}" stroke="#b5421f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M${40 - baseX} 11 L${40 - baseX + 4} ${22 - swing}" stroke="#b5421f" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }).join('');
  return `<svg width="${s * 1.55}" height="${s}" viewBox="0 0 40 26">
    ${legs}
    <ellipse cx="20" cy="9" rx="13" ry="7" fill="#d65a2e"/>
    <ellipse cx="20" cy="9" rx="13" ry="7" fill="none" stroke="#a8401c" stroke-width="0.6"/>
    <path d="M7 6 Q2 2 5 0 Q10 3 8 7 Z" fill="#d65a2e"/>
    <path d="M33 6 Q38 2 35 0 Q30 3 32 7 Z" fill="#d65a2e"/>
    <line x1="13" y1="2" x2="12" y2="0" stroke="#b5421f" stroke-width="1.4"/>
    <circle cx="12" cy="0" r="1.4" fill="white"/><circle cx="12" cy="0" r="0.7" fill="#111"/>
    <line x1="27" y1="2" x2="28" y2="0" stroke="#b5421f" stroke-width="1.4"/>
    <circle cx="28" cy="0" r="1.4" fill="white"/><circle cx="28" cy="0" r="0.7" fill="#111"/>
  </svg>`;
};

// ── Polvo — manto bojudo + tentáculos grossos afunilados ondulando; corpo simétrico, não precisa flip ──
const drawOctopus: DrawFn = (s, _flipped, phase) => {
  const tentacles = Array.from({ length: 8 }, (_, i) => {
    const baseX = 5 + i * 4.3;
    const wave = Math.sin(phase + i * 0.9) * 6;
    const wave2 = Math.sin(phase * 0.8 + i * 1.3) * 4;
    const len = 26 + Math.sin(phase * 0.3 + i) * 3;
    const w = 5;
    return `<path d="M${baseX - w / 2} 20
                     Q${(baseX - w / 2 + wave).toFixed(1)} ${(20 + len * 0.55).toFixed(1)} ${(baseX + wave2 * 0.3).toFixed(1)} ${(20 + len).toFixed(1)}
                     Q${(baseX + w / 2 + wave).toFixed(1)} ${(20 + len * 0.55).toFixed(1)} ${baseX + w / 2} 20 Z"
              fill="#9b3fb5" opacity="0.92"/>`;
  }).join('');
  const pulse = 1 + Math.sin(phase * 0.5) * 0.035;
  return `<svg width="${s * 1.5}" height="${s * 1.7}" viewBox="0 0 40 50" style="transform:scale(${pulse.toFixed(3)})">
    ${tentacles}
    <path d="M5 18 Q3 2 20 0 Q37 2 35 18 Q37 24 30 26 Q20 30 10 26 Q3 24 5 18 Z" fill="#b54fd1"/>
    <path d="M5 18 Q3 2 20 0 Q37 2 35 18 Q37 24 30 26 Q20 30 10 26 Q3 24 5 18 Z" fill="none" stroke="#8a35a8" stroke-width="0.6"/>
    <circle cx="14" cy="12" r="3.4" fill="white"/><circle cx="14.8" cy="12" r="1.7" fill="#111"/>
    <circle cx="26" cy="12" r="3.4" fill="white"/><circle cx="26.8" cy="12" r="1.7" fill="#111"/>
  </svg>`;
};

interface CreatureDef { kind: CreatureKind; draw: DrawFn; }

const CREATURES: CreatureDef[] = [
  ...FISH.map(draw => ({ kind: 'fish' as const, draw })),
  { kind: 'crab', draw: drawCrab },
  { kind: 'octopus', draw: drawOctopus },
];

function getCreatureType(username: string): number {
  let hash = 0;
  for (const c of username) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hash) % CREATURES.length;
}

function getFishSize(username: string): number {
  return 18 + (Math.abs(username.length * 13) % 12);
}

interface FishState {
  el: HTMLDivElement;
  tipEl: HTMLDivElement;
  username: string;
  typeIdx: number;
  kind: CreatureKind;
  size: number;
  x: number; y: number;
  vx: number; vy: number;
  flipped: boolean;
  wobble: number;
  wobbleSpeed: number;
  turnTimer: number;
  turnCounter: number;
}

export default function AquariumScene() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const fishList = useRef<FishState[]>([]);
  const animRef = useRef<number>(0);
  const [users, setUsers] = useState<AquaUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca usuários da API — repete a cada 30s para pegar novos registros.
  // Só atualiza o estado se a lista de usernames realmente mudou, evitando
  // disparar o efeito de spawn (e suas race conditions) sem necessidade.
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: AquaUser[] }>('/users/aquarium');
      const fresh = data.data ?? [];

      setUsers(prev => {
        const prevKey = prev.map(u => u.username).sort().join(',');
        const freshKey = fresh.map(u => u.username).sort().join(',');
        return prevKey === freshKey ? prev : fresh;
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30_000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Spawna peixes quando a lista de usuários mudar
  useEffect(() => {
    if (!wrapRef.current || loading) return;
    const wrap = wrapRef.current;

    // Remove peixes que não existem mais
    const currentUsernames = new Set(users.map(u => u.username));
    fishList.current = fishList.current.filter(f => {
      if (!currentUsernames.has(f.username)) {
        f.el.remove();
        f.tipEl.remove();
        return false;
      }
      return true;
    });

    // Adiciona peixes novos — reservamos o username NO MOMENTO em que o
    // spawn é agendado (antes do setTimeout), não só quando ele executa.
    // Isso evita que o efeito, ao rodar de novo (ex: polling de 30s) antes
    // do timeout anterior disparar, agende um segundo spawn pro mesmo user.
    const existingUsernames = new Set(fishList.current.map(f => f.username));
    const newUsers = users.filter(u => !existingUsernames.has(u.username));

    newUsers.forEach((u, idx) => {
      existingUsernames.add(u.username); // reserva o slot imediatamente

      setTimeout(() => {
        if (!wrapRef.current) return;

        // Guarda extra: se por qualquer motivo um peixe com esse username
        // já existe no array (ex: dois timeouts concorrentes de execuções
        // diferentes do efeito), não cria duplicado.
        if (fishList.current.some(f => f.username === u.username)) return;

        const W = wrap.offsetWidth;
        const H = wrap.offsetHeight;

        const typeIdx = getCreatureType(u.username);
        const kind = CREATURES[typeIdx].kind;
        const size = getFishSize(u.username);
        const flipped = Math.random() > 0.5;

        // Elemento do peixe
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;cursor:pointer;z-index:10;user-select:none;';
        el.innerHTML = CREATURES[typeIdx].draw(size, flipped, 0);
        wrap.appendChild(el);

        // Tooltip fixo no body
        const tipEl = document.createElement('div');
        tipEl.style.cssText = [
          'position:fixed',
          'background:rgba(6,24,40,0.95)',
          'color:#e0f4ff',
          'font-family:monospace',
          'font-size:13px',
          'padding:6px 12px',
          'border-radius:8px',
          'border:1px solid rgba(34,211,238,0.3)',
          'pointer-events:none',
          'z-index:99999',
          'white-space:nowrap',
          'opacity:0',
          'transition:opacity 0.12s',
          'box-shadow:0 4px 20px rgba(0,0,0,0.5)',
        ].join(';');

        // Destaca o peixe do usuário logado
        const isMe = user?.username === u.username;
        tipEl.innerHTML = isMe
          ? `<span style="color:#22d3ee">@${u.username}</span> <span style="color:#fbbf24;font-size:11px">← você</span>`
          : `<span style="color:#22d3ee">@${u.username}</span>${u.full_name ? `<span style="color:#94a3b8;font-size:11px"> · ${u.full_name}</span>` : ''}`;

        document.body.appendChild(tipEl);

        el.addEventListener('mouseenter', () => {
          tipEl.style.opacity = '1';
          el.style.filter = 'brightness(1.5) drop-shadow(0 0 6px rgba(34,211,238,0.6))';
        });
        el.addEventListener('mousemove', (e) => {
          tipEl.style.left = (e.clientX + 16) + 'px';
          tipEl.style.top = (e.clientY - 36) + 'px';
        });
        el.addEventListener('mouseleave', () => {
          tipEl.style.opacity = '0';
          el.style.filter = isMe ? 'drop-shadow(0 0 4px rgba(34,211,238,0.4))' : '';
        });

        // Peixe do usuário logado tem brilho permanente
        if (isMe) {
          el.style.filter = 'drop-shadow(0 0 4px rgba(34,211,238,0.4))';
        }

        const speed = 0.5 + Math.random() * 1.0;

        let x: number, y: number, vx: number, vy: number;
        if (kind === 'crab') {
          x = 40 + Math.random() * (W - 160);
          y = H - 72 - size * 0.7; // pousa na areia, ajustado de novo no loop
          vx = (Math.random() > 0.5 ? 1 : -1) * speed * 0.6;
          vy = 0;
        } else if (kind === 'octopus') {
          x = 40 + Math.random() * (W - 160);
          y = 50 + Math.random() * (H - 220);
          vx = (flipped ? 1 : -1) * speed * 0.4;
          vy = (Math.random() - 0.5) * 0.3;
        } else {
          x = 40 + Math.random() * (W - 160);
          y = 60 + Math.random() * (H - 200);
          vx = speed * (flipped ? 1 : -1); // cabeça do SVG é à esquerda → sem flip nada p/ esquerda
          vy = (Math.random() - 0.5) * 0.5;
        }

        const fish: FishState = {
          el, tipEl,
          username: u.username,
          typeIdx, kind, size,
          x, y, vx, vy,
          flipped,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: kind === 'octopus'
            ? 0.02 + Math.random() * 0.015
            : kind === 'crab'
              ? 0.05 + Math.random() * 0.02
              : 0.035 + Math.random() * 0.03,
          turnTimer: 100 + Math.floor(Math.random() * 150),
          turnCounter: Math.floor(Math.random() * 100),
        };

        fish.el.style.left = fish.x + 'px';
        fish.el.style.top = fish.y + 'px';
        fishList.current.push(fish);

      }, idx * 200);
    });

    return () => {};
  }, [users, loading, user]);

  // Animação
  useEffect(() => {
    const loop = () => {
      if (!wrapRef.current) { animRef.current = requestAnimationFrame(loop); return; }
      const W = wrapRef.current.offsetWidth;
      const H = wrapRef.current.offsetHeight;
      const floorY = H - 72;
      const ceilY = 36;
      const sandTopY = H - 60; // topo do bloco de areia visual (ver style do div "Areia")

      for (const f of fishList.current) {
        f.wobble += f.wobbleSpeed;
        f.turnCounter++;

        const fw = f.el.offsetWidth  || f.size * 2.2;
        const fh = f.el.offsetHeight || f.size;

        if (f.kind === 'crab') {
          // Anda de lado na areia, com pausas — corpo fica de frente p/ câmera, sem flip
          if (f.turnCounter >= f.turnTimer) {
            f.turnCounter = 0;
            f.turnTimer = 70 + Math.floor(Math.random() * 130);
            if (f.vx === 0) {
              const dir = Math.random() > 0.5 ? 1 : -1;
              f.vx = dir * (0.4 + Math.random() * 0.6);
            } else if (Math.random() < 0.3) {
              f.vx = 0; // pausa
            } else if (Math.random() < 0.4) {
              f.vx = -f.vx;
            }
          }
          f.x += f.vx;
          // a arte do caranguejo deixa as pernas na altura ~0.85 do viewBox (não na borda exata
          // do svg) — por isso alinhamos pela ponta da perna, não pelo fundo da bounding box,
          // senão ele fica com um respiro vazio embaixo e parece flutuar sobre a areia.
          f.y = sandTopY - fh * 0.846 + 4;

          if (f.x < 8) { f.x = 8; f.vx = Math.abs(f.vx); }
          if (f.x + fw > W - 8) { f.x = W - fw - 8; f.vx = -Math.abs(f.vx); }

        } else if (f.kind === 'octopus') {
          // Flutua livre na coluna d'água, pulsando — corpo simétrico, sem flip
          if (f.turnCounter >= f.turnTimer) {
            f.turnCounter = 0;
            f.turnTimer = 90 + Math.floor(Math.random() * 160);
            f.vx = Math.max(-0.6, Math.min(0.6, f.vx + (Math.random() - 0.5) * 0.3));
            f.vy = Math.max(-0.5, Math.min(0.5, f.vy + (Math.random() - 0.5) * 0.3));
          }
          f.x += f.vx;
          f.y += f.vy + Math.sin(f.wobble) * 0.3;

          if (f.x < 8) { f.x = 8; f.vx = Math.abs(f.vx); }
          if (f.x + fw > W - 8) { f.x = W - fw - 8; f.vx = -Math.abs(f.vx); }
          if (f.y < ceilY) { f.y = ceilY; f.vy = Math.abs(f.vy); }
          if (f.y + fh > floorY) { f.y = floorY - fh; f.vy = -Math.abs(f.vy); }

        } else {
          // Peixe: nado lateral com flip sincronizado à direção
          if (f.turnCounter >= f.turnTimer) {
            f.turnCounter = 0;
            f.turnTimer = 100 + Math.floor(Math.random() * 150);
            if (Math.random() < 0.25) {
              f.flipped = !f.flipped;
              f.vx = Math.abs(f.vx) * (f.flipped ? 1 : -1);
            }
            f.vy += (Math.random() - 0.5) * 0.35;
            f.vy = Math.max(-0.7, Math.min(0.7, f.vy));
          }

          f.y += f.vy + Math.sin(f.wobble) * 0.25;
          f.x += f.vx;

          if (f.x < 8) {
            f.x = 8; f.vx = Math.abs(f.vx); f.flipped = true;
          }
          if (f.x + fw > W - 8) {
            f.x = W - fw - 8; f.vx = -Math.abs(f.vx); f.flipped = false;
          }
          if (f.y < ceilY) {
            f.y = ceilY; f.vy = Math.abs(f.vy);
          }
          if (f.y + fh > floorY) {
            f.y = floorY - fh; f.vy = -Math.abs(f.vy);
          }
        }

        f.el.style.left = f.x + 'px';
        f.el.style.top  = f.y + 'px';
        f.el.innerHTML = CREATURES[f.typeIdx].draw(f.size, f.flipped, f.wobble);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Cleanup geral ao desmontar
  useEffect(() => {
    return () => {
      fishList.current.forEach(f => {
        f.el.remove();
        f.tipEl.remove();
      });
      fishList.current = [];
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #040e1a 0%, #061824 60%, #0a2030 100%)' }}
    >
      {/* Header */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-bold font-mono" style={{ color: '#22d3ee' }}>
            🐠 Aquário Social
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>
            {loading
              ? 'Enchendo o aquário...'
              : `${users.length} ${users.length === 1 ? 'peixe' : 'peixes'} nadando`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-mono" style={{ color: '#22d3ee' }}>
                @{user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-sm rounded-lg transition"
                style={{
                  border: '1px solid rgba(100,180,255,0.2)',
                  color: 'rgba(148,163,184,0.8)',
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(100,180,255,0.2)')}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm rounded-lg transition"
                style={{ border: '1px solid rgba(100,180,255,0.2)', color: 'rgba(180,210,255,0.8)' }}
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-semibold rounded-lg transition"
                style={{ background: '#22d3ee', color: '#040e1a' }}
              >
                Virar um peixe →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Aquário */}
      <div
        ref={wrapRef}
        className="relative w-full max-w-5xl overflow-hidden"
        style={{
          height: '520px',
          background: 'linear-gradient(180deg, #0a2a4a 0%, #0d3b6e 35%, #0a4f7a 65%, #0d5c8a 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(34,211,238,0.12)',
          boxShadow: '0 0 60px rgba(13,59,110,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Raios de luz */}
        {[15, 35, 55, 75, 90].map((x, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 0, left: `${x}%`,
            width: '60px',
            height: '180px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
            transform: `skewX(${-10 + i * 5}deg)`,
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        ))}

        {/* Plantas / algas */}
        {[5, 14, 25, 38, 50, 63, 74, 84, 93].map((x, i) => (
          <div key={i} style={{ position: 'absolute', bottom: '56px', left: `${x}%`, zIndex: 3 }}>
            {[0, 1, 2].slice(0, 1 + i % 3).map(j => (
              <div key={j} style={{
                position: 'absolute',
                bottom: 0,
                left: `${j * 7}px`,
                width: '5px',
                height: `${28 + ((i + j) * 11) % 35}px`,
                borderRadius: '3px 3px 0 0',
                background: i % 3 === 0 ? '#1a6b38' : i % 3 === 1 ? '#2d8c4e' : '#0f5028',
                transformOrigin: 'bottom center',
                animation: `sway ${2.5 + j * 0.4}s ease-in-out ${j * 0.3 + i * 0.1}s infinite`,
              }} />
            ))}
          </div>
        ))}

        {/* Bolhas */}
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${3 + (i % 5) * 2}px`,
            height: `${3 + (i % 5) * 2}px`,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.04)',
            left: `${4 + i * 6.5}%`,
            bottom: `${65 + (i % 4) * 35}px`,
            zIndex: 3,
            animation: `rise ${4 + i * 0.6}s linear ${i * 0.7}s infinite`,
          }} />
        ))}

        {/* Areia */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '60px',
          background: 'linear-gradient(180deg, #c8a96e 0%, #9a7035 100%)',
          borderRadius: '0 0 20px 20px',
          zIndex: 2,
        }}>
          {/* Ondulações na areia */}
          {[10, 30, 50, 70, 90].map((x, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '-8px', left: `${x}%`,
              width: '80px', height: '16px',
              background: '#c8a96e',
              borderRadius: '50%',
            }} />
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Aquário vazio */}
        {!loading && users.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '14px' }}>O aquário está vazio...</p>
            <Link to="/register" style={{ color: '#22d3ee', fontSize: '13px', marginTop: '8px' }}>
              Seja o primeiro peixe →
            </Link>
          </div>
        )}

        {/* Hint */}
        {!loading && users.length > 0 && (
          <p style={{
            position: 'absolute', bottom: '68px', right: '16px',
            fontSize: '11px', color: 'rgba(148,163,184,0.35)',
            zIndex: 5, fontFamily: 'monospace', pointerEvents: 'none',
          }}>
            passe o mouse sobre um peixe
          </p>
        )}
      </div>

      {/* Rodapé */}
      <p className="mt-4 text-xs" style={{ color: 'rgba(100,130,160,0.5)', fontFamily: 'monospace' }}>
        novo membro = novo peixe · atualiza a cada 30s
      </p>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes rise {
          0%   { transform: translateY(0) translateX(0); opacity: 0.6; }
          50%  { transform: translateY(-180px) translateX(8px); opacity: 0.25; }
          100% { transform: translateY(-380px) translateX(-4px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}