const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route
app.get("/", (req, res) => {
  console.log("Root endpoint called");
  res.json({ message: "Debug server is working!" });
});

// Member profile route
app.get("/api/member/profile", (req, res) => {
  console.log("Profile endpoint called");
  console.log("Headers:", req.headers);
  
  const userId = req.headers['user-id'];
  
  if (!userId) {
    console.log("No user-id header found");
    return res.status(401).json({ error: "User ID required" });
  }
  
  console.log("User ID:", userId);
  
  res.json({ 
    success: true, 
    data: {
      id: userId,
      message: "Profile endpoint is working!",
      debug: true
    }
  });
});

// Catch all route for debugging
app.use("*", (req, res) => {
  console.log("404 - Route not found:", req.method, req.originalUrl);
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Debug server running on http://localhost:${PORT}`);
  console.log("Available routes:");
  console.log("  GET /");
  console.log("  GET /api/member/profile");
}); 