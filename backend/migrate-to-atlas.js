const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Item = require('./models/Item');
const Sale = require('./models/Sale');
const Task = require('./models/Task');
const Reminder = require('./models/Reminder');

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/inventory_system';

// Atlas MongoDB connection (update with your actual connection string)
const ATLAS_MONGODB_URI = process.env.MONGODB_URI;

async function migrateData() {
  try {
    console.log('🚀 Starting migration to MongoDB Atlas...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_MONGODB_URI);
    console.log('✅ Connected to local MongoDB\n');

    // Export data from local database
    console.log('📤 Exporting data from local database...');
    
    const users = await User.find({});
    const items = await Item.find({});
    const sales = await Sale.find({});
    const tasks = await Task.find({});
    const reminders = await Reminder.find({});

    console.log(`📊 Data to migrate:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Items: ${items.length}`);
    console.log(`   - Sales: ${sales.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Reminders: ${reminders.length}\n`);

    // Disconnect from local MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from local MongoDB\n');

    // Connect to Atlas MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Clear existing data in Atlas (optional - remove if you want to keep existing data)
    console.log('🧹 Clearing existing data in Atlas...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await Sale.deleteMany({});
    await Task.deleteMany({});
    await Reminder.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Import data to Atlas
    console.log('📥 Importing data to Atlas...');
    
    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`✅ Imported ${users.length} users`);
    }
    
    if (items.length > 0) {
      await Item.insertMany(items);
      console.log(`✅ Imported ${items.length} items`);
    }
    
    if (sales.length > 0) {
      // Clean and validate sales data before importing
      console.log('🧹 Cleaning sales data...');
      const cleanedSales = sales.map(sale => {
        // Ensure basePrice exists and is valid
        if (!sale.basePrice || sale.basePrice < 0) {
          sale.basePrice = sale.sellingPrice || 0;
        }
        
        // Ensure profit is not negative (set to 0 if negative)
        if (sale.profit < 0) {
          sale.profit = 0;
        }
        
        // Ensure sellingPrice exists
        if (!sale.sellingPrice || sale.sellingPrice < 0) {
          sale.sellingPrice = sale.basePrice || 0;
        }
        
        // Recalculate totalAmount
        sale.totalAmount = sale.quantity * sale.sellingPrice;
        
        // Recalculate profit if it's still invalid
        if (!sale.profit || sale.profit < 0) {
          sale.profit = Math.max(0, sale.sellingPrice - sale.basePrice) * sale.quantity;
        }
        
        // Handle out-of-store sales required fields
        if (sale.saleType === 'out_of_store') {
          // Ensure fromWhom exists
          if (!sale.fromWhom) {
            sale.fromWhom = 'Unknown Supplier';
          }
          
          // Ensure itemName exists
          if (!sale.itemName) {
            sale.itemName = 'Unknown Item';
          }
          
          // Ensure itemType exists
          if (!sale.itemType) {
            sale.itemType = 'Unknown Type';
          }
        }
        
        // Ensure clientDetails exists (can be empty object)
        if (!sale.clientDetails) {
          sale.clientDetails = {
            phone: '',
            address: '',
            intentionalBehaviour: ''
          };
        }
        
        return sale;
      });
      
      await Sale.insertMany(cleanedSales);
      console.log(`✅ Imported ${cleanedSales.length} sales (cleaned and validated)`);
    }
    
    if (tasks.length > 0) {
      await Task.insertMany(tasks);
      console.log(`✅ Imported ${tasks.length} tasks`);
    }
    
    if (reminders.length > 0) {
      await Reminder.insertMany(reminders);
      console.log(`✅ Imported ${reminders.length} reminders`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Update your MONGODB_URI in config.env with your actual Atlas connection string');
    console.log('   2. Replace <password> with your actual database user password');
    console.log('   3. Replace xxxxx with your actual cluster identifier');
    console.log('   4. Restart your backend server');
    console.log('   5. Test your application to ensure everything works');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run migration
migrateData();
