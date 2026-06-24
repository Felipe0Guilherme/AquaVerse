#  AquaVerse

> Uma rede social interativa para aquaristas — crie seu perfil, monte seu aquário virtual, interaja com outros usuários em tempo real e explore criaturas com sistema de raridade.

 **[aqua-verse-two.vercel.app](https://aqua-verse-two.vercel.app)**

---

##  Funcionalidades

-  **Aquário virtual personalizado** — cada usuário tem seu próprio aquário com criaturas únicas
-  **Sistema de raridade** — criaturas com classificações Common, Uncommon, Rare, Epic e Legendary
-  **Mouse follow** — o peixe do usuário logado segue o cursor pela tela
-  **Chat em tempo real** — mensagens com speech bubbles animados sobre as criaturas
-  **Autenticação** — cadastro e login com sessão persistente via Supabase Auth
-  **Feed social** — visualize os aquários de outros usuários
-  **Design responsivo** — adaptado para desktop e mobile

---

##  Stack

### Frontend
| Tecnologia | Uso |
|---|---|
| React + TypeScript | Interface e tipagem |
| Vite | Bundler e dev server |
| Tailwind CSS | Estilização |
| Supabase JS Client | Auth e queries ao banco |

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + Express | API REST |
| TypeScript | Tipagem |
| Supabase | Banco de dados PostgreSQL + Auth + RLS |

### Infraestrutura
| Serviço | Finalidade |
|---|---|
| Vercel | Deploy do frontend |
| Railway | Deploy do backend |
| Supabase | Banco de dados e autenticação |

---

##  Estrutura do Projeto

```
AquaVerse/
├── frontend/          # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── package.json
├── backend/           # Express + TypeScript
│   ├── src/
│   └── package.json
├── database/          # Migrações e seeds
├── schema.sql         # Schema do banco de dados
├── vercel.json        # Configuração de deploy
└── package-lock.json
```

---

##  Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/Felipe0Guilherme/AquaVerse.git
cd AquaVerse
```

### 2. Configure o Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env` em `frontend/`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

### 3. Configure o Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` em `backend/`:

```env
PORT=3000
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

```bash
npm run dev
```

### 4. Configure o Banco de Dados

No painel do Supabase, execute o arquivo `schema.sql` no SQL Editor para criar todas as tabelas e políticas RLS.

---

##  Banco de Dados

O projeto utiliza **PostgreSQL via Supabase** com Row Level Security (RLS) habilitado. O schema inclui:

- `users` — perfis de usuários
- `creatures` — criaturas disponíveis com atributos de raridade
- `user_creatures` — criaturas que cada usuário possui em seu aquário
- `messages` — mensagens do chat em tempo real

---

##  Deploy

| Ambiente | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | [aqua-verse-two.vercel.app](https://aqua-verse-two.vercel.app) |
| Backend | Railway | — |
| Banco | Supabase | — |

---

##  Autor

**Felipe Guilherme**
- GitHub: [@Felipe0Guilherme](https://github.com/Felipe0Guilherme)
- Portfolio: [website-portfolio-theta-ashen.vercel.app](https://website-portfolio-theta-ashen.vercel.app)

---
