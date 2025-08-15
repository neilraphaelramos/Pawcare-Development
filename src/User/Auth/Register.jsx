import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import axios from "axios";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    username: "",
    email: "",
    phone: "",
    houseNum: "",
    province: "",
    provinceCode: "",
    municipality: "",
    municipalityCode: "",
    barangay: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  useEffect(() => {
    axios
      .get("https://psgc.gitlab.io/api/provinces.json")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  useEffect(() => {
    if (form.provinceCode) {
      axios
        .get(`https://psgc.gitlab.io/api/provinces/${form.provinceCode}/cities-municipalities.json`)
        .then((res) => setMunicipalities(res.data))
        .catch((err) => console.error("Error loading municipalities:", err));
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [form.provinceCode]);

  useEffect(() => {
    if (form.municipalityCode) {
      axios
        .get(`https://psgc.gitlab.io/api/cities-municipalities/${form.municipalityCode}/barangays.json`)
        .then((res) => setBarangays(res.data))
        .catch((err) => console.error("Error loading barangays:", err));
    } else {
      setBarangays([]);
    }
  }, [form.municipalityCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "province") {
      const selected = provinces.find((p) => p.name === value);
      setForm((prev) => ({
        ...prev,
        province: value,
        provinceCode: selected?.code || "",
        municipality: "",
        municipalityCode: "",
        barangay: "",
      }));
    } else if (name === "municipality") {
      const selected = municipalities.find((m) => m.name === value);
      setForm((prev) => ({
        ...prev,
        municipality: value,
        municipalityCode: selected?.code || "",
        barangay: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const password = form.password;

    if (!agree) {
      alert("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      alert("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/register", form);

      if (res.data.message) {
        alert("Registration successful!");

        setForm({
          firstName: "",
          middleName: "",
          lastName: "",
          suffix: "",
          username: "",
          email: "",
          phone: "",
          houseNum: "",
          province: "",
          provinceCode: "",
          municipality: "",
          municipalityCode: "",
          barangay: "",
          zipCode: "",
          password: "",
          confirmPassword: "",
        });

        navigate("/login", {
          state: { successMessage: "✅ You’ve successfully registered!" },
        });
      } else if (res.data.error) {
        alert(res.data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };


  return (
    <div className="login-container">
      <div className="login-image-section">
        <img src="images/bg5.png" alt="Dog" />
      </div>

      <div className="register-form-section">
        <div className="register-card">
          <h1>Create Account</h1>
          <p className="subtext">Join us by filling out the information below</p>

          <form onSubmit={handleSubmit}>
            <div className="forminfo">
              <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
              <input type="text" name="middleName" placeholder="Middle Name (Optional)" value={form.middleName} onChange={handleChange} />
              <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
              <input type="text" name="suffix" placeholder="Suffix (Optional)" value={form.suffix} onChange={handleChange} />
              <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
              <input type="text" name="houseNum" placeholder="House Number & Street" value={form.houseNum} onChange={handleChange} required />

              {/* Province */}
              <select className="input-like" name="province" value={form.province} onChange={handleChange} required>
                <option value="">Select Province</option>
                {provinces.map((prov) => (
                  <option key={prov.code} value={prov.name}>{prov.name}</option>
                ))}
              </select>

              {/* Municipality */}
              <select className="input-like" name="municipality" value={form.municipality} onChange={handleChange} required disabled={!form.province}>
                <option value="">Select Municipality</option>
                {municipalities.map((mun) => (
                  <option key={mun.code} value={mun.name}>{mun.name}</option>
                ))}
              </select>

              {/* Barangay */}
              <select className="input-like" name="barangay" value={form.barangay} onChange={handleChange} required disabled={!form.municipality}>
                <option value="">Select Barangay</option>
                {barangays.map((brgy) => (
                  <option key={brgy.code} value={brgy.name}>{brgy.name}</option>
                ))}
              </select>

              <input type="text" name="zipCode" placeholder="Zip Code (Optional)" value={form.zipCode} onChange={handleChange} />
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
            </div>

            <button type="submit">Sign Up</button>

            <div className="terms-container">
              <label className="terms-label">
                <input type="checkbox" className="terms-input" required checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className="terms-text">
                  I agree to the <a href="">Terms & Conditions</a> and <a href="">Privacy Policy</a>
                </span>
              </label>
            </div>
          </form>

          <div className="divider"><span>Or continue with</span></div>

          <div className="social-login">
            <button className="google">
              <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="Google icon" className="icon" />
              Google
            </button>
          </div>

          <p className="signup-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
