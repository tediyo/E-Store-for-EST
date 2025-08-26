const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import User model
const User = require('./models/User');

async function migrateUsers() {
  try {
    console.log('Starting user migration...');
    
    // Find all users that don't have socialLogin field
    const usersToUpdate = await User.find({ 
      $or: [
        { socialLogin: { $exists: false } },
        { socialLogin: null }
      ]
    });
    
    console.log(`Found ${usersToUpdate.length} users to update`);
    
    if (usersToUpdate.length > 0) {
      // Update each user to have socialLogin.provider = 'local'
      const updatePromises = usersToUpdate.map(user => {
        return User.findByIdAndUpdate(user._id, {
          $set: {
            socialLogin: {
              provider: 'local',
              socialId: null,
              avatar: null
            }
          }
        });
      });
      
      await Promise.all(updatePromises);
      console.log('Successfully updated all users');
    } else {
      console.log('No users need updating');
    }
    
    // Verify the update
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    
    const localUsers = await User.find({ 'socialLogin.provider': 'local' });
    console.log(`Users with local provider: ${localUsers.length}`);
    
    const socialUsers = await User.find({ 'socialLogin.provider': { $ne: 'local' } });
    console.log(`Users with social providers: ${socialUsers.length}`);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateUsers();
