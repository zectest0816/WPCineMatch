// create-test-user.js
const mongoose = require('mongoose');
const UserModel = require('./server/models/User');

mongoose.connect("mongodb://127.0.0.1:27017/cinematch")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const createTestUser = async () => {
  try {
    // Check if test user already exists
    // const existingUser = await UserModel.findOne({ email: 'test@example.com' });
    
    // if (existingUser) {
    //   console.log('Test user already exists with ID:', existingUser._id);
    //   console.log('Use this ID in your frontend localStorage');
    //   process.exit(0);
    // }
    
    // Create a new test user
    const testUser = new UserModel({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '555-123-4567',
      favorites: [299536, 299534, 24428], // Some popular Marvel movie IDs
      watchlist: [505642, 447365, 299537], // Some other movie IDs
      watchHistory: [299536, 24428, 99861], // Some watched movie IDs
      preferredGenres: [28, 12, 878], // Action, Adventure, Science Fiction
      isActive: true,
      lastLogin: new Date()
    });
    
    const savedUser = await testUser.save();
    console.log('Test user created successfully with ID:', savedUser._id);
    console.log('Use this ID in your frontend localStorage');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.disconnect();
  }
};

createTestUser();