const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt'); // 🔐 bcrypt for hashing
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

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

// Login route with password verification
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT uc.*, ui.firstName, ui.middleName, ui.lastName, ui.suffix,
           ui.phoneNumber, ui.houseNum, ui.province, ui.municipality,
           ui.barangay, ui.zipCode
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

    console.log('Database results:', results); // full query results

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    console.log('Selected user from DB:', user); // single user object with joined info

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
        zipCode: user.zipCode
      };

      console.log('Sending user data to frontend:', userData);

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

