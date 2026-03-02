const express = require("express");
const router = express.Router();
const Address = require("../models/address");
// const auth = require("../middleware/customerAuth");



// ADD ADDRESS
router.post("/",  async (req, res) => {
  const addr = new Address({
    ...req.body,
    customer: req.user.id
  });
  await addr.save();
  res.json({ msg: "Address Added", addr });
});



// GET ALL ADDRESSES BY USER
router.get("/my",  async (req, res) => {
  const addresses = await Address.find({
    customer: req.user.id
  });
  res.json(addresses);
});



// DELETE



router.delete("/:id",  async (req, res) => {
  await Address.findOneAndDelete({
    _id: req.params.id,
    customer: req.user.id
  });
  res.json({ msg: "Deleted" });
});

module.exports = router;