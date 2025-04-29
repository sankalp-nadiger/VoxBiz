# VoxBiz 🔊📊

> 🚀 AI-powered voice-to-visualization platform for real-time business insights  
> 🏆 Built during HackToFuture 3.0 | Top 5 Finalist in Industry & Trade Track

VoxBiz enables non-technical decision-makers to interact with their business databases using natural language — either through voice or text — and instantly see real-time data visualizations. From PostgreSQL queries to intelligent graph suggestions, VoxBiz transforms complex data retrieval into a seamless and intuitive experience.

---

## 🌟 Key Features

- 🎙️ **Voice-to-SQL Engine** — Converts natural language (voice or text) into executable SQL queries using NLTK and schema understanding.
- 📊 **Smart Visualization** — Automatically selects the most suitable graph/chart (e.g., bar, line, heatmap, gauges) based on query intent and data shape.
- 🧠 **AI-assisted Prompt Parsing** — Leverages GenAI models to interpret user queries and match them to organizational context.
- 🧾 **Email Reports** — Automatically sends query results and visualizations to the user's team.
- 🔐 **Secure DB Access** — Read/write modes with scoped permissions. Write access users can define rule-based governance logic.
- 📈 **Query History** — Logs queries, voice/text prompts, and execution metadata for audit and review.
- ⚙️ **Rule-Based Engine** — Admin users can define policies to transform/validate AI-generated queries before execution.
- 🌐 **Multi-language Input (Planned)** — Extendable to support diverse languages and dialects.

---

## 💻 Tech Stack

### Frontend:
- **React.js**
- **Three.js** (for immersive chart components)
- **Recharts** (for standard visualizations)
- **Tailwind CSS** (UI styling)

### Backend:
- **Node.js + Express.js**
- **PostgreSQL** (with schema introspection for smart query generation)
- **NLTK** (for prompt parsing and intent extraction)
- **GenAI (Gemini APIs)** for visualization decisions

### Integrations:
- 📩 Nodemailer for email reports
- 🎤 Web Speech API (for voice-to-text)

---

