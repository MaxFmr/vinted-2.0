require("dotenv").config();
console.log("modif");
const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(formidableMiddleware());
app.use(cors());
// Connexion à la BDD nommée "students-app" :
mongoose.connect(process.env.MONGODB_URI);

//config Cloudinary

cloudinary.config({
  cloud_name: "dal6ewwdl",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import des routes

//llalalla
const publishRoutes = require("./routes/users");
app.use(publishRoutes);

//llalalla
const loginRoutes = require("./routes/users");
app.use(loginRoutes);
//Modeles

const uid2 = require("uid2");

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
