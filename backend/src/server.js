const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Serve React build in production
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SmartPOS Server running on http://localhost:${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}/api`);
  console.log(`\n🔐 Login: admin@smartpos.com / admin123\n`);
});
