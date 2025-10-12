# 🚀 MongoDB Atlas Migration Guide

This guide will help you migrate your E Store application from local MongoDB to MongoDB Atlas.

## Prerequisites

- MongoDB running locally (for data export)
- Internet connection
- MongoDB Atlas account

## Step 1: Create MongoDB Atlas Account & Cluster

### 1.1 Sign up for MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### 1.2 Create a New Project
1. Click "New Project"
2. Name it "E Store Project"
3. Click "Next" and "Create Project"

### 1.3 Create a New Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select **AWS** as cloud provider
4. Choose a region close to your users
5. Name your cluster: `e-store-cluster`
6. Click "Create"

## Step 2: Configure Database Access

### 2.1 Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `estore-admin`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

## Step 3: Configure Network Access

### 3.1 Add IP Address
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

## Step 4: Get Connection String

### 4.1 Connect to Your Cluster
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver
5. Copy the connection string

### 4.2 Update Connection String
Replace `<password>` with your database user password and `<dbname>` with your database name:

```
mongodb+srv://estore-admin:<password>@e-store-cluster.xxxxx.mongodb.net/inventory_system?retryWrites=true&w=majority
```

## Step 5: Backup Local Data (Optional but Recommended)

```bash
cd backend
node backup-local-data.js
```

This will create a backup file in the `backups` folder.

## Step 6: Update Configuration

### 6.1 Update config.env
Replace the MONGODB_URI in `backend/config.env`:

```env
MONGODB_URI=mongodb+srv://estore-admin:YOUR_PASSWORD@e-store-cluster.xxxxx.mongodb.net/inventory_system?retryWrites=true&w=majority
```

### 6.2 Update for Production
For production, also update:
```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

## Step 7: Migrate Data

### 7.1 Run Migration Script
```bash
cd backend
node migrate-to-atlas.js
```

This script will:
- Connect to your local MongoDB
- Export all data (users, items, sales, tasks, reminders)
- Connect to MongoDB Atlas
- Import all data to Atlas

## Step 8: Test the Migration

### 8.1 Start Your Application
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### 8.2 Verify Data
1. Login to your application
2. Check if all data is present
3. Test creating new records
4. Verify all functionality works

## Step 9: Update Production Environment

### 9.1 Environment Variables
Update your production environment variables:
- `MONGODB_URI`: Your Atlas connection string
- `NODE_ENV`: `production`
- `FRONTEND_URL`: Your production domain

### 9.2 Security Considerations
- Use environment variables for sensitive data
- Never commit passwords to version control
- Use IP whitelisting for production
- Enable MongoDB Atlas monitoring

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check your IP address in Network Access
   - Verify the connection string is correct

2. **Authentication Failed**
   - Verify username and password
   - Check database user privileges

3. **Data Not Migrated**
   - Check if local MongoDB is running
   - Verify the migration script completed successfully

4. **Application Errors**
   - Check server logs for connection errors
   - Verify environment variables are loaded

### Getting Help

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Community Forums](https://community.mongodb.com/)
- Check the application logs for specific error messages

## Security Best Practices

1. **Use Strong Passwords**
2. **Enable IP Whitelisting**
3. **Use Environment Variables**
4. **Enable MongoDB Atlas Monitoring**
5. **Regular Backups**
6. **Update Dependencies Regularly**

## Next Steps

After successful migration:
1. Monitor your application performance
2. Set up MongoDB Atlas monitoring
3. Configure automated backups
4. Consider upgrading to a paid tier for production use
5. Implement proper error handling and logging

---

**Note**: Keep your local MongoDB running until you're confident the migration was successful and your application is working properly with Atlas.
