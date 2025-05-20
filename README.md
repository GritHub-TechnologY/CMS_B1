# Church Management System API

A comprehensive RESTful API for managing church members, events, and administrative activities.

## 🚀 Features

- Member Management
  - Create, read, update, and archive member records
  - Comprehensive member profiles
  - Pagination and filtering
  - Soft deletion (archiving)

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Joi for validation
- Helmet for security
- Morgan for logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd church-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/church_management
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

4. Start the development server:
```bash
npm run dev
```

## 📚 API Documentation

### Member Endpoints

#### Create Member
- **POST** `/api/members`
- Creates a new member record

#### Get All Members
- **GET** `/api/members`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### Get Single Member
- **GET** `/api/members/:id`
- Returns a specific member by ID

#### Update Member
- **PUT** `/api/members/:id`
- Updates a member's information

#### Archive Member
- **DELETE** `/api/members/:id`
- Soft deletes a member (archives)

## 🔐 Security Features

- Input validation using Joi
- Helmet for HTTP headers security
- CORS enabled
- Error handling middleware
- Soft deletion for data integrity

## 🧪 Testing

Run tests using:
```bash
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, please open an issue in the repository. 