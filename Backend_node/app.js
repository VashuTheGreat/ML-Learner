const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use("/", (req, res) => {
    console.log(req.method);
    res.send("Hello World");
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
