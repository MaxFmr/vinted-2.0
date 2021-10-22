const express = require("express");
const router = express.Router();
// // Import des models
const Offer = require("../models/modelOffer.js");
const User = require("../models/modelUser.js");
const cloudinary = require("cloudinary").v2;

//Middleware isAuthenticated

// app.use(formidableMiddleware());

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = user;
      // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé   pourra avoir accès à req.user
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

//
// Route de publication d'une offre
//
router.post("/user/offer/publish", isAuthenticated, async (req, res) => {
  console.log("route publish");

  try {
    const newOffer = await new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        {
          MARQUE: req.fields.brand,
        },
        {
          TAILLE: req.fields.size,
        },
        {
          ÉTAT: req.fields.size,
        },
        {
          COULEUR: req.fields.color,
        },
        {
          EMPLACEMENT: req.fields.city,
        },
      ],

      owner: req.user,
    });

    //J'envoie mon image sur cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path);
    //J'enregistre ce que me renvoie cloudinary dans la clé product_image
    newOffer.product_image = result;

    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//route consultation avec filtres

router.get("/offers", async (req, res) => {
  try {
    if (req.query.page) {
      const numberOfProduct = 3;
      const ObjectsToskip = Number(req.query.page) * numberOfProduct;
      const offers = await Offer.find()
        .limit(numberOfProduct)
        .skip(ObjectsToskip);
      res.json(offers);
    }

    const offers = await Offer.find(
      { product_name: new RegExp(req.query.title, "i") },
      { product_price: { $lte: Number(req.query.priceMax) } },
      { product_price: { $gte: Number(req.query.priceMin) } }
    );

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
