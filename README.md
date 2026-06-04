# Fontys ICT Assistent

Een RAG-chatbot (Retrieval-Augmented Generation) voor Fontys ICT-studenten. Studenten kunnen vragen stellen over tentamens, herkansingen, klachten, stages en andere studie-informatie. De assistent haalt relevante informatie op uit de Fontys-schoolgids en genereert een antwoord via een lokaal draaiend taalmodel (Ollama).

## Technologie

| Laag | Technologie |
|------|-------------|
| Backend | Python 3.13 · FastAPI · ChromaDB · Ollama (llama3.1:8b) |
| Embeddings | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Frontend | HTML · Vanilla JavaScript · Tailwind CSS |

---

## Vereisten

Zorg dat het volgende geïnstalleerd is voordat je begint:

- [Python 3.11+](https://www.python.org/downloads/)
- [Ollama](https://ollama.com/) — voor het lokaal draaien van het taalmodel
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (VS Code extensie) — voor de frontend
- Git

---

## Backend starten

### 1. Virtuele omgeving aanmaken en activeren

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac / Linux
source .venv/bin/activate
```

### 2. Dependencies installeren

```bash
pip install fastapi uvicorn chromadb langchain langchain-community \
    sentence-transformers langsmith python-dotenv pypdf
```

### 3. Ollama model downloaden

Zorg dat Ollama actief is en download het model:

```bash
ollama pull llama3.1:8b
```

### 4. Documenten inladen (eenmalig)

Zet de PDF-bestanden in de map `data/raw/` en voer daarna het ingest-script uit om de vectordatabase te vullen:

```bash
python -m scripts.ingest
```

### 5. Backend starten

```bash
uvicorn app.main:app --reload
```

De API is nu bereikbaar op `http://127.0.0.1:8000`.  
Documentatie: `http://127.0.0.1:8000/docs`

---

## Frontend starten

De frontend is een statische HTML-pagina en heeft geen buildstap nodig.

### Met VS Code Live Server (aanbevolen)

1. Open de map `frontend/` in VS Code
2. Klik rechtsonder op **Go Live** (of rechtsklik op `index.html` → *Open with Live Server*)
3. De app opent automatisch op `http://127.0.0.1:5500`

> **Let op:** de frontend verwacht dat de backend draait op `http://127.0.0.1:8000`. Start de backend dus altijd eerst.

---

## Projectstructuur

```
technical/
├── app/
│   ├── api/          # API routes (/ask, /health, /ingest)
│   ├── core/         # Configuratie en prompts
│   ├── models/       # Request/response modellen
│   ├── services/     # RAG-, retrieval- en ingest-logica
│   └── main.py       # FastAPI applicatie
├── frontend/
│   ├── index.html    # Chat-interface
│   └── app.js        # Frontend logica
├── scripts/
│   └── ingest.py     # Script om documenten in te laden
└── data/
    └── raw/          # Hier komen de PDF-bronbestanden
```
