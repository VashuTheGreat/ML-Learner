
const express = require("express");
const http = require("http");
const modelRoute = require("./routes/routers");

const app = express();
const server = http.createServer(app);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom routes
app.use(modelRoute);

// Default route
app.get("/", (req, res) => {
  console.log(req.method);
  res.send("Hello World");
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
