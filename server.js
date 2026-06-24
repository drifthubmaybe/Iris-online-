const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Store last heartbeat timestamp for each player
const onlinePlayers = new Map(); // playerName -> timestamp (ms)

// Clean up stale entries every 5 seconds (optional)
setInterval(() => {
  const now = Date.now();
  for (const [name, time] of onlinePlayers) {
    if (now - time > 5000) { // 5 seconds timeout
      onlinePlayers.delete(name);
    }
  }
}, 5000);

// Heartbeat endpoint – called by each client every 1 second
app.post('/api/heartbeat', (req, res) => {
  const { player } = req.body;
  if (!player) {
    return res.status(400).json({ error: 'Missing "player" field' });
  }
  onlinePlayers.set(player, Date.now());
  res.json({ success: true });
});

// Get online players (heartbeat within last 3 seconds)
app.get('/api/online', (req, res) => {
  const now = Date.now();
  const online = [];
  for (const [name, time] of onlinePlayers) {
    if (now - time <= 3000) { // 3 seconds tolerance
      online.push(name);
    }
  }
  res.json({ online });
});

// Dashboard homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});