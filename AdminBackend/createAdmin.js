// createAdmin.js
import axios from "axios";

const createAdmin = async () => {
  try {
    const response = await axios.post("http://localhost:5001/api/admin/create", {
      adminid: "admin001",
      name: "John",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    console.log(response.data);
  } catch (err) {
    console.error("Error creating admin:", err.response?.data || err.message);
  }
};

createAdmin();
