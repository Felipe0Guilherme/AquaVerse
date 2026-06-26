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
  // 0 — Palhaço (Clownfish) — laranja com listras brancas e bordas pretas
  (s, f) => `<svg width="${s*2.3}" height="${s*1.35}" viewBox="0 0 46 27" style="transform:scaleX(${f?-1:1})">
    <path d="M17 6 Q22 0 30 2 Q34 0 37 6" fill="#E8521A" stroke="#C03510" stroke-width="0.8"/>
    <path d="M8 13 Q7 4 20 3 Q35 2 41 13 Q34 24 20 24 Q7 22 8 13Z" fill="#FF6B2B" stroke="#C03510" stroke-width="1.3"/>
    <path d="M13 17 Q22 22 36 17 Q38 21 20 23 Q9 22 13 17Z" fill="rgba(255,200,130,0.5)"/>
    <path d="M11 4 Q15 3 16 6 L16 22 Q14 23 11 22 Q9 18 9 13 Q9 8 11 4Z" fill="white" stroke="#222" stroke-width="0.9"/>
    <path d="M25 3 Q28 2 29 5 L29 22 Q27 23 25 22 Q23 5 25 3Z" fill="white" stroke="#222" stroke-width="0.9"/>
    <path d="M17 15 Q12 21 14 24 Q18 21 18 17Z" fill="rgba(232,82,26,0.7)" stroke="#C03510" stroke-width="0.5"/>
    <path d="M41 10 Q50 4 48 13 Q50 22 41 17Z" fill="#E8521A" stroke="#C03510" stroke-width="0.9"/>
    <circle cx="10" cy="11" r="4" fill="white" stroke="#222" stroke-width="0.6"/>
    <circle cx="10.9" cy="11.6" r="2.4" fill="#1a1a1a"/>
    <circle cx="9.7" cy="10.4" r="1" fill="white"/>
    <path d="M5 14 Q6.5 17 9 14" stroke="#C03510" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 1 — Tang Azul (Blue Tang) — azul royal, cauda amarela
  (s, f) => `<svg width="${s*2.3}" height="${s*1.35}" viewBox="0 0 46 27" style="transform:scaleX(${f?-1:1})">
    <path d="M18 5 Q22 0 30 2 Q34 0 37 5" fill="#1565C0" stroke="#0D47A1" stroke-width="0.8"/>
    <path d="M8 13 Q7 4 20 3 Q35 2 41 13 Q34 24 20 24 Q7 22 8 13Z" fill="#1E88E5" stroke="#0D47A1" stroke-width="1.3"/>
    <path d="M12 16 Q22 22 37 17 Q38 21 20 23 Q8 22 12 16Z" fill="rgba(100,190,255,0.35)"/>
    <path d="M29 5 Q38 3 41 13 Q38 23 29 22 Q27 5 29 5Z" fill="#FDD835" stroke="#F9A825" stroke-width="0.7"/>
    <path d="M17 15 Q12 20 14 24 Q18 21 18 17Z" fill="rgba(21,101,192,0.7)"/>
    <path d="M41 10 Q50 5 48 13 Q50 21 41 17Z" fill="#FDD835" stroke="#F9A825" stroke-width="0.8"/>
    <path d="M41 13 L44 11 L44 15Z" fill="rgba(255,255,255,0.3)"/>
    <circle cx="10" cy="11" r="4" fill="white" stroke="#0D47A1" stroke-width="0.6"/>
    <circle cx="10.9" cy="11.6" r="2.4" fill="#1a1a1a"/>
    <circle cx="9.7" cy="10.4" r="1" fill="white"/>
    <path d="M5 14 Q6.5 17 9 14" stroke="#0D47A1" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 2 — Acará Bandeira (Angelfish) — corpo alto, listras preto/dourado
  (s, f) => `<svg width="${s*1.7}" height="${s*1.9}" viewBox="0 0 34 38" style="transform:scaleX(${f?-1:1})">
    <path d="M17 8 L11 0 L17 10Z" fill="#F5C020" stroke="#C49010" stroke-width="0.6"/>
    <path d="M17 30 L11 38 L17 28Z" fill="#F5C020" stroke="#C49010" stroke-width="0.6"/>
    <path d="M7 19 Q6 9 17 7 Q27 9 27 19 Q27 29 17 31 Q6 29 7 19Z" fill="#F5C020" stroke="#C49010" stroke-width="1.3"/>
    <path d="M13 17 Q17 21 17 28 Q14 27 13 24 Q11 22 11 19Z" fill="rgba(255,220,120,0.5)"/>
    <path d="M11 8 Q13 7 14 9 L14 30 Q12 31 11 30 Q9 27 9 19 Q9 11 11 8Z" fill="#1a1a1a"/>
    <path d="M20 8 Q22 7 23 9 L23 30 Q21 31 20 30 Q19 9 20 8Z" fill="#1a1a1a"/>
    <path d="M8 19 L2 14 L2 24Z" fill="#F5C020" stroke="#C49010" stroke-width="0.6"/>
    <path d="M27 19 L32 14 L32 24Z" fill="#F5C020" stroke="#C49010" stroke-width="0.6"/>
    <ellipse cx="9" cy="17" rx="3" ry="4.5" fill="#C49010"/>
    <circle cx="7.5" cy="15.5" r="2.2" fill="white" stroke="#1a1a1a" stroke-width="0.5"/>
    <circle cx="8.1" cy="16" r="1.3" fill="#1a1a1a"/>
    <circle cx="7.4" cy="15.2" r="0.55" fill="white"/>
    <path d="M5 18 Q5.5 20 7 18" stroke="#C49010" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 3 — Betta (Peixe-lutador) — roxo/vermelho, barbatanas ondulantes
  (s, f) => `<svg width="${s*2.8}" height="${s*1.5}" viewBox="0 0 56 30" style="transform:scaleX(${f?-1:1})">
    <path d="M36 10 Q44 0 54 4 Q50 10 54 16 Q44 14 36 18Z" fill="#6A1B9A" stroke="#4A148C" stroke-width="0.7" opacity="0.88"/>
    <path d="M8 6 Q5 15 8 22 Q5 22 2 27 Q4 20 6 18 Q4 14 6 12 Q4 10 6 8Z" fill="#8E24AA" stroke="#4A148C" stroke-width="0.6" opacity="0.85"/>
    <path d="M18 5 Q22 0 28 3" stroke="#CE93D8" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M8 15 Q22 9 36 14 Q30 22 22 22 Q12 22 8 15Z" fill="#9C27B0" stroke="#4A148C" stroke-width="1.3"/>
    <path d="M11 15 Q22 13 35 15" stroke="rgba(206,147,216,0.4)" stroke-width="1" fill="none"/>
    <path d="M10 18 Q14 24 18 23 Q16 19 10 18Z" fill="#AB47BC" opacity="0.75"/>
    <circle cx="10" cy="13" r="3.8" fill="white" stroke="#4A148C" stroke-width="0.5"/>
    <circle cx="10.9" cy="13.5" r="2.2" fill="#1a1a1a"/>
    <circle cx="9.8" cy="12.4" r="0.9" fill="white"/>
    <path d="M6 16 Q7 18.5 9 16" stroke="#4A148C" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 4 — Baiacu (Pufferfish) — redondo, espinhos, olhão expressivo
  (s, f) => `<svg width="${s*1.8}" height="${s*1.55}" viewBox="0 0 36 31" style="transform:scaleX(${f?-1:1})">
    <path d="M16 2 L14 0 M20 1 L20 0 M24 2 L25 0 M11 4 L8 2 M11 27 L8 29 M16 28 L15 31 M22 27 L23 31" stroke="#4CAF50" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="15" r="12.5" fill="#8BC34A" stroke="#558B2F" stroke-width="1.3"/>
    <path d="M7 12 Q16 6 28 12 Q28 20 16 24 Q7 20 7 12Z" fill="rgba(220,255,180,0.45)"/>
    <path d="M28 10 Q34 10 35 15 Q34 20 28 20Z" fill="#7CB342" stroke="#558B2F" stroke-width="0.8"/>
    <circle cx="10.5" cy="13" r="5" fill="white" stroke="#558B2F" stroke-width="0.7"/>
    <circle cx="11.5" cy="13.5" r="3.2" fill="#1a1a1a"/>
    <circle cx="10.3" cy="12.1" r="1.3" fill="white"/>
    <path d="M4 18 Q5.5 21 7.5 18" stroke="#33691E" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="22" cy="14" r="1.4" fill="#558B2F" opacity="0.35"/>
    <circle cx="26" cy="12" r="1" fill="#558B2F" opacity="0.3"/>
    <circle cx="19" cy="20" r="1" fill="#558B2F" opacity="0.3"/>
  </svg>`,

  // 5 — Donzela (Damselfish) — azul com cauda amarela
  (s, f) => `<svg width="${s*2.1}" height="${s*1.3}" viewBox="0 0 42 26" style="transform:scaleX(${f?-1:1})">
    <path d="M16 5 Q20 0 26 2 Q30 0 33 5" fill="#1565C0" stroke="#0D47A1" stroke-width="0.8"/>
    <path d="M7 13 Q6 4 19 3 Q33 2 38 13 Q31 23 19 23 Q6 22 7 13Z" fill="#1E88E5" stroke="#0D47A1" stroke-width="1.3"/>
    <path d="M26 4 Q35 2 38 13 Q35 23 26 22 Q24 5 26 4Z" fill="#FDD835" stroke="#F9A825" stroke-width="0.8"/>
    <path d="M10 16 Q19 21 30 17 Q32 20 19 22 Q8 21 10 16Z" fill="rgba(100,180,255,0.3)"/>
    <path d="M16 15 Q11 20 13 23 Q17 21 17 17Z" fill="rgba(21,101,192,0.7)"/>
    <path d="M38 10 Q46 6 44 13 Q46 20 38 17Z" fill="#FDD835" stroke="#F9A825" stroke-width="0.8"/>
    <circle cx="9" cy="11" r="3.8" fill="white" stroke="#0D47A1" stroke-width="0.6"/>
    <circle cx="9.9" cy="11.6" r="2.2" fill="#1a1a1a"/>
    <circle cx="8.8" cy="10.5" r="0.9" fill="white"/>
    <path d="M5 14 Q6.5 16.5 9 14" stroke="#0D47A1" stroke-width="1" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 6 — Sardinha prateada — metálica, bando escolar
  (s, f) => `<svg width="${s*2.5}" height="${s*0.9}" viewBox="0 0 50 18" style="transform:scaleX(${f?-1:1})">
    <path d="M7 9 Q6 3 21 2 Q38 1 44 9 Q38 16 21 16 Q6 15 7 9Z" fill="#B8D0E0" stroke="#7A9AB8" stroke-width="1"/>
    <path d="M9 11 Q26 15 42 11 Q40 15 21 16 Q8 15 9 11Z" fill="rgba(255,255,255,0.55)"/>
    <path d="M9 7 Q26 4 42 7" stroke="rgba(100,160,220,0.35)" stroke-width="1.5" fill="none"/>
    <path d="M22 2 Q30 9 22 16" stroke="rgba(80,130,180,0.25)" stroke-width="1.5" fill="none"/>
    <path d="M32 2 Q39 9 32 16" stroke="rgba(80,130,180,0.2)" stroke-width="1.2" fill="none"/>
    <path d="M44 7 Q52 4 50 9 Q52 14 44 11Z" fill="#B8D0E0" stroke="#7A9AB8" stroke-width="0.8"/>
    <ellipse cx="26" cy="9" rx="4" ry="1.2" fill="rgba(255,255,255,0.55)" transform="rotate(-20 26 9)"/>
    <circle cx="8" cy="8" r="3.2" fill="white" stroke="#7A9AB8" stroke-width="0.5"/>
    <circle cx="8.7" cy="8.4" r="1.9" fill="#1a1a1a"/>
    <circle cx="7.8" cy="7.5" r="0.8" fill="white"/>
    <path d="M4 10 Q5 12 7 10" stroke="#7A9AB8" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 7 — Peixe Dourado (Goldfish) — laranja/dourado, barbatanas fluidas
  (s, f) => `<svg width="${s*2.4}" height="${s*1.4}" viewBox="0 0 48 28" style="transform:scaleX(${f?-1:1})">
    <path d="M18 6 Q23 0 30 3 Q34 1 37 6" fill="#D4820A" stroke="#A85500" stroke-width="0.8"/>
    <path d="M8 14 Q7 5 21 4 Q36 3 42 14 Q36 25 21 25 Q7 24 8 14Z" fill="#F0970C" stroke="#A85500" stroke-width="1.3"/>
    <path d="M13 18 Q23 24 37 18 Q39 22 21 24 Q8 23 13 18Z" fill="rgba(255,220,120,0.55)"/>
    <path d="M18 5 Q24 9 22 14" stroke="rgba(160,90,5,0.2)" stroke-width="2" fill="none"/>
    <path d="M28 4 Q34 8 32 14" stroke="rgba(160,90,5,0.15)" stroke-width="1.5" fill="none"/>
    <path d="M16 16 Q11 22 13 26 Q17 23 17 18Z" fill="rgba(210,120,10,0.7)"/>
    <path d="M42 10 Q54 2 52 14 Q54 26 42 18Z" fill="#E08A08" stroke="#A85500" stroke-width="0.9"/>
    <path d="M43 14 Q50 11 49 14 Q50 17 43 14Z" fill="rgba(255,255,255,0.2)"/>
    <circle cx="10" cy="12" r="4.2" fill="white" stroke="#A85500" stroke-width="0.6"/>
    <circle cx="10.9" cy="12.6" r="2.5" fill="#1a1a1a"/>
    <circle cx="9.7" cy="11.4" r="1" fill="white"/>
    <path d="M5 15 Q6.5 18 9 15" stroke="#A85500" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 8 — Peixe-borboleta (Butterflyfish) — branco/preto/amarelo, olho camuflado
  (s, f) => `<svg width="${s*2.2}" height="${s*1.5}" viewBox="0 0 44 30" style="transform:scaleX(${f?-1:1})">
    <path d="M17 6 Q22 0 28 3 Q32 1 35 6" fill="#FDD835" stroke="#F9A825" stroke-width="0.8"/>
    <path d="M17 26 Q22 30 28 27 Q32 30 35 26" fill="#FDD835" stroke="#F9A825" stroke-width="0.6"/>
    <path d="M8 15 Q7 6 20 5 Q36 4 40 15 Q35 26 20 26 Q7 25 8 15Z" fill="#FFFDE7" stroke="#F9A825" stroke-width="1.3"/>
    <path d="M12 7 Q14 5 16 7 L16 24 Q13 25 12 24 Q10 21 10 15 Q10 9 12 7Z" fill="#212121"/>
    <path d="M25 5 Q27 4 28 6 L28 25 Q26 26 25 25 Q24 5 25 5Z" fill="#212121"/>
    <path d="M8 15 Q12 19 18 16 Q16 12 8 15Z" fill="rgba(255,230,100,0.4)"/>
    <path d="M40 11 Q46 8 44 15 Q46 22 40 19Z" fill="#FDD835" stroke="#F9A825" stroke-width="0.8"/>
    <circle cx="9.5" cy="13.5" r="4" fill="white" stroke="#F9A825" stroke-width="0.5"/>
    <circle cx="10.4" cy="13.5" r="2.3" fill="#1a1a1a"/>
    <circle cx="9.4" cy="12.5" r="1" fill="white"/>
    <path d="M5 16 Q6.5 18.5 9 16" stroke="#C88A00" stroke-width="1" fill="none" stroke-linecap="round"/>
    <circle cx="8" cy="10.5" r="2.2" fill="#1a1a1a" opacity="0.3"/>
  </svg>`,

  // 9 — Neon Tetra — corpo escuro, faixa elétrica azul e barriga vermelha
  (s, f) => `<svg width="${s*2.5}" height="${s*0.88}" viewBox="0 0 50 17.5" style="transform:scaleX(${f?-1:1})">
    <path d="M8 8.5 Q7 3 21 2 Q38 1 44 8.5 Q38 15 21 15 Q7 14 8 8.5Z" fill="#0D1B2A" stroke="#071020" stroke-width="0.9"/>
    <path d="M8 7.5 Q28 5 44 8" stroke="#00E5FF" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.95"/>
    <path d="M8 9.5 Q20 12 38 9.5 Q40 13 21 14 Q8 13 8 9.5Z" fill="#E53935" opacity="0.88"/>
    <path d="M44 6 Q50 3 48 8.5 Q50 14 44 11Z" fill="#0D1B2A" stroke="#071020" stroke-width="0.7"/>
    <circle cx="8.5" cy="7.5" r="3.2" fill="white" stroke="#071020" stroke-width="0.5"/>
    <circle cx="9.2" cy="7.9" r="1.9" fill="#1a1a1a"/>
    <circle cx="8.3" cy="7" r="0.8" fill="white"/>
    <path d="M4 9.5 Q5.2 11.5 7.5 9.5" stroke="#071020" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 10 — Imperador (Emperor Angelfish) — azul com faixas amarelas diagonais
  (s, f) => `<svg width="${s*2.2}" height="${s*1.4}" viewBox="0 0 44 28" style="transform:scaleX(${f?-1:1})">
    <path d="M16 6 Q20 0 28 3 Q32 1 35 6" fill="#1A237E" stroke="#0D1A6E" stroke-width="0.8"/>
    <path d="M8 14 Q7 5 20 4 Q36 3 40 14 Q34 24 20 24 Q7 23 8 14Z" fill="#1565C0" stroke="#0D47A1" stroke-width="1.3"/>
    <path d="M11 6 Q16 10 20 6 Q24 10 28 6 Q32 10 36 7" stroke="#FDD835" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M10 13 Q18 17 26 13 Q30 17 36 14" stroke="#FDD835" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M11 20 Q18 23 26 20 Q30 23 36 21" stroke="#FDD835" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M40 10 Q48 6 46 14 Q48 22 40 18Z" fill="#FDD835" stroke="#F9A825" stroke-width="0.8"/>
    <path d="M16 15 Q11 20 13 24 Q17 22 17 17Z" fill="rgba(21,101,192,0.7)"/>
    <ellipse cx="9" cy="13" rx="3.5" ry="5" fill="#0D47A1"/>
    <circle cx="7.5" cy="11.5" r="3.8" fill="white" stroke="#0D1A6E" stroke-width="0.6"/>
    <circle cx="8.3" cy="12" r="2.2" fill="#1a1a1a"/>
    <circle cx="7.3" cy="11" r="0.9" fill="white"/>
    <path d="M5 14 Q6.5 16.5 8.5 14" stroke="#0D1A6E" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  </svg>`,

  // 11 — Peixe-leão (Lionfish) — creme com faixas vermelhas e espinhos venenosos
  (s, f) => `<svg width="${s*2.6}" height="${s*1.9}" viewBox="0 0 52 38" style="transform:scaleX(${f?-1:1})">
    <path d="M18 10 L16 2 M22 9 L21 1 M26 9 L27 1 M31 10 L33 2" stroke="#C62828" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M10 23 L6 31 M13 26 L10 33 M16 27 L14 34" stroke="#C62828" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M9 20 L4 22 M10 16 L5 16 M10 12 L5 10" stroke="#C62828" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M9 18 Q8 9 23 8 Q39 7 44 18 Q38 29 22 29 Q8 28 9 18Z" fill="#FAFAFA" stroke="#C62828" stroke-width="1.3"/>
    <path d="M13 18 Q22 24 34 18 Q36 22 22 27 Q9 26 13 18Z" fill="rgba(220,180,160,0.45)"/>
    <path d="M12 10 Q14 8 15 11 L15 27 Q13 28 12 27 Q10 24 10 18 Q10 13 12 10Z" fill="#C62828"/>
    <path d="M22 8 Q24 7 25 9 L25 28 Q23 29 22 28 Q21 9 22 8Z" fill="#C62828"/>
    <path d="M32 9 Q34 8 35 10 L35 27 Q33 28 32 27 Q31 9 32 9Z" fill="#C62828"/>
    <path d="M44 14 Q50 10 49 18 Q50 26 44 22Z" fill="#FAFAFA" stroke="#C62828" stroke-width="0.9"/>
    <circle cx="11" cy="16" r="4.2" fill="white" stroke="#C62828" stroke-width="0.6"/>
    <circle cx="11.9" cy="16.5" r="2.5" fill="#1a1a1a"/>
    <circle cx="10.7" cy="15.3" r="1.05" fill="white"/>
    <path d="M6 19 Q7.5 22.5 10.5 19" stroke="#C62828" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </svg>`,
];

// ════════════════════════════════════════════════════════════════
// PEIXES ÓSSEOS EXTRAS
// ════════════════════════════════════════════════════════════════

// Cavalo-marinho — fica em pé, nada verticalmente
const drawSeahorse: DrawFn = (s, f, phase) => {
  const sway = Math.sin(phase * 0.7) * 4;
  return `<svg width="${s*0.95}" height="${s*2.3}" viewBox="0 0 19 46" style="transform:rotate(${sway}deg) scaleX(${f?-1:1})">
    <path d="M9 6 Q15 9 14 17 Q14 26 11 32 Q9 38 10 44" stroke="#C8901A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M9 6 Q3 9 4 17 Q4 26 7 32" stroke="#E0AA2A" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M9 6 Q15 9 14 17 Q14 26 11 32 Q9 38 10 44" stroke="rgba(255,220,120,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M7 10 Q5 9 3 11 M7 14 Q5 13 3 14 M7 18 Q5 17 3 18 M7 22 Q5 21 3 22 M8 26 Q6 25 4 26" stroke="#B07A10" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="9" cy="5" r="4.5" fill="#D4A020" stroke="#A07010" stroke-width="1"/>
    <ellipse cx="9" cy="3" rx="3" ry="1.5" fill="#E0B830" opacity="0.6"/>
    <path d="M9 0 Q13 2 12 5" stroke="#C8901A" stroke-width="1.2" fill="none"/>
    <path d="M10 44 Q13 46 15 44 Q13 48 10 46 Z" fill="#A07010"/>
    <circle cx="6.5" cy="4.5" r="1.8" fill="white" stroke="#A07010" stroke-width="0.5"/>
    <circle cx="7" cy="4.8" r="1.1" fill="#1a1a1a"/>
    <circle cx="6.5" cy="4.2" r="0.45" fill="white"/>
    <path d="M14 19 L18 18 M14 23 L18 22 M14 27 L18 27" stroke="#C8901A" stroke-width="1.2" fill="none" stroke-linecap="round"/>
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
const drawGiantClam: DrawFn = (s, _f, phase) => {
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
  const flap = Math.sin(phase * 0.6) * 9;
  return `<svg width="${s*2.4}" height="${s*1.85}" viewBox="0 0 48 37" style="transform:scaleX(${f?-1:1})">
    <path d="M14 18 L5 ${11+flap} M14 19 L4 ${24-flap}" stroke="#2E7D32" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M34 18 L43 ${11+flap} M34 19 L44 ${24-flap}" stroke="#2E7D32" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M22 29 L20 35 L24 35 L26 29" stroke="#2E7D32" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M14 14 Q24 9 34 14 Q34 27 24 31 Q14 27 14 14Z" fill="#388E3C" stroke="#1B5E20" stroke-width="1.3"/>
    <path d="M24 10 Q34 12 34 20" stroke="#1B5E20" stroke-width="1.2" fill="none" opacity="0.6"/>
    <path d="M14 20 Q24 22 34 20" stroke="#1B5E20" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M19 10 Q24 9 29 10 Q24 12 19 10Z" fill="#1B5E20" opacity="0.5"/>
    <path d="M17 14 Q20 12 23 14 Q20 16 17 14Z" fill="#1B5E20" opacity="0.35"/>
    <path d="M25 14 Q28 12 31 14 Q28 16 25 14Z" fill="#1B5E20" opacity="0.35"/>
    <path d="M16 20 Q19 18 22 20 Q19 22 16 20Z" fill="#1B5E20" opacity="0.3"/>
    <path d="M26 20 Q29 18 32 20 Q29 22 26 20Z" fill="#1B5E20" opacity="0.3"/>
    <ellipse cx="13" cy="18" rx="5.5" ry="6.5" fill="#2E7D32"/>
    <circle cx="10.5" cy="15.5" r="2.5" fill="white" stroke="#1B5E20" stroke-width="0.5"/>
    <circle cx="11.2" cy="16" r="1.5" fill="#1a1a1a"/>
    <circle cx="10.6" cy="15.3" r="0.6" fill="white"/>
    <path d="M8 20 Q9 22 12 21" stroke="#1B5E20" stroke-width="0.9" fill="none" stroke-linecap="round"/>
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
  const arc = Math.sin(phase * 0.5) * 3;
  return `<svg width="${s*3}" height="${s*1.7}" viewBox="0 0 60 34" style="transform:scaleX(${f?-1:1})">
    <path d="M5 ${18+arc} Q18 ${9+arc} 36 ${13+arc} Q52 ${11+arc} 56 ${18+arc} Q50 ${23+arc} 36 ${24+arc} Q20 ${26+arc} 8 ${22+arc}Z" fill="#5B7F96" stroke="#3D5F76" stroke-width="1.1"/>
    <path d="M10 ${21+arc} Q30 ${27+arc} 52 ${21+arc} Q50 ${26+arc} 32 ${28+arc} Q14 ${27+arc} 10 ${21+arc}Z" fill="rgba(220,240,255,0.45)"/>
    <ellipse cx="36" cy="${15+arc}" rx="11" ry="4" fill="#7AA0BA" opacity="0.35"/>
    <path d="M28 ${10+arc} Q32 ${3+arc} 38 ${10+arc}Z" fill="#3D5F76" stroke="#3D5F76" stroke-width="0.8"/>
    <path d="M56 ${18+arc} L62 ${13+arc} L62 ${23+arc}Z" fill="#3D5F76"/>
    <path d="M46 ${24+arc} L48 ${31+arc} L53 ${24+arc}Z" fill="#3D5F76"/>
    <path d="M14 ${22+arc} L9 ${28+arc} L18 ${23+arc}Z" fill="#4A7090"/>
    <ellipse cx="7" cy="${18+arc}" rx="5" ry="5.5" fill="#4A7090"/>
    <path d="M4 ${16+arc} Q6 ${12+arc} 10 ${15+arc}" stroke="#7ABFE0" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="5.5" cy="${16+arc}" r="2.8" fill="white" stroke="#3D5F76" stroke-width="0.5"/>
    <circle cx="6.2" cy="${16.5+arc}" r="1.7" fill="#1a1a1a"/>
    <circle cx="5.5" cy="${15.7+arc}" r="0.7" fill="white"/>
    <path d="M3 ${19+arc} Q4 ${21.5+arc} 7 ${19.5+arc}" stroke="#3D5F76" stroke-width="1" fill="none" stroke-linecap="round"/>
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
  const pulse = 1 + Math.sin(phase * 0.5) * 0.1;
  const tentacles = Array.from({length: 8}, (_, i) => {
    const bx = 7 + i * 4.4;
    const w1 = Math.sin(phase + i * 0.9) * 7;
    const w2 = Math.sin(phase * 0.8 + i) * 5;
    const len = 22 + Math.sin(phase * 0.35 + i) * 5;
    return `<path d="M${bx} 18 Q${bx+w1} ${18+len*0.5} ${bx+w2*0.6} ${18+len}" stroke="rgba(180,100,240,0.55)" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  }).join('');
  const oralArms = Array.from({length: 4}, (_, i) => {
    const bx = 13 + i * 6;
    const w = Math.sin(phase * 0.7 + i) * 4;
    return `<path d="M${bx} 18 Q${bx+w} 26 ${bx+w*0.5} 32" stroke="rgba(210,150,255,0.75)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }).join('');
  return `<svg width="${s*1.8}" height="${s*2.3}" viewBox="0 0 42 46" style="transform:scale(${pulse.toFixed(3)})">
    ${tentacles}
    ${oralArms}
    <path d="M5 15 Q21 2 37 15 Q37 20 21 22 Q5 20 5 15Z" fill="rgba(160,80,220,0.78)" stroke="rgba(200,120,255,0.5)" stroke-width="0.8"/>
    <path d="M5 15 Q21 4 37 15" fill="none" stroke="rgba(240,200,255,0.45)" stroke-width="3"/>
    <ellipse cx="21" cy="10" rx="10" ry="4" fill="rgba(220,160,255,0.35)"/>
    <path d="M10 15 Q21 12 32 15" stroke="rgba(220,160,255,0.5)" stroke-width="1.5" fill="none"/>
    <path d="M8 14 Q21 11 34 14" stroke="rgba(255,200,255,0.3)" stroke-width="1" fill="none"/>
  </svg>`;
};
// ── Caranguejo — anda de lado na areia, corpo sempre de frente p/ câmera (não precisa flip) ──
const drawCrab: DrawFn = (s, _flipped, phase) => {
  const legs = [0, 1, 2].map(i => {
    const bx = 9 - i * 4.2;
    const sw = Math.sin(phase + i * 1.4) * 3;
    return `
      <path d="M${bx} 12 Q${bx-3} ${17+sw} ${bx-4} ${22+sw}" stroke="#B5341A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="${bx-4}" cy="${22+sw}" r="1.2" fill="#8D1F05"/>
      <path d="M${42-bx} 12 Q${42-bx+3} ${17-sw} ${42-bx+4} ${22-sw}" stroke="#B5341A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="${42-bx+4}" cy="${22-sw}" r="1.2" fill="#8D1F05"/>`;
  }).join('');
  return `<svg width="${s*1.7}" height="${s*1.05}" viewBox="0 0 44 28">
    ${legs}
    <path d="M8 13 Q8 5 22 4 Q36 5 36 13 Q36 21 22 23 Q8 21 8 13Z" fill="#D84315" stroke="#8D1F05" stroke-width="1.3"/>
    <path d="M10 10 Q22 7 34 10" stroke="rgba(0,0,0,0.18)" stroke-width="1.2" fill="none"/>
    <path d="M11 14 Q22 11 33 14" stroke="rgba(0,0,0,0.12)" stroke-width="1" fill="none"/>
    <path d="M12 18 Q22 22 32 18 Q30 22 22 23 Q12 22 12 18Z" fill="rgba(255,160,100,0.4)"/>
    <path d="M8 11 Q3 5 0 9 Q2 14 0 17 Q4 14 8 15Z" fill="#C62828" stroke="#8D1F05" stroke-width="1.1"/>
    <path d="M0 9 Q-2 7 -1 10 Q-2 13 0 12" fill="#EF5350" stroke="#8D1F05" stroke-width="0.7"/>
    <path d="M36 11 Q41 5 44 9 Q42 14 44 17 Q40 14 36 15Z" fill="#C62828" stroke="#8D1F05" stroke-width="1.1"/>
    <path d="M44 9 Q46 7 45 10 Q46 13 44 12" fill="#EF5350" stroke="#8D1F05" stroke-width="0.7"/>
    <line x1="15" y1="4" x2="13" y2="0" stroke="#8D1F05" stroke-width="1.6"/>
    <circle cx="13" cy="-0.5" r="2.4" fill="white" stroke="#8D1F05" stroke-width="0.6"/>
    <circle cx="13.5" cy="-0.1" r="1.4" fill="#1a1a1a"/>
    <circle cx="12.8" cy="-0.8" r="0.6" fill="white"/>
    <line x1="29" y1="4" x2="31" y2="0" stroke="#8D1F05" stroke-width="1.6"/>
    <circle cx="31" cy="-0.5" r="2.4" fill="white" stroke="#8D1F05" stroke-width="0.6"/>
    <circle cx="31.5" cy="-0.1" r="1.4" fill="#1a1a1a"/>
    <circle cx="30.8" cy="-0.8" r="0.6" fill="white"/>
    <path d="M17 20 Q22 22.5 27 20" stroke="#8D1F05" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  </svg>`;
};

// ── Polvo — manto redondo e grande, tentáculos abertos em leque com ventosas; corpo simétrico, não precisa flip ──
const drawOctopus: DrawFn = (s, _flipped, phase) => {
  const tentacles = Array.from({ length: 8 }, (_, i) => {
    const spread = (i - 3.5) / 3.5;
    const bx = 20 + spread * 14;
    const wave1 = Math.sin(phase + i * 0.9) * 6;
    const wave2 = Math.sin(phase * 0.8 + i * 1.2) * 4;
    const len = 26 + Math.sin(phase * 0.3 + i) * 3;
    const w = 5 - Math.abs(spread) * 1.5;
    const mx = bx + spread * 4 + wave1 * 0.7;
    const tx = bx + spread * 6 + wave2 * 0.4;
    const suckers = [0.4, 0.68, 0.88].map(t => {
      const sx = (bx + (mx - bx) * t + (tx - mx) * Math.max(0, t - 0.5)).toFixed(1);
      const sy = (22 + len * t).toFixed(1);
      return `<circle cx="${sx}" cy="${sy}" r="1.3" fill="#e0aaff" opacity="0.75"/>`;
    }).join('');
    return `
      <path d="M${(bx-w/2).toFixed(1)} 21
               C${(mx-w/3).toFixed(1)} ${(22+len*0.45).toFixed(1)} ${(mx-w/4).toFixed(1)} ${(22+len*0.7).toFixed(1)} ${tx.toFixed(1)} ${(22+len).toFixed(1)}
               C${(mx+w/4).toFixed(1)} ${(22+len*0.7).toFixed(1)} ${(mx+w/3).toFixed(1)} ${(22+len*0.45).toFixed(1)} ${(bx+w/2).toFixed(1)} 21Z"
            fill="#9C27B0" stroke="#6A1B9A" stroke-width="0.5"/>
      ${suckers}`;
  }).join('');
  const pulse = 1 + Math.sin(phase * 0.5) * 0.035;
  return `<svg width="${s*1.7}" height="${s*1.65}" viewBox="0 0 40 52" style="transform:scale(${pulse.toFixed(3)})">
    ${tentacles}
    <path d="M5 18 Q4 4 20 2 Q36 4 35 18 Q36 26 28 28 Q20 32 12 28 Q4 26 5 18Z" fill="#BA68C8" stroke="#6A1B9A" stroke-width="1.2"/>
    <path d="M7 12 Q20 8 33 12" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
    <ellipse cx="20" cy="6" rx="8" ry="3" fill="rgba(206,147,216,0.4)"/>
    <circle cx="13" cy="15" r="4.2" fill="white" stroke="#6A1B9A" stroke-width="0.6"/>
    <circle cx="14" cy="15.6" r="2.5" fill="#1a1a1a"/>
    <circle cx="12.8" cy="14.5" r="1.05" fill="white"/>
    <circle cx="27" cy="15" r="4.2" fill="white" stroke="#6A1B9A" stroke-width="0.6"/>
    <circle cx="28" cy="15.6" r="2.5" fill="#1a1a1a"/>
    <circle cx="26.8" cy="14.5" r="1.05" fill="white"/>
    <path d="M16 25 Q20 27 24 25" stroke="#6A1B9A" stroke-width="1" fill="none" stroke-linecap="round"/>
  </svg>`;
};

// ── Tubarão — grande, fluido, boca mostrando dentes ──────────────────────────
const drawShark: DrawFn = (s, f, _p) => `<svg width="${s*3.2}" height="${s*1.4}" viewBox="0 0 64 28" style="transform:scaleX(${f?-1:1})">
  <path d="M4 14 Q6 5 22 7 Q40 4 56 14 Q48 18 32 19 Q16 20 8 18 Z" fill="#5D7FA8" stroke="#3A5A82" stroke-width="1"/>
  <path d="M10 17 Q32 22 52 17 Q48 21 32 22 Q12 22 10 17Z" fill="#ECEFF1" opacity="0.85"/>
  <path d="M22 7 L28 0 L34 7Z" fill="#4A6A90" stroke="#3A5A82" stroke-width="0.8"/>
  <path d="M8 18 L4 25 L16 19Z" fill="#4A6A90" stroke="#3A5A82" stroke-width="0.7"/>
  <path d="M56 14 L64 10 L64 18Z" fill="#5D7FA8" stroke="#3A5A82" stroke-width="0.8"/>
  <path d="M38 19 L40 25 L45 19Z" fill="#4A6A90" stroke="#3A5A82" stroke-width="0.7"/>
  <path d="M16 18 L14 22 L20 19Z" fill="#4A6A90"/>
  <path d="M15 8 Q17 12 15 16" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" fill="none"/>
  <path d="M20 7 Q22 11 20 15" stroke="rgba(0,0,0,0.1)" stroke-width="1.2" fill="none"/>
  <ellipse cx="7" cy="13" rx="3.5" ry="4.5" fill="#4A6A90"/>
  <path d="M4 15 Q5 18 8 17 Q6 20 5 18" stroke="white" stroke-width="1" fill="none" stroke-linecap="round"/>
  <line x1="5" y1="17" x2="6.5" y2="18.5" stroke="white" stroke-width="0.8"/>
  <line x1="6.8" y1="17.5" x2="8" y2="18.8" stroke="white" stroke-width="0.8"/>
  <circle cx="5.5" cy="11" r="2.2" fill="white" stroke="#3A5A82" stroke-width="0.5"/>
  <circle cx="6.1" cy="11.4" r="1.3" fill="#111"/>
  <circle cx="5.4" cy="10.6" r="0.6" fill="white"/>
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
const drawOrca: DrawFn = (s, f, _p) => `<svg width="${s*3.5}" height="${s*1.9}" viewBox="0 0 70 38" style="transform:scaleX(${f?-1:1})">
  <path d="M5 19 Q14 8 34 10 Q54 8 64 19 Q56 24 40 26 Q22 27 8 23Z" fill="#1A1A1A" stroke="#111" stroke-width="1"/>
  <path d="M12 19 Q28 25 52 20 Q48 26 34 27 Q16 26 12 19Z" fill="#FAFAFA"/>
  <ellipse cx="10" cy="15" rx="5" ry="6.5" fill="#FAFAFA"/>
  <ellipse cx="32" cy="20" rx="9" ry="3.5" fill="#424242" opacity="0.45"/>
  <path d="M32 10 L38 0 L44 10Z" fill="#1A1A1A" stroke="#111" stroke-width="1"/>
  <path d="M8 23 L4 32 L18 24Z" fill="#1A1A1A"/>
  <path d="M64 19 L70 14 L70 24Z" fill="#1A1A1A"/>
  <path d="M46 26 L49 34 L55 26Z" fill="#1A1A1A"/>
  <circle cx="9" cy="12" r="3.2" fill="white"/>
  <circle cx="9.8" cy="12.5" r="1.9" fill="#111"/>
  <circle cx="9.1" cy="11.7" r="0.8" fill="white"/>
  <path d="M6 20 Q8 23 14 21" stroke="#555" stroke-width="0.9" fill="none"/>
</svg>`;

// ── Baleia-azul ───────────────────────────────────────────────────────────────
const drawWhale: DrawFn = (s, f, phase) => {
  const tailWag = Math.sin(phase * 0.4) * 4;
  return `<svg width="${s*5}" height="${s*2.2}" viewBox="0 0 100 44" style="transform:scaleX(${f?-1:1})">
    <path d="M6 22 Q18 10 50 12 Q78 10 92 22 Q82 28 58 30 Q28 32 10 28Z" fill="#1E5D8A" stroke="#144070" stroke-width="1.2"/>
    <path d="M10 24 Q40 32 86 24 Q80 32 50 34 Q20 32 10 24Z" fill="rgba(200,230,255,0.45)"/>
    <ellipse cx="48" cy="16" rx="22" ry="5" fill="#2D7AB0" opacity="0.35"/>
    <path d="M30 12 Q38 8 46 12" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M92 20 L100 ${15+tailWag} Q102 ${19+tailWag} 100 ${23+tailWag} L92 24Z" fill="#144070" stroke="#144070" stroke-width="0.5"/>
    <path d="M100 ${15+tailWag} Q106 ${12+tailWag} 104 ${17+tailWag} Q106 ${22+tailWag} 100 ${23+tailWag}" fill="#1E5D8A"/>
    <path d="M62 30 L66 38 L74 30Z" fill="#144070"/>
    <path d="M10 28 L4 34 L18 30Z" fill="#144070"/>
    <ellipse cx="9" cy="14" rx="3.5" ry="5" fill="#144070"/>
    <path d="M8 16 Q10 10 16 13" stroke="rgba(255,255,255,0.35)" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="7.5" cy="13" r="3" fill="white" stroke="#144070" stroke-width="0.5"/>
    <circle cx="8.3" cy="13.5" r="1.8" fill="#1a1a1a"/>
    <circle cx="7.6" cy="12.7" r="0.75" fill="white"/>
    <ellipse cx="26" cy="10" rx="5" ry="2" fill="rgba(255,255,255,0.18)"/>
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
  const flap = Math.sin(phase * 0.6) * 5;
  return `<svg width="${s*3.5}" height="${s*2.1}" viewBox="0 0 70 42" style="transform:scaleX(${f?-1:1})">
    <path d="M35 21 Q18 ${12+flap} 4 23 Q14 ${31-flap} 35 23Z" fill="#1B2A3A" stroke="#111828" stroke-width="0.8"/>
    <path d="M35 21 Q52 ${12+flap} 66 23 Q56 ${31-flap} 35 23Z" fill="#1B2A3A" stroke="#111828" stroke-width="0.8"/>
    <path d="M35 21 Q18 ${13+flap} 4 23 Q14 ${30-flap} 35 22.5Z" fill="#2C4A66" opacity="0.4"/>
    <path d="M35 21 Q52 ${13+flap} 66 23 Q56 ${30-flap} 35 22.5Z" fill="#2C4A66" opacity="0.4"/>
    <path d="M26 21 Q35 17 44 21 Q44 26 35 27 Q26 26 26 21Z" fill="#253545"/>
    <path d="M35 23 Q38 32 40 42" stroke="#1B2A3A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="20" rx="3.5" ry="2.5" fill="#111" opacity="0.55"/>
    <ellipse cx="40" cy="20" rx="3.5" ry="2.5" fill="#111" opacity="0.55"/>
    <path d="M28 18 Q30 15 34 16" stroke="#4A6A8A" stroke-width="1.2" fill="none"/>
    <path d="M36 16 Q40 15 42 18" stroke="#4A6A8A" stroke-width="1.2" fill="none"/>
    <circle cx="29" cy="19" r="1.5" fill="white" stroke="#111" stroke-width="0.4"/>
    <circle cx="29.6" cy="19.4" r="0.9" fill="#1a1a1a"/>
    <circle cx="41" cy="19" r="1.5" fill="white" stroke="#111" stroke-width="0.4"/>
    <circle cx="41.6" cy="19.4" r="0.9" fill="#1a1a1a"/>
    <ellipse cx="35" cy="25" rx="5" ry="1.5" fill="rgba(200,230,255,0.15)"/>
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
  typeCounts: Map<number, number>,
  shuffleSeed: number,   // muda a cada roleta do admin → hash diferente → criatura diferente
  maxPerType = 2
): number {
  // Incorpora o seed no hash: seed=0 mantém o comportamento original
  const input = shuffleSeed > 0 ? `${username}:${shuffleSeed}` : username;
  let hash = 0;
  for (const c of input) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  const poolLen = CREATURE_POOL.length;
  const startPos = Math.abs(hash) % poolLen;

  let hash2 = 0;
  for (const c of input) hash2 = (hash2 * 17 + c.charCodeAt(0)) & 0xffffffff;
  const step = (Math.abs(hash2) % (poolLen - 1)) + 1;

  for (let i = 0; i < poolLen; i++) {
    const pos = (startPos + i * step) % poolLen;
    const idx = CREATURE_POOL[pos];
    if ((typeCounts.get(idx) ?? 0) < maxPerType) return idx;
  }
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

  // ── Gamificação ───────────────────────────────────────────────
  // XP / nível por usuário
  const [xpMap, setXpMap]       = useState<Record<string, {xp:number; level:number}>>({});
  // Alimentação
  const [feeding, setFeeding]   = useState(false);
  const foodRef                  = useRef<{x:number;y:number;until:number}|null>(null);
  // Humor do aquário
  const [msgCount, setMsgCount] = useState(0);
  const msgCountRef              = useRef(0);
  // Toast de avistamento
  const [sighting, setSighting] = useState<string|null>(null);
  const seenLegendaryRef        = useRef<Set<string>>(new Set());

  const LEGENDARY_KINDS: CreatureKind[] = ['whale','whaleshark','krill','seaslug'];

  // Humor calculado a partir de usuários online e mensagens recentes
  const aquariumMood = (() => {
    const u = users.length;
    const m = msgCount;
    if (u === 0)   return { emoji:'🌊', label:'Aquário vazio',     color:'rgba(100,150,200,0.7)' };
    if (u >= 10 && m >= 8)  return { emoji:'🎉', label:'Festa no recife!', color:'rgba(250,200,50,0.9)' };
    if (m >= 5)             return { emoji:'🌊', label:'Aquário agitado',  color:'rgba(34,211,238,0.85)' };
    if (u >= 5)             return { emoji:'🐠', label:'Aquário cheio',    color:'rgba(100,220,180,0.85)' };
    if (m === 0 && u <= 2)  return { emoji:'😴', label:'Aquário quieto',   color:'rgba(150,180,220,0.65)' };
    return                         { emoji:'🐡', label:'Aquário tranquilo',color:'rgba(120,200,160,0.75)' };
  })();

  // Busca XP/nível de todos os usuários
  const fetchXp = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{success:boolean;data:Record<string,{xp:number;level:number}>}>('/gamification/xp');
      setXpMap(data.data ?? {});
      // Detecta lendários recém-avistados
      for (const f of fishList.current) {
        if (LEGENDARY_KINDS.includes(f.kind) && !seenLegendaryRef.current.has(f.username)) {
          seenLegendaryRef.current.add(f.username);
          const label = f.kind === 'whale' ? 'Baleia-azul' : f.kind === 'whaleshark' ? 'Tubarão-baleia' : f.kind === 'krill' ? 'Krill' : 'Lesma-do-mar';
          setSighting(`🌟 Uma ${label} foi avistada! É de @${f.username}`);
          setTimeout(() => setSighting(null), 5000);
        }
      }
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    fetchXp();
    const interval = setInterval(fetchXp, 10_000);
    return () => clearInterval(interval);
  }, [fetchXp]);

  // Alimentação: lança comida e concede XP
  const handleFeed = async () => {
    if (feeding || !user || !wrapRef.current) return;
    setFeeding(true);
    const rect  = wrapRef.current.getBoundingClientRect();
    const foodX = 60 + Math.random() * (rect.width - 120);
    const foodY = rect.height * 0.4 + Math.random() * (rect.height * 0.25);
    foodRef.current = { x: foodX, y: foodY, until: Date.now() + 4000 };
    try {
      await apiClient.post('/gamification/feed');
      await fetchXp();
    } catch { /* ignore */ }
    setTimeout(() => { foodRef.current = null; setFeeding(false); }, 4200);
  };

  // Integra alimentação no loop — peixes nadam em direção à comida
  const foodRefStable = foodRef;


  // ── Admin: roleta de criaturas ────────────────────────────────
  const ADMIN_USERNAME = 'Sonim';
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const lastSeedRef = useRef(0);
  const [reshuffling, setReshuffling] = useState(false);

  const fetchShuffleSeed = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { seed: number } }>('/admin/shuffle-seed');
      const newSeed = data.data?.seed ?? 0;
      if (newSeed !== lastSeedRef.current) {
        lastSeedRef.current = newSeed;
        setShuffleSeed(newSeed);
      }
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    fetchShuffleSeed();
    const interval = setInterval(fetchShuffleSeed, 4_000);
    return () => clearInterval(interval);
  }, [fetchShuffleSeed]);

  const handleReshuffle = async () => {
    if (reshuffling) return;
    setReshuffling(true);
    try {
      await apiClient.post('/admin/reshuffle');
      await fetchShuffleSeed(); // aplica imediatamente pro próprio admin
    } catch { /* silently ignore */ }
    finally { setTimeout(() => setReshuffling(false), 1500); }
  };

  // Busca mensagens recentes (últimos ~30s) e atualiza o balão do peixe correspondente.
  // Usa lastMsgTs por peixe pra não "renovar" o balão a cada poll enquanto a msg
  // ainda estiver dentro da janela do backend — só atualiza se for de fato uma msg nova.
  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        data: { username: string; text: string; created_at: string }[];
      }>('/messages/recent');

      const msgs = data.data ?? [];
      // Conta mensagens recentes pra calcular humor do aquário
      msgCountRef.current = msgs.length;
      setMsgCount(msgs.length);

      for (const m of msgs) {
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

  // Spawna peixes quando a lista de usuários mudar ou quando o admin aciona a roleta
  useEffect(() => {
    if (!wrapRef.current || loading) return;
    const wrap = wrapRef.current;

    // Quando o seed muda (roleta do admin), remove TODOS os peixes pra re-sortear
    if (shuffleSeed > 0 && fishList.current.length > 0) {
      fishList.current.forEach(f => { f.el.remove(); f.tipEl.remove(); f.bubbleEl.remove(); });
      fishList.current = [];
    }

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
      const reservedTypeIdx = getCreatureType(u.username, typeCounts, shuffleSeed);
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
  }, [users, loading, user, shuffleSeed]);

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

        // ── Atração pela comida ───────────────────────────────────────────────
        const food = foodRefStable.current;
        if (food && food.until > now && f.kind !== 'crab' && !isMyFish) {
          const cx = f.x + fw / 2, cy = f.y + fh / 2;
          const dx = food.x - cx, dy = food.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const pull = Math.min(dist * 0.06, 3.5);
          f.vx += (dx / dist) * pull * 0.22;
          f.vy += (dy / dist) * pull * 0.22;
          const maxV = 3.5;
          const v = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
          if (v > maxV) { f.vx = (f.vx / v) * maxV; f.vy = (f.vy / v) * maxV; }
          if (Math.abs(f.vx) > 0.2) f.flipped = f.vx > 0;
        }


        // ── Badge de nível (XP) acima do peixe ───────────────────────────────
      const userData = xpMap[f.username];
      const level = userData?.level ?? 1;
        // Cor da borda por nível: cinza < 5, verde < 10, azul < 20, roxo < 30, dourado 30+
        const lvlColor = level >= 30 ? '#FFD700' : level >= 20 ? '#A855F7' : level >= 10 ? '#3B82F6' : level >= 5 ? '#22C55E' : '#9CA3AF';
        // Anel ao redor do peixe para lendários de alto nível
        const glowRing = LEGENDARY_KINDS.includes(f.kind) && level >= 5
          ? `box-shadow:0 0 ${6+level/2}px ${lvlColor}, 0 0 ${12+level}px rgba(${lvlColor},0.3);`
          : '';
        f.el.style.cssText = `position:absolute;cursor:pointer;z-index:10;user-select:none;left:${f.x}px;top:${f.y}px;${glowRing}`;

        f.el.innerHTML = CREATURES[f.typeIdx].draw(f.size, f.flipped, f.wobble)
          + (level > 1 ? `<div style="
              position:absolute;top:-18px;left:50%;transform:translateX(-50%);
              background:rgba(8,20,36,0.88);border:1px solid ${lvlColor};
              color:${lvlColor};font-size:9px;font-weight:700;font-family:monospace;
              padding:1px 5px;border-radius:8px;white-space:nowrap;pointer-events:none;
              letter-spacing:0.5px;">Lv${level}</div>` : '');

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
          background: 'linear-gradient(180deg, #020d1a 0%, #041628 18%, #062240 38%, #083060 58%, #0a3f78 78%, #0c4888 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(34,211,238,0.15)',
          boxShadow: '0 0 80px rgba(8,40,100,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 120px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* ── Gradiente de profundidade (camadas sobrepostas) ── */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20,80,160,0.35) 0%, transparent 70%)', pointerEvents:'none', zIndex:1 }}/>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(0,60,120,0.2) 0%, transparent 65%)', pointerEvents:'none', zIndex:1 }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(0,0,0,0.45) 0%, transparent 45%)', pointerEvents:'none', zIndex:1 }}/>

        {/* ── Raios de luz volumétricos ── */}
        {[8,22,38,54,68,82].map((x,i) => (
          <div key={i} style={{
            position:'absolute', top:0, left:`${x}%`,
            width:`${30+i*8}px`, height:'65%',
            background:`linear-gradient(180deg, rgba(120,200,255,${0.03+i%3*0.012}) 0%, transparent 100%)`,
            transform:`skewX(${-18+i*7}deg)`,
            transformOrigin:'top center',
            pointerEvents:'none', zIndex:2,
            animation:`lightray ${6+i*1.3}s ease-in-out ${i*0.8}s infinite alternate`,
          }}/>
        ))}

        {/* ── Partículas flutuantes (plâncton) ── */}
        {Array.from({length:22},(_,i)=>(
          <div key={i} style={{
            position:'absolute',
            width:`${1+i%3}px`, height:`${1+i%3}px`,
            borderRadius:'50%',
            background:`rgba(${180+i%60},${220+i%35},255,${0.15+i%4*0.06})`,
            left:`${2+i*4.4}%`,
            top:`${8+i%5*14}%`,
            pointerEvents:'none', zIndex:2,
            animation:`plankton ${8+i*0.9}s ease-in-out ${i*0.55}s infinite alternate`,
          }}/>
        ))}

        {/* ── Bolhas animadas ── */}
        {Array.from({length:16},(_,i)=>(
          <div key={i} style={{
            position:'absolute',
            width:`${2+(i%5)*2.5}px`, height:`${2+(i%5)*2.5}px`,
            borderRadius:'50%',
            border:`1px solid rgba(180,230,255,${0.25+i%3*0.08})`,
            background:`radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18), rgba(255,255,255,0.02))`,
            left:`${3+i*6}%`,
            bottom:`${62+(i%5)*30}px`,
            pointerEvents:'none', zIndex:3,
            animation:`rise ${5+i*0.7}s ease-in ${i*0.9}s infinite`,
          }}/>
        ))}

        {/* ── Pedras no fundo ── */}
        {[4,14,28,42,57,70,82,92].map((x,i)=>(
          <div key={i} style={{
            position:'absolute',
            bottom:`${52+(i%3)*6}px`,
            left:`${x}%`,
            width:`${18+i%4*12}px`, height:`${12+i%3*8}px`,
            borderRadius:`${5+i%3*3}px ${8+i%4*3}px ${3+i%2*4}px ${6+i%3*3}px`,
            background:`linear-gradient(145deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)`,
            boxShadow:`0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)`,
            zIndex:3,
          }}/>
        ))}

        {/* ── Corais SVG ── */}
        {/* Coral ramo (branch coral) */}
        {[6,34,66,88].map((x,i)=>(
          <svg key={i} style={{position:'absolute',bottom:'52px',left:`${x}%`,zIndex:4,pointerEvents:'none'}}
               width={28+i%2*14} height={50+i%3*20} viewBox="0 0 28 60">
            <path d="M14 60 Q13 48 12 36 Q8 28 4 18 Q2 10 6 4" stroke={i%2?'#C2185B':'#D32F2F'} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M14 60 Q15 46 16 32 Q20 24 24 14 Q26 8 22 2" stroke={i%2?'#E91E63':'#F44336'} strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M13 45 Q9 40 5 36" stroke={i%2?'#AD1457':'#B71C1C'} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M15 38 Q20 33 23 28" stroke={i%2?'#AD1457':'#B71C1C'} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M12 30 Q8 26 6 20" stroke={i%2?'#C2185B':'#D32F2F'} strokeWidth="2" fill="none" strokeLinecap="round"/>
            {[4,6,36,18].map((y,j)=>(
              <circle key={j} cx={[6,22,5,23][j]} cy={y} r="2.5" fill={i%2?'#F48FB1':'#FF8A80'} opacity="0.9"/>
            ))}
          </svg>
        ))}
        {/* Coral cogumelo (brain coral) */}
        {[20,52,78].map((x,i)=>(
          <svg key={i} style={{position:'absolute',bottom:'52px',left:`${x}%`,zIndex:4,pointerEvents:'none'}}
               width={34+i*8} height={26+i*6} viewBox="0 0 40 30">
            <ellipse cx="20" cy="18" rx="18" ry="12" fill={['#F57F17','#E65100','#BF360C'][i]} stroke={['#E65100','#BF360C','#8D1100'][i]} strokeWidth="1"/>
            <ellipse cx="20" cy="18" rx="18" ry="12" fill="none" stroke={['#FFA000','#FF6D00','#DD2C00'][i]} strokeWidth="0.8" strokeDasharray="3,2"/>
            {[0,1,2,3,4].map(j=>(
              <path key={j} d={`M${6+j*7} 18 Q${9+j*7} 12 ${12+j*7} 18`} stroke={['#FFD740','#FFAB40','#FF6E40'][i%3]} strokeWidth="1.5" fill="none"/>
            ))}
            <ellipse cx="20" cy="18" rx="14" ry="8" fill="rgba(255,200,100,0.15)"/>
          </svg>
        ))}
        {/* Coral tubular */}
        {[44,92].map((x,i)=>(
          <svg key={i} style={{position:'absolute',bottom:'52px',left:`${x}%`,zIndex:4,pointerEvents:'none'}}
               width={36} height={55} viewBox="0 0 36 55">
            {[0,1,2,3].map(j=>(
              <g key={j}>
                <path d={`M${6+j*8} 55 Q${5+j*8} ${30+j%2*8} ${4+j*8} ${20-j*3}`} stroke="#7B1FA2" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
                <circle cx={4+j*8} cy={20-j*3} r="3.5" fill="#CE93D8"/>
                <circle cx={4+j*8} cy={20-j*3} r="1.5" fill="#F3E5F5"/>
              </g>
            ))}
          </svg>
        ))}

        {/* ── Algas / plantas orgânicas ── */}
        {[3,11,19,29,40,51,61,71,80,90].map((x,i)=>(
          <svg key={i} style={{position:'absolute',bottom:'52px',left:`${x}%`,zIndex:4,pointerEvents:'none',
            animation:`seaweed ${2.2+i%4*0.6}s ease-in-out ${i*0.25}s infinite alternate`}}
               width={14+i%3*8} height={55+i%4*22} viewBox={`0 0 ${14+i%3*8} ${55+i%4*22}`}>
            {(()=>{
              const h=55+i%4*22, c=['#1B5E20','#2E7D32','#388E3C','#1565C0','#0D47A1'][i%5];
              return(<>
                <path d={`M${7+i%3*4} ${h} Q${4+i%2*6} ${h*0.6} ${8+i%3*3} ${h*0.3} Q${5+i%4*3} ${h*0.1} ${9+i%2*2} 0`}
                  stroke={c} strokeWidth={3+i%3} fill="none" strokeLinecap="round" opacity="0.9"/>
                <path d={`M${7+i%3*4} ${h} Q${10+i%2*4} ${h*0.55} ${6+i%3*4} ${h*0.25}`}
                  stroke={['#4CAF50','#66BB6A','#42A5F5','#1E88E5','#43A047'][i%5]} strokeWidth={2+i%2} fill="none" strokeLinecap="round" opacity="0.7"/>
              </>);
            })()}
          </svg>
        ))}

        {/* ── Areia texturizada ── */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'60px',
          background:'linear-gradient(180deg, #C9A96E 0%, #B8935A 40%, #8B6914 100%)',
          borderRadius:'0 0 20px 20px',
          boxShadow:'inset 0 4px 12px rgba(0,0,0,0.35)',
          zIndex:5,
        }}>
          {/* Ondulações e sombras na areia */}
          {[5,20,36,52,66,80,93].map((x,i)=>(
            <div key={i} style={{
              position:'absolute', top:'-6px', left:`${x}%`,
              width:`${50+i%3*30}px`, height:'14px',
              background:'#C9A96E',
              borderRadius:'50%',
              boxShadow:'0 -2px 6px rgba(0,0,0,0.2)',
            }}/>
          ))}
          <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'rgba(0,0,0,0.15)',borderRadius:'50%'}}/>
        </div>

        {/* CSS das novas animações */}
        <style>{`
          @keyframes lightray {
            0%   { opacity: 0.6; transform: skewX(var(--sk, -10deg)) scaleX(1); }
            100% { opacity: 1;   transform: skewX(var(--sk, -10deg)) scaleX(1.15); }
          }
          @keyframes plankton {
            0%   { transform: translate(0,0); opacity:0.6; }
            50%  { transform: translate(3px,-8px); opacity:1; }
            100% { transform: translate(-3px,4px); opacity:0.5; }
          }
          @keyframes seaweed {
            0%   { transform-origin: bottom center; transform: rotate(-8deg); }
            100% { transform-origin: bottom center; transform: rotate(8deg); }
          }
        `}</style>

        {/* ── Humor do aquário ── */}
        <div style={{
          position:'absolute', top:'12px', left:'14px', zIndex:20,
          display:'flex', alignItems:'center', gap:'6px',
          background:'rgba(8,20,36,0.75)', border:`1px solid ${aquariumMood.color}`,
          borderRadius:'20px', padding:'4px 12px', pointerEvents:'none',
          boxShadow:`0 0 12px rgba(0,0,0,0.3)`,
        }}>
          <span style={{fontSize:'15px'}}>{aquariumMood.emoji}</span>
          <span style={{fontSize:'11px', fontFamily:'monospace', color: aquariumMood.color, fontWeight:600}}>
            {aquariumMood.label}
          </span>
        </div>

        {/* ── Toast de avistamento lendário ── */}
        {sighting && (
          <div style={{
            position:'absolute', top:'50px', left:'50%', transform:'translateX(-50%)',
            zIndex:25, background:'rgba(8,20,36,0.95)',
            border:'1px solid #FFD700', borderRadius:'12px',
            padding:'8px 18px', color:'#FFD700', fontSize:'13px',
            fontFamily:'monospace', fontWeight:700, whiteSpace:'nowrap',
            boxShadow:'0 0 24px rgba(255,215,0,0.4)',
            animation:'fadeInOut 5s ease forwards',
          }}>
            {sighting}
          </div>
        )}

        {/* ── Comida animada ── */}
        {feeding && foodRef.current && (
          <>
            {Array.from({length:8},(_,i)=>(
              <div key={i} style={{
                position:'absolute',
                left: `${foodRef.current!.x + (i-3.5)*14}px`,
                top: `${foodRef.current!.y - 20}px`,
                fontSize: `${10+i%3*4}px`,
                zIndex:18, pointerEvents:'none',
                animation:`foodfall ${0.6+i*0.15}s ease-in ${i*0.08}s forwards`,
              }}>
                {['🦐','🐟','🍤','🦐','🐠','🍤','🦐','🐟'][i]}
              </div>
            ))}
            <div style={{
              position:'absolute',
              left:`${foodRef.current.x - 24}px`,
              top:`${foodRef.current.y - 8}px`,
              fontSize:'28px', zIndex:18, pointerEvents:'none',
              animation:'foodpulse 0.6s ease-in-out infinite alternate',
            }}>🍤</div>
          </>
        )}


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
        <div className="w-full max-w-5xl mt-3 flex flex-col gap-2">

          {/* Barra de XP / nível do usuário logado */}
          {(() => {
            const me = xpMap[user.username];
            if (!me) return null;
            const xpInLevel = me.xp % 100;
            const lvlColor = me.level >= 30 ? '#FFD700' : me.level >= 20 ? '#A855F7' : me.level >= 10 ? '#3B82F6' : me.level >= 5 ? '#22C55E' : '#9CA3AF';
            return (
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'11px', fontFamily:'monospace', color: lvlColor, minWidth:'52px', fontWeight:700 }}>
                  Lv {me.level}
                </span>
                <div style={{ flex:1, height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'4px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${xpInLevel}%`, background:`linear-gradient(90deg, ${lvlColor}, #fff)`, borderRadius:'4px', transition:'width 0.5s ease' }}/>
                </div>
                <span style={{ fontSize:'10px', fontFamily:'monospace', color:'rgba(150,180,220,0.7)', minWidth:'68px', textAlign:'right' }}>
                  {me.xp} XP total
                </span>
              </div>
            );
          })()}

          <form onSubmit={handleSendMessage} className="flex gap-2">
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

          {/* Botão alimentar */}
          <button
            type="button"
            onClick={handleFeed}
            disabled={feeding}
            title="Alimentar os peixes (+25 XP)"
            className="px-3 py-2 text-lg rounded-lg transition"
            style={{
              background: feeding ? 'rgba(255,180,60,0.25)' : 'rgba(255,160,40,0.18)',
              border: `1px solid rgba(255,180,60,${feeding?0.2:0.45})`,
              cursor: feeding ? 'default' : 'pointer',
              animation: feeding ? 'spin 1s linear infinite' : 'none',
            }}
          >
            🍤
          </button>

          {/* Botão de roleta — visível só pro admin (Sonim) */}
          {user.username === ADMIN_USERNAME && (
            <button
              type="button"
              onClick={handleReshuffle}
              disabled={reshuffling}
              title="Rolar a roleta — todos os peixes trocam de espécie"
              className="px-3 py-2 text-sm font-bold rounded-lg transition"
              style={{
                background: reshuffling ? 'rgba(251,191,36,0.3)' : 'linear-gradient(135deg,#f59e0b,#ef4444)',
                color: '#fff', cursor: reshuffling ? 'default' : 'pointer',
                boxShadow: reshuffling ? 'none' : '0 0 12px rgba(245,158,11,0.5)',
                fontSize: '18px', lineHeight: 1,
                animation: reshuffling ? 'spin 0.6s linear infinite' : 'none',
              }}
            >
              🎲
            </button>
          )}
        </form>
        </div>
      )}

      {/* Rodapé */}
      <p className="mt-4 text-xs" style={{ color: 'rgba(100,130,160,0.5)', fontFamily: 'monospace' }}>
        novo membro = novo peixe · atualiza a cada 30s
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes rise {
          0%   { transform: translateY(0) translateX(0); opacity: 0.7; }
          50%  { transform: translateY(-180px) translateX(6px); opacity: 0.3; }
          100% { transform: translateY(-420px) translateX(-4px); opacity: 0; }
        }
        @keyframes foodfall {
          0%   { transform: translateY(-30px) scale(0.6); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(30px) scale(1.1); opacity: 0.85; }
        }
        @keyframes foodpulse {
          0%   { transform: scale(1); filter: drop-shadow(0 0 4px rgba(255,180,60,0.7)); }
          100% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(255,180,60,0.9)); }
        }
        @keyframes fadeInOut {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          12%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          75%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}