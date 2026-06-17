# 🔧 Instruções de Correção — AquaMonitor Frontend

## O que foi corrigido e por quê

| Arquivo | Problema | Solução |
|---|---|---|
| `package.json` | lucide-react v1 (API quebrada), recharts v3, vite v8, @vitejs/plugin-react v6 — todas versões incompatíveis entre si | Versões estáveis e compatíveis com Tailwind v4 |
| `vite.config.ts` | Não existia — sem ele o Tailwind v4 não funciona e o alias `@/` não resolve | Criado com `@tailwindcss/vite` plugin + path alias |
| `src/index.css` | Faltavam as variáveis CSS do shadcn e o bloco `@theme` do Tailwind v4 | Adicionadas todas as variáveis + mapeamento `@theme` |
| `components.json` | `"config": "tailwind.config.js"` — no v4 não existe mais esse arquivo | Trocado para `"config": ""` |
| `src/pages/LoginPage.tsx` | Não existia (era um stub) | Criada completa |
| `src/pages/RegisterPage.tsx` | Não existia (era um stub) | Criada completa |
| `src/main.tsx` | Pode não existir dependendo de como o Vite foi iniciado | Criado/confirmado |

---

## Passo a passo

### 1. Substituir os arquivos

Copie cada arquivo desta pasta para o seu projeto, respeitando os caminhos:

```
INSTRUCOES.md              → ignore, só leitura
package.json               → C:\AquaMonitorMVP\frontend\package.json
components.json            → C:\AquaMonitorMVP\frontend\components.json
vite.config.ts             → C:\AquaMonitorMVP\frontend\vite.config.ts       ← NOVO
src/index.css              → C:\AquaMonitorMVP\frontend\src\index.css
src/App.tsx                → C:\AquaMonitorMVP\frontend\src\App.tsx
src/main.tsx               → C:\AquaMonitorMVP\frontend\src\main.tsx
src/pages/LoginPage.tsx    → C:\AquaMonitorMVP\frontend\src\pages\LoginPage.tsx
src/pages/RegisterPage.tsx → C:\AquaMonitorMVP\frontend\src\pages\RegisterPage.tsx
```

Os arquivos que você já tem (AuthContext, ProtectedRoute, api/, types/, hooks/, DashboardPage) **não precisam mudar**.

### 2. Apagar a pasta node_modules e reinstalar

No terminal, dentro de `C:\AquaMonitorMVP\frontend\`:

```bash
# Windows (PowerShell):
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

npm install
```

Isso é necessário porque o `package.json` mudou — as versões antigas ainda estão em cache.

### 3. Corrigir o `.env` do backend (se ainda não fez)

Abra `C:\AquaMonitorMVP\backend\.env` e certifique que a linha não tem espaço:

```env
# ERRADO (tem espaço depois do =):
SUPABASE_SERVICE_ROLE_KEY= eyJhbGci...

# CERTO:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 4. Rodar o projeto

**Terminal 1 — Backend:**
```bash
cd C:\AquaMonitorMVP\backend
npm run dev
# Aguarde: 🐠 AquaMonitor API — Listening on: http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd C:\AquaMonitorMVP\frontend
npm run dev
# Aguarde: Local: http://localhost:5173
```

Acesse `http://localhost:5173` — você vai ver a tela de Login.

---

## Erros comuns e soluções

### `Cannot find module '@tailwindcss/vite'`
```bash
npm install -D @tailwindcss/vite
```

### `Cannot find module 'path'` no vite.config.ts
```bash
npm install -D @types/node
```

### Tela em branco / sem estilos
- Confirme que `src/index.css` começa com `@import "tailwindcss";`
- Confirme que `src/main.tsx` importa `'./index.css'`

### Ícone não encontrado (lucide-react)
O downgrade para `^0.383.0` corrige. Se algum ícone específico der erro, troque por outro similar:
- `FlaskConical` → `Flask` ou `TestTube`
- Consulte: https://lucide.dev/icons/

### Erro CORS no frontend (requisição bloqueada)
Confirme que o backend está rodando na porta 3001 e que o `.env` do backend tem:
```
CLIENT_URL=http://localhost:5173
```

### `401 Unauthorized` em todas as requisições
O cookie HttpOnly não está sendo enviado. Confirme que o `api/client.ts` tem:
```ts
withCredentials: true
```

---

## Próximos passos (depois que estiver rodando)

1. Criar conta em `/register`
2. Criar um aquário manualmente no Supabase Table Editor (a tela de gestão de aquários ainda não foi construída)
3. Adicionar medições via a tela de Logs
4. Ver os gráficos no Dashboard
