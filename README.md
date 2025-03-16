# Blog it - Modern Blogging Platform

A full-stack blogging application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (register, login, profile management)
- Create, read, update, and delete blog posts
- Rich text editor for writing posts
- Image upload for post covers and user profiles
- Tag-based categorization
- Responsive design with modern UI
- Like and comment functionality

## Deployment Guide

This application can be deployed completely for free using the following services:

### Frontend Deployment (Netlify)

1. Create a Netlify account at [netlify.com](https://www.netlify.com/)
2. Install the Netlify CLI: `npm install -g netlify-cli`
3. Navigate to the frontend directory: `cd frontend`
4. Login to Netlify: `netlify login`
5. Deploy the site: `netlify deploy --prod`

Alternatively, you can deploy directly from the Netlify dashboard:
1. Go to [app.netlify.com](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect to your GitHub/GitLab/Bitbucket repository
4. Set build command to `npm run build`
5. Set publish directory to `build`

### Backend Deployment (Render)

1. Create a Render account at [render.com](https://render.com/)
2. Create a new Web Service
3. Connect to your GitHub/GitLab repository
4. Set the following configuration:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `JWT_SECRET`: (your secure JWT secret)
   - `MONGODB_URI`: (your MongoDB Atlas connection string)

## Local Development

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000`

## File Structure

```
├── backend/                # Node.js/Express backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded files
│   ├── .env                # Environment variables
│   └── index.js            # Entry point
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── api/            # API service
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── styles/         # Styled components
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   └── package.json        # Dependencies
│
└── README.md               # Project documentation
```

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Token (JWT) for authentication
- Multer for file uploads

### Frontend
- React.js
- React Router for navigation
- Styled Components for styling
- Framer Motion for animations
- React Quill for rich text editing
- Axios for API requests

## License

This project is licensed under the MIT License.
