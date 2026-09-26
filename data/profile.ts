export const profile = { name: 'Peter Paul Poloan', role: 'AI-Augmented Full-Stack Developer · CS Student', school: 'Sorsogon State University – Bulan Campus', email: 'peterpaulpoloan@gmail.com', bio: 'I’m a developer who builds and ships quickly using AI-assisted tools, backed by a solid understanding of software architecture, tech stacks, and engineering principles. I follow the SDLC and apply STLC and testing pyramid principles to deliver reliable software. I’ve used Firebase Firestore and Firebase Authentication in most of my projects. I take ownership of my tasks, I’m eager to keep learning, and I can explain my work clearly.', stack: ['React', 'Vite', 'Next.js', 'shadcn/ui', 'Tailwind', 'Node.js', 'Firebase', 'Supabase', 'Vercel', 'GitHub', 'Playwright'] }

export const aiTools = 'Claude, powered by Graphify + Obra Superpowers'

export const strengths = [
  { title: 'AI-assisted development', description: 'Proficient in using AI coding tools to plan, build, and ship features quickly while reviewing and verifying the output.' },
  { title: 'Architecture and engineering principles', description: 'Well-versed in software architecture, tech stack selection, and core software engineering principles.' },
  { title: 'Structured development process', description: 'Follows the Software Development Life Cycle (SDLC) and applies Software Testing Life Cycle (STLC) principles and the testing pyramid to deliver reliable software.' },
  { title: 'Backend services', description: 'Hands-on experience with Firebase Firestore and Firebase Authentication across most of my projects.' },
  { title: 'Ownership and growth mindset', description: 'Takes full ownership of assigned tasks and actively seeks opportunities to learn and grow.' },
  { title: 'Clear communication', description: 'Able to explain technical work clearly to both technical and non-technical audiences.' },
]

export const conversations = [
  { label: 'Gmail', preview: 'Email me for opportunities', href: 'mailto:peterpaulpoloan@gmail.com', kind: 'external' },
  { label: 'Facebook', preview: 'Connect with me on Facebook', href: 'https://www.facebook.com/PeterPogi.33', kind: 'external' },
  { label: 'LinkedIn', preview: 'Let\'s connect professionally', href: 'https://www.linkedin.com/in/peter-undefined-161ab1280/', kind: 'external' },
  { label: 'PeterAI', preview: 'Ask my AI anything about me', kind: 'ai' },
]

export const photos: string[] = []

export type Project = { id: string; title: string; description: string; tags: string[]; image: string; likes: number; comments: number; pinned?: boolean; repo?: string; live: string }
export type Comment = { name: string; text: string; time: string }

const previewImage = (liveUrl: string) => `https://s.wordpress.com/mshots/v1/${encodeURIComponent(liveUrl)}?w=900`

export const projects: Project[] = [
  { id: 'delbertboardinghouse', title: 'Delbert Boarding House', description: 'A centralized announcement board, report board, and chat system for Delbert’s Boarding House, using Firestore as chat storage. Posts expire after 24 hours and messages expire after 4 hours.', tags: ['Firestore'], image: previewImage('https://delbertboardinghouse-tau.vercel.app'), likes: 0, comments: 0, live: 'https://delbertboardinghouse-tau.vercel.app' },
  { id: 'kudos-app', title: 'Kudos App', description: 'A social media app for positivity only, built with Firebase backend services — created to practice building social-media-style systems.', tags: ['Firebase'], image: previewImage('https://kudos-app-lyart.vercel.app'), likes: 0, comments: 0, live: 'https://kudos-app-lyart.vercel.app' },
  { id: 'pomogrove', title: 'PomoGrove', description: 'A study tool with a built-in Pomodoro clock, quiz generation using a spaced repetition algorithm, a built-in music player that sources from YouTube, and notes boards — built with Firebase Firestore and Firebase Authentication.', tags: ['Firestore', 'Firebase Auth'], image: previewImage('https://pomogrove-beta.vercel.app'), likes: 0, comments: 0, live: 'https://pomogrove-beta.vercel.app' },
  { id: 'university-sports-center', title: 'University Sports Center', description: 'A ranking board and athlete profiling system for a university.', tags: [], image: previewImage('https://university-sports-center.vercel.app'), likes: 0, comments: 0, live: 'https://university-sports-center.vercel.app' },
  { id: 'meetingsense', title: 'MeetingSense', description: 'An NLP-powered transcript analyzer that categorizes meeting transcripts, using a simple reference dataset.', tags: ['NLP'], image: previewImage('https://meetingsense.vercel.app'), likes: 0, comments: 0, live: 'https://meetingsense.vercel.app' },
]

export default profile
