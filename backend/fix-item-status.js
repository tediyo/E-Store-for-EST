const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import the Item model
const Item = require('./models/Item');

async function fixItemStatus() {
  try {
    const itemId = '68a46175396bf3cbf0200abf';
    
    console.log(`Fixing status for item: ${itemId}\n`);
    
    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      console.log('❌ Item not found');
      return;
    }
    
    console.log('Current item details:');
    console.log(`  Name: ${item.name}`);
    console.log(`  Quantity: ${item.quantity}`);
    console.log(`  Current Status: ${item.status}`);
    
    // Calculate correct status
    let correctStatus;
    if (item.quantity === 0) {
      correctStatus = 'out_of_stock';
    } else if (item.quantity <= 5) {
      correctStatus = 'low_stock';
    } else {
      correctStatus = 'in_stock';
    }
    
    console.log(`\nCorrect status should be: ${correctStatus}`);
    
    if (item.status === correctStatus) {
      console.log('✅ Status is already correct!');
    } else {
      console.log('🔄 Updating status...');
      
      // Update the status
      await Item.findByIdAndUpdate(itemId, { status: correctStatus });
      
      // Verify the update
      const updatedItem = await Item.findById(itemId);
      console.log(`✅ Status updated successfully to: ${updatedItem.status}`);
    }
    
    console.log('\nStatus fix completed!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
fixItemStatus();
