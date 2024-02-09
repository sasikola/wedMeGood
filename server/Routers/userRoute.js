const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");
const authMiddleware = require("../MiddleWares/authMiddleware");
const doctorModel = require("../Models/doctorModel");
const router = express.Router();

// REGISTER

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Check if a user with the same email already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists", success: false });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new userModel({
      fullName,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error", success: false });
  }
});

// LOGIN

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid Email" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, "your-secret-key", {
      expiresIn: "1h", // Token expires in 1 hour
    });
    res.json({ token, message: "User loggedin successfully", success: true });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error logged in " });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({ message: "No User Found", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false });
  }
});

router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
  try {
    const newDoctor = new doctorModel({ ...req.body, status: "Pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account `,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
      },
      onclickPath: "/admin/doctors",
    });
    // console.log(unseenNotifications);
    await userModel.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res
      .status(200)
      .send({ message: "Doctor account applied successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error applying doctor account", success: false });
  }
});

router.post("/mark-all-as-seen", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const unseenNotifications = user.unseenNotifications;
    const seenNotifications = user.seenNotifications;
    seenNotifications.push(...unseenNotifications);
    user.unseenNotifications = [];
    user.seenNotifications = seenNotifications;

    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      message: "All notifications marked as seen",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error applying doctor account", success: false });
  }
});

router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      message: "All notifications has deleted successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error applying doctor account", success: false });
  }
});

module.exports = router;
