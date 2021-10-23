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

// route consultation avec filtres

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



// router.get("/offers", async (req, res) => {
//   try {
//     const filters = {};

//     if (req.query.title) {
//       filters.product_name = new RegExp(req.query.title, "i");
//     }

//     if (req.query.priceMin) {
//       filters.product_price = { $gte: req.query.priceMin };
//     }

//     if (req.query.priceMax) {
//       if (filters.product_price) {
//         filters.product_price.$lte = req.query.priceMax;
//       } else {
//         filters.product_price = {
//           $lte: req.query.priceMax,
//         };
//       }
//     }

//     //console.log(filters);
//     let sort = {};

//     if (req.query.sort === "price-desc") {
//       sort = { product_price: -1 };
//     } else {
//       sort = { product_price: 1 };
//     }

//     // Par défaut on envoie la page 1
//     let page = 1;
//     if (req.query.page) {
//       page = Number(req.query.page);
//     }

//     // Par défaut on fixe la limite à 3
//     let limit = 3;
//     if (req.query.limit) {
//       limit = Number(req.query.limit);
//     }

//     const offers = await Offer.find(filters)
//       .sort(sort)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .select("product_name product_price");

//     const count = await Offer.countDocuments(filters);

//     res.json({
//       count: count,
//       offers: offers,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// router.get("/offer/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const offer = await Offer.findById(id).populate({
//       path: "owner",
//       select: "account",
//     });
//     if (offer) {
//       res.json(offer);
//     } else {
//       res.status(400).json({ message: "Offer not found" });
//     }
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

module.exports = router;




