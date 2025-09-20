const { Schema, model, connect } = require("mongoose");

const uri = "mongodb+srv://vashuthegreat7832:Vansh1234@cluster0.x3hen.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new Schema({
    name: { type: String, required: true },       // ✅ corrected
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    image: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const User = model("User", userSchema);

module.exports = User;
