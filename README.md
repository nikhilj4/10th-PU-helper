# AI Student Chatbot Platform

Production-ready architecture with `Next.js` frontend and `FastAPI` backend.

## Folder Structure

```text
frontend/
  pages/
    _app.tsx                 # Next.js app wrapper and global CSS import
    index.tsx                # Complete user flow: landing -> auth -> profile -> chat
  components/
    AuthModal.tsx            # Name + phone + OTP flow
    ProfileSetup.tsx         # Class and subject selection
    ChatInterface.tsx        # Chat UI + token-aware sending + recharge gate
    RechargeModal.tsx        # Razorpay checkout integration for token recharge
  hooks/
    useAppStore.ts           # Zustand state for session/onboarding/chat
  services/api/
    client.ts                # Axios client with JWT interceptor
    index.ts                 # Typed API wrappers for all required endpoints
  utils/
    subjects.ts              # Class -> subject mapping
  styles/globals.css         # Tailwind base theme styles
  package.json
  .env.example

backend/
  app/
    main.py                  # FastAPI app boot, middleware, global exception handling
    api/
      router.py              # API router aggregator
      deps.py                # JWT auth dependency
      routes/
        auth.py              # /auth/send-otp, /auth/verify-otp
        user.py              # /user/create, /user/profile, /user/tokens
        chat.py              # /chat/query
        payment.py           # /payment/create-order, /payment/verify
    services/
      auth_service.py        # Twilio Verify integration
      user_service.py        # user/profile business logic
      token_service.py       # wallet init/deduct/credit logic
      chat_service.py        # chat orchestration + token enforcement
      payment_service.py     # Razorpay create/verify + idempotent crediting
    pipeline/
      rag_pipeline.py        # Gemini embeddings + Pinecone retrieval + strict-context answer
    models/
      entities.py            # SQLAlchemy models
    schemas/
      *.py                   # Pydantic request/response contracts
    db/
      session.py             # SQLAlchemy engine/session
      base.py                # declarative base
      init_db.py             # creates schema from models
  db/schema.sql              # explicit PostgreSQL schema
  requirements.txt
  railway.toml
  .env.example
  main.py                    # Railway entrypoint
```

## Backend API

- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/user/create`
- `PATCH /api/v1/user/profile`
- `POST /api/v1/chat/query`
- `GET /api/v1/user/tokens`
- `POST /api/v1/payment/create-order`
- `POST /api/v1/payment/verify`

## Local Run

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000
```

## Add Textbooks (RAG Knowledge Base)

1. Put PDFs or text files anywhere (example: `backend/data/`).
2. Ensure backend env has `GEMINI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX`, and `GEMINI_EMBED_MODEL=gemini-embedding-001`.
3. Ingest a book into Pinecone:

```bash
cd backend
source .venv/bin/activate
python scripts/ingest_textbook.py --subject "Mathematics" --file "./data/math.pdf"
```

### Ingest everything in `backend/data/` (auto-subject from filename)

If you renamed files by subject (example: `Mathematics.pdf`, `Physics.pdf`), run:

```bash
cd backend
source .venv/bin/activate
python scripts/ingest_data_folder.py
```

If you don't see progress output, run unbuffered:

```bash
PYTHONUNBUFFERED=1 python scripts/ingest_data_folder.py
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Deployment

### Frontend (Vercel)

1. Import `frontend` as project root in Vercel.
2. Add environment variables from `frontend/.env.example`.
3. Set `NEXT_PUBLIC_API_BASE_URL` to Railway backend URL with `/api/v1`.
4. Deploy.

### Backend (Railway)

1. Create Railway service from this repo with root set to `backend`.
2. Add all environment variables from `backend/.env.example`.
3. Railway uses `railway.toml` start command (`uvicorn app.main:app`).
4. Connect PostgreSQL cloud instance and confirm `DATABASE_URL`.
5. Run schema via `python -m app.db.init_db` once in Railway shell.

## Production Notes

- JWT secures protected endpoints.
- Token wallet starts at `1000` and blocks chat with `402 PAYMENT_REQUIRED` at zero balance.
- Razorpay verification is server-side and idempotent by `razorpay_payment_id`.
- RAG response is constrained to Pinecone-retrieved context.
