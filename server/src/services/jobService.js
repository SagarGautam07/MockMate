const axios = require('axios');

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/in/search/1';

/**
 * Fetch live job listings from Adzuna API (free tier: 250 req/day).
 * Falls back to static mock jobs if API is unavailable or not configured.
 *
 * @param {object} params - { keyword, location, type, page }
 * @returns {Promise<{ jobs: object[], total: number }>}
 */
async function fetchJobs({ keyword = '', location = '', type = '', page = 1 } = {}) {
  // If Adzuna keys not configured, use mock data
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_API_KEY) {
    console.log('ℹ️  Adzuna not configured — using mock jobs');
    return getMockJobs(keyword, location, type);
  }

  try {
    const res = await axios.get(ADZUNA_BASE, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        results_per_page: 20,
        what: keyword || 'software engineer',
        where: location || 'india',
        page,
        'content-type': 'application/json',
      },
      timeout: 8000,
    });

    const jobs = res.data.results.map((job, i) => ({
      id: job.id || String(i),
      title: job.title,
      company: job.company?.display_name || 'Company',
      location: job.location?.display_name || 'India',
      salary: formatSalary(job.salary_min, job.salary_max),
      type: type || 'Full-time',
      tags: extractTags(job.description || ''),
      postedDays: daysSince(job.created),
      description: (job.description || '').slice(0, 400) + '...',
      requirements: [],
      applicants: Math.floor(Math.random() * 200) + 20,
      url: job.redirect_url,
    }));

    return { jobs, total: res.data.count || jobs.length };
  } catch (err) {
    console.error('❌ Adzuna API error:', err.message);
    return getMockJobs(keyword, location, type);
  }
}

function formatSalary(min, max) {
  if (!min && !max) return 'Salary not disclosed';
  const lpa = (v) => '₹' + (v / 100000).toFixed(1) + ' LPA';
  if (min && max) return lpa(min) + ' – ' + lpa(max);
  return lpa(min || max);
}

function daysSince(dateStr) {
  if (!dateStr) return 3;
  const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

function extractTags(description) {
  const tech = [
    'React',
    'Node.js',
    'Python',
    'Java',
    'AWS',
    'Docker',
    'TypeScript',
    'MongoDB',
    'PostgreSQL',
    'Kubernetes',
    'Angular',
    'Vue',
    'Spring Boot',
  ];
  return tech.filter((t) => description.toLowerCase().includes(t.toLowerCase())).slice(0, 4);
}

function getMockJobs(keyword, location, type) {
  const allJobs = [
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
      requirements: [
        '2+ years React experience',
        'TypeScript proficiency',
        'REST API integration',
        'Git version control',
      ],
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
      description:
        'Design and build scalable backend services and RESTful APIs. Work on cloud infrastructure and database optimization for enterprise clients.',
      requirements: ['Node.js expertise', 'MongoDB/PostgreSQL', 'AWS experience', 'Microservices knowledge'],
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
      description:
        'End-to-end development of web applications. Collaborate with product and design teams to ship features rapidly.',
      requirements: ['React + Node.js', 'Database design', 'Agile methodology', '3+ years experience'],
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
      description:
        'Join our consumer apps team building products used by millions of users daily across India and 25 other countries.',
      requirements: ['React expertise', 'Redux/Zustand', 'Performance optimization', 'Mobile-first design'],
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
      description:
        'Entry-level position for fresh graduates. 6-month structured training provided. Work on enterprise software for Fortune 500 global clients.',
      requirements: ['B.Tech/BCA/MCA graduate', 'Java fundamentals', 'SQL basics', 'Strong problem-solving'],
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
        "Build and maintain infrastructure at massive scale powering India's largest e-commerce platform. Improve deployment pipelines and reliability.",
      requirements: [
        'Docker + Kubernetes',
        'CI/CD pipelines (GitHub Actions/Jenkins)',
        'Linux administration',
        'Cloud platforms (AWS/GCP)',
      ],
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
      description:
        "Build and maintain Paytm's iOS app used by 350 million+ users for payments, banking, and commerce.",
      requirements: ['Swift proficiency', 'UIKit + SwiftUI', 'Core Data', 'App Store submission experience'],
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
      description:
        "Build data pipelines and analytics infrastructure powering real-time decisions for India's leading food delivery platform.",
      requirements: ['Python + SQL', 'Apache Spark', 'Data pipeline design', 'Airflow or Prefect'],
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
      description:
        'Build cross-platform mobile learning experiences for 150M+ students across India and globally.',
      requirements: ['React Native', 'Firebase integration', 'Offline-first app design', 'Animation libraries'],
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
      description:
        "Hybrid design-development role. Design and implement user interfaces for Razorpay's fintech products used by 8M+ businesses across India.",
      requirements: ['Figma proficiency', 'React development', 'Design system experience', 'Fintech domain a plus'],
      applicants: 88,
    },
  ];

  let filtered = allJobs;
  if (keyword) {
    const q = keyword.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (location) {
    filtered = filtered.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()));
  }
  if (type) {
    filtered = filtered.filter((j) => j.type === type);
  }

  return { jobs: filtered, total: filtered.length };
}

module.exports = { fetchJobs };

