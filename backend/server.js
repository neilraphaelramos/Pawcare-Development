const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt'); // 🔐 bcrypt for hashing
const jwt = require("jsonwebtoken");
const fs = require("fs");
const app = express();
const port = 5000;
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const google_Client_ID = '1005622017132-od8o6vgodloqntbve3mba6anjn6v5v71.apps.googleusercontent.com';
const CLIENT = new OAuth2Client(google_Client_ID)

const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './tmp/uploads/');
  },
  filename: function (req, file, cb) {
    // Keep original extension
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage: storage });

const PRIVATE_KEY = fs.readFileSync("./private_key.pk", "utf8");
const JITSI_APP_ID = 'vpaas-magic-cookie-d26ed00354e841dbabe6a987da039e25';
const JITSI_APP_API_KEY = 'vpaas-magic-cookie-d26ed00354e841dbabe6a987da039e25/ac1c10';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('tmp/uploads'));
app.use("/uploads", express.static(path.join(__dirname, "tmp/uploads")));

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
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      suffix: user.suffix,
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
  const { firstName, middleName, lastName, suffix, username, email, phone, password, role, image } = req.body;

  try {
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
  const { id, firstName, middleName, lastName, suffix, username, email, phone, password, role, image } = req.body;

  try {
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

app.post("/login", (req, res) => {
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
      console.error("[DB ERROR]", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.length === 0) {
      console.warn("[LOGIN] No user found with email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];
    console.log("[LOGIN] User found:", user.email, "Role:", user.userRole);

    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error("[BCRYPT ERROR]", bcryptErr);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (!isMatch) {
        console.warn("[LOGIN] Wrong password for:", email);
        return res.status(401).json({ error: "Invalid email or password" });
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

      let jitsiToken = null;
      if (user.userRole === "Veterinarian") {
        console.log("[JITSI] Generating token for vet:", user.email);
        console.log("[JITSI] ENV APP_ID:", JITSI_APP_ID);
        console.log("[JITSI] ENV API_KEY:", JITSI_APP_API_KEY);
        console.log("[JITSI] PRIVATE_KEY exists?", !!PRIVATE_KEY);

        try {
          const payload = {
            aud: "jitsi",
            iss: "chat",
            sub: JITSI_APP_ID,
            room: "*",
            context: {
              user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                moderator: "true",
              },
              features: {
                livestreaming: "true",
                recording: "true",
                transcription: "true",
              },
            },
            exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60, // 3 hours
            nbf: Math.floor(Date.now() / 1000) - 10,
          };

          console.log("[JITSI] Payload:", JSON.stringify(payload, null, 2));

          jitsiToken = jwt.sign(payload, PRIVATE_KEY, {
            algorithm: "RS256",
            header: { kid: JITSI_APP_API_KEY },
          });

          console.log("[JITSI] Token generated successfully");
        } catch (jwtErr) {
          console.error("[JITSI ERROR] Failed to sign token:", jwtErr);
        }
      }

      res.status(200).json({
        message: "Login successful",
        user: userData,
        jitsiToken,
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

app.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await CLIENT.verifyIdToken({
      idToken: token,
      audience: google_Client_ID,
    });

    const fetchsql = `
    SELECT uc.*, ui.firstName, ui.middleName, ui.lastName, ui.suffix,
           ui.phoneNumber, ui.houseNum, ui.province, ui.municipality,
           ui.barangay, ui.zipCode, ui.profile_Pic, ui.bio
    FROM user_credentials AS uc
    LEFT JOIN user_infos AS ui
      ON uc.id = ui.user_id
    WHERE uc.email = ?
  `;

    const sql_informations = `
      INSERT INTO user_infos
      (user_id, firstName, lastName)
      VALUES (?, ?, ?)
    `;

    const payload = ticket.getPayload();
    let { email, given_name, family_name } = payload;
    let username = email.split("@")[0];

    if (!family_name) {
      family_name = null;
    }

    const sqlCheck = 'SELECT * FROM user_credentials WHERE email = ?';
    db.query(sqlCheck, [email], async (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        db.query(fetchsql, [email], (err, results) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          if (results.length === 0) {
            return res.status(401).json({ error: 'User Data Not Found' });
          }

          const user = results[0];

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

          let jitsiToken = null;
          if (user.userRole === "Veterinarian") {
            console.log("[JITSI] Generating token for vet:", user.email);
            console.log("[JITSI] ENV APP_ID:", JITSI_APP_ID);
            console.log("[JITSI] ENV API_KEY:", JITSI_APP_API_KEY);
            console.log("[JITSI] PRIVATE_KEY exists?", !!PRIVATE_KEY);

            try {
              const payload = {
                aud: "jitsi",
                iss: "chat",
                sub: JITSI_APP_ID,
                room: "*",
                context: {
                  user: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    moderator: "true",
                  },
                  features: {
                    livestreaming: "true",
                    recording: "true",
                    transcription: "true",
                  },
                },
                exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60, // 3 hours
                nbf: Math.floor(Date.now() / 1000) - 10,
              };

              console.log("[JITSI] Payload:", JSON.stringify(payload, null, 2));

              jitsiToken = jwt.sign(payload, PRIVATE_KEY, {
                algorithm: "RS256",
                header: { kid: JITSI_APP_API_KEY },
              });

              console.log("[JITSI] Token generated successfully");
            } catch (jwtErr) {
              console.error("[JITSI ERROR] Failed to sign token:", jwtErr);
            }
          }

          return res.status(200).json({
            message: 'Login successful',
            user: userData,
            jitsiToken,
          });
        })
      } else {
        const sqlInsert = `
          INSERT INTO user_credentials (userName, email, password)
          VALUES (?, ?, ?)
        `;
        const hashedPassword = await bcrypt.hash('GOOGLE_AUTH', 10);

        db.query(sqlInsert, [username, email, hashedPassword], (insertErr, result) => {
          if (insertErr) {
            console.error('Registration error:', insertErr);
            return res.status(500).json({ error: 'Registration failed' });
          }

          db.query(sql_informations, [result.insertId, given_name, family_name], (err, results) => {
            if (err) {
              console.error('Registration error:', err);
              return res.status(500).json({ error: 'Registration failed' });
            }

            db.query(fetchsql, [email], (err, results) => {
              if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ error: 'Internal server error' });
              }

              if (results.length === 0) {
                return res.status(401).json({ error: 'User Data Not Found' });
              }

              const user = results[0];

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

              let jitsiToken = null;
              if (user.userRole === "Veterinarian") {
                console.log("[JITSI] Generating token for vet:", user.email);
                console.log("[JITSI] ENV APP_ID:", JITSI_APP_ID);
                console.log("[JITSI] ENV API_KEY:", JITSI_APP_API_KEY);
                console.log("[JITSI] PRIVATE_KEY exists?", !!PRIVATE_KEY);

                try {
                  const payload = {
                    aud: "jitsi",
                    iss: "chat",
                    sub: JITSI_APP_ID,
                    room: "*",
                    context: {
                      user: {
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        moderator: "true",
                      },
                      features: {
                        livestreaming: "true",
                        recording: "true",
                        transcription: "true",
                      },
                    },
                    exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60, // 3 hours
                    nbf: Math.floor(Date.now() / 1000) - 10,
                  };

                  console.log("[JITSI] Payload:", JSON.stringify(payload, null, 2));

                  jitsiToken = jwt.sign(payload, PRIVATE_KEY, {
                    algorithm: "RS256",
                    header: { kid: JITSI_APP_API_KEY },
                  });

                  console.log("[JITSI] Token generated successfully");
                } catch (jwtErr) {
                  console.error("[JITSI ERROR] Failed to sign token:", jwtErr);
                }
              }

              return res.status(200).json({
                message: 'Registration successful',
                user: userData,
                jitsiToken,
              });
            })
          })
        });
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: 'Invalid Google token' });
  }
});

app.post('/online_consult', async (req, res) => {
  const { owner_name, pet_name, pet_type, concern_description, consult_type, file_payment, file_type } = req.body;
  const channel_consult_ID = "consult" + Date.now();

  try {
    const sqlScript = `INSERT INTO online_consultation_table
      (channel_consult_ID, Owner_name, pet_name, pet_type, 
      payment_proof, concern_text, type_consult, fileType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sqlScript, [
      channel_consult_ID,
      owner_name,
      pet_name,
      pet_type,
      file_payment,        // store Base64 string directly
      concern_description,
      consult_type,
      file_type            // store the type (pdf/image)
    ], (err, result) => {
      if (err) {
        console.error("Error uploading data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        message: "Success",
        success: true,
        channel_consult_ID
      });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/online_consult_fetch', (req, res) => {
  const fetchOC = `SELECT * FROM online_consultation_table`;

  try {
    db.query(fetchOC, (err, results) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const formattedResults = results.map((item) => {
        let fileBase64 = null;
        if (item.payment_proof) {
          const mimeType = item.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
          // ✅ just wrap it once
          fileBase64 = `data:${mimeType};base64,${item.payment_proof}`;
        }

        return {
          id: item.consult_id,
          channelConsult: item.channel_consult_ID,
          petName: item.pet_name,
          petType: item.pet_type,
          concern: item.concern_text,
          consultationType: item.type_consult,
          ownerName: item.Owner_name,
          paymentProof: fileBase64
        };
      });


      res.json({ fetchData: formattedResults });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/fetch_services', (req, res) => {
  const fetchDataServicesSQL = `SELECT * FROM services`;

  db.query(fetchDataServicesSQL, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Database error" });
    };

    const servicesData = results.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      image: service.image
        ? `data:image/jpeg;base64,${service.image.toString("base64")}`
        : null,
    }));

    res.json(servicesData);
  })
});

app.post('/add_services', async (req, res) => {
  const { title, description, image } = req.body;

  if (!title || !description || !image) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const insertSQL = "INSERT INTO services (title, description, image) VALUES (?, ?, ?)";
    db.query(insertSQL, [title, description, buffer], (err, result) => {
      if (err) {
        console.error("Error inserting service:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, message: "Service added successfully", id: result.insertId });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/update_services/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, image } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: "Title and description are required" });
  }

  try {
    let updateSQL, values;

    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      updateSQL = "UPDATE services SET title = ?, description = ?, image = ? WHERE id = ?";
      values = [title, description, buffer, id];
    } else {
      updateSQL = "UPDATE services SET title = ?, description = ? WHERE id = ?";
      values = [title, description, id];
    }

    db.query(updateSQL, values, (err, result) => {
      if (err) {
        console.error("Error updating service:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
      res.json({ success: true, message: "Service updated successfully" });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete('/delete_services/:id', (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM services WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Deletion error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Deletion Successful!'
        });
      }
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/fetchFeatures", (req, res) => {
  const sqlFeatures = `SELECT * FROM features`;

  db.query(sqlFeatures, (err, result) => {
    if (err) {
      console.error("Error fetching features:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      success: true,
      data: result
    });
  });
});

app.post("/add_features", (req, res) => {
  const { icon, title, description } = req.body;
  const sql = "INSERT INTO features (icon, title, description) VALUES (?, ?, ?)";
  db.query(sql, [icon, title, description], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true, id: result.insertId });
  });
});

app.put("/update_features/:id", (req, res) => {
  const { id } = req.params;
  const { icon, title, description } = req.body;
  const sql = "UPDATE features SET icon=?, title=?, description=? WHERE id=?";
  db.query(sql, [icon, title, description, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true });
  });
});

app.delete("/delete_features/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM features WHERE id=?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true });
  });
});

// Fetch all inventory items
app.get("/fetch_inventory", (req, res) => {
  const sql = "SELECT * FROM inventory";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching inventory:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true, data: results });
  });
});

// Add new inventory item
app.post("/add_inventory", upload.single('photo'), (req, res) => {
  const { item_code, name, item_group, date_purchase, date_expiration, stock, price, unit } = req.body;
  const photo = req.file ? req.file.filename : null; // now includes extension

  if (!item_code || !name || !item_group || stock === undefined || price === undefined) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO inventory 
    (item_code, photo, name, item_group, date_purchase, date_expiration, stock, price, unit) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [item_code, photo, name, item_group, date_purchase, date_expiration, stock, price, unit], (err, result) => {
    if (err) {
      console.error("Error adding inventory:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// Update inventory item
app.put("/update_inventory/:id", upload.single("photo"), (req, res) => {
  const { id } = req.params;
  const {
    item_code,
    name,
    item_group,
    date_purchase,
    date_expiration,
    stock,
    price,
    unit,
  } = req.body;

  const newPhoto = req.file ? req.file.filename : null;

  // Step 1: Get the old photo first
  db.query("SELECT photo FROM inventory WHERE product_ID = ?", [id], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching old photo:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const oldPhoto = rows[0].photo;

    // Step 2: If new file uploaded, delete the old one
    if (newPhoto && oldPhoto) {
      const oldPath = path.join(__dirname, "tmp/uploads", oldPhoto);
      fs.unlink(oldPath, (err) => {
        if (err) {
          console.warn("⚠️ Could not delete old photo:", oldPath, err.message);
        } else {
          console.log("🗑 Deleted old photo:", oldPath);
        }
      });
    }

    // Step 3: Update DB (use new photo if uploaded, otherwise keep old one)
    const photoToSave = newPhoto || oldPhoto;

    const sql = `
      UPDATE inventory 
      SET item_code=?, photo=?, name=?, item_group=?, date_purchase=?, date_expiration=?, stock=?, price=?, unit=? 
      WHERE product_ID=?
    `;

    db.query(
      sql,
      [
        item_code || null,
        photoToSave || null,
        name || null,
        item_group || null,
        date_purchase || null,
        date_expiration || null,
        stock || 0,
        price || 0,
        unit || null,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Error updating inventory:", err);
          return res.status(500).json({ success: false, error: "Database error" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Item not found" });
        }
        res.json({ success: true, message: "Item updated", photo: photoToSave });
      }
    );
  });
});

// Delete inventory item
app.delete("/delete_inventory/:id", (req, res) => {
  const { id } = req.params;

  // Step 1: Fetch the photo filename first
  db.query("SELECT photo FROM inventory WHERE product_ID = ?", [id], (err, rows) => {
    if (err) {
      console.error("❌ Error fetching photo for delete:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const photo = rows[0].photo;

    // Step 2: Delete DB record
    db.query("DELETE FROM inventory WHERE product_ID = ?", [id], (err, result) => {
      if (err) {
        console.error("❌ Error deleting inventory:", err);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      // Step 3: Remove file if it exists
      if (photo) {
        const filePath = path.join(__dirname, "tmp/uploads", photo);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.warn("⚠️ Could not delete photo:", filePath, err.message);
          } else {
            console.log("🗑 Deleted photo:", filePath);
          }
        });
      }

      res.json({ success: true, message: "Item and photo deleted" });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});