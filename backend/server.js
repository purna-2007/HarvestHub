require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { initializeDatabase } = require('./config/database');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const io = new Server(server, { cors: { origin: allowedOrigin, methods: ['GET','POST','PUT','PATCH','DELETE'] } });
app.set('io', io);
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (_req,res) => res.json({ success:true, service:'HarvestHub API' }));
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/disease', diseaseRoutes);

const last10 = value => String(value || '').replace(/\D/g,'').slice(-10);
io.on('connection', socket => {
  socket.on('register_farmer', data => { const phone=last10(data?.farmer_phone || data?.phone); if(phone) socket.join(`farmer:${phone}`); });
  socket.on('register_worker', data => { const phone=last10(data?.worker_phone || data?.phone); if(phone) socket.join(`worker:${phone}`); });
});

const port = Number(process.env.PORT || 5001);
initializeDatabase()
  .then(() => server.listen(port, () => console.log(`HarvestHub MySQL API listening on port ${port}`)))
  .catch(error => { console.error('Database initialization failed:', error); process.exit(1); });
