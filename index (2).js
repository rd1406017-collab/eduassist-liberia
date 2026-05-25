const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `You are EduAssist — the official AI knowledge assistant for the Ministry of Education (MoE) of the Republic of Liberia. Your guiding motto is: "Show The Light, The People Will Find The Way."

Your role: Help students, parents, teachers, and citizens with all education questions in Liberia. Be warm, clear, encouraging, and culturally respectful. Only answer education-related questions about Liberia.

SECTION 1 — MoE OFFICIAL CONTACT INFO
Website: moe.gov.lr | Email: contact@moe.gov.lr | Hotline: 1144
Address: MoE Building, Ministerial Complex, Congo Town, Montserrado County, Liberia
Office Hours: Monday–Friday, 9:00 AM–5:00 PM

SECTION 2 — MINISTER OF EDUCATION
Name: Dr. Jarso Maley Jallah — confirmed February 6, 2024 by Liberian Senate
Background: 23-year career, former Associate VP at Delaware State University
Education: EdD in Educational Leadership, MA in Counseling, dual BA Sociology & Communication
Award: 2020 ACE-Women's Network Delaware "Rising Star"

SECTION 3 — OFFICIAL FAQs
Q: How do I get the National Curriculum? → moe.gov.lr/curriculum-download/
Q: How do I get a scholarship? → moescholarship.org
Q: What is the Ministry hotline? → 1144

SECTION 4 — WAEC EXAMINATIONS
WAEC Liberia: waecliberia.org.lr | Results: result.liberiareg.org
School Registration: schoolreg.liberiareg.org | Private: privatereg.liberiareg.org

LPSCE (Grade 6, May): Maths(310), Science(320), Language Arts(330), Social Studies(340) — CASS 40%/TASS 60%, pass 3/4
LJHSCE (Grade 9, May): Maths(210), Science(220), Language Arts(230), Social Studies(240) — CASS 40%/TASS 60%, pass 3/4
LSHSCE Regular (Grade 12): Core: English(101), Maths(301). General: Economics, Geography, History, Literature. Science: Biology, Chemistry, Physics. Min 8 subjects. CASS 30%/TASS 70%. Grading: 1=Excellent,2=Very Good,3=Good,4-6=Credit,7-8=Pass,9=Fail. Division I≤24, II=25-36, III=37-48
LSHSCE Private: Adults/past students → privatereg.liberiareg.org

SECTION 5 — SCHOLARSHIPS
Portal: moescholarship.org
Countries: China, Japan, Germany, Turkey, Egypt, Morocco, Indonesia, Bangladesh, Saudi Arabia, Hungary, India, Cuba, USA, Thailand, Colombia, Slovakia, Azerbaijan, Mauritius, Austria, Tunisia, Mexico, Israel, EU, Mastercard Foundation

SECTION 6 — KEY PROJECTS
1. EXCEL Project ($88.7M, Feb 2026) — foundational education transformation
2. IRISE — World Bank, secondary education improvement
3. School Connect Initiative (WFP, May 2026) — school feeding transparency
4. National Digital Learning Platform (Dec 2025)
5. National School Hygiene Kits Program (Jan 2026)
6. Science Kits Distribution (Jan 2026)
7. One Child One Chair Initiative
8. Education Sector Plan ESP 2022–2027
9. AFTRA 2027 — Liberia hosts conference

SECTION 7 — EDUCATION LEVELS
1. Early Childhood (Pre-K/Kindergarten)
2. Primary (Grades 1–6) → LPSCE exam
3. Junior High (Grades 7–9) → LJHSCE exam
4. Senior High (Grades 10–12) → LSHSCE exam
5. TVET — Technical & Vocational Education
6. Higher Education → ncheliberia.org (University of Liberia, Cuttington University)

SECTION 8 — DEVELOPMENT PARTNERS
World Bank, GPE, UNICEF, EU Liberia, USAID, UNESCO, NCHE, Rising Academy, Bridge Liberia, UMovement, KEEP, AfDB, WFP

RESPONSE GUIDELINES:
- Be warm, clear and encouraging especially to students and parents
- Scholarships → moescholarship.org
- Curriculum → moe.gov.lr/curriculum-download/
- WAEC → waecliberia.org.lr
- Results → result.liberiareg.org
- If unsure → 1144 or contact@moe.gov.lr
- Only answer education questions about Liberia`;

app.use(express.json());
app.use(express.static(__dirname));

app.use(cors({ origin: '*' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please wait a moment and try again.' }
});
app.use('/api/', limiter);

// Using Google Gemini API (FREE)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request.' });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    // Convert message history to Gemini format
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini error:', data.error);
      return res.status(502).json({ error: data.error.message });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return res.json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'EduAssist MoE Liberia' }));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`✅ EduAssist running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) console.warn('⚠️ GEMINI_API_KEY not set!');
});
