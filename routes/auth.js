
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// REGISTER USER
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, contact, username, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User with this email already exists" });

        user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: "Username already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            firstName,
            lastName,
            email,
            contact,
            username,
            password: hashedPassword,
        });

        await user.save();
        res.json({ msg: "User registered successfully" });

    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ msg: "Server error" });
    }
});

// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body; // Use username instead of email

        const user = await User.findOne({ username }); // Find user by username
        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const payload = {
            userId: user._id // Make sure this is called 'userId' to match what your vitals route expects
          };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username, contact: user.contact } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;