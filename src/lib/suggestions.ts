/**
 * Rotating Idea Suggestions for ShepLight Compass
 * 
 * Displays different suggestions based on time intervals
 * to keep the UI fresh and engaging
 */

export interface IdeaStarter {
  title: string
  prompt: string
  audience: string
  category: 'productivity' | 'community' | 'finance' | 'creative' | 'health' | 'education'
}

const IDEA_STARTERS: IdeaStarter[] = [
  // Productivity
  {
    title: "Help busy people",
    prompt: "I want to build an app that helps busy professionals manage their time better by automatically scheduling tasks based on energy levels and priorities",
    audience: "Working professionals aged 25-45 who struggle with work-life balance",
    category: 'productivity'
  },
  {
    title: "Automate daily tasks",
    prompt: "I'm creating a tool that automatically organizes digital files and documents for remote workers based on content and usage patterns",
    audience: "Remote workers and freelancers dealing with digital clutter",
    category: 'productivity'
  },
  {
    title: "Streamline meetings",
    prompt: "Building a platform that reduces meeting time by 50% through smart agendas, AI summaries, and action item tracking",
    audience: "Team leads and managers in fast-paced startups",
    category: 'productivity'
  },

  // Community
  {
    title: "Connect neighbors",
    prompt: "Creating a hyper-local app where neighbors can share tools, organize events, and support each other",
    audience: "Urban residents in apartment buildings who want stronger community connections",
    category: 'community'
  },
  {
    title: "Find workout buddies",
    prompt: "Building a platform that matches people with similar fitness goals and schedules for accountability and motivation",
    audience: "Fitness beginners who need motivation and social support",
    category: 'community'
  },
  {
    title: "Book club platform",
    prompt: "An app that helps book clubs organize meetings, track reading progress, and discover new books together",
    audience: "Avid readers who want deeper discussions and accountability",
    category: 'community'
  },

  // Finance
  {
    title: "Freelancer invoicing",
    prompt: "Simplifying invoicing for freelancers with automatic time tracking, payment reminders, and tax calculations",
    audience: "Freelancers and solopreneurs who hate dealing with admin work",
    category: 'finance'
  },
  {
    title: "Split bills easily",
    prompt: "Making group expenses transparent and fair with automatic splitting, tracking, and reminders",
    audience: "Young professionals who share living expenses with roommates",
    category: 'finance'
  },
  {
    title: "Budget with friends",
    prompt: "A social budgeting app where friends can share tips, challenge each other, and celebrate savings milestones",
    audience: "Millennials who want to save money but need social accountability",
    category: 'finance'
  },

  // Health
  {
    title: "Track mental health",
    prompt: "Building a mood journal that uses AI to identify patterns and suggest personalized coping strategies",
    audience: "People managing anxiety or depression who want data-driven insights",
    category: 'health'
  },
  {
    title: "Meal prep helper",
    prompt: "An app that creates personalized meal plans based on dietary restrictions, budget, and cooking time",
    audience: "Busy parents and professionals who want healthy homemade meals",
    category: 'health'
  },
  {
    title: "Sleep better",
    prompt: "Helping people improve sleep quality through personalized routines, environmental tracking, and gentle wake-ups",
    audience: "Professionals with irregular schedules and poor sleep habits",
    category: 'health'
  },

  // Education
  {
    title: "Learn languages faster",
    prompt: "Creating a language learning app that uses real conversations and AI feedback instead of traditional lessons",
    audience: "Professionals who need to learn a language for work or travel",
    category: 'education'
  },
  {
    title: "Code learning buddy",
    prompt: "Building a platform where coding beginners can pair program with peers and get instant help",
    audience: "Career changers learning to code who feel stuck and isolated",
    category: 'education'
  },
  {
    title: "Kids homework help",
    prompt: "An app that helps parents support their kids' homework without doing it for them",
    audience: "Parents of elementary school kids who struggle with new teaching methods",
    category: 'education'
  },

  // Creative
  {
    title: "Daily art prompts",
    prompt: "Sending creative prompts every day to help artists overcome creative block and build a consistent practice",
    audience: "Hobbyist artists who want to draw/paint more but lack motivation",
    category: 'creative'
  },
  {
    title: "Writing accountability",
    prompt: "A platform where writers set daily word count goals, track progress, and get gentle accountability from peers",
    audience: "Aspiring authors who struggle to finish their first book",
    category: 'creative'
  },
  {
    title: "Music collaboration",
    prompt: "Connecting musicians remotely to collaborate on songs, share feedback, and release music together",
    audience: "Independent musicians looking for creative partners",
    category: 'creative'
  },
]

/**
 * Get rotating suggestions based on current time
 * Rotates every 15 seconds to keep UI fresh
 */
export function getRotatingSuggestions(count: number = 3): IdeaStarter[] {
  const now = Math.floor(Date.now() / 1000) // seconds
  const intervalSeconds = 15
  const offset = Math.floor(now / intervalSeconds) * count
  
  const rotated: IdeaStarter[] = []
  for (let i = 0; i < count; i++) {
    const index = (offset + i) % IDEA_STARTERS.length
    rotated.push(IDEA_STARTERS[index])
  }
  
  return rotated
}

/**
 * Get initial suggestions (always the same for SSR/hydration)
 */
export function getInitialSuggestions(count: number = 3): IdeaStarter[] {
  return IDEA_STARTERS.slice(0, count)
}
