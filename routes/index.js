const express = require('express');
const router = express.Router(); 
const userModel = require("./users");
var productModel = require('./product');
const config = require('../config/config.js');
const multer = require('multer');
const expressSession = require('express-session')
const passport = require('passport');

const userimagesupload = multer({ storage: config.userimagesStorage });
const productimagesupload = multer({ storage: config.productimagesStorage });
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


// <-------------------------Primary Routes --------------------------------------------->




router.get('/', function (req, res) {
  res.render('index');
});


// mart ka code
router.get("/mart", isloggedin , async function(req,res){
  let allproducts =  await productModel.find().limit(8).populate("userid");
  res.render('mart',{allproducts:allproducts});
});

// profile ka code
router.get('/profile', isloggedin, async function (req, res) {
  let user = await userModel.findOne({ username:req.session.passport.user}).populate("products");
  res.render('profile',{user:user})
});

// register ka code!
router.post("/register", async function (req, res) {
  var newUser = new userModel({
    username: req.body.username,
    name: req.body.name,
    isseller: req.body.isseller,
    contactnumber: req.body.contactnumber,
    email: req.body.email
  })
  await userModel.register(newUser, req.body.password)
  passport.authenticate("local")(req, res, function () {
    res.redirect("/profile");
  })
});

// login ka code!
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function (req, res) { });

// logout ka code!
router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// isloggedin ka code!
function isloggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect("/");
  }
};


// <------------------------- Secondary Routes --------------------------------------------->

// verified ka code
router.get('/verify', isloggedin, async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user })
  res.render('verify',{user:user});
});

// data of verified user
router.post('/verify', isloggedin, async function (req, res) {
  let data = {
    gstin: req.body.gstin,
    contactnumber: req.body.contactnumber,
    email: req.body.email
  }
  let Updateduser = await userModel.findOneAndUpdate({ username: req.session.passport.data },data)
  res.redirect("/profile")
});

// image upload krne ka code
router.post('/upload', isloggedin, userimagesupload.single('image'), async function (req, res, next) {
  let user = await userModel.findOne({ username: req.session.passport.user })
  user.pic = req.file.filename;
  await user.save();
  res.send('Ho gyi image upload!')
})

router.post('/create/product', isloggedin, productimagesupload.array('image', 3), async function (req, res, next) {
  const userdata = await userModel.findOne({ username: req.session.passport.user });

  if (userdata.isseller) {

    const data = {
      name: req.body.name,
      userid: userdata._id,
      pic: req.files.map(fl => fl.filename),
      desc: req.body.desc
    }
    //YAHA PAR NAAM  GALAT THA 
    let productmodel = await productModel.create(data);
    userdata.products.push(productmodel._id);
    await userdata.save()
    res.redirect('back');
  }
  else {
    res.send('You dont have a vender account!');
  }

})

// product ko edit krne ka code!
// router.get('/edit/product:_id', isloggedin, async function (req, res, next) {
//   let product = await userModel.findOne({ _id: req.params.id });
//   res.send('This will show a form with product data filled');
// });

// router.post('/edit/product:_id', isloggedin, async function (req, res, next) {
//   let user = await userModel.findOne({ username: req.session.passport.user });
//   let product = await productModel.findOne({ _id: req.params.id }).populate('sellerid');
//   res.send('This will show a form with product data filled');

//   if (product.sellerid.username === user.username) {

//   }
//   else {
//     res.send('hi bro')
//   }

//   // work in progress
// });


// product ko delete krne ka code
router.get('/delete/product:_id', isloggedin, async function (req, res, next) {
  let product = await userModel.findOne({ _id: req.params.id });
  let user = await userModel.findOne({ username: req.session.passport.user });

  if (product.sellerid.user === user.username) {
    await productModel.findOneAndDelete({ _id: req.params.id });
    user.products.splice(user.products.indexof(user._id), 1);
    await user.save();
  }
  // Splice - splice change the orignal array by removing , replacing or adding values and returns the affected values!
});



// wishlist ka code 
router.get('/wishlist/product:_id', isloggedin, async function (req, res, next) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  user.wishlist.push(req.params.id);
  await user.save();
  res.redirect("back");
});



module.exports = router;
