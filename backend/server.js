const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");

const app = express();
const server = http.createServer(app);

// Enable cross-origin calls and payload parsers
app.use(cors());
app.use(express.json());

// Bind routing modules
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);

// Establish real-time tracking network sockets setup
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("⚡ A user connected to real-time notification stream:", socket.id);
  
  socket.on("job_accepted", (data) => {
    io.emit("notify_farmer", { message: `Worker accepted your job posting!`, jobId: data.jobId });
  });

  socket.on("disconnect", () => console.log("User disconnected."));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Node Server running flawlessly on http://localhost:${PORT}`);
});
