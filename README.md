# ChatFlux

ChatFlux is a real-time messaging, audio and video calling application built using the MERN stack (MongoDB, Express, React, Node.js). It supports real-time messaging, user authentication, and more, making it a great solution for live communication.

## Features

- **Real-Time Communication**: Enabled instant text, audio, video, and file sharing using Socket.io for real-time updates.
- **Audio & Video Recording**: Integrated functionality to record and send audio and video messages seamlessly.
- **Audio & Video Calls**: Implemented peer-to-peer audio and video calling using WebRTC.
- **Message Management**: Features for replying, deleting, and managing messages in one-on-one and group chats.
- **Group Chats**: Developed group chat functionality, allowing users to create and manage conversations in real time.
- **Authentication & Authorization**: Secured the app with JWT-based authentication, Email OTP verification, and OAuth 2.0 integration using Google and GitHub (via Passport.js).
- **User-friendly Interface**: A clean, responsive UI built with React.

## Technology Stack

- **Language**: Typescript
- **Frontend**: React, React Router, Formik, Tailwind CSS, WebRTC, React-Query
- **Backend**: Node.js, Express, Socket.io, JWT, Passport.js, Cloudinary, Nodemailer, Joi, Winston, JWT, BCrypt
- **Database**: MongoDB with Mongoose

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AnirudhPV123/ChatFlux.git

2. Set Up Environment Variables
Copy the .env.sample file and rename it to .env in both the frontend and backend directories.
Add the necessary values (e.g., MongoDB URI, API keys).

3. Set Up MongoDB Database
Ensure MongoDB is installed and running on your machine, or use a cloud MongoDB instance (e.g., MongoDB Atlas).

2. Install dependencies
   ```bash
   # start backend
   cd backend
   npm i
   redis-server
   npm run dev

   # start frontend
   cd ..
   cd frontend
   npm i
   npm run dev

   
