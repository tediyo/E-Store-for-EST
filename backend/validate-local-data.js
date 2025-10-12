const mongoose = require('mongoose');

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/inventory_system';

// Import models
const User = require('./models/User');
const Item = require('./models/Item');
const Sale = require('./models/Sale');
const Task = require('./models/Task');
const Reminder = require('./models/Reminder');

async function validateData() {
  try {
    console.log('🔍 Validating local data before migration...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_MONGODB_URI);
    console.log('✅ Connected to local MongoDB\n');

    // Validate Users
    console.log('👥 Validating Users...');
    const users = await User.find({});
    console.log(`   - Total users: ${users.length}`);
    
    const invalidUsers = users.filter(user => !user.username || !user.email);
    if (invalidUsers.length > 0) {
      console.log(`   ⚠️  Invalid users: ${invalidUsers.length}`);
      invalidUsers.forEach(user => {
        console.log(`      - User ID: ${user._id}, Username: ${user.username}, Email: ${user.email}`);
      });
    } else {
      console.log('   ✅ All users are valid');
    }

    // Validate Items
    console.log('\n📦 Validating Items...');
    const items = await Item.find({});
    console.log(`   - Total items: ${items.length}`);
    
    const invalidItems = items.filter(item => !item.name || !item.shoeType || item.quantity < 0);
    if (invalidItems.length > 0) {
      console.log(`   ⚠️  Invalid items: ${invalidItems.length}`);
      invalidItems.forEach(item => {
        console.log(`      - Item ID: ${item._id}, Name: ${item.name}, Quantity: ${item.quantity}`);
      });
    } else {
      console.log('   ✅ All items are valid');
    }

    // Validate Sales
    console.log('\n💰 Validating Sales...');
    const sales = await Sale.find({});
    console.log(`   - Total sales: ${sales.length}`);
    
    const invalidSales = sales.filter(sale => {
      const basicValidation = !sale.basePrice || 
             sale.basePrice < 0 || 
             !sale.sellingPrice || 
             sale.sellingPrice < 0 || 
             sale.profit < 0 ||
             !sale.quantity ||
             sale.quantity < 1;
      
      // Check out-of-store sales requirements
      const outOfStoreValidation = sale.saleType === 'out_of_store' && (
        !sale.fromWhom || 
        !sale.itemName || 
        !sale.itemType
      );
      
      return basicValidation || outOfStoreValidation;
    });
    
    if (invalidSales.length > 0) {
      console.log(`   ⚠️  Invalid sales: ${invalidSales.length}`);
      invalidSales.forEach(sale => {
        console.log(`      - Sale ID: ${sale._id}`);
        console.log(`        Base Price: ${sale.basePrice}, Selling Price: ${sale.sellingPrice}`);
        console.log(`        Profit: ${sale.profit}, Quantity: ${sale.quantity}`);
        console.log(`        Sale Type: ${sale.saleType}`);
      });
    } else {
      console.log('   ✅ All sales are valid');
    }

    // Validate Tasks
    console.log('\n📋 Validating Tasks...');
    const tasks = await Task.find({});
    console.log(`   - Total tasks: ${tasks.length}`);
    
    const invalidTasks = tasks.filter(task => !task.clientPhone || !task.behavioralDetails);
    if (invalidTasks.length > 0) {
      console.log(`   ⚠️  Invalid tasks: ${invalidTasks.length}`);
      invalidTasks.forEach(task => {
        console.log(`      - Task ID: ${task._id}, Phone: ${task.clientPhone}`);
      });
    } else {
      console.log('   ✅ All tasks are valid');
    }

    // Validate Reminders
    console.log('\n⏰ Validating Reminders...');
    const reminders = await Reminder.find({});
    console.log(`   - Total reminders: ${reminders.length}`);
    
    const invalidReminders = reminders.filter(reminder => !reminder.title || !reminder.actionAt);
    if (invalidReminders.length > 0) {
      console.log(`   ⚠️  Invalid reminders: ${invalidReminders.length}`);
      invalidReminders.forEach(reminder => {
        console.log(`      - Reminder ID: ${reminder._id}, Title: ${reminder.title}`);
      });
    } else {
      console.log('   ✅ All reminders are valid');
    }

    // Summary
    console.log('\n📊 Validation Summary:');
    console.log(`   - Users: ${users.length} (${invalidUsers.length} invalid)`);
    console.log(`   - Items: ${items.length} (${invalidItems.length} invalid)`);
    console.log(`   - Sales: ${sales.length} (${invalidSales.length} invalid)`);
    console.log(`   - Tasks: ${tasks.length} (${invalidTasks.length} invalid)`);
    console.log(`   - Reminders: ${reminders.length} (${invalidReminders.length} invalid)`);

    const totalInvalid = invalidUsers.length + invalidItems.length + invalidSales.length + invalidTasks.length + invalidReminders.length;
    
    if (totalInvalid === 0) {
      console.log('\n🎉 All data is valid! Ready for migration.');
    } else {
      console.log(`\n⚠️  Found ${totalInvalid} invalid records. The migration script will clean these automatically.`);
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run validation
validateData();
