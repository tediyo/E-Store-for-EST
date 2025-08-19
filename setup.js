const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function createAdminUser() {
  try {
    console.log('🚀 Setting up Inventory Management System...\n');
    
    // Check if server is running
    try {
      await axios.get(`${API_BASE}/auth/profile`);
      console.log('✅ Server is already running and has users');
      return;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running. Please start the backend first:');
        console.log('   cd backend && npm run dev\n');
        return;
      }
    }

    // Create admin user
    const adminData = {
      username: 'admin',
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin'
    };

    console.log('👤 Creating admin user...');
    const response = await axios.post(`${API_BASE}/auth/register`, adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('\n🎉 Setup complete! You can now login with these credentials.\n');
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@inventory.com');
      console.log('🔑 Password: admin123\n');
    } else {
      console.error('❌ Error creating admin user:', error.response?.data?.message || error.message);
    }
  }
}

// Run setup
createAdminUser();
