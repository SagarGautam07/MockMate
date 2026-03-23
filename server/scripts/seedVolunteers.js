require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Volunteer = require('../src/models/Volunteer');

const seedData = [
  {
    name: 'Aditi Sharma',
    email: 'aditi.sharma@mockmate.dev',
    role: 'Senior SDE at Microsoft',
    expertise: ['Technical', 'System Design'],
    experience: '7 years',
    availability: [{ day: 'Sat', slots: ['morning'] }, { day: 'Sun', slots: ['afternoon'] }],
    coinsCharged: 50,
    bio: 'Backend and distributed systems mentor. Focused on practical interview strategies.',
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@mockmate.dev',
    role: 'Engineering Manager at Flipkart',
    expertise: ['Behavioral', 'Leadership', 'Communication'],
    experience: '10+ years',
    availability: [{ day: 'Tue', slots: ['evening'] }, { day: 'Thu', slots: ['evening'] }],
    coinsCharged: 45,
    bio: 'Helps candidates improve storytelling, ownership examples, and leadership communication.',
  },
  {
    name: 'Neha Iyer',
    email: 'neha.iyer@mockmate.dev',
    role: 'Staff Engineer at Razorpay',
    expertise: ['System Design', 'Technical'],
    experience: '8 years',
    availability: [{ day: 'Mon', slots: ['afternoon'] }, { day: 'Fri', slots: ['afternoon'] }],
    coinsCharged: 60,
    bio: 'Specializes in high-scale architecture, API design, and interview whiteboarding.',
  },
  {
    name: 'Karan Verma',
    email: 'karan.verma@mockmate.dev',
    role: 'HR Partner at Amazon',
    expertise: ['HR', 'Behavioral', 'Communication'],
    experience: '6 years',
    availability: [{ day: 'Wed', slots: ['morning'] }, { day: 'Sat', slots: ['morning'] }],
    coinsCharged: 35,
    bio: 'Improves confidence for HR rounds, compensation talks, and final fit interviews.',
  },
  {
    name: 'Sana Khan',
    email: 'sana.khan@mockmate.dev',
    role: 'Principal Engineer at Zomato',
    expertise: ['Technical', 'Leadership', 'System Design'],
    experience: '12 years',
    availability: [{ day: 'Sun', slots: ['evening'] }, { day: 'Thu', slots: ['afternoon'] }],
    coinsCharged: 70,
    bio: 'Mentors experienced engineers for senior and principal-level interview preparation.',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[seed] Connected to MongoDB');

  for (const entry of seedData) {
    const firebaseUid = `seed_${entry.email}`;
    let user = await User.findOne({ email: entry.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        firebaseUid,
        name: entry.name,
        email: entry.email.toLowerCase(),
        role: 'volunteer',
      });
    }

    await Volunteer.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        name: entry.name,
        role: entry.role,
        expertise: entry.expertise,
        experience: entry.experience,
        availability: entry.availability,
        coinsCharged: entry.coinsCharged,
        bio: entry.bio,
        isApproved: true,
        rating: 4.8,
        totalReviews: 25,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('[seed] Volunteers seeded successfully');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('[seed] Failed:', err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});

