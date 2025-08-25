const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const auth = require("../middleware/auth");
const multer = require("multer");

// Multer for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Create recipe
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      author: req.user.id
    });
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add recipe", error: err.message });
  }
});


// Get all recipes
router.get("/", async (req, res) => {
  const recipes = await Recipe.find()
    .populate("author", "name")
    .sort({ createdAt: -1 });
  res.json(recipes);
});

// Get single recipe
router.get("/:id", async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate("author", "name")
    .populate("comments.user", "name");
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  res.json(recipe);
});

// Update recipe
router.put("/:id", auth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  if (recipe.author.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

  Object.assign(recipe, req.body);
  await recipe.save();
  res.json(recipe);
});

// Delete recipe
router.delete("/:id", auth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  if (recipe.author.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

  await recipe.remove();
  res.json({ message: "Recipe deleted" });
});

// Post comment
router.post("/:id/comments", auth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });

  recipe.comments.push({ user: req.user.id, text: req.body.text });
  await recipe.save();
  res.json(recipe);
});

// Rate recipe
router.post("/:id/rate", auth, async (req, res) => {
  const { stars } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });

  const total = recipe.rating.average * recipe.rating.totalRatings + stars;
  recipe.rating.totalRatings += 1;
  recipe.rating.average = total / recipe.rating.totalRatings;

  await recipe.save();
  res.json(recipe);
});

// Favorite / unfavorite
router.post("/:id/favorite", auth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });

  const index = recipe.favorites.indexOf(req.user.id);
  if (index === -1) recipe.favorites.push(req.user.id);
  else recipe.favorites.splice(index, 1);

  await recipe.save();
  res.json(recipe);
});

module.exports = router;
