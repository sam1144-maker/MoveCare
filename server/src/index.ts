import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import caregiverRoutes from './routes/caregiverRoutes';
import recordsRoutes from './routes/recordsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173",
    "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/records', recordsRoutes);

import http from 'http';
import { initVitalsSimulator } from './services/vitalsSimulator';

// Database Connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Create HTTP Server to share with WebSocket
    const server = http.createServer(app);
    initVitalsSimulator(server);

    server.listen(PORT, () => console.log(`Server & WebSocket running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
