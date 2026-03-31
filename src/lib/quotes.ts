export const MOTIVATIONAL_QUOTES = [
  "Action is the foundational key to all success. — Pablo Picasso",
  "The secret of getting ahead is getting started. — Mark Twain",
  "It’s not at all that I’m so smart, it’s just that I stay with problems longer. — Albert Einstein",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work. — Stephen King",
  "If you spend too much time thinking about a thing, you’ll never get it done. — Bruce Lee",
  "The best way to predict the future is to create it. — Peter Drucker",
  "Focus on being productive instead of busy. — Tim Ferriss",
  "Done is better than perfect. — Sheryl Sandberg",
  "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
  "Do not wait to strike till the iron is hot; but make it hot by striking. — William Butler Yeats",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Efficiency is doing things right; effectiveness is doing the right things. — Peter Drucker",
  "Lost time is never found again. — Benjamin Franklin",
  "The way to get started is to quit talking and begin doing. — Walt Disney",
  // ... Adding more programmatically or curated
  "Your mind is for having ideas, not holding them. — David Allen",
  "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
  "Deep work is the superpower of the 21st century. — Cal Newport",
  "A year from now you may wish you had started today. — Karen Lamb",
  "Don't count the days, make the days count. — Muhammad Ali",
  "The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt",
  "Quality is not an act, it is a habit. — Aristotle",
  "Discipline is choosing between what you want now and what you want most. — Abraham Lincoln",
  "Work hard in silence, let your success be your noise. — Frank Ocean",
  "Everything you’ve ever wanted is on the other side of fear. — George Addair",
  "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
  "Success usually comes to those who are too busy to be looking for it. — Henry David Thoreau",
  "The more I want to get something done, the less I call it work. — Richard Bach",
  "It always seems impossible until it's done. — Nelson Mandela",
  "Believe you can and you're halfway there. — Theodore Roosevelt"
];

/**
 * Returns a deterministic quote for the current day.
 * It changes daily but stays the same throughout the day.
 */
export function getQuoteOfDay(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
