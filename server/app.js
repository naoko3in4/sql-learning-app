const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ルート設定
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/auth', require('./routes/auth'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 