const express = require("express");
const http = require("http");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios");

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/model", async (req, res) => {
  try {
    const flaskRes = await axios.post("http://127.0.0.1:5000/model", req.body);
    res.json(flaskRes.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Flask server error" });
  }
});

app.get("/", (req, res) => {
  console.log(req.method);
  res.send("Hello World");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
