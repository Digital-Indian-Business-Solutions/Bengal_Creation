const Address = require("../models/address");

const addAddress = async (req, res) => {
  try {
    const addr = new Address({
      customer: req.body.customer,
      fullName: req.body.fullName,
      phone: req.body.phone,
      pincode: req.body.pincode,
      state: req.body.state,
      city: req.body.city,
      area: req.body.area,
      houseNo: req.body.houseNo,
      landmark: req.body.landmark,
    });
    await addr.save();
    res.json(addr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAddressesByCustomer = async (req, res) => {
  try {
    const addresses = await Address.find({ customer: req.params.customerId });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addAddress, getAddressesByCustomer, deleteAddress };
