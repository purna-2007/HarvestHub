import { io } from "socket.io-client";

// Connect to your local backend server port instance
const socket = io("http://localhost:3000", {
  autoConnect: true
});

export default socket;
