const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log(req.body);

    let user = await Customer.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    user = new Customer({ name, email, phone, password: hashed });
    await user.save();

    res.json({ msg: "Customer Registered" });
  } catch (err) {
    res.status(500).json({ msg: "error", error: err.message });
  }
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  const user = await Customer.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid email" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user });
};

module.exports = { registerCustomer, loginCustomer };
