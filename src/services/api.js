import axios from 'axios';

// With Vite proxy configured, we do NOT need a full base URL.
// Requests to /api/* are automatically forwarded to the backend by Vite.
// IS_MOCK is only true if explicitly set — default is now LIVE mode when backend is running.
const BASE_URL = import.meta.env.VITE_API_URL || '';
// IS_MOCK is true ONLY when explicitly set.
// Without backend running, set VITE_MOCK_MODE=true in .env to use mock data.
// Default is false so the real backend is used when available.
const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

// Axios instance for all API calls
// baseURL is empty string when using Vite proxy — axios will use relative paths
// which Vite intercepts and forwards to localhost:5000
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout so we fail fast if backend is down
});

// Attach Firebase token to every request
let _getToken = null;
export const setTokenGetter = (fn) => {
  _getToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) {}
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response at all = backend is not running or proxy misconfigured
    if (!error.response) {
      console.error('[API] No response received. Is the backend running on port 5000?');
      error.message = 'Cannot reach server. Make sure the backend is running on port 5000.';
    }
    return Promise.reject(error);
  }
);

// ── MOCK ENGINE ──────────────────────────────────────────────
// In mock mode (VITE_MOCK_MODE=true), intercept calls and return realistic fake data.

function mockDelay(data) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ data }), 200 + Math.random() * 400)
  );
}

async function mockRequest(method, url, body) {
  // Platform stats
  if (url === '/api/stats/platform') {
    return mockDelay({
      practiceSessions: 12847 + Math.floor(Math.random() * 50),
      mockInterviews: 6234,
      jobsPosted: 3891,
      successRate: 87,
      activeUsers: 4521,
      avgScore: 76,
    });
  }

  // User profile
  if (url === '/api/users/me' && method === 'get') {
    return mockDelay({
      _id: 'mock_user_1',
      name: 'Sagar Kumar Gautam',
      email: 'sagar@example.com',
      photoURL: null,
      coins: 150,
      role: 'candidate',
      profile: {
        targetRole: 'Software Engineer',
        experience: 'Fresher',
        skills: ['React', 'JavaScript', 'Node.js'],
        bio: 'BCA student passionate about full-stack development.',
      },
      stats: {
        totalSessions: 12,
        avgScore: 78,
        streak: 5,
        lastActiveDate: new Date().toISOString(),
        skillScores: {
          technical: 72,
          behavioral: 80,
          communication: 68,
          problemSolving: 75,
        },
      },
    });
  }

  // Update profile
  if (url === '/api/users/me' && method === 'patch') {
    return mockDelay({ success: true });
  }

  // Interview history
  if (url === '/api/interview/history') {
    return mockDelay({
      sessions: [
        {
          _id: '1',
          type: 'Technical',
          difficulty: 'Intermediate',
          overallScore: 82,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          coinsEarned: 5,
          role: 'Software Engineer',
        },
        {
          _id: '2',
          type: 'Behavioral',
          difficulty: 'Beginner',
          overallScore: 91,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          coinsEarned: 5,
          role: 'Product Manager',
        },
        {
          _id: '3',
          type: 'HR',
          difficulty: 'Beginner',
          overallScore: 74,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          coinsEarned: 5,
          role: 'Software Engineer',
        },
        {
          _id: '4',
          type: 'System Design',
          difficulty: 'Advanced',
          overallScore: 65,
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          coinsEarned: 5,
          role: 'Senior Engineer',
        },
      ],
    });
  }

  // Start interview
  if (url === '/api/interview/start' && method === 'post') {
    const { type = 'Technical', difficulty = 'Intermediate', role = 'Software Engineer' } = body || {};
    return mockDelay({
      sessionId: 'mock_session_' + Date.now(),
      questions: getMockQuestions(type, difficulty),
    });
  }

  // Evaluate answer
  if (url.match(/\/api\/interview\/.+\/answer/) && method === 'post') {
    const answer = body?.answer || '';
    const len = answer.trim().split(/\s+/).length;
    const score =
      len > 40 ? Math.floor(75 + Math.random() * 20)
      : len > 15 ? Math.floor(55 + Math.random() * 20)
      : Math.floor(30 + Math.random() * 25);
    return mockDelay({
      score,
      strengths: score >= 75
        ? ['Well structured response', 'Good use of relevant concepts', 'Clear communication']
        : ['Attempted the question', 'Shows basic understanding'],
      improvements: score >= 75
        ? ['Add a specific real-world example', 'Mention edge cases', 'Be more concise']
        : ['Provide more detail', 'Use STAR method', 'Give a concrete example'],
      suggestion: score >= 75
        ? `Good answer! You covered the core concept well. To push this to excellent, add a specific example from a project and mention any trade-offs or edge cases you would consider.`
        : `Your answer touches on the right area but needs more depth. Structure your response: start with a brief definition, then explain how it works, then give a real example from your experience or studies.`,
    });
  }

  // Complete interview
  if (url.includes('/api/interview/') && url.includes('/complete') && method === 'post') {
    return mockDelay({
      overallScore: Math.floor(70 + Math.random() * 25),
      coinsEarned: 5,
    });
  }

  // Jobs apply
  if (url === '/api/jobs/apply' && method === 'post') {
    return mockDelay({ success: true, appliedAt: new Date().toISOString() });
  }

  // Jobs list
  if (url.startsWith('/api/jobs')) {
    return mockDelay({ jobs: MOCK_JOBS, total: MOCK_JOBS.length });
  }

  // Volunteers
  if (url.startsWith('/api/volunteer/list')) {
    // Parse expertise filter from URL if present
    let filtered = MOCK_VOLUNTEERS;
    try {
      const urlObj = new URL(`http://x${url}`);
      const expertiseParam = urlObj.searchParams.get('expertise');
      filtered = expertiseParam
        ? MOCK_VOLUNTEERS.filter((v) => (v.expertise || []).includes(expertiseParam))
        : MOCK_VOLUNTEERS;
    } catch {
      filtered = MOCK_VOLUNTEERS;
    }
    return mockDelay({ volunteers: filtered });
  }

  if (url === '/api/volunteer/register' && method === 'post') {
    return mockDelay({ success: true, message: 'Application submitted!' });
  }

  if (url === '/api/volunteer/book' && method === 'post') {
    return mockDelay({ success: true, booking: { _id: 'booking_' + Date.now() } });
  }

  // Coins purchase
  if (url === '/api/coins/purchase' && method === 'post') {
    return mockDelay({ success: true, newBalance: 100 });
  }

  // Coins history
  if (url === '/api/coins/history') {
    return mockDelay({
      balance: 150,
      transactions: [
        {
          _id: '1',
          type: 'earn',
          amount: 5,
          reason: 'Completed Technical Interview',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '2',
          type: 'earn',
          amount: 5,
          reason: 'Completed Behavioral Interview',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          _id: '3',
          type: 'spend',
          amount: 100,
          reason: 'Profile Boost – 7 days',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
        },
      ],
    });
  }

  // Stats platform
  if (url === '/api/stats/platform') {
    return mockDelay({
      practiceSessions: 12847,
      mockInterviews: 6234,
      jobsPosted: 3891,
      successRate: 87,
      activeUsers: 4521,
      avgScore: 76,
    });
  }

  return mockDelay({ success: true });
}

// ── CORE REQUEST FUNCTION ─────────────────────────────────────
async function request(method, url, data = null, config = {}) {
  if (IS_MOCK) {
    const res = await mockRequest(method, url, data);
    return res.data;
  }
  const res = await api({ method, url, data, ...config });
  return res.data;
}

// ── EXPORTED API NAMESPACES ───────────────────────────────────
export const statsAPI = {
  getPlatformStats: () => request('get', '/api/stats/platform'),
};

export const userAPI = {
  getMe: () => request('get', '/api/users/me'),
  updateProfile: (data) => request('patch', '/api/users/me', data),
  getCoinHistory: () => request('get', '/api/coins/history'),
};

export const coinsAPI = {
  getHistory: () => request('get', '/api/coins/history'),
  purchase: (data) => request('post', '/api/coins/purchase', data),
};

export const interviewAPI = {
  start: (data) => request('post', '/api/interview/start', data, { timeout: 60000 }),
  submitAnswer: (sessionId, data) =>
    request('post', `/api/interview/${sessionId}/answer`, data, { timeout: 60000 }),
  complete: (sessionId) => request('post', `/api/interview/${sessionId}/complete`, null, { timeout: 30000 }),
  getHistory: () => request('get', '/api/interview/history'),
};

export const jobsAPI = {
  getJobs: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request('get', `/api/jobs${query ? '?' + query : ''}`);
  },
  apply: (data) => request('post', '/api/jobs/apply', data),
};

export const volunteerAPI = {
  // Pass { expertise } to filter by expertise area
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v)),
    ).toString();
    return request('get', `/api/volunteer/list${query ? `?${query}` : ''}`);
  },
  register: (data) => request('post', '/api/volunteer/register', data),
  book: (data) => request('post', '/api/volunteer/book', data),
};

export const adminAPI = {
  getOverview: () => request('get', '/api/admin/overview'),
  getVolunteers: (status = 'all') => request('get', `/api/admin/volunteers?status=${encodeURIComponent(status)}`),
  setVolunteerApproval: (id, isApproved) =>
    request('patch', `/api/admin/volunteers/${id}/approval`, { isApproved }),
  getUsers: () => request('get', '/api/admin/users'),
  getTransactions: () => request('get', '/api/admin/transactions'),
};

// ── MOCK DATA ─────────────────────────────────────────────────
function getMockQuestions(type, difficulty) {
  const banks = {
    Technical: {
      Beginner: [
        'What is the difference between var, let, and const in JavaScript?',
        'Explain what a REST API is and give an example.',
        'What is version control and why do developers use Git?',
        'What is the difference between HTML, CSS, and JavaScript?',
        'What is a database and why is it used in web applications?',
        'Explain the concept of responsive design.',
        'What is the purpose of a package.json file?',
        'What is the difference between == and === in JavaScript?',
        'What is a callback function? Give an example.',
        'Explain what async/await does in JavaScript.',
      ],
      Intermediate: [
        'Explain closures in JavaScript with a practical example.',
        'How does the event loop work in Node.js?',
        'What are React hooks? Explain useState and useEffect.',
        'What is the difference between SQL and NoSQL databases?',
        'How does HTTPS work? Explain the handshake process.',
        'What is the difference between authentication and authorisation?',
        'Explain the concept of debouncing and throttling.',
        'What is CORS and how do you handle it in Express?',
        'Describe the differences between REST and GraphQL.',
        'What is memoization? When would you use useMemo?',
      ],
      Advanced: [
        'Explain micro-frontend architecture and its trade-offs.',
        'How would you design a distributed rate limiter?',
        'What is the CAP theorem and how does it affect your architecture choices?',
        'Explain memory management and garbage collection in V8.',
        'How would you implement zero-downtime blue-green deployments?',
        'What are the trade-offs between optimistic and pessimistic locking?',
        'Explain how React reconciliation and the virtual DOM diffing algorithm work.',
        'How would you design a real-time collaborative editing feature?',
        'What is eventual consistency and when is it acceptable?',
        'Describe strategies for managing technical debt in a large codebase.',
      ],
    },
    Behavioral: {
      Beginner: [
        'Tell me about yourself and why you chose software development.',
        'Describe a time you worked well as part of a team.',
        'What are your greatest strengths as a developer?',
        'Why are you interested in this role at our company?',
        'Tell me about a technical challenge you overcame.',
        'How do you handle feedback on your code?',
        'Describe a project you are proud of from college or personal work.',
        'How do you approach learning a new technology?',
        'Tell me about a time you missed a deadline. What did you do?',
        'What does a good day at work look like for you?',
      ],
      Intermediate: [
        'Describe a time you had to meet a very tight deadline.',
        'Tell me about a conflict with a teammate and how you resolved it.',
        'Give an example of when you took initiative on a project.',
        'How do you prioritise when everything seems equally urgent?',
        'Tell me about a time you had to learn something very quickly.',
        'Describe a situation where you disagreed with your manager.',
        'How have you handled a project that was going off track?',
        'Give an example of receiving critical feedback and acting on it.',
        'Tell me about a time you mentored or helped a junior colleague.',
        'Describe how you balance quality vs speed when under pressure.',
      ],
      Advanced: [
        'Tell me about a critical technical decision you made with incomplete information.',
        'Describe how you have influenced others without direct authority.',
        'How have you handled a significant failure or missed expectation?',
        'Tell me about a time you drove a culture or process change.',
        'Describe your approach to ambiguous or poorly defined problems.',
        'How do you manage stakeholder expectations on a complex project?',
        'Give an example of a time you had to push back on a product requirement.',
        'Tell me about building or scaling a team.',
        'Describe how you approach hiring and evaluating engineering candidates.',
        'How do you maintain engineering standards while moving fast?',
      ],
    },
    'System Design': {
      Beginner: [
        'What is the difference between vertical and horizontal scaling?',
        'Explain what a load balancer does and why it is needed.',
        'What is a CDN and when would you use one?',
        'Describe the difference between monolith and microservices architecture.',
        'What is caching and what problems does it solve?',
        'Explain what a message queue is used for.',
        'What is the difference between synchronous and asynchronous communication?',
        'What is database indexing and why does it matter?',
        'Explain what an API gateway does.',
        'What is a reverse proxy? Give an example of when to use one.',
      ],
      Intermediate: [
        'Design a URL shortener like bit.ly.',
        'How would you design a notification system for 10 million users?',
        'Design a basic real-time chat application.',
        'How would you approach database sharding?',
        'Design a rate limiter for a public REST API.',
        'How would you design a search autocomplete system?',
        'Design a job queue system for background processing.',
        'How would you implement session management at scale?',
        'Design a file upload and storage system.',
        'How would you architect a multi-tenant SaaS application?',
      ],
      Advanced: [
        "Design Twitter's news feed at scale of 500 million users.",
        'How would you build a distributed key-value store from scratch?',
        'Design a real-time collaborative document editing system like Google Docs.',
        'Architect a payment processing system with 99.99% availability.',
        "Design YouTube's video upload, transcoding, and streaming pipeline.",
        'How would you design a distributed transaction system?',
        'Design a global content delivery system with regional failover.',
        'How would you build a recommendation engine for an e-commerce platform?',
        'Design a fraud detection system for financial transactions.',
        'Architect a system to handle 1 million concurrent WebSocket connections.',
      ],
    },
    HR: {
      Beginner: [
        'Where do you see yourself in 5 years?',
        'What do you know about our company and why do you want to work here?',
        'What are your salary expectations for this role?',
        'Why should we hire you over other candidates?',
        'Do you have any questions for us?',
        'How soon can you join if selected?',
        'Are you comfortable with the job location and working hours?',
        'What do you do outside of work to stay sharp technically?',
        'How do you handle work pressure and tight deadlines?',
        'What type of work environment brings out your best performance?',
      ],
      Intermediate: [
        'Why are you looking to leave your current role?',
        'How do you maintain work-life balance during high-pressure periods?',
        'Describe your ideal team and work culture.',
        'How do you stay updated with the latest technology trends?',
        'What motivates you beyond your compensation?',
        'How do you handle disagreements with peers or leads?',
        'Describe a time when you went above and beyond your job description.',
        'How do you evaluate whether a job opportunity is right for you?',
        'What does career growth mean to you over the next 3 years?',
        'How important is remote vs in-office work to you and why?',
      ],
      Advanced: [
        'How do you align your personal career goals with a company mission?',
        'Describe your contribution to building engineering culture at past companies.',
        'What is your philosophy on continuous learning and staying relevant?',
        'How do you handle persistent disagreements with senior leadership?',
        'What does good technical leadership mean to you?',
        'How do you evaluate risk when making architectural decisions?',
        'Describe your approach to building long-term client or partner relationships.',
        'How do you think about compensation, equity, and long-term incentives?',
        'What legacy do you want to leave in your engineering career?',
        'How do you think about work-life integration rather than balance?',
      ],
    },
  };

  const typeBank = banks[type] || banks.Technical;
  const diffBank = typeBank[difficulty] || typeBank.Intermediate;

  // Fisher-Yates shuffle to return 5 random different questions each time
  const shuffled = [...diffBank];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechMahindra',
    location: 'Bangalore, India',
    salary: '₹6–12 LPA',
    type: 'Full-time',
    tags: ['React', 'TypeScript', 'Tailwind'],
    postedDays: 2,
    description:
      'Build modern web applications using React and TypeScript. Work with cross-functional teams to deliver high-quality user experiences at scale.',
    requirements: ['2+ years React', 'TypeScript', 'REST APIs', 'Git'],
    applicants: 87,
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'Infosys',
    location: 'Pune, India',
    salary: '₹8–15 LPA',
    type: 'Full-time',
    tags: ['Node.js', 'MongoDB', 'AWS'],
    postedDays: 5,
    description: 'Design and build scalable backend services and RESTful APIs for enterprise clients globally.',
    requirements: ['Node.js', 'MongoDB/PostgreSQL', 'AWS', 'Microservices'],
    applicants: 143,
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Wipro',
    location: 'Hyderabad, India',
    salary: '₹10–18 LPA',
    type: 'Full-time',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    postedDays: 1,
    description: 'End-to-end development of web applications in an agile team environment.',
    requirements: ['React + Node.js', 'Database design', 'Agile', '3+ years'],
    applicants: 62,
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'Zomato',
    location: 'Gurugram, India',
    salary: '₹12–20 LPA',
    type: 'Full-time',
    tags: ['React', 'Redux', 'GraphQL'],
    postedDays: 3,
    description: 'Join our consumer apps team building products used by millions daily.',
    requirements: ['React', 'Redux', 'Performance optimization', 'Mobile-first'],
    applicants: 218,
  },
  {
    id: '5',
    title: 'Software Engineer – Fresher',
    company: 'TCS',
    location: 'Chennai, India',
    salary: '₹3.5–5 LPA',
    type: 'Full-time',
    tags: ['Java', 'SQL', 'Spring Boot'],
    postedDays: 7,
    description: 'Entry-level position with 6-month structured training for fresh graduates.',
    requirements: ['BCA/B.Tech/MCA', 'Java basics', 'SQL', 'Problem-solving'],
    applicants: 1240,
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'Flipkart',
    location: 'Bangalore, India',
    salary: '₹14–24 LPA',
    type: 'Full-time',
    tags: ['Docker', 'Kubernetes', 'CI/CD'],
    postedDays: 4,
    description:
      "Build and maintain infrastructure at massive scale for India's largest e-commerce platform.",
    requirements: ['Docker + Kubernetes', 'CI/CD', 'Linux', 'AWS/GCP'],
    applicants: 95,
  },
  {
    id: '7',
    title: 'iOS Developer',
    company: 'Paytm',
    location: 'Noida, India',
    salary: '₹10–16 LPA',
    type: 'Full-time',
    tags: ['Swift', 'UIKit', 'Xcode'],
    postedDays: 6,
    description: "Build Paytm's iOS app used by 350M+ users for payments and banking.",
    requirements: ['Swift', 'UIKit + SwiftUI', 'Core Data', 'App Store'],
    applicants: 71,
  },
  {
    id: '8',
    title: 'Data Engineer',
    company: 'Swiggy',
    location: 'Bangalore, India',
    salary: '₹12–22 LPA',
    type: 'Full-time',
    tags: ['Python', 'Spark', 'Airflow'],
    postedDays: 2,
    description: "Build data pipelines for real-time decisions on India's leading food delivery platform.",
    requirements: ['Python + SQL', 'Apache Spark', 'Data pipelines', 'Airflow'],
    applicants: 109,
  },
  {
    id: '9',
    title: 'React Native Developer',
    company: "BYJU'S",
    location: 'Bangalore, India',
    salary: '₹8–14 LPA',
    type: 'Contract',
    tags: ['React Native', 'TypeScript', 'Firebase'],
    postedDays: 8,
    description: 'Build cross-platform mobile learning experiences for 150M+ students.',
    requirements: ['React Native', 'Firebase', 'Offline-first', 'Animations'],
    applicants: 134,
  },
  {
    id: '10',
    title: 'UI/UX + Frontend Developer',
    company: 'Razorpay',
    location: 'Bangalore, India',
    salary: '₹10–18 LPA',
    type: 'Full-time',
    tags: ['Figma', 'React', 'Design Systems'],
    postedDays: 3,
    description: 'Design and implement UI for fintech products used by 8M+ businesses.',
    requirements: ['Figma', 'React', 'Design systems', 'Fintech a plus'],
    applicants: 88,
  },
];

const MOCK_VOLUNTEERS = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Senior Engineer at Google',
    rating: 4.9,
    totalReviews: 127,
    expertise: ['System Design', 'Technical', 'Algorithms'],
    experience: '6 years',
    availability: 'Mon, Wed, Fri — 6–9 PM IST',
    bio: 'Ex-Amazon, now at Google. I love helping freshers break into top tech companies.',
    coinsCharged: 50,
  },
  {
    id: '2',
    name: 'Rahul Verma',
    role: 'Tech Lead at Flipkart',
    rating: 4.7,
    totalReviews: 89,
    expertise: ['Technical', 'System Design', 'Leadership'],
    experience: '8 years',
    availability: 'Tue, Thu — 7–10 PM IST',
    bio: 'Full-stack tech lead. Specialised in cracking product company interviews.',
    coinsCharged: 40,
  },
  {
    id: '3',
    name: 'Anita Patel',
    role: 'HR Manager at Infosys',
    rating: 4.8,
    totalReviews: 203,
    expertise: ['HR', 'Behavioral', 'Communication'],
    experience: '5 years',
    availability: 'Mon–Fri — 12–2 PM IST',
    bio: 'HR professional helping candidates present their best selves confidently.',
    coinsCharged: 30,
  },
  {
    id: '4',
    name: 'Arjun Nair',
    role: 'Software Architect at Razorpay',
    rating: 4.6,
    totalReviews: 61,
    expertise: ['System Design', 'Microservices', 'Backend'],
    experience: '10 years',
    availability: 'Weekends — 10 AM–1 PM IST',
    bio: 'Building fintech systems at scale. Happy to share what it takes to join top startups.',
    coinsCharged: 60,
  },
  {
    id: '5',
    name: 'Sneha Gupta',
    role: 'Product Manager at Zomato',
    rating: 4.5,
    totalReviews: 44,
    expertise: ['Behavioral', 'Product', 'Case Studies'],
    experience: '4 years',
    availability: 'Wed, Sat — 5–8 PM IST',
    bio: 'PM with an engineering background. Great for product + SWE hybrid interviews.',
    coinsCharged: 35,
  },
];
