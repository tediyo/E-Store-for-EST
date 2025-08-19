# Inventory Management System

A full-stack inventory management system built with Next.js frontend, Node.js backend, and MongoDB database. Perfect for managing shoe store inventory, sales, and daily tasks.

## Features

### 🔐 Authentication
- User registration and login
- Role-based access control (Admin/User)
- JWT token-based authentication
- Secure password hashing

### 📦 Store Management
- Add new items to inventory
- Update item details and quantities
- Track item status (in stock, low stock, out of stock)
- Manage suppliers and descriptions

### 🛒 Sales Management
- Record item sales (store and out-of-store)
- Track client details (phone, address, behavior)
- Automatic profit calculation
- Real-time inventory updates

### 📋 Daily Task Counter
- Comprehensive task tracking form
- Shoe type categorization
- Sale location tracking (store vs out-of-store)
- Cost tracking (base price, taxi, other costs)
- Supplier information
- Client behavior analysis

### 📊 Interactive Dashboard
- Real-time overview of all metrics
- Time-based filtering (daily, weekly, monthly, yearly)
- Total transactions, profits, and revenue
- Inventory status overview
- Sales analytics by location
- Responsive design for all devices

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/inventory_system
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas and update the connection string in `.env`

5. **Run the application**
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run separately:
   npm run dev:frontend  # Frontend on http://localhost:3000
   npm run dev:backend   # Backend on http://localhost:5000
   ```

## Project Structure

```
inventory-management-system/
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Items (Inventory)
- `GET /api/items` - Get all items
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/stats/overview` - Get inventory stats

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/stats/overview` - Get sales stats

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/overview` - Get task stats

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard data
- `GET /api/dashboard/analytics` - Get time-based analytics

## Usage

### 1. First Time Setup
1. Start the application
2. Register an admin account
3. Login with your credentials

### 2. Adding Items
1. Navigate to Inventory section
2. Click "Add New Item"
3. Fill in item details (name, shoe type, prices, quantity, supplier)
4. Save the item

### 3. Recording Sales
1. Go to Sales section
2. Click "Record Sale"
3. Select item, enter quantity and selling price
4. Choose sale location (store or out-of-store)
5. Add client details if needed
6. Save the sale

### 4. Creating Tasks
1. Navigate to Tasks section
2. Click "Create Task"
3. Fill in all required fields:
   - Shoe type
   - Sale location (radio button)
   - Base price
   - Profit gained
   - Taxi and other costs
   - Supplier information
   - Client details
4. Save the task

### 5. Dashboard Analytics
1. View the main dashboard for overview
2. Use time filters (today, week, month, year)
3. Analyze sales, inventory, and task metrics
4. Monitor profits and costs

## Features in Detail

### Dashboard Flexibility
- **Daily View**: Shows metrics for the current day
- **Weekly View**: Aggregates data for the last 7 days
- **Monthly View**: Shows current month's performance
- **Yearly View**: Annual overview and trends
- **Custom Range**: Select specific date ranges

### Real-time Updates
- Inventory quantities update automatically after sales
- Dashboard refreshes with latest data
- Status indicators for stock levels
- Profit calculations in real-time

### Client Management
- Store client contact information
- Track client behavior patterns
- Associate sales with specific clients
- Analyze client preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

## Future Enhancements

- [ ] Advanced reporting and exports
- [ ] Barcode scanning integration
- [ ] Mobile app development
- [ ] Multi-store support
- [ ] Advanced analytics and forecasting
- [ ] Email notifications
- [ ] Backup and restore functionality
