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

app.post('/update_account_admin', async (req, res) => {
  const { id, fullName, username, email, phone, password, role, image } = req.body;

  try {
    if (!fullName || fullName.trim() === "") {
      return res.status(400).json({ error: "Full name is required" });
    }

    const parts = fullName.split("-").map(p => p.trim());
    const firstName = parts[0] || "";
    const middleName = parts[1] || "";
    const lastName = parts[2] || "";
    const suffix = parts[3] || "";

    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let imageBuffer = null;
    if (image) {
      const base64Data = image.replace(/^data:.+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
    }

    const updateCredentialSql = `
      UPDATE user_credentials 
      SET userName = ?, email = ?, userRole = ? ${hashedPassword ? ", password = ?" : ""} 
      WHERE id = ?`;

    const credentialParams = hashedPassword
      ? [username, email, role, hashedPassword, id]
      : [username, email, role, id];

    const updateInfoSql = `
      UPDATE user_infos 
      SET firstName = ?, middleName = ?, lastName = ?, suffix = ?, phoneNumber = ? ${imageBuffer ? ", profile_Pic = ?" : ""} 
      WHERE user_ID = ?`;

    const infoParams = imageBuffer
      ? [firstName, middleName, lastName, suffix, phone, imageBuffer, id]
      : [firstName, middleName, lastName, suffix, phone, id];

    db.beginTransaction(err => {
      if (err) {
        console.error("Transaction error:", err);
        return res.status(500).json({ error: "Transaction failed" });
      }

      db.query(updateCredentialSql, credentialParams, (err, result1) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error updating credentials:", err);
            res.status(500).json({ error: "Failed to update credentials" });
          });
        }

        db.query(updateInfoSql, infoParams, (err, result2) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error updating user info:", err);
              res.status(500).json({ error: "Failed to update user info" });
            });
          }

          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error("Commit error:", err);
                res.status(500).json({ error: "Transaction commit failed" });
              });
            }
            res.json({ message: "Account updated successfully!" });
          });
        });
      });
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
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

app.post('/delete_account', (req, res) => {
  const { id } = req.body

  try {
    const deleteSql = `DELETE FROM user_credentials WHERE id = ?`;

    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        console.error('Deletion error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(200).json({
          message: 'Deletion Successful!',
        });
      }
    })
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/update_profile", async (req, res) => {
  try {
    const {
      id,
      firstName,
      middleName,
      lastName,
      suffix,
      phone,
      houseNumber,
      province,
      municipality,
      barangay,
      zipCode,
      bio,
      currentPassword,
      newPassword,
      password, // confirmation
      image,
    } = req.body;

    if (!id) return res.status(400).json({ error: "User ID is required" });

    // 📌 Fetch user
    const [user] = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM user_credentials WHERE id = ?", [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // 📌 Prepare updates
    let updatesInfo = [];
    let paramsInfo = [];

    if (firstName !== undefined) { updatesInfo.push("firstName = ?"); paramsInfo.push(firstName); }
    if (middleName !== undefined) { updatesInfo.push("middleName = ?"); paramsInfo.push(middleName); }
    if (lastName !== undefined) { updatesInfo.push("lastName = ?"); paramsInfo.push(lastName); }
    if (suffix !== undefined) { updatesInfo.push("suffix = ?"); paramsInfo.push(suffix); }
    if (phone !== undefined) { updatesInfo.push("phoneNumber = ?"); paramsInfo.push(phone); }
    if (houseNumber !== undefined) { updatesInfo.push("houseNum = ?"); paramsInfo.push(houseNumber); }
    if (province !== undefined) { updatesInfo.push("province = ?"); paramsInfo.push(province); }
    if (municipality !== undefined) { updatesInfo.push("municipality = ?"); paramsInfo.push(municipality); }
    if (barangay !== undefined) { updatesInfo.push("barangay = ?"); paramsInfo.push(barangay); }
    if (zipCode !== undefined) { updatesInfo.push("zipCode = ?"); paramsInfo.push(zipCode); }
    if (bio !== undefined) { updatesInfo.push("bio = ?"); paramsInfo.push(bio); }

    // 📌 Handle image update
    if (image) {
      const base64Data = image.replace(/^data:.+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      updatesInfo.push("profile_Pic = ?");
      paramsInfo.push(imageBuffer);
    }

    paramsInfo.push(id);

    // 📌 Password update only if provided
    if (currentPassword && newPassword && password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword !== password) return res.status(400).json({ error: "Passwords do not match" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await new Promise((resolve, reject) => {
        db.query("UPDATE user_credentials SET password = ? WHERE id = ?", [hashedPassword, id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    }

    // 📌 Only run info update if something changed
    if (updatesInfo.length > 0) {
      const sql = `UPDATE user_infos SET ${updatesInfo.join(", ")} WHERE user_ID = ?`;
      await new Promise((resolve, reject) => {
        db.query(sql, paramsInfo, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    }

    // 📌 Fetch updated user
    const [updatedUser] = await new Promise((resolve, reject) => {
      const fetchsql = `
        SELECT uc.*, ui.firstName, ui.middleName, ui.lastName, ui.suffix,
               ui.phoneNumber, ui.houseNum, ui.province, ui.municipality,
               ui.barangay, ui.zipCode, ui.profile_Pic, ui.bio
        FROM user_credentials AS uc
        LEFT JOIN user_infos AS ui ON uc.id = ui.user_id
        WHERE uc.id = ?`;
      db.query(fetchsql, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.userName,
      role: updatedUser.userRole,
      firstName: updatedUser.firstName,
      middleName: updatedUser.middleName,
      lastName: updatedUser.lastName,
      suffix: updatedUser.suffix,
      phone: updatedUser.phoneNumber,
      houseNum: updatedUser.houseNum,
      province: updatedUser.province,
      municipality: updatedUser.municipality,
      barangay: updatedUser.barangay,
      zipCode: updatedUser.zipCode,
      pic: updatedUser.profile_Pic ? Buffer.from(updatedUser.profile_Pic).toString("base64") : null,
      bio: updatedUser.bio,
    };

    res.status(200).json({
      success: true,
      message: "Update successful",
      user: userData,
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

