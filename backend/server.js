// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const db = require("./db");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow PDF, images, and common document formats
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and documents are allowed.'), false);
    }
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'user-id', 'admin-id']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Middleware to check if admin exists and get admin info
const getAdminInfo = (req, res, next) => {
  const adminId = req.headers['user-id'];
  
  if (!adminId) {
    return res.status(401).json({ error: "User ID required" });
  }
  
  const sql = `
    SELECT 
      id,
      username,
      email,
      full_name,
      role,
      is_active,
      created_at
    FROM admins 
    WHERE id = ? AND is_active = TRUE
  `;
  
  db.query(sql, [adminId], (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    req.admin = results[0];
    next();
  });
};

// Admin middleware - check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  console.log(`Admin check for admin ${req.admin.id} (${req.admin.role})`);
  
  // Check if admin is active and has appropriate role
  if (req.admin.is_active && ['super_admin', 'admin', 'moderator'].includes(req.admin.role)) {
    console.log(`✅ Admin access granted for admin ${req.admin.id}`);
    next();
  } else {
    console.log(`❌ Admin access denied for admin ${req.admin.id}`);
    return res.status(403).json({ error: "Admin access required" });
  }
};

// Member middleware - get user info from organization_members table
const getUserInfo = (req, res, next) => {
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: "User ID required" });
  }
  
  const sql = `
    SELECT 
      id,
      organization_type,
      organization_name,
      email,
      mobile_no,
      spoc_name,
      spoc_designation,
      pan_no,
      reg_address,
      reg_city,
      reg_state,
      reg_pincode,
      reg_website,
      reg_date,
      status,
      created_at
    FROM organization_members 
    WHERE id = ?
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    req.user = results[0];
    next();
  });
};

// Member middleware - check if user is active member
const requireActiveMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  console.log(`Member status check for user ${req.user.id}: ${req.user.status}`);
  
  if (req.user.status !== 'active') {
    console.log(`❌ Inactive member access denied for user ${req.user.id}`);
    return res.status(403).json({ 
      error: "Your account is inactive. Please contact the administrator.",
      status: req.user.status
    });
  }
  
  console.log(`✅ Active member access granted for user ${req.user.id}`);
  next();
};

// Member middleware - check if user is member (active or inactive)
const requireMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Allow both active and inactive members (for login purposes)
  next();
};

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

// Registration Route
app.post("/register", async (req, res) => {
  console.log("Registration request body:", req.body);
  
  const {
    ngoType,
    ngoName,
    email,
    mobileNo,
    spocName,
    panNo,
    password,
    spocDesignation,
    address,
    city,
    state,
    pincode,
    website,
    registrationDate
  } = req.body;

  // Map frontend field names to new backend/database field names
  const organization_type = ngoType;
  const organization_name = ngoName;
  const pan_no = panNo;
  const mobile_no = mobileNo;
  const spoc_name = spocName;
  const spoc_designation = spocDesignation || "";
  const reg_address = address || "";
  const reg_city = city || "";
  const reg_state = state || "";
  const reg_pincode = pincode || "";
  const reg_website = website || "";
  const reg_date = registrationDate || new Date().toISOString().slice(0, 10);

  if (
    !organization_type ||
    !organization_name ||
    !email ||
    !mobile_no ||
    !spoc_name ||
    !pan_no ||
    !password
  ) {
    return res.status(400).json({ error: "All required fields are needed." });
  }

  try {
    // Store password as plain text (for demo/simple use only)
    // Insert trust member into database
    const sql = `INSERT INTO organization_members (
      organization_type, organization_name, pan_no, email, mobile_no, spoc_name, spoc_designation, reg_address, reg_city, reg_state, reg_pincode, reg_website, reg_date, password_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [
        organization_type,
        organization_name,
        pan_no,
        email,
        mobile_no,
        spoc_name,
        spoc_designation,
        reg_address,
        reg_city,
        reg_state,
        reg_pincode,
        reg_website,
        reg_date,
        password // store as plain text in password_hash column
      ],
      (err, result) => {
        if (err) {
          console.log("Database error during registration:", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Email or PAN already registered." });
          }
          return res.status(500).json({ error: "Database error.", details: err.message });
        }
        console.log("Registration successful for:", email);
        res.status(201).json({ message: "Registration successful!" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error.", details: err });
  }
});

app.post("/login", (req, res) => {
  console.log("Login request received:", req.body);
  const { username, password, userType = "admin" } = req.body;
  console.log("Login attempt:", { username, password: password ? "***provided***" : "***missing***", userType });
  if (!username || !password) {
    console.log("Missing username or password");
    return res.status(400).json({ error: "Username and password are required." });
  }
  
  if (userType === "admin") {
    // Admin login
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    console.log("Username type:", isEmail ? "email" : "username");
    
    const sql = isEmail
      ? "SELECT * FROM admins WHERE email = ? AND is_active = TRUE"
      : "SELECT * FROM admins WHERE username = ? AND is_active = TRUE";
      
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.log("Database error:", err);
        return res.status(500).json({ error: "Database error.", details: err });
      }
      console.log("Database results:", results.length > 0 ? "Admin found" : "Admin not found");
      if (!results || results.length === 0) {
        console.log("Admin not found in database");
        return res.status(401).json({ error: "Invalid username or password." });
      }
      const admin = results[0];
      console.log("Admin found:", { id: admin.id, email: admin.email, role: admin.role });
      const match = await bcrypt.compare(password, admin.password_hash);
      console.log("Password match:", match);
      if (!match) {
        console.log("Password does not match");
        return res.status(401).json({ error: "Invalid username or password." });
      }
      console.log("Login successful for admin:", admin.id);
      const responseData = { 
        message: "Login successful!", 
        userId: admin.id,
        userType: 'admin',
        role: admin.role,
        fullName: admin.full_name
      };
      console.log("Sending response:", responseData);
      res.json(responseData);
    });
  } else {
    // Trust Member login
    console.log("Trust member login attempt");
    
    // Check if username is email or mobile number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    const isMobile = /^[6-9]\d{9}$/.test(username);
    
    if (!isEmail && !isMobile) {
      console.log("Invalid username format - must be email or mobile number");
      return res.status(400).json({ error: "Please enter a valid email address or mobile number." });
    }
    
    // Query organization_members table
    const sql = isEmail
      ? "SELECT * FROM organization_members WHERE email = ? AND is_active = TRUE"
      : "SELECT * FROM organization_members WHERE mobile_no = ? AND is_active = TRUE";
      
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.log("Database error:", err);
        return res.status(500).json({ error: "Database error.", details: err });
      }
      
      console.log("Database results:", results.length > 0 ? "Member found" : "Member not found");
      if (!results || results.length === 0) {
        console.log("Trust member not found in database");
        return res.status(401).json({ error: "Invalid email/mobile or password." });
      }
      
      const member = results[0];
      console.log("Member found:", { id: member.id, email: member.email, status: member.status });
      
      // Check if member is active
      if (member.status !== 'active') {
        console.log("Member account is not active:", member.status);
        return res.status(403).json({ 
          error: "Your account is not active. Please contact the administrator.",
          status: member.status
        });
      }
      
      // Verify password (plain text)
      if (member.password_hash !== password) {
        console.log("Password does not match");
        return res.status(401).json({ error: "Invalid email/mobile or password." });
      }
      
      console.log("Login successful for trust member:", member.id);
      res.json({ 
        message: "Login successful!", 
        userId: member.id,
        userType: 'member',
        organizationName: member.organization_name,
        organizationType: member.organization_type,
        spocName: member.spoc_name,
        status: member.status
      });
    });
  }
});

// Email transporter setup
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS ? "***SET***" : "***NOT SET***");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email connection
transporter.verify(function(error, success) {
  if (error) {
    console.log("Email connection error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Forgot Password - Generate and send OTP
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  try {
    // Check if admin exists
    const sql = "SELECT * FROM admins WHERE email = ? AND is_active = TRUE";
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error." });
      if (!results || results.length === 0) {
        return res.status(404).json({ error: "Admin not found." });
      }
      
      // Generate OTP
      const otp = generateOTP();
      const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      // Store OTP with expiry
      otpStore.set(email, { otp, expiry: expiryTime });
      
      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        html: `
          <h2>Password Reset Request</h2>
          <p>Your OTP for password reset is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };
      
      await transporter.sendMail(mailOptions);
      res.json({ message: "OTP sent to your email." });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }
  
  const storedData = otpStore.get(email);
  if (!storedData) {
    return res.status(400).json({ error: "OTP not found or expired." });
  }
  
  if (Date.now() > storedData.expiry) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP has expired." });
  }
  
  if (storedData.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP." });
  }
  
  // OTP is valid, remove it from store
  otpStore.delete(email);
  res.json({ message: "OTP verified successfully." });
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  
  try {
    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Update password in database
    const sql = "UPDATE admins SET password_hash = ? WHERE email = ? AND is_active = TRUE";
    db.query(sql, [password_hash, email], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error." });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Admin not found." });
      }
      res.json({ message: "Password updated successfully." });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password." });
  }
});

// Admin API: Get all trust members
app.get("/api/admin/trust-members", getAdminInfo, requireAdmin, (req, res) => {
  const sql = `
    SELECT 
      id,
      organization_name as name,
      email,
      mobile_no as phone,
      organization_type,
      spoc_name,
      created_at,
      status
    FROM organization_members 
    ORDER BY created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    // Transform the data to match the expected format
    const trustMembers = results.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      organizationType: member.organization_type,
      spocName: member.spoc_name,
      status: member.status,
      createdAt: member.created_at
    }));
    
    res.json({ 
      success: true, 
      data: trustMembers,
      total: trustMembers.length
    });
  });
});

// Admin API: Toggle member status
app.put("/api/admin/member/:id/status", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['active', 'inactive', 'suspended'].includes(status.toLowerCase())) {
    return res.status(400).json({ error: "Status must be 'active', 'inactive', or 'suspended'" });
  }
  
  // Update the member's status
  const sql = "UPDATE organization_members SET status = ? WHERE id = ?";
  const params = [status.toLowerCase(), id];
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    res.json({ 
      success: true, 
      message: `Member status updated to ${status}`,
      status: status.toLowerCase()
    });
  });
});

// Admin API: Upload document to member
app.post("/api/admin/member/:id/documents", getAdminInfo, requireAdmin, upload.single('document'), (req, res) => {
  const { id } = req.params;
  const { documentName, documentType } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  if (!documentName) {
    return res.status(400).json({ error: "Document name is required" });
  }
  
  // Check if member exists
  const checkMemberSql = "SELECT id FROM organization_members WHERE id = ?";
  db.query(checkMemberSql, [id], (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }
    
    // Insert document record
    const insertSql = `
      INSERT INTO documents (
        document_name, 
        file_path, 
        file_type, 
        file_size, 
        member_id, 
        uploaded_by_admin,
        admin_id,
        document_category,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const filePath = `/uploads/${req.file.filename}`;
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;
    
    db.query(insertSql, [
      documentName,
      filePath,
      fileType,
      fileSize,
      id,
      1, // uploaded_by_admin (1 for admin)
      req.admin.id, // admin_id
      documentType || 'other' // document_category
    ], (err, result) => {
      if (err) {
        console.log("Database error:", err);
        return res.status(500).json({ error: "Database error.", details: err });
      }
      
      res.json({ 
        success: true, 
        message: "Document uploaded successfully",
        document: {
          id: result.insertId,
          name: documentName,
          path: filePath,
          type: fileType,
          size: fileSize
        }
      });
    });
  });
});

// Admin API: Get member documents
app.get("/api/admin/member/:id/documents", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT 
      id,
      document_name,
      file_path,
      file_type,
      file_size,
      created_at
    FROM documents 
    WHERE member_id = ?
    ORDER BY created_at DESC
  `;
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    res.json({ 
      success: true, 
      data: results,
      total: results.length
    });
  });
});

// Member API: Get own profile
app.get("/api/member/profile", getUserInfo, requireActiveMember, (req, res) => {
  const userId = req.user.id;
  
  // Get member's documents
  const documentsSql = `
    SELECT 
      id,
      document_name,
      file_path,
      file_type,
      file_size,
      created_at
    FROM documents 
    WHERE member_id = ?
    ORDER BY created_at DESC
  `;
  
  db.query(documentsSql, [userId], (err, documents) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    res.json({ 
      success: true, 
      data: {
        ...req.user,
        documents: documents || []
      }
    });
  });
});

// Member API: Secure document download
app.get("/api/member/documents/:documentId", getUserInfo, requireActiveMember, (req, res) => {
  const userId = req.user.id;
  const { documentId } = req.params;
  
  // Get document details and verify ownership
  const documentSql = `
    SELECT 
      id,
      document_name,
      file_path,
      file_type,
      file_size
    FROM documents 
    WHERE id = ? AND member_id = ?
  `;
  
  db.query(documentSql, [documentId, userId], (err, documentResults) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    if (documentResults.length === 0) {
      return res.status(404).json({ error: "Document not found or access denied" });
    }
    
    const document = documentResults[0];
    const filePath = path.join(__dirname, document.file_path.replace('/uploads/', 'uploads/'));
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }
    
    // Set appropriate headers for download
    const fileName = document.document_name + path.extname(document.file_path);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', document.file_type);
    res.setHeader('Content-Length', document.file_size);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

// Member API: Get documents list
app.get("/api/member/documents", getUserInfo, requireActiveMember, (req, res) => {
  const userId = req.user.id;
  
  // Get user's documents
  const documentsSql = `
    SELECT 
      id,
      document_name,
      file_path,
      file_type,
      file_size,
      created_at
    FROM documents 
    WHERE member_id = ?
    ORDER BY created_at DESC
  `;
  
  db.query(documentsSql, [userId], (err, documents) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    res.json({ 
      success: true, 
      data: documents || [],
      total: documents ? documents.length : 0
    });
  });
});

// --- Member Registration Details API ---

// GET registration details for the logged-in member
app.get('/api/member/registration-details', getUserInfo, (req, res) => {
  const memberId = req.user.id;
  db.query(
    'SELECT * FROM members_registration_details WHERE member_id = ?',
    [memberId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      if (results.length === 0) return res.json({ data: null });
      // Parse JSON field before sending
      const row = results[0];
      if (typeof row.other_details === 'string') {
        try { row.other_details = JSON.parse(row.other_details); } catch { row.other_details = []; }
      }
      res.json({ data: row });
    }
  );
});

// POST registration details for the logged-in member (insert or update)
app.post('/api/member/registration-details', getUserInfo, (req, res) => {
  const memberId = req.user.id;
  const data = req.body;
  // Stringify the JSON field before saving
  const otherDetails = JSON.stringify(data.otherDetails || []);
  db.query(
    `INSERT INTO members_registration_details
      (member_id, organization_name, registration_type, registration_no, registration_date, other_registration_no, other_registration_date, pan_no, tan_no, gst_no, niti_ayog_id, niti_ayog_reg_date, other_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        organization_name=VALUES(organization_name),
        registration_type=VALUES(registration_type),
        registration_no=VALUES(registration_no),
        registration_date=VALUES(registration_date),
        other_registration_no=VALUES(other_registration_no),
        other_registration_date=VALUES(other_registration_date),
        pan_no=VALUES(pan_no),
        tan_no=VALUES(tan_no),
        gst_no=VALUES(gst_no),
        niti_ayog_id=VALUES(niti_ayog_id),
        niti_ayog_reg_date=VALUES(niti_ayog_reg_date),
        other_details=VALUES(other_details)`,
    [
      memberId,
      data.organizationName,
      data.registrationType,
      data.registrationNo,
      data.registrationDate,
      data.otherRegistrationNo,
      data.otherRegistrationDate,
      data.panNo,
      data.tanNo,
      data.gstNo,
      data.nitiAyogId,
      data.nitiAyogRegDate,
      otherDetails
    ],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ success: true });
    }
  );
});

// --- Member Login with OTP Flow ---

// Request OTP for member login
app.post("/request-otp", async (req, res) => {
  console.log("Request OTP received:", req.body);
  const { username, password, userType = "member" } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  
  if (userType !== "member") {
    return res.status(400).json({ error: "OTP login is only available for members." });
  }
  
  // Check if username is email or mobile number
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
  const isMobile = /^[6-9]\d{9}$/.test(username);
  
  if (!isEmail && !isMobile) {
    return res.status(400).json({ error: "Please enter a valid email address or mobile number." });
  }
  
  // Query organization_members table
  const sql = isEmail
    ? "SELECT * FROM organization_members WHERE email = ?"
    : "SELECT * FROM organization_members WHERE mobile_no = ?";
    
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    if (!results || results.length === 0) {
      return res.status(401).json({ error: "Invalid email/mobile or password." });
    }
    
    const member = results[0];
    console.log("Member found:", { id: member.id, email: member.email, status: member.status });
    
    // Verify password (plain text)
    if (member.password_hash !== password) {
      return res.status(401).json({ error: "Invalid email/mobile or password." });
    }
    
    // Check if member is active
    if (member.status !== 'active') {
      return res.status(403).json({ 
        error: "Your account is not active. Please contact the administrator.",
        status: member.status
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP with member ID for verification
    otpStore.set(member.id.toString(), { otp, expiry: expiryTime, memberId: member.id });
    
    try {
      // Send email with OTP
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: member.email,
        subject: "Login Verification OTP",
        html: `
          <h2>Login Verification</h2>
          <p>Your OTP for login verification is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };
      
      await transporter.sendMail(mailOptions);
      console.log("OTP sent successfully to:", member.email);
      
      res.json({ 
        message: "OTP sent to your email.", 
        userId: member.id 
      });
    } catch (err) {
      console.log("Email sending error:", err);
      res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
  });
});

// Verify OTP for member login
app.post("/login-verify-otp", (req, res) => {
  console.log("Login verify OTP received:", req.body);
  const { userId, otp } = req.body;
  
  if (!userId || !otp) {
    return res.status(400).json({ error: "User ID and OTP are required." });
  }
  
  const storedData = otpStore.get(userId.toString());
  if (!storedData) {
    return res.status(400).json({ error: "OTP not found or expired." });
  }
  
  if (Date.now() > storedData.expiry) {
    otpStore.delete(userId.toString());
    return res.status(400).json({ error: "OTP has expired." });
  }
  
  if (storedData.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP." });
  }
  
  // OTP is valid, get member details
  const sql = "SELECT * FROM organization_members WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    
    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }
    
    const member = results[0];
    
    // Clear the OTP after successful verification
    otpStore.delete(userId.toString());
    
    console.log("Login successful for member:", member.id);
    res.json({ 
      message: "Login successful!", 
      userId: member.id,
      userType: 'member',
      organizationName: member.organization_name,
      organizationType: member.organization_type,
      spocName: member.spoc_name,
      status: member.status
    });
  });
});

// --- Master Data API Endpoints ---

// States API
app.get("/api/admin/states", getAdminInfo, requireAdmin, (req, res) => {
  const sql = "SELECT * FROM states WHERE is_active = TRUE ORDER BY name";
  db.query(sql, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/states", getAdminInfo, requireAdmin, (req, res) => {
  const { name, code } = req.body;
  if (!name) {
    return res.status(400).json({ error: "State name is required" });
  }
  
  const sql = "INSERT INTO states (name, code) VALUES (?, ?)";
  db.query(sql, [name, code], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "State already exists" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, id: result.insertId, message: "State added successfully" });
  });
});

app.put("/api/admin/states/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  if (!name) {
    return res.status(400).json({ error: "State name is required" });
  }
  
  const sql = "UPDATE states SET name = ?, code = ? WHERE id = ?";
  db.query(sql, [name, code, id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "State already exists" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "State not found" });
    }
    res.json({ success: true, message: "State updated successfully" });
  });
});

app.delete("/api/admin/states/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM states WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "State not found" });
    }
    res.json({ success: true, message: "State deleted successfully" });
  });
});

// Public States API for members
app.get("/api/states", (req, res) => {
  const sql = "SELECT id, name FROM states WHERE is_active = TRUE ORDER BY name";
  db.query(sql, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

// Districts API
app.get("/api/admin/districts", getAdminInfo, requireAdmin, (req, res) => {
  const { stateId } = req.query;
  let sql = `
    SELECT d.*, s.name as state_name 
    FROM districts d 
    JOIN states s ON d.state_id = s.id 
    WHERE d.is_active = TRUE
  `;
  let params = [];
  
  if (stateId) {
    sql += " AND d.state_id = ?";
    params.push(stateId);
  }
  
  sql += " ORDER BY d.name";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/districts", getAdminInfo, requireAdmin, (req, res) => {
  const { name, stateId } = req.body;
  if (!name || !stateId) {
    return res.status(400).json({ error: "District name and state are required" });
  }
  
  const sql = "INSERT INTO districts (name, state_id) VALUES (?, ?)";
  db.query(sql, [name, stateId], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "District already exists in this state" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, id: result.insertId, message: "District added successfully" });
  });
});

app.put("/api/admin/districts/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, stateId } = req.body;
  if (!name || !stateId) {
    return res.status(400).json({ error: "District name and state are required" });
  }
  
  const sql = "UPDATE districts SET name = ?, state_id = ? WHERE id = ?";
  db.query(sql, [name, stateId, id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "District already exists in this state" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "District not found" });
    }
    res.json({ success: true, message: "District updated successfully" });
  });
});

app.delete("/api/admin/districts/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM districts WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "District not found" });
    }
    res.json({ success: true, message: "District deleted successfully" });
  });
});

// Public Districts API for members
app.get("/api/districts", (req, res) => {
  const { stateId } = req.query;
  let sql = "SELECT id, name, state_id FROM districts WHERE is_active = TRUE";
  let params = [];
  if (stateId) {
    sql += " AND state_id = ?";
    params.push(stateId);
  }
  sql += " ORDER BY name";
  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

// Cities API
app.get("/api/admin/cities", getAdminInfo, requireAdmin, (req, res) => {
  const { stateId, districtId } = req.query;
  let sql = `
    SELECT c.*, d.name as district_name, s.name as state_name 
    FROM cities c 
    JOIN districts d ON c.district_id = d.id 
    JOIN states s ON c.state_id = s.id 
    WHERE c.is_active = TRUE
  `;
  let params = [];
  
  if (stateId) {
    sql += " AND c.state_id = ?";
    params.push(stateId);
  }
  if (districtId) {
    sql += " AND c.district_id = ?";
    params.push(districtId);
  }
  
  sql += " ORDER BY c.name";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/cities", getAdminInfo, requireAdmin, (req, res) => {
  const { name, stateId, districtId } = req.body;
  if (!name || !stateId || !districtId) {
    return res.status(400).json({ error: "City name, state, and district are required" });
  }
  
  const sql = "INSERT INTO cities (name, state_id, district_id) VALUES (?, ?, ?)";
  db.query(sql, [name, stateId, districtId], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "City already exists in this district" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, id: result.insertId, message: "City added successfully" });
  });
});

app.put("/api/admin/cities/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, stateId, districtId } = req.body;
  if (!name || !stateId || !districtId) {
    return res.status(400).json({ error: "City name, state, and district are required" });
  }
  
  const sql = "UPDATE cities SET name = ?, state_id = ?, district_id = ? WHERE id = ?";
  db.query(sql, [name, stateId, districtId, id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "City already exists in this district" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "City not found" });
    }
    res.json({ success: true, message: "City updated successfully" });
  });
});

app.delete("/api/admin/cities/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE cities SET is_active = FALSE WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "City not found" });
    }
    res.json({ success: true, message: "City deleted successfully" });
  });
});

// Public Cities API for members
app.get("/api/cities", (req, res) => {
  const { stateId, districtId, talukaId } = req.query;
  let sql = "SELECT id, name, state_id, district_id, taluka_id FROM cities WHERE is_active = TRUE";
  let params = [];
  if (stateId) {
    sql += " AND state_id = ?";
    params.push(stateId);
  }
  if (districtId) {
    sql += " AND district_id = ?";
    params.push(districtId);
  }
  if (talukaId) {
    sql += " AND taluka_id = ?";
    params.push(talukaId);
  }
  sql += " ORDER BY name";
  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

// Talukas API
app.get("/api/admin/talukas", getAdminInfo, requireAdmin, (req, res) => {
  const { stateId, districtId } = req.query;
  let sql = `
    SELECT t.*, d.name as district_name, s.name as state_name 
    FROM talukas t 
    JOIN districts d ON t.district_id = d.id 
    JOIN states s ON t.state_id = s.id 
    WHERE t.is_active = TRUE
  `;
  let params = [];
  
  if (stateId) {
    sql += " AND t.state_id = ?";
    params.push(stateId);
  }
  if (districtId) {
    sql += " AND t.district_id = ?";
    params.push(districtId);
  }
  
  sql += " ORDER BY t.name";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/talukas", getAdminInfo, requireAdmin, (req, res) => {
  const { name, stateId, districtId } = req.body;
  if (!name || !stateId || !districtId) {
    return res.status(400).json({ error: "Taluka name, state, and district are required" });
  }
  
  const sql = "INSERT INTO talukas (name, state_id, district_id) VALUES (?, ?, ?)";
  db.query(sql, [name, stateId, districtId], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Taluka already exists in this district" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, id: result.insertId, message: "Taluka added successfully" });
  });
});

app.put("/api/admin/talukas/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, stateId, districtId } = req.body;
  if (!name || !stateId || !districtId) {
    return res.status(400).json({ error: "Taluka name, state, and district are required" });
  }
  
  const sql = "UPDATE talukas SET name = ?, state_id = ?, district_id = ? WHERE id = ?";
  db.query(sql, [name, stateId, districtId, id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Taluka already exists in this district" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Taluka not found" });
    }
    res.json({ success: true, message: "Taluka updated successfully" });
  });
});

app.delete("/api/admin/talukas/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE talukas SET is_active = FALSE WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Taluka not found" });
    }
    res.json({ success: true, message: "Taluka deleted successfully" });
  });
});

// Public Talukas API for members
app.get("/api/talukas", (req, res) => {
  const { stateId, districtId } = req.query;
  let sql = "SELECT id, name, state_id, district_id FROM talukas WHERE is_active = TRUE";
  let params = [];
  if (stateId) {
    sql += " AND state_id = ?";
    params.push(stateId);
  }
  if (districtId) {
    sql += " AND district_id = ?";
    params.push(districtId);
  }
  sql += " ORDER BY name";
  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

// Occupations API
app.get("/api/admin/occupations", getAdminInfo, requireAdmin, (req, res) => {
  const sql = "SELECT * FROM occupations WHERE is_active = TRUE ORDER BY name";
  db.query(sql, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/occupations", getAdminInfo, requireAdmin, (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Occupation name is required" });
  }
  
  const sql = "INSERT INTO occupations (name, description) VALUES (?, ?)";
  db.query(sql, [name, description], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Occupation already exists" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, id: result.insertId, message: "Occupation added successfully" });
  });
});

app.put("/api/admin/occupations/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Occupation name is required" });
  }
  
  const sql = "UPDATE occupations SET name = ?, description = ? WHERE id = ?";
  db.query(sql, [name, description, id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Occupation already exists" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Occupation not found" });
    }
    res.json({ success: true, message: "Occupation updated successfully" });
  });
});

app.delete("/api/admin/occupations/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE occupations SET is_active = FALSE WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Occupation not found" });
    }
    res.json({ success: true, message: "Occupation deleted successfully" });
  });
});

// Designations API
app.get("/api/admin/designations", getAdminInfo, requireAdmin, (req, res) => {
  const sql = "SELECT * FROM designations WHERE is_active = TRUE ORDER BY name";
  db.query(sql, (err, results) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, data: results });
  });
});

app.post("/api/admin/designations", getAdminInfo, requireAdmin, (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Designation name is required" });
  }
  
  const sql = "INSERT INTO designations (name, description) VALUES (?, ?)";
  db.query(sql, [name, description], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Designation already exists" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    res.json({ success: true, id: result.insertId, message: "Designation added successfully" });
  });
});

app.put("/api/admin/designations/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Designation name is required" });
  }
  
  const sql = "UPDATE designations SET name = ?, description = ? WHERE id = ?";
  db.query(sql, [name, description, id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Designation already exists" });
      }
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Designation not found" });
    }
    res.json({ success: true, message: "Designation updated successfully" });
  });
});

app.delete("/api/admin/designations/:id", getAdminInfo, requireAdmin, (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE designations SET is_active = FALSE WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error.", details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Designation not found" });
    }
    res.json({ success: true, message: "Designation deleted successfully" });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
