require('dotenv').config();
const app = require('./src/app');

// Retrieve port from env variables, default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TransitOps server is running on port ${PORT}`);
});
