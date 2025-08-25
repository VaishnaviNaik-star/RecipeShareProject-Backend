const mongoose = require('mongoose');
// Get single recipe
router.get('/:id', async (req, res) => {
const item = await Recipe.findById(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });
res.json(item);
});


// Update recipe (author only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
const existing = await Recipe.findById(req.params.id);
if (!existing) return res.status(404).json({ message: 'Not found' });
if (String(existing.creator) !== req.user.id) return res.status(403).json({ message: 'Not owner' });


const { title, description, category, ingredients, instructions } = req.body;
if (req.file) existing.imageUrl = `/uploads/${req.file.filename}`;
if (title) existing.title = title;
if (description !== undefined) existing.description = description;
if (category) existing.category = category;
if (ingredients !== undefined) existing.ingredients = Array.isArray(ingredients) ? ingredients : String(ingredients).split('\n').filter(Boolean);
if (instructions) existing.instructions = instructions;
existing.markModified('ingredients');
await existing.save();
res.json(existing);
});


// Delete recipe (author only)
router.delete('/:id', auth, async (req, res) => {
const existing = await Recipe.findById(req.params.id);
if (!existing) return res.status(404).json({ message: 'Not found' });
if (String(existing.creator) !== req.user.id) return res.status(403).json({ message: 'Not owner' });
await existing.deleteOne();
res.json({ message: 'Deleted' });
});


// Rate a recipe (1–5). If user rated before, update rating.
router.post('/:id/rate', auth, async (req, res) => {
const { stars } = req.body;
if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: 'Stars must be 1-5' });
const recipe = await Recipe.findById(req.params.id);
if (!recipe) return res.status(404).json({ message: 'Not found' });
const idx = recipe.ratings.findIndex(r => String(r.user) === req.user.id);
if (idx >= 0) recipe.ratings[idx].stars = stars; else recipe.ratings.push({ user: req.user.id, stars });
recipe.recalcAverage();
await recipe.save();
res.json({ avgRating: recipe.avgRating, ratings: recipe.ratings });
});


// Toggle favorite
router.post('/:id/favorite', auth, async (req, res) => {
const user = await User.findById(req.user.id);
const rid = req.params.id;
const i = user.favorites.findIndex(x => String(x) === rid);
if (i >= 0) user.favorites.splice(i, 1); else user.favorites.push(rid);
await user.save();
res.json({ favorites: user.favorites });
});


// Get my favorites
router.get('/me/favorites/list', auth, async (req, res) => {
const user = await User.findById(req.user.id).populate('favorites');
res.json(user.favorites || []);
});


module.exports = router;


