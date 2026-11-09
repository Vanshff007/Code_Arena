// Beginner's guide content. Each section links to the page where the player
// does that step; guide.test.js checks every link is a real route.
export const GUIDE_SECTIONS = [
  {
    title: 'Practice first',
    link: { to: '/problems', label: 'Open practice' },
    points: [
      'Pick any problem from Practice. There is no clock and nobody is watching.',
      'Most problems give you a Solution function to fill in. Return the answer; you do not read input or write main.',
      'Run checks your code against the custom input box. Submit checks it against every test, including hidden ones.',
      'Try the daily problem on the dashboard to keep a streak.',
    ],
  },
  {
    title: 'Your first battle',
    link: { to: '/battle', label: 'Find a match' },
    points: [
      'Quick match pairs you with the next player in the queue. Blitz is five minutes on an Easy problem.',
      'To play a friend, create a room and send them the room code.',
      'In a room, both players press "I\'m ready". A five-second countdown starts the battle.',
      'You both get the same problem and fifteen minutes. The first accepted submission wins.',
      'If time runs out, more passed test cases wins.',
    ],
  },
  {
    title: 'Battle rules',
    points: [
      'Battles are played in fullscreen. Outside it, the problem is hidden and the clock keeps running.',
      'Copy, paste and right-click are off during a battle. Type your own code.',
      'If you disconnect, you have 20 seconds to come back before you forfeit.',
      'Chat with your opponent is open, so keep it friendly.',
    ],
  },
  {
    title: 'Rating and progress',
    link: { to: '/skills', label: 'See your skills' },
    points: [
      'Ratings use ELO. Beating a stronger player earns more; losing to a weaker one costs more.',
      'Solved problems earn XP per topic. The Skills page shows your weakest topics and what to practice next.',
      'After a battle, watch the replay and read the editorial to learn the intended solution.',
      'Link your LeetCode account in your profile to get problem suggestions there too.',
    ],
  },
];
