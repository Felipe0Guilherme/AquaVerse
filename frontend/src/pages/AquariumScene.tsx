// src/pages/AquariumScene.tsx
// Página principal — aquário social com peixes reais da API
import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';

interface AquaUser {
  username: string;
  full_name: string | null;
  created_at: string;
}

// ── Definições dos tipos de criatura ───────────────────────────
type CreatureKind =
  // Peixes Ósseos
  | 'fish' | 'seahorse' | 'pipefish' | 'clownfrogfish' | 'trumpetfish' | 'moorishidol' | 'surgeonfish' | 'parrotfish' | 'grouper' | 'sunfish'
  // Peixes Cartilaginosos
  | 'shark' | 'hammerhead' | 'whaleshark' | 'sawfish'
  // Crustáceos
  | 'crab' | 'lobster' | 'mantisshrimp'
  // Moluscos
  | 'octopus' | 'nautilus' | 'nudibranch' | 'giantclam'
  // Equinodermos
  | 'starfish' | 'seaurchin' | 'seaslug'
  // Répteis Marinhos
  | 'seaturtle' | 'seaSnake'
  // Mamíferos Marinhos
  | 'orca' | 'whale' | 'humpback' | 'dolphin' | 'dugong' | 'sealion'
  // Outros
  | 'manta' | 'krill' | 'jellyfish';
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

// ════════════════════════════════════════════════════════════════
// PEIXES ÓSSEOS EXTRAS
// ════════════════════════════════════════════════════════════════

// Cavalo-marinho — fica em pé, nada verticalmente
const drawSeahorse: DrawFn = (s, f, phase) => {
  const sway = Math.sin(phase * 0.7) * 3;
  return `<svg width="${s*0.9}" height="${s*2.2}" viewBox="0 0 18 44" style="transform:rotate(${sway}deg) scaleX(${f?-1:1})">
    <path d="M9 4 Q14 8 13 16 Q13 24 10 30 Q8 36 9 42" stroke="#d4a017" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M9 4 Q4 8 5 16 Q5 24 8 30" stroke="#b8880e" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="9" cy="4" r="4" fill="#d4a017"/>
    <path d="M9 0 Q14 2 13 4" stroke="#c49010" stroke-width="1" fill="none"/>
    <circle cx="7" cy="3" r="1.2" fill="white"/><circle cx="7.4" cy="3" r="0.6" fill="#111"/>
    <path d="M13 12 L17 10 M13 16 L17 15 M13 20 L17 20" stroke="#b8880e" stroke-width="1" fill="none"/>
    <path d="M9 40 Q12 42 14 40 Q12 44 9 42 Z" fill="#a07800"/>
  </svg>`;
};

// Trombeta-do-mar (Trumpetfish) — corpo finíssimo e longo
const drawTrumpetfish: DrawFn = (s, f, _p) => `<svg width="${s*3.5}" height="${s*0.5}" viewBox="0 0 70 10" style="transform:scaleX(${f?-1:1})">
  <path d="M2 5 Q35 3 62 5 Q65 5 70 5" stroke="#d4956a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M2 5 Q35 6.5 62 5" stroke="#b87040" stroke-width="1" fill="none" opacity="0.5"/>
  <ellipse cx="4" cy="5" rx="3.5" ry="2.5" fill="#c07850"/>
  <circle cx="2.5" cy="4" r="1.2" fill="white"/><circle cx="2.9" cy="4" r="0.6" fill="#111"/>
  <path d="M60 4 L70 2 L70 8 Z" fill="#d4956a"/>
</svg>`

// Peixe-papagaio (Parrotfish) — bico de papagaio, cores vibrantes
const drawParrotfish: DrawFn = (s, f, _p) => `<svg width="${s*2.3}" height="${s*1.1}" viewBox="0 0 46 22" style="transform:scaleX(${f?-1:1})">
  <ellipse cx="23" cy="11" rx="17" ry="8" fill="#3cb371"/>
  <ellipse cx="23" cy="11" rx="17" ry="8" fill="none" stroke="#2a8a52" stroke-width="0.5"/>
  <path d="M10 6 Q16 11 10 16" stroke="#e0a020" stroke-width="2.5" fill="none"/>
  <path d="M18 4 Q23 8 28 4" stroke="#5cd89a" stroke-width="1.5" fill="none"/>
  <ellipse cx="9" cy="11" rx="4.5" ry="6" fill="#2a8a52"/>
  <path d="M5 11 Q4 8 6 9 Q5 12 7 13 Z" fill="#e05020"/>
  <circle cx="6.5" cy="9.5" r="1.4" fill="white"/><circle cx="6.9" cy="9.5" r="0.7" fill="#111"/>
  <path d="M40 11 L46 6 L46 16 Z" fill="#e0a020"/>
</svg>`

// Ídolo-mouro (Moorish Idol) — corpo alto, preto/branco/amarelo, barbatana dorsal longa
const drawMoorishIdol: DrawFn = (s, f, _p) => `<svg width="${s*1.6}" height="${s*2}" viewBox="0 0 32 40" style="transform:scaleX(${f?-1:1})">
  <ellipse cx="16" cy="24" rx="11" ry="13" fill="white"/>
  <path d="M6 16 Q16 18 26 16 Q26 28 16 32 Q6 28 6 16 Z" fill="#1a1a1a"/>
  <path d="M6 24 Q16 26 26 24 Q26 28 16 32 Q6 28 6 24 Z" fill="#ffd700"/>
  <path d="M16 10 L13 0 L19 0 Z" fill="#1a1a1a"/>
  <path d="M26 16 L32 12 L32 20 Z" fill="white"/>
  <ellipse cx="9" cy="20" rx="3.5" ry="5" fill="#1a1a1a"/>
  <circle cx="7" cy="18" r="1.5" fill="white"/><circle cx="7.4" cy="18" r="0.7" fill="#111"/>
</svg>`

// Peixe-cirurgião (Surgeonfish) — espinho na base da cauda, corpo oval
const drawSurgeonfish: DrawFn = (s, f, _p) => `<svg width="${s*2}" height="${s*1.1}" viewBox="0 0 40 22" style="transform:scaleX(${f?-1:1})">
  <ellipse cx="20" cy="11" rx="14" ry="8" fill="#2196a0"/>
  <path d="M14 5 Q20 8 26 5" stroke="#1a7a82" stroke-width="1.5" fill="none"/>
  <path d="M14 17 Q20 14 26 17" stroke="#1a7a82" stroke-width="1.5" fill="none"/>
  <ellipse cx="9" cy="11" rx="4" ry="5.5" fill="#1a7a82"/>
  <circle cx="6.5" cy="10" r="1.5" fill="white"/><circle cx="6.9" cy="10" r="0.7" fill="#111"/>
  <path d="M34 11 L40 6 L40 16 Z" fill="#2196a0"/>
  <path d="M34 13 L37 16 L34 16 Z" fill="#e0e0e0"/>
</svg>`

// Garoupa (Grouper) — corpo robusto com manchas
const drawGrouper: DrawFn = (s, f, _p) => `<svg width="${s*2.2}" height="${s*1.2}" viewBox="0 0 44 24" style="transform:scaleX(${f?-1:1})">
  <ellipse cx="22" cy="12" rx="16" ry="9" fill="#8b4513"/>
  <circle cx="16" cy="10" r="2" fill="#6b2e08" opacity="0.6"/>
  <circle cx="22" cy="14" r="2.5" fill="#6b2e08" opacity="0.6"/>
  <circle cx="28" cy="9" r="1.8" fill="#6b2e08" opacity="0.6"/>
  <circle cx="26" cy="15" r="1.5" fill="#6b2e08" opacity="0.5"/>
  <path d="M14 4 Q22 6 30 4" stroke="#6b2e08" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="9" cy="12" rx="4.5" ry="6" fill="#7a3a10"/>
  <circle cx="6.5" cy="11" r="1.5" fill="white"/><circle cx="6.9" cy="11" r="0.7" fill="#111"/>
  <path d="M38 12 L44 6 L44 18 Z" fill="#8b4513"/>
</svg>`

// Peixe-lua / Mola-mola — corpo quase circular, sem cauda real
const drawSunfish: DrawFn = (s, f, _p) => `<svg width="${s*1.8}" height="${s*2}" viewBox="0 0 36 40" style="transform:scaleX(${f?-1:1})">
  <ellipse cx="18" cy="20" rx="15" ry="17" fill="#9eb5c8"/>
  <ellipse cx="18" cy="20" rx="15" ry="17" fill="none" stroke="#7a9ab0" stroke-width="0.6"/>
  <path d="M33 14 L36 10 L36 30 L33 26" fill="#8aa5ba"/>
  <path d="M18 3 L15 0 L21 0 Z" fill="#8aa5ba"/>
  <path d="M18 37 L15 40 L21 40 Z" fill="#8aa5ba"/>
  <ellipse cx="10" cy="18" rx="4" ry="5" fill="#8aa5ba"/>
  <circle cx="8" cy="17" r="2" fill="white"/><circle cx="8.6" cy="17" r="1" fill="#111"/>
  <circle cx="18" cy="20" r="3" fill="rgba(255,255,255,0.1)"/>
</svg>`

// Peixe-cachimbo (Pipefish) — como trombeta mas mais fino e curvado
const drawPipefish: DrawFn = (s, f, phase) => {
  const wave = Math.sin(phase * 0.5) * 3;
  return `<svg width="${s*3}" height="${s*0.7}" viewBox="0 0 60 14" style="transform:scaleX(${f?-1:1})">
    <path d="M2 7 Q20 ${7+wave} 40 ${7-wave} Q55 ${7+wave*0.5} 58 7" stroke="#4a8c5a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M2 7 Q20 ${7.5+wave} 40 ${7.5-wave} Q55 ${7.5+wave*0.5} 58 7.5" stroke="#2a6c3a" stroke-width="1" fill="none" opacity="0.5"/>
    <ellipse cx="3.5" cy="7" rx="3" ry="2.5" fill="#3a7c4a"/>
    <circle cx="2" cy="6" r="1.1" fill="white"/><circle cx="2.3" cy="6" r="0.55" fill="#111"/>
    <path d="M56 6 L60 4 L60 10 Z" fill="#4a8c5a"/>
  </svg>`;
}

// Peixe-sapo-palhaço (Clown Frogfish) — com isco luminoso, camuflagem
const drawClownFrogfish: DrawFn = (s, f, phase) => {
  const lure = Math.sin(phase * 1.2) * 3;
  return `<svg width="${s*1.6}" height="${s*1.4}" viewBox="0 0 32 28" style="transform:scaleX(${f?-1:1})">
    <ellipse cx="16" cy="16" rx="13" ry="10" fill="#e8a040"/>
    <circle cx="12" cy="14" r="4" fill="#c87020" opacity="0.5"/>
    <circle cx="20" cy="18" r="3" fill="#c87020" opacity="0.4"/>
    <circle cx="16" cy="10" r="2.5" fill="#c87020" opacity="0.4"/>
    <path d="M16 6 Q18 ${3+lure} 17 ${1+lure}" stroke="#d4a060" stroke-width="1.2" fill="none"/>
    <circle cx="17" cy="${1+lure}" r="1.5" fill="#ffe060" opacity="0.9"/>
    <ellipse cx="7" cy="15" rx="5" ry="6" fill="#d09030"/>
    <path d="M3 17 Q5 20 9 18" stroke="white" stroke-width="1" fill="none"/>
    <circle cx="5" cy="14" r="1.8" fill="white"/><circle cx="5.5" cy="14" r="0.9" fill="#111"/>
    <path d="M28 14 L32 10 L32 22 Z" fill="#e8a040"/>
  </svg>`;
};

// ════════════════════════════════════════════════════════════════
// PEIXES CARTILAGINOSOS EXTRAS
// ════════════════════════════════════════════════════════════════

// Tubarão-baleia — o maior peixe do mundo, listras brancas
const drawWhaleShark: DrawFn = (s, f, _p) => `<svg width="${s*5.5}" height="${s*2}" viewBox="0 0 110 40" style="transform:scaleX(${f?-1:1})">
  <path d="M4 20 Q22 10 55 12 Q80 10 98 20 Q88 26 60 28 Q30 30 10 26 Z" fill="#4a7a9b"/>
  <path d="M4 20 Q22 10 55 12 Q80 10 98 20 Q88 26 60 28 Q30 30 10 26 Z" fill="none" stroke="#2a5a7b" stroke-width="0.5"/>
  ${[1,2,3,4,5].map(i=>`<circle cx="${15+i*15}" cy="${12+i%2*4}" r="2.5" fill="rgba(255,255,255,0.25)"/>`).join('')}
  ${[1,2,3].map(i=>`<path d="M${20+i*20} 14 Q${28+i*20} 16 ${20+i*20} 18" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>`).join('')}
  <path d="M40 12 L46 2 L52 12 Z" fill="#3a6a8b"/>
  <path d="M98 20 L110 14 L110 26 Z" fill="#4a7a9b"/>
  <path d="M65 28 L70 36 L76 28 Z" fill="#3a6a8b"/>
  <ellipse cx="8" cy="20" rx="5" ry="6" fill="#3a6a8b"/>
  <path d="M4 22 Q6 26 12 24" stroke="white" stroke-width="0.8" fill="none"/>
  <circle cx="6" cy="17" r="2" fill="white"/><circle cx="6.6" cy="17" r="1" fill="#111"/>
</svg>`

// Peixe-serra (Sawfish)
const drawSawfish: DrawFn = (s, f, _p) => `<svg width="${s*4}" height="${s*1.2}" viewBox="0 0 80 24" style="transform:scaleX(${f?-1:1})">
  <path d="M4 12 Q12 6 30 8 Q50 6 68 12 Q58 16 36 17 Q18 18 8 15 Z" fill="#7a8a6a"/>
  <path d="M4 12 L0 8 L18 8" stroke="#5a6a4a" stroke-width="2" fill="none"/>
  ${[0,1,2,3,4,5,6].map(i=>`<line x1="${2+i*2.4}" y1="8" x2="${1.5+i*2.4}" y2="${5 - (i%2)*3}" stroke="#4a5a3a" stroke-width="0.8"/>`).join('')}
  <path d="M68 12 L80 8 L80 16 Z" fill="#7a8a6a"/>
  <path d="M44 17 L46 22 L50 17 Z" fill="#5a6a4a"/>
  <ellipse cx="8" cy="12" rx="4" ry="5" fill="#6a7a5a"/>
  <circle cx="6" cy="10.5" r="1.4" fill="white"/><circle cx="6.4" cy="10.5" r="0.7" fill="#111"/>
</svg>`

// ════════════════════════════════════════════════════════════════
// CRUSTÁCEOS EXTRAS
// ════════════════════════════════════════════════════════════════

// Lagosta — antenas compridas, cauda em leque
const drawLobster: DrawFn = (s, f, phase) => {
  const tail = Math.sin(phase * 0.8) * 2;
  return `<svg width="${s*2.5}" height="${s*1.1}" viewBox="0 0 50 22" style="transform:scaleX(${f?-1:1})">
    <path d="M2 5 Q8 4 14 7" stroke="#c0392b" stroke-width="1.2" fill="none"/>
    <path d="M2 4 Q8 2 14 6" stroke="#c0392b" stroke-width="1" fill="none" opacity="0.6"/>
    ${[0,1,2,3,4].map(i=>`<path d="M${16+i*3} 14 L${14+i*3} ${19+Math.sin(phase+i)*2}" stroke="#a93226" stroke-width="1.5" fill="none" stroke-linecap="round"/>`).join('')}
    <ellipse cx="20" cy="10" rx="8" ry="5" fill="#c0392b"/>
    <path d="M28 8 Q38 6 44 10 Q38 14 28 12 Z" fill="#a93226"/>
    <path d="M44 ${10+tail} L50 ${8+tail} L50 ${12+tail} Z" fill="#c0392b"/>
    <path d="M36 12 L38 18 L42 12 Z" fill="#a93226"/>
    <ellipse cx="14" cy="10" rx="4" ry="5" fill="#b03020"/>
    <circle cx="12" cy="8.5" r="1.5" fill="white"/><circle cx="12.4" cy="8.5" r="0.7" fill="#111"/>
    <path d="M10 8 Q8 6 5 5 M10 10 Q7 10 4 10" stroke="#c0392b" stroke-width="1.2" fill="none"/>
  </svg>`;
};

// Camarão-louva-a-deus (Mantis Shrimp) — cores neon iridescentes
const drawMantisShrimp: DrawFn = (s, f, phase) => {
  const legs = Array.from({length:6}, (_,i) => {
    const x = 12 + i * 4;
    const sw = Math.sin(phase + i*0.9) * 2;
    return `<path d="M${x} 12 L${x-1} ${17+sw}" stroke="#40e0d0" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  }).join('');
  return `<svg width="${s*2.5}" height="${s}" viewBox="0 0 50 20" style="transform:scaleX(${f?-1:1})">
    ${legs}
    <path d="M4 10 Q25 5 42 10 Q38 14 25 14 Q10 14 4 10 Z" fill="#2ecc71"/>
    <path d="M4 10 Q25 7 42 10" stroke="#40e0d0" stroke-width="1.5" fill="none" opacity="0.8"/>
    <path d="M4 10 Q25 8.5 42 10" stroke="#9b59b6" stroke-width="0.8" fill="none" opacity="0.7"/>
    <path d="M42 10 L50 7 L50 13 Z" fill="#e74c3c"/>
    <path d="M28 14 L30 18 L34 14 Z" fill="#27ae60"/>
    <ellipse cx="6" cy="10" rx="4" ry="4.5" fill="#27ae60"/>
    <path d="M3 9 L0 7 M3 10 L0 10 M3 11 L0 13" stroke="#40e0d0" stroke-width="1" fill="none"/>
    <circle cx="4.5" cy="8.5" r="1.5" fill="white"/><circle cx="4.9" cy="8.5" r="0.7" fill="#e74c3c"/>
  </svg>`;
};

// ════════════════════════════════════════════════════════════════
// MOLUSCOS EXTRAS
// ════════════════════════════════════════════════════════════════

// Nautilus — concha espiral
const drawNautilus: DrawFn = (s, f, phase) => {
  const spin = phase * 0.3;
  return `<svg width="${s*1.6}" height="${s*1.6}" viewBox="0 0 32 32" style="transform:scaleX(${f?-1:1}) rotate(${spin.toFixed(2)}rad)">
    <circle cx="16" cy="16" r="14" fill="#f5e6c8"/>
    <circle cx="16" cy="16" r="14" fill="none" stroke="#c4a060" stroke-width="0.6"/>
    <path d="M16 2 Q28 4 30 16 Q28 28 16 30 Q4 28 2 16 Q4 4 16 2" fill="none" stroke="#c4a060" stroke-width="1.5" stroke-dasharray="3,2"/>
    <circle cx="16" cy="16" r="8" fill="#e8d4a8"/>
    <circle cx="16" cy="16" r="4" fill="#d4b880"/>
    <circle cx="16" cy="16" r="1.5" fill="#b89840"/>
    ${[0,1,2,3,4,5].map(i=>`<line x1="16" y1="16" x2="${(16+12*Math.cos(i*1.047)).toFixed(1)}" y2="${(16+12*Math.sin(i*1.047)).toFixed(1)}" stroke="#c4a060" stroke-width="0.5" opacity="0.5"/>`).join('')}
    <path d="M16 14 Q20 15 20 18 Q18 20 16 18" fill="none" stroke="#8b6020" stroke-width="1" opacity="0.6"/>
    ${Array.from({length:8},(_,i)=>`<path d="M${(16+14*Math.cos(i*0.785)).toFixed(1)} ${(16+14*Math.sin(i*0.785)).toFixed(1)} L${(16+10*Math.cos(i*0.785+0.15)).toFixed(1)} ${(16+10*Math.sin(i*0.785+0.15)).toFixed(1)}" stroke="#a08040" stroke-width="1.5" fill="none"/>`).join('')}
  </svg>`;
};

// Nudibranquio — lesma do mar, cores vibrantes e galas
const drawNudibranch: DrawFn = (s, f, phase) => {
  const galas = Array.from({length:10},(_,i)=>{
    const x = 6 + i*3.5;
    const h = 4 + Math.sin(phase+i*0.7)*2;
    return `<path d="M${x} 8 Q${x+1} ${8-h} ${x} ${8-h*1.5}" stroke="#ff6b9d" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }).join('');
  return `<svg width="${s*2.3}" height="${s*1.2}" viewBox="0 0 46 24" style="transform:scaleX(${f?-1:1})">
    ${galas}
    <path d="M4 14 Q23 10 42 14 Q38 18 23 18 Q8 18 4 14 Z" fill="#ff4500"/>
    <path d="M4 14 Q23 12 42 14" stroke="#ff8c00" stroke-width="1.5" fill="none" opacity="0.7"/>
    <path d="M40 14 L46 11 L46 17 Z" fill="#ff4500"/>
    <path d="M4 12 L0 9 M4 13 L0 13" stroke="#ff6b9d" stroke-width="1.2" fill="none"/>
    <circle cx="4.5" cy="13.5" r="1.5" fill="white"/><circle cx="4.9" cy="13.5" r="0.7" fill="#111"/>
  </svg>`;
};

// Marisquinho gigante (Giant Clam) — fica no fundo, abre e fecha
const drawGiantClam: DrawFn = (s, f, phase) => {
  const open = (Math.sin(phase * 0.3) * 0.5 + 0.5) * 8;
  return `<svg width="${s*2}" height="${s*1.3}" viewBox="0 0 40 26">
    <ellipse cx="20" cy="${18+open*0.3}" rx="18" ry="${6-open*0.2}" fill="#6a8fb5"/>
    <ellipse cx="20" cy="${18+open*0.3}" rx="18" ry="${6-open*0.2}" fill="none" stroke="#4a6f95" stroke-width="0.7"/>
    <ellipse cx="20" cy="${14-open}" rx="16" ry="${5+open*0.3}" fill="#7aa0c5"/>
    <ellipse cx="20" cy="${14-open}" rx="16" ry="${5+open*0.3}" fill="none" stroke="#4a6f95" stroke-width="0.7"/>
    ${open > 3 ? `<ellipse cx="20" cy="16" rx="10" ry="3" fill="#7fffcb" opacity="0.6"/>` : ''}
    <path d="M4 18 Q6 22 10 20 Q14 24 20 22 Q26 24 30 20 Q34 22 36 18" stroke="#4a6f95" stroke-width="1" fill="none" opacity="0.5"/>
  </svg>`;
};

// ════════════════════════════════════════════════════════════════
// EQUINODERMOS
// ════════════════════════════════════════════════════════════════

// Estrela-do-mar — 5 braços, fica na areia
const drawStarfish: DrawFn = (s, _f, phase) => {
  const pulse = 1 + Math.sin(phase * 0.4) * 0.04;
  const arms = Array.from({length:5},(_,i)=>{
    const angle = (i * 72 - 90) * Math.PI / 180;
    const x2 = (16 + 13*Math.cos(angle)).toFixed(1);
    const y2 = (16 + 13*Math.sin(angle)).toFixed(1);
    const cx1 = (16 + 7*Math.cos(angle-0.4)).toFixed(1);
    const cy1 = (16 + 7*Math.sin(angle-0.4)).toFixed(1);
    const cx2 = (16 + 7*Math.cos(angle+0.4)).toFixed(1);
    const cy2 = (16 + 7*Math.sin(angle+0.4)).toFixed(1);
    return `<path d="M16 16 Q${cx1} ${cy1} ${x2} ${y2} Q${cx2} ${cy2} 16 16" fill="#e85c3a"/>`;
  }).join('');
  return `<svg width="${s*1.8}" height="${s*1.8}" viewBox="0 0 32 32" style="transform:scale(${pulse.toFixed(3)})">
    ${arms}
    <circle cx="16" cy="16" r="5" fill="#d04020"/>
    <circle cx="16" cy="16" r="2" fill="#c03010"/>
  </svg>`;
};

// Ouriço-do-mar — bola com espinhos, fica na areia
const drawSeaUrchin: DrawFn = (s, _f, phase) => {
  const spines = Array.from({length:16},(_,i)=>{
    const angle = (i * 22.5) * Math.PI / 180;
    const len = 9 + Math.sin(phase * 0.5 + i) * 1.5;
    const x2 = (14 + len*Math.cos(angle)).toFixed(1);
    const y2 = (14 + len*Math.sin(angle)).toFixed(1);
    return `<line x1="14" y1="14" x2="${x2}" y2="${y2}" stroke="#4a1a8a" stroke-width="1" stroke-linecap="round"/>`;
  }).join('');
  return `<svg width="${s*1.6}" height="${s*1.6}" viewBox="0 0 28 28">
    ${spines}
    <circle cx="14" cy="14" r="8" fill="#6b2daa"/>
    <circle cx="14" cy="14" r="8" fill="none" stroke="#4a1a8a" stroke-width="0.6"/>
    <circle cx="14" cy="14" r="3" fill="#4a1a8a"/>
  </svg>`;
};

// ════════════════════════════════════════════════════════════════
// RÉPTEIS MARINHOS
// ════════════════════════════════════════════════════════════════

// Tartaruga marinha — nada graciosamente
const drawSeaTurtle: DrawFn = (s, f, phase) => {
  const flap = Math.sin(phase * 0.6) * 8;
  return `<svg width="${s*2.4}" height="${s*1.8}" viewBox="0 0 48 36" style="transform:scaleX(${f?-1:1})">
    <path d="M14 18 L6 ${12+flap} M14 18 L5 ${22-flap}" stroke="#2e7d32" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M34 18 L42 ${12+flap} M34 18 L43 ${22-flap}" stroke="#2e7d32" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="24" cy="18" rx="13" ry="10" fill="#388e3c"/>
    <path d="M13 12 Q24 8 35 12 Q35 24 24 28 Q13 24 13 12 Z" fill="none" stroke="#1b5e20" stroke-width="1" opacity="0.6"/>
    <path d="M13 18 Q24 16 35 18" stroke="#1b5e20" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M19 10 Q24 8 29 10 Q24 12 19 10 Z" fill="#1b5e20" opacity="0.4"/>
    <path d="M24 28 L22 34 L26 34 Z" stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="13" cy="18" rx="5" ry="6" fill="#2e7d32"/>
    <circle cx="11" cy="16" r="2" fill="white"/><circle cx="11.6" cy="16" r="1" fill="#111"/>
  </svg>`;
};

// Cobra-do-mar — corpo longo e sinuoso
const drawSeaSnake: DrawFn = (s, f, phase) => {
  const w1 = Math.sin(phase * 0.6) * 8;
  const w2 = Math.sin(phase * 0.6 + 1) * 8;
  const w3 = Math.sin(phase * 0.6 + 2) * 8;
  return `<svg width="${s*3.5}" height="${s*1.2}" viewBox="0 0 70 24" style="transform:scaleX(${f?-1:1})">
    <path d="M4 12 Q16 ${12+w1} 28 12 Q40 ${12+w2} 52 12 Q60 ${12+w3} 66 12"
          stroke="#558b2f" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M4 12 Q16 ${12+w1} 28 12 Q40 ${12+w2} 52 12 Q60 ${12+w3} 66 12"
          stroke="#33691e" stroke-width="2" fill="none" stroke-dasharray="4,6" opacity="0.7"/>
    <ellipse cx="6" cy="12" rx="5" ry="4" fill="#33691e"/>
    <path d="M2 10 L0 8 M2 12 L0 12 M2 14 L0 16" stroke="#ffe000" stroke-width="1" fill="none"/>
    <circle cx="4.5" cy="10.5" r="1.5" fill="white"/><circle cx="4.9" cy="10.5" r="0.75" fill="#111"/>
    <path d="M66 11 L70 10 L70 14 L66 13 Z" fill="#558b2f"/>
  </svg>`;
};

// ════════════════════════════════════════════════════════════════
// MAMÍFEROS MARINHOS EXTRAS
// ════════════════════════════════════════════════════════════════

// Golfinho — ágil, saltitante
const drawDolphin: DrawFn = (s, f, phase) => {
  const arc = Math.sin(phase * 0.5) * 5;
  return `<svg width="${s*3}" height="${s*1.6}" viewBox="0 0 60 32" style="transform:scaleX(${f?-1:1})">
    <path d="M4 ${18+arc} Q16 ${10+arc} 34 ${14+arc} Q50 ${12+arc} 56 ${18+arc}" fill="none" stroke="#607d8b" stroke-width="10" stroke-linecap="round"/>
    <path d="M4 ${18+arc} Q16 ${10+arc} 34 ${14+arc} Q50 ${12+arc} 56 ${18+arc}" fill="none" stroke="#78909c" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="34" cy="${14+arc}" rx="12" ry="4" fill="#cfd8dc" opacity="0.6"/>
    <path d="M28 ${10+arc} L32 ${3+arc} L36 ${10+arc} Z" fill="#546e7a"/>
    <path d="M56 ${18+arc} L62 ${14+arc} L62 ${22+arc} Z" fill="#607d8b"/>
    <path d="M46 ${22+arc} L48 ${28+arc} L52 ${22+arc} Z" fill="#546e7a"/>
    <ellipse cx="7" cy="${18+arc}" rx="5" ry="4.5" fill="#546e7a"/>
    <circle cx="5" cy="${16+arc}" r="1.8" fill="white"/><circle cx="5.5" cy="${16+arc}" r="0.9" fill="#111"/>
  </svg>`;
};

// Dugongo / Peixe-boi — robusto, lento, herbívoro
const drawDugong: DrawFn = (s, f, phase) => {
  const tail = Math.sin(phase * 0.3) * 3;
  return `<svg width="${s*3.2}" height="${s*1.6}" viewBox="0 0 64 32" style="transform:scaleX(${f?-1:1})">
    <path d="M6 16 Q20 8 40 10 Q58 10 60 16 Q56 22 38 24 Q18 26 8 22 Z" fill="#8d9e8a"/>
    <path d="M6 16 Q20 8 40 10 Q58 10 60 16" fill="none" stroke="#6d7e6a" stroke-width="0.5"/>
    <ellipse cx="30" cy="15" rx="15" ry="5" fill="#9dae9a" opacity="0.4"/>
    <path d="M60 15 L64 ${11+tail} L64 ${19+tail} Z" fill="#7d8e7a"/>
    <path d="M44 24 L46 30 L50 24 Z" fill="#7d8e7a"/>
    <path d="M14 20 L10 26 L18 22 Z" fill="#7d8e7a"/>
    <ellipse cx="8" cy="16" rx="5" ry="7" fill="#7d8e7a"/>
    <circle cx="6" cy="13" r="2" fill="white"/><circle cx="6.6" cy="13" r="1" fill="#111"/>
    <path d="M4 15 Q2 14 0 16" stroke="#8d9e8a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M4 17 Q2 18 0 16" stroke="#8d9e8a" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
};

// Leão-marinho — nada em espiral, brincalhão
const drawSealion: DrawFn = (s, f, phase) => {
  const spin = Math.sin(phase * 0.5) * 6;
  return `<svg width="${s*2.5}" height="${s*1.5}" viewBox="0 0 50 30" style="transform:scaleX(${f?-1:1}) rotate(${spin}deg)">
    <path d="M8 15 Q20 8 36 12 Q44 14 46 18 Q40 22 28 22 Q14 24 8 18 Z" fill="#a0785a"/>
    <path d="M8 15 Q20 8 36 12 Q44 14 46 18" fill="none" stroke="#7a5a3a" stroke-width="0.5"/>
    <path d="M46 18 L50 15 L50 21 Z" fill="#8a6040"/>
    <path d="M28 22 L30 28 L34 22 Z" fill="#8a6040"/>
    <path d="M14 20 L8 26 L16 22 Z" fill="#8a6040"/>
    <ellipse cx="10" cy="15" rx="6" ry="7" fill="#8a6040"/>
    <circle cx="8" cy="12" r="2.2" fill="white"/><circle cx="8.7" cy="12" r="1.1" fill="#111"/>
    <path d="M6 16 Q4 17 2 15" stroke="#b08060" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M5 18 Q3 20 2 18" stroke="#b08060" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M8 8 Q10 6 13 7" stroke="#7a5a3a" stroke-width="1" fill="none"/>
    <path d="M8 8 Q7 5 10 5" stroke="#7a5a3a" stroke-width="1" fill="none"/>
  </svg>`;
};

// ════════════════════════════════════════════════════════════════
// OUTROS
// ════════════════════════════════════════════════════════════════

// Água-viva — agora sim uma água-viva real (diferente do polvo)
const drawJellyfish: DrawFn = (s, _f, phase) => {
  const pulse = 1 + Math.sin(phase * 0.5) * 0.08;
  const tentacles = Array.from({length:8},(_,i)=>{
    const x = 8 + i * 4.2;
    const w1 = Math.sin(phase + i*0.8) * 6;
    const w2 = Math.sin(phase*0.7 + i) * 4;
    const len = 20 + Math.sin(phase*0.3+i)*4;
    return `<path d="M${x} 16 Q${x+w1} ${16+len*0.5} ${x+w2} ${16+len}" stroke="rgba(180,100,220,0.6)" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  }).join('');
  return `<svg width="${s*1.8}" height="${s*2.2}" viewBox="0 0 36 44" style="transform:scale(${pulse.toFixed(3)})">
    ${tentacles}
    <path d="M4 14 Q18 2 32 14 Q32 18 18 20 Q4 18 4 14 Z" fill="rgba(180,100,220,0.75)"/>
    <path d="M4 14 Q18 4 32 14" fill="none" stroke="rgba(220,160,255,0.5)" stroke-width="2"/>
    <ellipse cx="18" cy="12" rx="8" ry="3" fill="rgba(220,160,255,0.3)"/>
  </svg>`;
};

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

// ── Polvo — manto redondo e grande, tentáculos abertos em leque com ventosas; corpo simétrico, não precisa flip ──
const drawOctopus: DrawFn = (s, _flipped, phase) => {
  const tentacles = Array.from({ length: 8 }, (_, i) => {
    const spread = (i - 3.5) / 3.5; // -1 (esquerda) a 1 (direita) — abre o "leque"
    const baseX = 20 + spread * 13;
    const wave = Math.sin(phase + i * 0.9) * 5;
    const len = 24 + Math.sin(phase * 0.3 + i) * 3;
    const midX = baseX + spread * 5 + wave * 0.6;
    const tipX = baseX + spread * 7 + wave * 0.3;
    const w = 4.5;
    const suckers = [0.45, 0.75].map(t => {
      const sx = (baseX + (midX - baseX) * t).toFixed(1);
      const sy = (20 + len * t).toFixed(1);
      return `<ellipse cx="${sx}" cy="${sy}" rx="1.5" ry="1" fill="#d99ce8" opacity="0.7"/>`;
    }).join('');
    return `
      <path d="M${(baseX - w / 2).toFixed(1)} 19
               Q${(midX - w / 3).toFixed(1)} ${(20 + len * 0.6).toFixed(1)} ${tipX.toFixed(1)} ${(20 + len).toFixed(1)}
               Q${(midX + w / 3).toFixed(1)} ${(20 + len * 0.6).toFixed(1)} ${(baseX + w / 2).toFixed(1)} 19 Z"
            fill="#9b3fb5" opacity="0.92"/>
      ${suckers}`;
  }).join('');
  const pulse = 1 + Math.sin(phase * 0.5) * 0.035;
  return `<svg width="${s * 1.6}" height="${s * 1.5}" viewBox="0 0 40 48" style="transform:scale(${pulse.toFixed(3)})">
    ${tentacles}
    <ellipse cx="20" cy="14" rx="16" ry="13" fill="#b54fd1"/>
    <ellipse cx="20" cy="14" rx="16" ry="13" fill="none" stroke="#8a35a8" stroke-width="0.6"/>
    <ellipse cx="20" cy="6" rx="9" ry="3" fill="#c468da" opacity="0.5"/>
    <circle cx="14" cy="12" r="3.6" fill="white"/><circle cx="14.9" cy="12" r="1.8" fill="#111"/>
    <circle cx="26" cy="12" r="3.6" fill="white"/><circle cx="26.9" cy="12" r="1.8" fill="#111"/>
  </svg>`;
};

// ── Tubarão — grande, fluido, boca mostrando dentes ──────────────────────────
const drawShark: DrawFn = (s, f, _p) => `<svg width="${s*3.2}" height="${s*1.3}" viewBox="0 0 64 26" style="transform:scaleX(${f?-1:1})">
  <path d="M2 13 Q8 6 20 8 Q36 5 54 13 Q48 16 36 17 Q20 18 8 16 Z" fill="#4a6fa5"/>
  <path d="M2 13 Q8 6 20 8 Q36 5 54 13 Q48 16 36 17 Q20 18 8 16 Z" fill="none" stroke="#2d4f7a" stroke-width="0.5"/>
  <path d="M20 8 L26 0 L30 8 Z" fill="#3d5f8a"/>
  <path d="M8 16 L4 22 L14 17 Z" fill="#3d5f8a"/>
  <path d="M54 13 L64 10 L64 16 Z" fill="#4a6fa5"/>
  <path d="M36 17 L38 22 L42 17 Z" fill="#3d5f8a"/>
  <ellipse cx="7" cy="12" rx="3" ry="4" fill="#3d5f8a"/>
  <path d="M4 14 Q6 17 10 15" stroke="white" stroke-width="0.8" fill="none"/>
  <line x1="5" y1="15" x2="7" y2="16" stroke="white" stroke-width="0.5"/>
  <line x1="7" y1="15.5" x2="9" y2="16" stroke="white" stroke-width="0.5"/>
  <circle cx="5" cy="11" r="1.3" fill="white"/><circle cx="5.4" cy="11" r="0.6" fill="#111"/>
  <rect x="7" y="11" width="6" height="1" rx="0.5" fill="rgba(255,255,255,0.15)"/>
</svg>`

// ── Tubarão-martelo ───────────────────────────────────────────────────────────
const drawHammerhead: DrawFn = (s, f, _p) => `<svg width="${s*3}" height="${s*1.5}" viewBox="0 0 60 30" style="transform:scaleX(${f?-1:1})">
  <path d="M10 15 Q20 9 38 10 Q52 10 58 15 Q52 18 38 19 Q20 19 10 17 Z" fill="#5a7a9a"/>
  <path d="M22 10 L26 2 L30 10 Z" fill="#4a6a8a"/>
  <path d="M10 17 L6 24 L16 18 Z" fill="#4a6a8a"/>
  <path d="M58 15 L60 12 L60 18 Z" fill="#5a7a9a"/>
  <path d="M0 12 Q4 7 8 12 Q4 17 0 18 Z" fill="#4a6a8a"/>
  <circle cx="2" cy="10" r="1.2" fill="white"/><circle cx="2.4" cy="10" r="0.6" fill="#111"/>
  <circle cx="2" cy="19" r="1.2" fill="white"/><circle cx="2.4" cy="19" r="0.6" fill="#111"/>
  <path d="M5 14 Q7 16 10 15" stroke="white" stroke-width="0.7" fill="none"/>
</svg>`;

// ── Orca ─────────────────────────────────────────────────────────────────────
const drawOrca: DrawFn = (s, f, _p) => `<svg width="${s*3.5}" height="${s*1.8}" viewBox="0 0 70 36" style="transform:scaleX(${f?-1:1})">
  <path d="M4 18 Q14 8 32 10 Q52 8 64 18 Q58 22 40 24 Q22 25 8 22 Z" fill="#111"/>
  <ellipse cx="24" cy="18" rx="14" ry="7" fill="white" opacity="0.9"/>
  <ellipse cx="8" cy="14" rx="4" ry="5" fill="white" opacity="0.8"/>
  <path d="M30 10 L36 0 L42 10 Z" fill="#111"/>
  <path d="M8 22 L4 30 L16 23 Z" fill="#111"/>
  <path d="M64 18 L70 14 L70 22 Z" fill="#111"/>
  <path d="M46 24 L48 30 L52 24 Z" fill="#111"/>
  <circle cx="8" cy="11" r="2" fill="white"/><circle cx="8.6" cy="11" r="1" fill="#111"/>
  <ellipse cx="18" cy="8" rx="3" ry="1.5" fill="#333" opacity="0.4"/>
</svg>`;

// ── Baleia-azul ───────────────────────────────────────────────────────────────
const drawWhale: DrawFn = (s, f, phase) => {
  const tailWag = Math.sin(phase * 0.4) * 4;
  return `<svg width="${s*5}" height="${s*2}" viewBox="0 0 100 40" style="transform:scaleX(${f?-1:1})">
    <path d="M6 20 Q20 10 50 12 Q75 10 90 18 Q80 24 55 26 Q25 28 10 24 Z" fill="#2a6496"/>
    <path d="M6 20 Q20 10 50 12 Q75 10 90 18 Q80 24 55 26 Q25 28 10 24 Z" fill="none" stroke="#1a4f7a" stroke-width="0.5"/>
    <ellipse cx="50" cy="18" rx="25" ry="5" fill="#3a7ab5" opacity="0.3"/>
    <path d="M90 18 L100 ${14+tailWag} L100 ${22+tailWag} Z" fill="#1e5a8a"/>
    <path d="M60 26 L65 34 L72 26 Z" fill="#1e5a8a"/>
    <path d="M10 24 L5 30 L18 25 Z" fill="#1e5a8a"/>
    <path d="M8 16 Q12 10 18 14" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"/>
    <circle cx="8" cy="14" r="2.5" fill="#1e5a8a"/>
    <circle cx="7" cy="13" r="1.5" fill="white"/><circle cx="7.5" cy="13" r="0.7" fill="#111"/>
    <ellipse cx="25" cy="10" rx="4" ry="1.5" fill="rgba(255,255,255,0.15)"/>
  </svg>`;
};

// ── Baleia jubarte (humpback) ─────────────────────────────────────────────────
const drawHumpback: DrawFn = (s, f, phase) => {
  const tailWag = Math.sin(phase * 0.35) * 5;
  return `<svg width="${s*4.5}" height="${s*2.2}" viewBox="0 0 90 44" style="transform:scaleX(${f?-1:1})">
    <path d="M6 24 Q18 10 40 12 Q62 10 80 20 Q70 28 45 30 Q22 32 8 28 Z" fill="#3d5a6e"/>
    <path d="M40 12 Q46 3 52 12" fill="#2e4a5e"/>
    <path d="M80 20 L90 ${16+tailWag} L90 ${24+tailWag} Z" fill="#2e4a5e"/>
    <path d="M55 30 L60 38 L68 30 Z" fill="#2e4a5e"/>
    <path d="M8 28 L3 34 L16 29 Z" fill="#2e4a5e"/>
    <path d="M14 14 Q20 8 28 12" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="28" cy="12" rx="8" ry="3" fill="rgba(150,180,200,0.2)"/>
    <circle cx="9" cy="18" r="2" fill="white"/><circle cx="9.6" cy="18" r="1" fill="#111"/>
    <path d="M8 24 Q10 28 18 26" stroke="rgba(255,255,255,0.35)" stroke-width="1" fill="none"/>
  </svg>`;
};

// ── Manta ─────────────────────────────────────────────────────────────────────
const drawManta: DrawFn = (s, f, phase) => {
  const flap = Math.sin(phase * 0.6) * 4;
  return `<svg width="${s*3.5}" height="${s*2}" viewBox="0 0 70 40" style="transform:scaleX(${f?-1:1})">
    <path d="M35 20 Q10 ${10+flap} 0 22 Q10 ${28-flap} 35 22 Z" fill="#2c3e50"/>
    <path d="M35 20 Q60 ${10+flap} 70 22 Q60 ${28-flap} 35 22 Z" fill="#2c3e50"/>
    <ellipse cx="35" cy="21" rx="10" ry="7" fill="#34495e"/>
    <path d="M35 22 L42 40" stroke="#2c3e50" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="19" rx="3" ry="2" fill="#1a252f" opacity="0.7"/>
    <path d="M28 17 Q30 15 34 16" stroke="#667" stroke-width="1" fill="none"/>
    <circle cx="29" cy="18" r="1.2" fill="white"/><circle cx="29.4" cy="18" r="0.6" fill="#111"/>
    <circle cx="41" cy="18" r="1.2" fill="white"/><circle cx="41.4" cy="18" r="0.6" fill="#111"/>
    <ellipse cx="35" cy="24" rx="6" ry="2" fill="rgba(200,220,255,0.12)"/>
  </svg>`;
};

// ── Krill — minúsculo e translúcido, ultra raro ───────────────────────────────
const drawKrill: DrawFn = (s, f, phase) => {
  const legs = Array.from({ length: 5 }, (_, i) => {
    const x = 6 + i * 4;
    const sw = Math.sin(phase + i * 0.7) * 2;
    return `<path d="M${x} 8 L${x-1} ${12+sw}" stroke="rgba(255,180,140,0.7)" stroke-width="0.8" fill="none"/>`;
  }).join('');
  return `<svg width="${s*0.9}" height="${s*0.6}" viewBox="0 0 28 14" style="transform:scaleX(${f?-1:1})">
    ${legs}
    <path d="M4 7 Q14 3 24 7 Q20 10 14 10 Q8 10 4 7 Z" fill="rgba(255,160,120,0.65)"/>
    <path d="M24 7 L28 5 L28 9 Z" fill="rgba(255,140,100,0.6)"/>
    <circle cx="4" cy="6" r="1.2" fill="rgba(255,100,80,0.8)"/><circle cx="4" cy="6" r="0.6" fill="#111"/>
    <path d="M3 5 L0 3 M3 6 L0 6" stroke="rgba(255,160,120,0.8)" stroke-width="0.7" fill="none"/>
  </svg>`;
};

interface CreatureDef {
  kind: CreatureKind;
  draw: DrawFn;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  sizeOverride?: number; // se definido, ignora getFishSize (em px, valor base do SVG)
}

// Peso de cada raridade no pool de sorteio
const RARITY_WEIGHT = { common: 12, uncommon: 5, rare: 2, legendary: 1 } as const;

const CREATURES: CreatureDef[] = [
  // ── Peixes Ósseos comuns ─────────────────────────────────────────────────────
  ...FISH.map(draw => ({ kind: 'fish' as const, draw, rarity: 'common' as const })),
  { kind: 'seahorse',     draw: drawSeahorse,     rarity: 'common' },
  { kind: 'pipefish',     draw: drawPipefish,     rarity: 'common' },
  { kind: 'parrotfish',   draw: drawParrotfish,   rarity: 'common' },
  { kind: 'surgeonfish',  draw: drawSurgeonfish,  rarity: 'common' },
  { kind: 'grouper',      draw: drawGrouper,      rarity: 'common' },
  { kind: 'moorishidol',  draw: drawMoorishIdol,  rarity: 'common' },
  // ── Crustáceos comuns ────────────────────────────────────────────────────────
  { kind: 'crab',         draw: drawCrab,         rarity: 'common' },
  // ── Moluscos comuns ──────────────────────────────────────────────────────────
  { kind: 'octopus',      draw: drawOctopus,      rarity: 'common' },
  { kind: 'nudibranch',   draw: drawNudibranch,   rarity: 'common' },
  // ── Equinodermos comuns ──────────────────────────────────────────────────────
  { kind: 'starfish',     draw: drawStarfish,     rarity: 'common' },

  // ── Incomuns ─────────────────────────────────────────────────────────────────
  { kind: 'trumpetfish',  draw: drawTrumpetfish,  rarity: 'uncommon' },
  { kind: 'clownfrogfish',draw: drawClownFrogfish, rarity: 'uncommon' },
  { kind: 'lobster',      draw: drawLobster,      rarity: 'uncommon', sizeOverride: 28 },
  { kind: 'mantisshrimp', draw: drawMantisShrimp, rarity: 'uncommon' },
  { kind: 'nautilus',     draw: drawNautilus,     rarity: 'uncommon' },
  { kind: 'giantclam',    draw: drawGiantClam,    rarity: 'uncommon' },
  { kind: 'seaurchin',    draw: drawSeaUrchin,    rarity: 'uncommon' },
  { kind: 'jellyfish',    draw: drawJellyfish,    rarity: 'uncommon' },
  { kind: 'manta',        draw: drawManta,        rarity: 'uncommon', sizeOverride: 34 },
  { kind: 'shark',        draw: drawShark,        rarity: 'uncommon', sizeOverride: 36 },
  { kind: 'seaturtle',    draw: drawSeaTurtle,    rarity: 'uncommon', sizeOverride: 32 },
  { kind: 'dugong',       draw: drawDugong,       rarity: 'uncommon', sizeOverride: 34 },

  // ── Raros ────────────────────────────────────────────────────────────────────
  { kind: 'sunfish',      draw: drawSunfish,      rarity: 'rare',     sizeOverride: 38 },
  { kind: 'sawfish',      draw: drawSawfish,      rarity: 'rare',     sizeOverride: 36 },
  { kind: 'hammerhead',   draw: drawHammerhead,   rarity: 'rare',     sizeOverride: 40 },
  { kind: 'orca',         draw: drawOrca,         rarity: 'rare',     sizeOverride: 44 },
  { kind: 'humpback',     draw: drawHumpback,     rarity: 'rare',     sizeOverride: 48 },
  { kind: 'dolphin',      draw: drawDolphin,      rarity: 'rare',     sizeOverride: 36 },
  { kind: 'sealion',      draw: drawSealion,      rarity: 'rare',     sizeOverride: 34 },
  { kind: 'seaSnake',     draw: drawSeaSnake,     rarity: 'rare',     sizeOverride: 28 },

  // ── Lendários ────────────────────────────────────────────────────────────────
  { kind: 'whale',        draw: drawWhale,        rarity: 'legendary', sizeOverride: 58 },
  { kind: 'whaleshark',   draw: drawWhaleShark,   rarity: 'legendary', sizeOverride: 52 },
  { kind: 'krill',        draw: drawKrill,        rarity: 'legendary', sizeOverride: 10 },
  { kind: 'seaslug',      draw: drawNudibranch,   rarity: 'legendary', sizeOverride: 8  }, // micro-nudibranch lendário
];

// Pool ponderada: cada criatura aparece N vezes conforme seu peso de raridade.
// hash % CREATURE_POOL.length dá índice final com probabilidade proporcional.
const CREATURE_POOL: number[] = CREATURES.flatMap((c, idx) =>
  Array(RARITY_WEIGHT[c.rarity]).fill(idx)
);

function getCreatureType(
  username: string,
  typeCounts: Map<number, number>,   // criaturaIdx → quantos já têm esse tipo
  maxPerType = 2
): number {
  let hash = 0;
  for (const c of username) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  const poolLen = CREATURE_POOL.length;
  const startPos = Math.abs(hash) % poolLen;

  // Tenta a preferência natural do hash primeiro.
  // Se esse tipo já atingiu o limite, sobe pelo pool até achar um disponível.
  // A direção de busca usa um segundo hash derivado do nome, pra dois usuários
  // "deslocados" não caírem sempre no mesmo tipo de reserva.
  let hash2 = 0;
  for (const c of username) hash2 = (hash2 * 17 + c.charCodeAt(0)) & 0xffffffff;
  const step = (Math.abs(hash2) % (poolLen - 1)) + 1; // passo ímpar garante varredura completa

  for (let i = 0; i < poolLen; i++) {
    const pos = (startPos + i * step) % poolLen;
    const idx = CREATURE_POOL[pos];
    if ((typeCounts.get(idx) ?? 0) < maxPerType) return idx;
  }

  // Fallback improvável (todas as criaturas com 2+ usuários): retorna a preferência natural
  return CREATURE_POOL[startPos];
}

function getFishSize(username: string): number {
  return 18 + (Math.abs(username.length * 13) % 12);
}

interface FishState {
  el: HTMLDivElement;
  tipEl: HTMLDivElement;
  bubbleEl: HTMLDivElement;
  username: string;
  typeIdx: number;
  kind: CreatureKind;
  size: number;
  x: number; y: number;
  vx: number; vy: number;
  flipped: boolean;
  wobble: number;
  wobbleSpeed: number;
  lastMsgTs: number;     // timestamp (ms) da última mensagem já exibida — evita reexibir a mesma msg a cada poll
  messageUntil: number;  // timestamp (ms) até quando o balão deve ficar visível
  turnTimer: number;
  turnCounter: number;
}

// Quanto tempo o balão de chat fica visível acima do peixe.
// Se mudar aqui, ajusta também o RECENT_WINDOW_SECONDS no messagesController.ts
// do backend (precisa ser um pouco maior que isso, pra dar margem ao polling).
const MESSAGE_DISPLAY_MS = 10_000;

export default function AquariumScene() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  // Posição do mouse dentro do aquário; null = fora do aquário
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
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

  // ── Chat ─────────────────────────────────────────────
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);

  // Busca mensagens recentes (últimos ~30s) e atualiza o balão do peixe correspondente.
  // Usa lastMsgTs por peixe pra não "renovar" o balão a cada poll enquanto a msg
  // ainda estiver dentro da janela do backend — só atualiza se for de fato uma msg nova.
  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        data: { username: string; text: string; created_at: string }[];
      }>('/messages/recent');

      for (const m of data.data ?? []) {
        const f = fishList.current.find(fs => fs.username === m.username);
        if (!f) continue;
        const ts = new Date(m.created_at).getTime();
        if (ts > f.lastMsgTs) {
          f.lastMsgTs = ts;
          f.messageUntil = Date.now() + MESSAGE_DISPLAY_MS;
          f.bubbleEl.textContent = m.text;
        }
      }
    } catch {
      // silently fail — só não atualiza nesse tick
    }
  }, []);

  useEffect(() => {
    if (!user) return; // só faz polling de chat se estiver logado
    fetchMessages();
    const interval = setInterval(fetchMessages, 3_000);
    return () => clearInterval(interval);
  }, [user, fetchMessages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || !user || sending) return;

    setSending(true);
    setChatInput('');
    try {
      await apiClient.post('/messages', { text });
      // feedback otimista: já mostra o balão no próprio peixe sem esperar o próximo poll
      const f = fishList.current.find(fs => fs.username === user.username);
      if (f) {
        f.lastMsgTs = Date.now();
        f.messageUntil = Date.now() + MESSAGE_DISPLAY_MS;
        f.bubbleEl.textContent = text;
      }
    } catch {
      // se falhar, devolve o texto pro input pra não perder o que a pessoa digitou
      setChatInput(text);
    } finally {
      setSending(false);
    }
  };

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
        f.bubbleEl.remove();
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

    // Conta quantos peixes já existem de cada tipo (inclui os que já estão no aquário)
    // pra que getCreatureType pule tipos lotados ao sortear os novos usuários.
    const typeCounts = new Map<number, number>();
    for (const f of fishList.current) {
      typeCounts.set(f.typeIdx, (typeCounts.get(f.typeIdx) ?? 0) + 1);
    }

    newUsers.forEach((u, idx) => {
      existingUsernames.add(u.username); // reserva o slot imediatamente

      // Sorteia o tipo ANTES do setTimeout (com o mapa atual) e já incrementa
      // o contador, pra usuários seguintes na mesma rodada não pegarem o mesmo.
      const reservedTypeIdx = getCreatureType(u.username, typeCounts);
      typeCounts.set(reservedTypeIdx, (typeCounts.get(reservedTypeIdx) ?? 0) + 1);

      setTimeout(() => {
        if (!wrapRef.current) return;

        // Guarda extra: se por qualquer motivo um peixe com esse username
        // já existe no array (ex: dois timeouts concorrentes de execuções
        // diferentes do efeito), não cria duplicado.
        if (fishList.current.some(f => f.username === u.username)) return;

        const W = wrap.offsetWidth;
        const H = wrap.offsetHeight;

        const typeIdx = reservedTypeIdx;
        const creatureDef = CREATURES[typeIdx];
        const kind = creatureDef.kind;
        const size = creatureDef.sizeOverride ?? getFishSize(u.username);
        const rarity = creatureDef.rarity;
        const flipped = Math.random() > 0.5;

        // Elemento do peixe
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;cursor:pointer;z-index:10;user-select:none;';
        el.innerHTML = CREATURES[typeIdx].draw(size, flipped, 0);
        wrap.appendChild(el);

        // Balão de chat — fica dentro do wrap (acompanha x/y do peixe, não o cursor)
        const bubbleEl = document.createElement('div');
        bubbleEl.style.cssText = [
          'position:absolute',
          'z-index:15',
          'pointer-events:none',
          'background:rgba(8,22,38,0.95)',
          'border:1px solid rgba(34,211,238,0.45)',
          'color:#e6f7ff',
          'font-family:monospace',
          'font-size:12px',
          'line-height:1.3',
          'padding:5px 10px',
          'border-radius:12px',
          'max-width:150px',
          'white-space:normal',
          'word-break:break-word',
          'text-align:center',
          'opacity:0',
          'transition:opacity 0.25s ease',
          'transform:translateX(-50%)',
          'box-shadow:0 3px 12px rgba(0,0,0,0.4)',
        ].join(';');
        wrap.appendChild(bubbleEl);

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
        const rarityBadge = rarity === 'legendary'
          ? `<span style="color:#f59e0b;font-size:10px"> ✦ lendário</span>`
          : rarity === 'rare'
          ? `<span style="color:#a78bfa;font-size:10px"> ★ raro</span>`
          : rarity === 'uncommon'
          ? `<span style="color:#34d399;font-size:10px"> · incomum</span>`
          : '';
        tipEl.innerHTML = isMe
          ? `<span style="color:#22d3ee">@${u.username}</span> <span style="color:#fbbf24;font-size:11px">← você</span>${rarityBadge}`
          : `<span style="color:#22d3ee">@${u.username}</span>${u.full_name ? `<span style="color:#94a3b8;font-size:11px"> · ${u.full_name}</span>` : ''}${rarityBadge}`;

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

        // Criaturas raras/lendárias se movem mais devagar — tamanho maior já as faz destacar
        const speedMultiplier = rarity === 'legendary' ? 0.25
          : rarity === 'rare'     ? 0.4
          : rarity === 'uncommon' ? 0.65
          : 1.0;
        const speed = (0.5 + Math.random() * 1.0) * speedMultiplier;

        // Zona vertical disponível varia por raridade: grandes ficam longe do teto
        const yMin = rarity === 'legendary' || rarity === 'rare' ? H * 0.35 : 60;

        let x: number, y: number, vx: number, vy: number;
        if (kind === 'crab') {
          x = 40 + Math.random() * (W - 160);
          y = H - 72 - size * 0.7;
          vx = (Math.random() > 0.5 ? 1 : -1) * speed * 0.6;
          vy = 0;
        } else if (kind === 'octopus') {
          x = 40 + Math.random() * (W - 160);
          y = 50 + Math.random() * (H - 220);
          vx = (flipped ? 1 : -1) * speed * 0.4;
          vy = (Math.random() - 0.5) * 0.3;
        } else {
          x = 40 + Math.random() * (W - 160);
          y = yMin + Math.random() * (H - yMin - 120);
          vx = speed * (flipped ? 1 : -1);
          vy = (Math.random() - 0.5) * 0.4 * speedMultiplier;
        }

        const fish: FishState = {
          el, tipEl, bubbleEl,
          username: u.username,
          typeIdx, kind, size,
          x, y, vx, vy,
          flipped,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: kind === 'octopus'
            ? 0.02 + Math.random() * 0.015
            : kind === 'crab'
              ? 0.05 + Math.random() * 0.02
              : rarity === 'legendary' || rarity === 'rare'
                ? 0.015 + Math.random() * 0.01   // grandes se movem mais suavemente
                : 0.035 + Math.random() * 0.03,
          turnTimer: rarity === 'legendary' ? 220 + Math.floor(Math.random() * 200)
            : rarity === 'rare' ? 160 + Math.floor(Math.random() * 180)
            : 100 + Math.floor(Math.random() * 150),
          turnCounter: Math.floor(Math.random() * 100),
          lastMsgTs: 0,
          messageUntil: 0,
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
      const now = Date.now();

      for (const f of fishList.current) {
        f.wobble += f.wobbleSpeed;
        f.turnCounter++;

        const fw = f.el.offsetWidth  || f.size * 2.2;
        const fh = f.el.offsetHeight || f.size;

        const isMyFish = user?.username === f.username;
        const mouse    = mouseRef.current;

        // ── Mouse-follow: só o peixe do usuário logado, só quando mouse está no aquário ──
        if (isMyFish && mouse && f.kind !== 'crab') {
          // Centro do peixe
          const cx = f.x + fw / 2;
          const cy = f.y + fh / 2;
          const dx = mouse.x - cx;
          const dy = mouse.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Velocidade proporcional à distância (mais longe = mais rápido), clamped
          const followSpeed = Math.min(dist * 0.08, 4.5);
          f.vx += (dx / dist) * followSpeed * 0.18;
          f.vy += (dy / dist) * followSpeed * 0.18;

          // Clamp de velocidade máxima
          const maxV = 4;
          const v = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
          if (v > maxV) { f.vx = (f.vx / v) * maxV; f.vy = (f.vy / v) * maxV; }

          // Flip reflete a direção horizontal de movimento
          if (Math.abs(f.vx) > 0.2) f.flipped = f.vx > 0;

          f.x += f.vx;
          f.y += f.vy;

          // Amortecimento
          f.vx *= 0.88;
          f.vy *= 0.88;

        } else if (f.kind === 'crab' || f.kind === 'lobster' || f.kind === 'starfish' || f.kind === 'seaurchin' || f.kind === 'giantclam' ) {
          // Criaturas de fundo — ficam fixas na areia, movimento lateral lento (exceto estáticas)
          if (f.kind !== 'starfish' && f.kind !== 'seaurchin' && f.kind !== 'giantclam' ) {
            if (f.turnCounter >= f.turnTimer) {
              f.turnCounter = 0;
              f.turnTimer = 70 + Math.floor(Math.random() * 130);
              if (f.vx === 0) {
                const dir = Math.random() > 0.5 ? 1 : -1;
                f.vx = dir * (0.3 + Math.random() * 0.5);
              } else if (Math.random() < 0.3) {
                f.vx = 0;
              } else if (Math.random() < 0.4) {
                f.vx = -f.vx;
              }
            }
            f.x += f.vx;
            if (f.x < 8) { f.x = 8; f.vx = Math.abs(f.vx); }
            if (f.x + fw > W - 8) { f.x = W - fw - 8; f.vx = -Math.abs(f.vx); }
          } else if (f.kind === 'starfish' || f.kind === 'seaurchin') {
            // Movimento muito lento, rastejando
            if (f.turnCounter >= f.turnTimer) {
              f.turnCounter = 0;
              f.turnTimer = 200 + Math.floor(Math.random() * 300);
              f.vx = (Math.random() - 0.5) * 0.15;
            }
            f.x += f.vx;
            if (f.x < 8) { f.x = 8; f.vx = Math.abs(f.vx); }
            if (f.x + fw > W - 8) { f.x = W - fw - 8; f.vx = -Math.abs(f.vx); }
          }
          // Ancora todas na areia
          f.y = sandTopY - fh * 0.85 + 4;

        } else if (f.kind === 'jellyfish' || f.kind === 'seahorse' || f.kind === 'nautilus') {
          // Flutuantes verticais — sobem e descem suavemente, derivam levemente na horizontal
          if (f.turnCounter >= f.turnTimer) {
            f.turnCounter = 0;
            f.turnTimer = 120 + Math.floor(Math.random() * 180);
            f.vx = Math.max(-0.4, Math.min(0.4, f.vx + (Math.random() - 0.5) * 0.2));
            f.vy = Math.max(-0.5, Math.min(0.5, (Math.random() - 0.5) * 0.4));
          }
          f.x += f.vx;
          f.y += f.vy + Math.sin(f.wobble) * 0.4;

          if (f.x < 8) { f.x = 8; f.vx = Math.abs(f.vx); }
          if (f.x + fw > W - 8) { f.x = W - fw - 8; f.vx = -Math.abs(f.vx); }
          if (f.y < ceilY) { f.y = ceilY; f.vy = Math.abs(f.vy); }
          if (f.y + fh > floorY) { f.y = floorY - fh; f.vy = -Math.abs(f.vy); }

        } else if (f.kind === 'octopus') {
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

        // ── Bordas para o peixe do usuário logado (o bloco acima não clampeia) ──
        if (isMyFish) {
          if (f.x < 8)            { f.x = 8;            f.vx = Math.abs(f.vx) * 0.5; }
          if (f.x + fw > W - 8)   { f.x = W - fw - 8;   f.vx = -Math.abs(f.vx) * 0.5; }
          if (f.y < ceilY)        { f.y = ceilY;         f.vy = Math.abs(f.vy) * 0.5; }
          if (f.y + fh > floorY)  { f.y = floorY - fh;  f.vy = -Math.abs(f.vy) * 0.5; }
        }

        // ── Colisões ──────────────────────────────────────────────────────────
        // Só calcula colisões a partir do "meu peixe" com os outros, e entre
        // dois peixes de usuários logados. Evita o O(n²) completo.
        if (isMyFish) {
          for (const other of fishList.current) {
            if (other === f) continue;

            const ofw = other.el.offsetWidth  || other.size * 2.2;
            const ofh = other.el.offsetHeight || other.size;

            // Centro de cada criatura
            const ax = f.x + fw / 2;
            const ay = f.y + fh / 2;
            const bx = other.x + ofw / 2;
            const by = other.y + ofh / 2;

            const dx = bx - ax;
            const dy = by - ay;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            // Raio de colisão: soma dos "raios" aproximados de cada criatura
            const radiusA = Math.max(fw, fh) * 0.45;
            const radiusB = Math.max(ofw, ofh) * 0.45;
            const minDist = radiusA + radiusB;

            if (dist < minDist) {
              // Normaliza a direção de empurrão
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = minDist - dist;

              const isOtherLoggedIn = false; // sem multi-login simultâneo visível aqui

              if (isOtherLoggedIn) {
                // Dois peixes de usuários logados: empurrão mútuo simétrico
                const push = overlap * 0.5;
                f.x     -= nx * push; f.y     -= ny * push;
                other.x += nx * push; other.y += ny * push;
                const impulse = 3.5;
                f.vx     -= nx * impulse; f.vy     -= ny * impulse;
                other.vx += nx * impulse; other.vy += ny * impulse;
              } else {
                // Meu peixe empurra o outro com força; o meu não para
                other.x += nx * overlap * 0.9;
                other.y += ny * overlap * 0.9;
                const pushForce = 4.5 + Math.abs(f.vx + f.vy) * 0.4;
                other.vx += nx * pushForce;
                other.vy += ny * pushForce * 0.6;
                // Devolve a velocidade do empurrado pro caranguejo/peixe voltar à posição normal
                other.vx = Math.max(-5, Math.min(5, other.vx));
                other.vy = Math.max(-4, Math.min(4, other.vy));
                // Flip do peixe empurrado conforme direção do empurrão
                if (other.kind !== 'crab' && other.kind !== 'octopus') {
                  if (Math.abs(nx) > 0.3) other.flipped = nx > 0;
                }
              }
            }
          }
        }

        f.el.style.left = f.x + 'px';
        f.el.style.top  = f.y + 'px';
        f.el.innerHTML = CREATURES[f.typeIdx].draw(f.size, f.flipped, f.wobble);

        // Balão de chat: segue o peixe enquanto a mensagem estiver "viva" (25s)
        if (f.messageUntil > now) {
          f.bubbleEl.style.left = (f.x + fw / 2) + 'px';
          f.bubbleEl.style.top  = (f.y - 38) + 'px';
          f.bubbleEl.style.opacity = '1';
        } else if (f.bubbleEl.style.opacity !== '0') {
          f.bubbleEl.style.opacity = '0';
        }
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
        f.bubbleEl.remove();
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
        onMouseMove={e => {
          const rect = wrapRef.current?.getBoundingClientRect();
          if (rect) mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseLeave={() => { mouseRef.current = null; }}
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

      {/* Chat — só aparece pra quem está logado */}
      {user && (
        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-5xl mt-3 flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            maxLength={80}
            placeholder="Diga algo pro aquário e aperte Enter..."
            className="flex-1 px-4 py-2 text-sm rounded-lg outline-none font-mono"
            style={{
              background: 'rgba(10,30,50,0.55)',
              border: '1px solid rgba(34,211,238,0.2)',
              color: '#e6f7ff',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(34,211,238,0.2)')}
          />
          <button
            type="submit"
            disabled={sending || !chatInput.trim()}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition"
            style={{
              background: sending || !chatInput.trim() ? 'rgba(34,211,238,0.3)' : '#22d3ee',
              color: '#040e1a',
              cursor: sending || !chatInput.trim() ? 'default' : 'pointer',
            }}
          >
            Enviar
          </button>
        </form>
      )}

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