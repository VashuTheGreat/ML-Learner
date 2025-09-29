const express = require("express");
const supabase = require("../supabase");

const router = express.Router();


// Create Profile (signup ke baad)
router.post("/profiles", async (req, res) => {
  const { id, username, email, profile_image } = req.body;
  const { data, error } = await supabase
    .from("profiles")
    .insert([{ id, username, email, profile_image }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get Profile
router.get("/profiles/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update Profile
router.put("/profiles/:id", async (req, res) => {
  const { username, profile_image } = req.body;
  const { data, error } = await supabase
    .from("profiles")
    .update({ username, profile_image })
    .eq("id", req.params.id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});




// Performance Routers


// Get user performance
router.get("/performance/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("performance")
    .select("*")
    .eq("user_id", req.params.userId)
    .limit(1)
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update performance (increment stats after solving a problem)
router.put("/performance/:userId", async (req, res) => {
  const updates = req.body;
  const userId = req.params.userId;

  try {
    const { data, error } = await supabase
      .from("performance")
      .update(updates)
      .eq("user_id", userId)
      .select(); // select() lagaane se updated record wapas milega

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




// Activities 



// Get weekly activity
router.get("/activeness/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("activeness")
    .select("*")
    .eq("user_id", req.params.userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update activity
router.put("/activeness/:id", async (req, res) => {
  const updates = req.body;
  const { data, error } = await supabase
    .from("activeness")
    .update(updates)
    .eq("user_id", req.params.id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});



// Monthly progress

// Get monthly progress
router.get("/monthly-progress/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("monthly_progress")
    .select("*")
    .eq("user_id", req.params.userId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update progress
router.put("/monthly-progress/:userId", async (req, res) => {
  const { problems_solved, month, year } = req.body;
  const userId = req.params.userId;

  try {
    const { data, error } = await supabase
      .from("monthly_progress")
      .update({ problems_solved })
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: "No record found to update" });
    }

    res.json({ message: "Monthly progress updated", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// add month
router.post("/monthly-progress", async (req, res) => {
  const { user_id, problems_solved } = req.body;

  try {
    const monthNames = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];

    const newDate = new Date();
    const month = monthNames[newDate.getMonth()];
    const year = newDate.getFullYear();

    const { data, error } = await supabase
      .from("monthly_progress")
      .insert([
        { user_id, month, year, problems_solved }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// question


// Add a question
router.post("/questions", async (req, res) => {
  const { title, description, difficulty, category } = req.body;
  const { data, error } = await supabase
    .from("questions")
    .insert([{ title, description, difficulty, category }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({"message":"success","data_inserted":data});
});

// Get all questions
router.get("/questions", async (req, res) => {
  const { data, error } = await supabase.from("questions").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});



//Recent Activities

// Add recent activity (when user attempts/solves)
router.post("/recent-activity", async (req, res) => {
  const { user_id, question_id, question_title, difficulty, status } = req.body;
  const { data, error } = await supabase
    .from("recent_activity")
    .insert([{ user_id, question_id, question_title, difficulty, status }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get user’s recent activity
router.get("/recent-activity/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("recent_activity")
    .select("*")
    .eq("user_id", req.params.userId)
    .order("attempted_at", { ascending: false })
    .limit(10);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


// Ranking Routes

// Get ranking
router.get("/ranking/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .eq("user_id", req.params.userId);

  if (error) return res.status(400).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: "No ranking found" });

  res.json(data[0]); // first row return karo
});


// Update ranking
router.put("/ranking/:userId", async (req, res) => {
  const updates = req.body;
  const { data, error } = await supabase
    .from("ranking")
    .update(updates)
    .eq("user_id", req.params.userId).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post("/ranking", async (req, res) => {
  const { user_id, rank, percentile } = req.body;

  try {
    const { data, error } = await supabase
      .from("ranking")
      .insert([{ user_id, rank, percentile }])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Ranking inserted successfully",
      data_inserted: data,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




router.post("/question-examples", async (req, res) => {
  const { question_id, example_input, example_output, test_cases } = req.body;

  const { data, error } = await supabase
    .from("question_examples")
    .insert([{ question_id, example_input, example_output, test_cases }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: "Example added", data });
});


router.put("/question-examples/:id", async (req, res) => {
  const updates = req.body;

  const { data, error } = await supabase
    .from("question_examples")
    .update(updates)
    .eq("id", req.params.id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Example updated", data });
});


router.delete("/question-examples/:id", async (req, res) => {
  const { error } = await supabase
    .from("question_examples")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Example deleted successfully" });
});



router.get("/question-examples/:question_id", async (req, res) => {
  const { data, error } = await supabase
    .from("question_examples")
    .select("*")
    .eq("question_id", req.params.question_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


module.exports= {dataRouter:router};