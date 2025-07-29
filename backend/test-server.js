const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Test server is working!" });
});

// Test member profile route
app.get("/api/member/profile", (req, res) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: "User ID required" });
  }
  
  res.json({ 
    success: true, 
    data: {
      id: userId,
      message: "Profile endpoint is working!"
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
}); 