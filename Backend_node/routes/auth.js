const express = require("express");
const supabase = require("../supabase");

const router = express.Router();

router.post("/signUp", async (req, res) => {
  const { username, email, password, profile_image } = req.body;
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const userId = authData.user.id;

    const month = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const newDate = new Date();

    await supabase.from("profiles").insert([
      { id: userId, username, email, profile_image },
    ]);
    await supabase.from("performance").insert([{ user_id: userId }]);
    await supabase.from("activeness").insert([{ user_id: userId }]);
    await supabase.from("monthly_progress").insert([
      {
        user_id: userId,
        month: month[newDate.getMonth()],
        year: newDate.getFullYear(),
        problems_solved: 0,
      },
    ]);
    await supabase.from("ranking").insert([
      { user_id: userId, rank: null, percentile: 0 },
    ]);
    await supabase.from("recent_activity").insert([
      {
        user_id: userId,
        question_id: null,
        question_title: "",
        difficulty: "Easy",
        status: "Attempted",
      },
    ]);

    res.status(201).json({ message: "SignUp successful", userId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
