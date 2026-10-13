import concurrently from 'concurrently';

console.log('🚀 Memulai Fullstack Kaze Suite (Backend :5001 & Frontend :5173)...');

const { result } = concurrently(
  [
    { command: 'npm --prefix backend run dev', name: 'BACKEND', prefixColor: 'cyan.bold' },
    { command: 'npm --prefix frontend run dev:vite', name: 'FRONTEND', prefixColor: 'green.bold' },
  ],
  {
    killOthers: ['failure', 'success'],
    restartTries: 0,
  }
);

result.catch(() => {
  // Graceful exit
});

