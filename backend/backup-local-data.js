const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/inventory_system';

// Import models
const User = require('./models/User');
const Item = require('./models/Item');
const Sale = require('./models/Sale');
const Task = require('./models/Task');
const Reminder = require('./models/Reminder');

async function backupData() {
  try {
    console.log('🔄 Creating backup of local data...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_MONGODB_URI);
    console.log('✅ Connected to local MongoDB\n');

    // Create backup directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    // Export all data
    console.log('📤 Exporting data...');
    
    const users = await User.find({});
    const items = await Item.find({});
    const sales = await Sale.find({});
    const tasks = await Task.find({});
    const reminders = await Reminder.find({});

    const backupData = {
      timestamp: new Date().toISOString(),
      users: users,
      items: items,
      sales: sales,
      tasks: tasks,
      reminders: reminders
    };

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    console.log(`✅ Backup created successfully!`);
    console.log(`📁 Backup file: ${backupFile}`);
    console.log(`📊 Data backed up:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Items: ${items.length}`);
    console.log(`   - Sales: ${sales.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log(`   - Reminders: ${reminders.length}`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run backup
backupData();
