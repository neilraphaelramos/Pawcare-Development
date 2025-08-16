const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt'); // 🔐 bcrypt for hashing
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // leave blank if no password
  database: 'pawcare',
});

db.connect((err) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Registration route with password hashing
app.post('/register', async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    username,
    email,
    phone,
    houseNum,
    province,
    municipality,
    barangay,
    zipCode,
    password,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql_credentials = `
      INSERT INTO user_credentials 
      (userName, email, password, userRole)
      VALUES (?, ?, ?, ?)
    `;

    const sql_informations = `
      INSERT INTO user_infos
      (user_id, firstName, middleName, lastName, suffix, phoneNumber, houseNum, province, municipality, barangay, zipCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const credential_values = [
      username,
      email,
      hashedPassword,
      'User',
    ];

    db.query(sql_credentials, credential_values, (err, result) => {
      if (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }

      const info_values = [
        result.insertId,
        firstName,
        middleName,
        lastName,
        suffix,
        phone,
        houseNum,
        province,
        municipality,
        barangay,
        zipCode,
      ];

      db.query(sql_informations, info_values, (err2, result2) => {
        if (err2) {
          console.error('Registration error:', err2);
          return res.status(500).json({ error: 'Registration failed' });
        }

        res.status(200).json({ message: 'Registration successful' });
      });
    });

  } catch (err) {
    console.error('Hashing error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/data", (req, res) => {
  const sql = `
    SELECT 
      uc.*, 
      ui.firstName, ui.middleName, ui.lastName, ui.suffix,
      ui.phoneNumber, ui.houseNum, ui.province, ui.municipality,
      ui.barangay, ui.zipCode, ui.profile_Pic, ui.bio
    FROM user_credentials AS uc
    LEFT JOIN user_infos AS ui
      ON uc.id = ui.user_id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const formattedUsers = result.map((user) => ({
      id: user.id,
      fullName: `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""} ${user.suffix || ""}`.trim(),
      username: user.userName,
      email: user.email,
      phone: user.phoneNumber,
      password: user.password,
      role: user.userRole,
      image: user.profile_Pic
        ? `data:image/jpeg;base64,${user.profile_Pic.toString("base64")}`
        : null,
      address: `${user.houseNum || ""}, ${user.barangay || ""}, ${user.municipality || ""}, ${user.province || ""}, ${user.zipCode || ""}`.trim(),
      bio: user.bio || ""
    }));

    res.json(formattedUsers);
  });
});

app.post('/add_account', async (req, res) => {
  const { fullName, username, email, phone, password, role, image } = req.body;

  try {
    if (!fullName || fullName.trim() === "") {
      return res.status(400).json({ error: "Full name is required" });
    }

    // Split fullname by "-" and trim spaces
    const parts = fullName.split("-").map(p => p.trim());
    const firstName = parts[0] || "";
    const middleName = parts[1] || "";
    const lastName = parts[2] || "";
    const suffix = parts[3] || "";

    const hashedPassword = await bcrypt.hash(password, 10);

    let setRole;
    if (role === 'User') { 
      setRole = "User"; 
    } else if (role === 'Admin') { 
      setRole = "Admin" 
    } else { 
      setRole = "Veterinarian"; 
    }

    let imageBuffer = null;
    if (image) {
      const base64Data = image.replace(/^data:.+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
    }

    const sql_credentials = `
      INSERT INTO user_credentials (userName, email, password, userRole)
      VALUES (?, ?, ?, ?)
    `;

    const sql_informations = `
      INSERT INTO user_infos 
      (user_id, firstName, middleName, lastName, suffix, phoneNumber, profile_Pic)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql_credentials, [username, email, hashedPassword, setRole], (err, result) => {
      if (err) {
        console.error('DB credentials insert error:', err);
        return res.status(500).json({ error: 'Add Account failed (credentials)' });
      }

      const info_values = [result.insertId, firstName, middleName, lastName, suffix, phone, imageBuffer];

      db.query(sql_informations, info_values, (err2) => {
        if (err2) {
          console.error('DB infos insert error:', err2);
          return res.status(500).json({ error: 'Add Account failed (infos)' });
        }

        return res.status(200).json({ message: 'Add Account Successful' });
      });
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT uc.*, ui.firstName, ui.middleName, ui.lastName, ui.suffix,
           ui.phoneNumber, ui.houseNum, ui.province, ui.municipality,
           ui.barangay, ui.zipCode, ui.profile_Pic, ui.bio
    FROM user_credentials AS uc
    LEFT JOIN user_infos AS ui
      ON uc.id = ui.user_id
    WHERE uc.email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error('Bcrypt error:', bcryptErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const userData = {
        id: user.id,
        email: user.email,
        username: user.userName,
        role: user.userRole,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        suffix: user.suffix,
        phone: user.phoneNumber,
        houseNum: user.houseNum,
        province: user.province,
        municipality: user.municipality,
        barangay: user.barangay,
        zipCode: user.zipCode,
        pic: user.profile_Pic ? Buffer.from(user.profile_Pic).toString("base64") : null,
        bio: user.bio,
      };

      res.status(200).json({
        message: 'Login successful',
        user: userData,
      });
    });
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

