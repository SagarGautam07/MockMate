const OpenAI = require('openai');

const SYSTEM_PROMPT =
  'You are an experienced technical interviewer asking coding interview questions and evaluating answers.';
const MODEL = 'qwen/qwen3.5-122b-a10b';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

if (!process.env.NVIDIA_API_KEY) {
  console.warn('NVIDIA_API_KEY not set - AI evaluation will use fallback scoring');
}

let client = null;

function getNormalizedApiKey() {
  return String(process.env.NVIDIA_API_KEY || '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

function getClient() {
  const apiKey = getNormalizedApiKey();

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not configured');
  }

  if (!client) {
    client = new OpenAI({
      baseURL: BASE_URL,
      apiKey,
    });
  }

  return client;
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sanitizeAiText(input) {
  const text = String(input || '');
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) =>
      line
        .replace(/^[-*#>\s]+/, '')
        .replace(/\*\*/g, '')
        .trim()
    )
    .filter(Boolean)
    .filter(
      (line) =>
        !/^(now let me|let me create|final comprehensive report|executive summary|report date|tested by)/i.test(
          line
        )
    );

  return lines.join(' ').replace(/\s+/g, ' ').trim();
}

function extractCompletionText(response) {
  const content = response?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('')
      .trim();
  }

  return '';
}

function isRetriableAiError(err) {
  const status = err?.status || err?.response?.status;
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createInterviewCompletion(userPrompt, options = {}) {
  if (!getNormalizedApiKey()) {
    throw new Error('NVIDIA_API_KEY is not configured');
  }

  const maxAttempts = options.maxAttempts ?? 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await getClient().chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        timeout: options.timeoutMs ?? 12000,
      });

      const text = extractCompletionText(response);
      if (!text) {
        throw new Error('Empty response from NVIDIA Qwen API');
      }

      return text;
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts || !isRetriableAiError(err)) {
        break;
      }
      await sleep(700 * attempt);
    }
  }

  throw lastError;
}

async function generateQuestions(interviewType, difficulty, role, count = 5) {
  const prompt = `You are interviewing a candidate for a ${role} position.

Generate exactly ${count} ${difficulty}-level ${interviewType} interview questions.

Rules:
- Questions must be realistic and commonly asked in actual Indian tech company interviews
- Match the difficulty: Beginner = concepts and definitions, Intermediate = application and problem-solving, Advanced = architecture, trade-offs, and deep expertise
- For Technical: focus on the specific technologies relevant to ${role}
- For Behavioral: use STAR-method-friendly prompts
- For System Design: give a concrete system to design
- For HR: practical workplace and career questions
- Make each question a single clear sentence ending with a question mark
- Do NOT number the questions
- Do NOT add any preamble or explanation

Return ONLY a valid JSON array of exactly ${count} strings. Example:
["Question one?", "Question two?"]`;

  try {
    const text = await createInterviewCompletion(prompt, {
      temperature: 0.4,
      maxTokens: 450,
      maxAttempts: 1,
      timeoutMs: 12000,
    });

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from NVIDIA Qwen API');
    }

    return questions
      .map((q) => sanitizeAiText(q))
      .filter(Boolean)
      .slice(0, count);
  } catch (err) {
    console.error('Qwen question generation failed:', err.message);
    return getFallbackQuestions(interviewType, difficulty);
  }
}

async function evaluateAnswer(question, answer, role, difficulty, interviewType) {
  if (!answer || answer.trim().length < 10) {
    return {
      score: 20,
      strengths: [],
      improvements: [
        'Your answer was too short or empty',
        'Always attempt to answer even if uncertain',
        'Use the STAR method for structured responses',
      ],
      suggestion:
        'You did not provide a meaningful answer. In a real interview, always attempt a response. Even a partial answer shows your thought process. Try to say what you know and acknowledge what you are still learning.',
    };
  }

  const prompt = `Evaluate this ${difficulty}-level ${interviewType} interview answer for a ${role} position.

QUESTION: "${question}"

CANDIDATE ANSWER: "${answer}"

Return ONLY a valid JSON object with this exact structure:
{
  "score": <integer between 0 and 100>,
  "strengths": [<2-3 specific positive points>],
  "improvements": [<2-3 specific areas to improve>],
  "suggestion": "<one paragraph of constructive, actionable feedback>"
}

Scoring guide:
- 90-100: Exceptional
- 75-89: Good
- 60-74: Average
- 40-59: Below average
- 0-39: Poor

Be fair and constructive. ${difficulty === 'Beginner' ? 'Be lenient for a fresher or beginner.' : ''}
${difficulty === 'Advanced' ? 'Be rigorous and expect depth.' : ''}`;

  try {
    const raw = await createInterviewCompletion(prompt, {
      temperature: 0.2,
      maxTokens: 500,
      maxAttempts: 1,
      timeoutMs: 12000,
    });

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`No JSON object in NVIDIA Qwen response: ${raw.slice(0, 120)}`);
    }

    const parsed = JSON.parse(match[0]);

    return {
      score: Math.round(Math.max(0, Math.min(100, Number(parsed.score) || 50))),
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.map((s) => sanitizeAiText(s)).filter(Boolean).slice(0, 3)
        : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.map((s) => sanitizeAiText(s)).filter(Boolean).slice(0, 3)
        : [],
      suggestion:
        sanitizeAiText(parsed.suggestion || '') ||
        'The AI evaluation service is currently returning incomplete feedback. Try answering with more structure and specific examples.',
    };
  } catch (err) {
    console.error('Qwen answer evaluation failed:', err.message);
    const score = Math.min(75, Math.max(30, Math.floor(answer.trim().length / 5)));
    return {
      score,
      strengths: ['You attempted the question'],
      improvements: ['Add more specific examples', 'Structure your answer more clearly'],
      suggestion:
        'AI evaluation is temporarily unavailable. Based on your response length, you appear to have engaged with the question. In a real interview, focus on concrete examples using the STAR method (Situation, Task, Action, Result).',
    };
  }
}

function getFallbackQuestions(type, difficulty) {
  const banks = {
    Technical: {
      Beginner: [
        'What is the difference between var, let, and const in JavaScript?',
        'Explain what a REST API is.',
        'What is the purpose of version control like Git?',
        'What is the difference between HTML, CSS, and JavaScript?',
        'Explain what a database is and why we use one.',
      ],
      Intermediate: [
        'Explain closures in JavaScript with an example.',
        'How does the event loop work in Node.js?',
        'What are React hooks? Explain useState and useEffect.',
        'What is the difference between SQL and NoSQL databases?',
        'How does HTTPS work?',
      ],
      Advanced: [
        'Explain micro-frontend architecture and its trade-offs.',
        'How would you design a distributed rate limiter?',
        'What is the CAP theorem and how does it affect system design?',
        'Explain memory management and garbage collection in V8.',
        'How would you implement zero-downtime deployments?',
      ],
    },
    Behavioral: {
      Beginner: [
        'Tell me about yourself and why you chose software development.',
        'Describe a time you worked in a team.',
        'What are your strengths and areas for growth?',
        'Why are you interested in this role?',
        'Describe a challenge you faced and how you solved it.',
      ],
      Intermediate: [
        'Tell me about a time you had to meet a tight deadline.',
        'Describe a conflict with a teammate and how you resolved it.',
        'Give an example of when you took initiative on a project.',
        'How do you prioritize tasks when everything is urgent?',
        'Describe a project you are most proud of.',
      ],
      Advanced: [
        'Tell me about a time you made a critical decision with incomplete information.',
        'Describe how you have influenced others without having direct authority.',
        'How have you handled a failure or missed expectation?',
        'Give an example of how you have mentored someone.',
        'Describe your approach to managing ambiguity.',
      ],
    },
    'System Design': {
      Beginner: [
        'What is the difference between vertical and horizontal scaling?',
        'Explain what a load balancer does.',
        'What is a CDN and when would you use one?',
        'Describe the difference between monolith and microservices.',
        'What is caching and what problems does it solve?',
      ],
      Intermediate: [
        'Design a URL shortener like bit.ly.',
        'How would you design a notification system for millions of users?',
        'Design a basic chat application - what technologies would you choose?',
        'How would you approach database sharding?',
        'Design a rate limiter for a public API.',
      ],
      Advanced: [
        "Design Twitter's news feed at scale.",
        'How would you build a distributed key-value store?',
        'Design a real-time collaborative document editing system.',
        'Architect a payment processing system with 99.99% availability.',
        "How would you design YouTube's video upload and streaming pipeline?",
      ],
    },
    HR: {
      Beginner: [
        'Where do you see yourself in 5 years?',
        'What do you know about our company?',
        'What are your salary expectations?',
        'Why should we hire you?',
        'Do you have any questions for us?',
      ],
      Intermediate: [
        'Why are you looking for a new opportunity?',
        'How do you maintain work-life balance under pressure?',
        'Describe your ideal work environment.',
        'How do you stay up to date with technology?',
        'What motivates you beyond compensation?',
      ],
      Advanced: [
        'How do you align personal goals with company mission?',
        'Describe your contribution to company culture in the past.',
        'What is your philosophy on continuous learning?',
        'How do you handle disagreements with senior management?',
        'What does good technical leadership look like to you?',
      ],
    },
  };

  const typeKey = banks[type] ? type : 'Technical';
  const diffKey = banks[typeKey][difficulty] ? difficulty : 'Intermediate';
  return shuffleArray(banks[typeKey][diffKey]).slice(0, 5);
}

module.exports = { generateQuestions, evaluateAnswer, getFallbackQuestions };
