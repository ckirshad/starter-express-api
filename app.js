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

  // Check if user with email already exists
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        User.findOneAndUpdate({ email }, { name }, { new: true })
          .then((updatedUser) => {
            if (!updatedUser) {
              return res.status(404).json({ error: 'User not found' });
            }
          })
          .catch((error) => {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal server error' });
          });

        return res.status(201).json({
          error: 'User already exists',
          isUserExist: true,
          userDetails: existingUser,
        });
      }

      // Create a new user instance
      const newUser = new User({ name, email, highscore: 0 });

      // Save the user to the database
      newUser
        .save()
        .then((savedUser) => {
          res.status(201).json({
            message: 'User created successfully',
            isUserExist: false,
            userDetails: savedUser,
          });
        })
        .catch((error) => {
          console.error('Error saving user:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    })
    .catch((error) => {
      console.error('Error checking existing user:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.post('/api/saveScore', (req, res) => {
  const { email, highscore } = req.body;

  User.findOneAndUpdate({ email }, { highscore }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(201).json({ message: 'Score updated', updatedUser });
    })
    .catch((error) => {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/api/leaderboard', (req, res) => {
  User.find()
    .sort({ highscore: -1 })
    .limit(10)
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.error('Error retrieving top users:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});
