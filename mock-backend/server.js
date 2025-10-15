// Simple Express mock backend for signup
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/users/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  // Simulate user creation and token
  return res.status(201).json({
    user: { id: Date.now(), name, email },
    token: 'mock-token-123',
    message: 'Registration successful (mock)'
  });
});

app.get('/', (req, res) => res.send('Mock backend running'));

app.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
