const crypto = require('crypto');
const path = require("path");
const multer = require("multer");

//user ki image upload hone ka code!
const userimagesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/userimage/")
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(14,function (err, buff) {
      var fn = buff.toString("hex")+path.extname(file.originalname);
      cb(null, fn)
    })
  }
})

//product ki image upload hone ka code!
const productimagesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/productimage/");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(14,function (err, buff) {
      //YAHA PAR ORIGINAL NAME KARNA hai
      var fn = buff.toString("hex") + path.extname(file.originalname);
      cb(null, fn)
    })
  }
})

module.exports = {userimagesStorage,productimagesStorage};
