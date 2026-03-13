const express = require("express");
const router = express.Router();
const Address = require("../models/address");


// ADD ADDRESS
router.post("/", async (req, res) => {
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
      landmark: req.body.landmark
    });

    await addr.save();

    res.json(addr);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET USER ADDRESSES
router.get("/my/:customerId", async (req, res) => {

  try {

    const addresses = await Address.find({
      customer: req.params.customerId
    });

    res.json(addresses);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


// DELETE ADDRESS
router.delete("/:id", async (req, res) => {

  try {

    await Address.findByIdAndDelete(req.params.id);

    res.json({ msg: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

module.exports = router;