const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Recipe = require("./models/Recipe");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for seeding..."))
  .catch(err => console.log(err));

const seedRecipes = async () => {
  try {
    await Recipe.deleteMany(); // Clear old recipes

    const recipes = [
      {
        title: "Paneer Butter Masala",
        description: "Rich and creamy paneer curry cooked in tomato gravy with butter.",
        category: "Indian",
        image: "/uploads/paneer.jpg",
        ingredients: ["Paneer", "Tomatoes", "Butter", "Cream", "Spices"],
        instructions: "Cook tomato gravy, add spices and paneer, finish with cream & butter."
      },
      {
        title: "Veg Biryani",
        description: "Fragrant rice cooked with fresh vegetables and aromatic spices.",
        category: "Rice",
        image: "/uploads/biryani.jpg",
        ingredients: ["Basmati rice", "Carrot", "Beans", "Cauliflower", "Spices"],
        instructions: "Layer cooked rice with spiced vegetables, steam until flavors blend."
      },
      {
        title: "Margherita Pizza",
        description: "Classic Italian pizza topped with mozzarella, tomato, and basil.",
        category: "Italian",
        image: "/uploads/pizza.jpg",
        ingredients: ["Pizza base", "Tomato sauce", "Mozzarella", "Basil"],
        instructions: "Spread sauce on base, add cheese & basil, bake until golden."
      },
      {
        title: "Veggie Burger",
        description: "Crispy veg patty with lettuce, tomato, and mayo inside a soft bun.",
        category: "Fast Food",
        image: "/uploads/burger.jpg",
        ingredients: ["Burger bun", "Veg patty", "Lettuce", "Tomato", "Mayo"],
        instructions: "Toast buns, add patty and veggies, layer with mayo and serve."
      },
      {
        title: "Masala Dosa",
        description: "South Indian crispy dosa stuffed with spiced potato filling.",
        category: "Breakfast",
        image: "/uploads/dosa.jpeg",
        ingredients: ["Dosa batter", "Potato", "Onion", "Mustard seeds", "Curry leaves"],
        instructions: "Spread dosa batter on tawa, fill with potato masala, fold and serve."
      }
    ];

    // Insert recipes into database
    await Recipe.insertMany(recipes);

    console.log("✅ Recipes seeded successfully!");
    mongoose.connection.close(); // Close DB connection
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};

seedRecipes();
