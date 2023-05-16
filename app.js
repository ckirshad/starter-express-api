const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create an Express app
const app = express();
const port = 3001;

app.use(cors());

// Connect to MongoDB Atlas
mongoose
  .connect(
    'mongodb+srv://gameadmin:sU0pU2hVmLZkCdL6@shoppingpuzzlegame.zwvct9u.mongodb.net/?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Create a schema for the user data
const playerSchema = new mongoose.Schema({
  name: String,
  email: String,
  highscore: Number,
});

// Create a user model
const User = mongoose.model('Player', playerSchema);

// Parse JSON bodies
app.use(express.json());

// Define a route to handle user data
app.post('/api/player', (req, res) => {
  const { name, email } = req.body;

  // Create a new user instance
  const user = new User({ name, email });

  // Save the user to the database
  user
    .save()
    .then(() => {
      res.status(201).json({ message: 'Player created successfully' });
    })
    .catch((error) => {
      console.error('Error saving user:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.post('/api/saveScore', (req, res) => {
  const { email, score } = req.body;

  db.collection('scores')
    .insertOne({ email, score })
    .then((result) => {
      res.status(200).json({ success: true, data: result.ops[0] });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Unable to save score' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
