const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  ingredients: [String],
  instructions: [String],
  category: String,
  imageUrl: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  rating: {
    average: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Recipe", RecipeSchema);
