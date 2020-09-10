module.exports = {
  sample(req, res) {
    res.status(200).json({"hello": "express"})
  }
};
