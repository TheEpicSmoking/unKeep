# unKeep  

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Connected-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Educational-orange)](#license)

unKeep is a **web application for note management and sharing**. It extends traditional note-taking by introducing **real-time collaboration** and a **versioning system** that allows users to view, restore, and manage previous versions of their notes.  

The project is fully hosted and publicly accessible at:  
👉 [https://unkeep.onrender.com](https://unkeep.onrender.com)  

It was developed as part of the **Fondamenti del Web** course at **Politecnico di Bari**, using the **MERN stack** with **Material UI (MUI)** for the frontend.  

---

## Features  
- 📝 Create, edit, and share notes  
- 🤝 Real-time collaboration  
- ⏪ Version history with restore support  
- 🌐 Hosted and accessible online  
- 🐳 Easy local development with Docker  

---

## Tech Stack  
- **Frontend**: React + Vite + MUI  
- **Backend**: Node.js + Express  
- **Database**: MongoDB  
- **Authentication**: JWT (access & refresh tokens)  
- **Deployment**: Docker & docker-compose  

---

## Running Locally with Docker  

### 1. Clone the repository  
```
git clone https://github.com/<your-username>/unkeep.git
cd unkeep
```

### 2. Create environment files  
You need two `.env` files:  

#### `client/.env`
```
VITE_BACKEND_URL="http://localhost:8000/"
```

#### `server/.env`
```
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://mongo:27017/unkeep
ACCESS_JWT_SECRET=your_access_secret
REFRESH_JWT_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:8080
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

⚠️ Replace `your_access_secret`, `your_refresh_secret`, and Cloudinary keys with your own secrets.  

### 3. Start the stack  
From the project root:  
```
sudo docker-compose up -d --build
```

This will start:  
- **Frontend** → [http://localhost:8080](http://localhost:8080)  
- **Backend** → [http://localhost:8000](http://localhost:8000)  
- **Database** → MongoDB at port `27017` (inside container `mongo`)  

---

## License  
This project was developed for educational purposes as part of a university course.
