const express = require("express");
const http = require("http");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const os = require("os");
const pty = require("node-pty");

const app = express();
const server = http.createServer(app);

app.use(cors())

// Routers
const router = require("./routes/auth");
const { dataRouter } = require("./routes/dataRouter");

// Ensure "user" directory exists
const userDir = path.join(process.cwd(), "user");
if (!fsSync.existsSync(userDir)) {
    console.log(`Creating missing directory: ${userDir}`);
    fsSync.mkdirSync(userDir, { recursive: true });
}

// Terminal setup
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: userDir, // fixed cwd
    env: process.env
});

// Socket.io setup
const { Server: SocketServer } = require("socket.io");
const io = new SocketServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

// Watch user folder for changes
chokidar.watch(userDir, { ignoreInitial: true }).on("all", (event, changedPath) => {
    io.emit("file:refresh", changedPath);
});

// Emit terminal data
ptyProcess.onData(data => {
    io.emit("terminal:data", data);
});

// Socket.io connection
io.on("connection", socket => {
    console.log(`Socket connected`, socket.id);

    socket.emit("file:refresh");

    socket.on("file:change", async ({ path: filePath, content }) => {
        try {
            const fullPath = path.join(userDir, filePath);
            await fs.writeFile(fullPath, content, "utf-8");
            console.log(`File saved: ${fullPath}`);
        } catch (err) {
            console.error("Error writing file:", err);
        }
    });

    socket.on("terminal:write", data => {
        if (typeof data === "string") {
            ptyProcess.write(data + "\r"); // safe write with newline
        }
    });
});

// Helper: Generate file tree
async function generateFileTree(directory) {
    const tree = {};

    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                currentTree[file] = {};
                await buildTree(filePath, currentTree[file]);
            } else {
                currentTree[file] = null;
            }
        }
    }

    await buildTree(directory, tree);
    return tree;
}

// API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", router);
app.use("/dataRoute", dataRouter);

app.post("/model", async (req, res) => {
    console.log("request received")
    try {
        const flaskRes = await axios.post("http://127.0.0.1:5000/model", req.body);
        res.json(flaskRes.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Flask server error" });
    }
});

app.post("/airesponse", async (req, res) => {
    console.log("request received ai")
    try {
        const flaskRes = await axios.post("http://127.0.0.1:5000/airesponse", req.body);
        res.json(flaskRes.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Flask server error" });
    }
});


app.post("/run", async (req, res) => {
    console.log("request received run")
    try {
        const flaskRes = await axios.post("http://127.0.0.1:5000/run", req.body);
        res.json(flaskRes.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Flask server error" });
    }
});



app.get("/problems", async (req, res) => {
    console.log("📩 Request received at Node /problems");

    try {
        const flaskRes = await axios.get("http://127.0.0.1:5000/problems"); // GET now
        res.json(flaskRes.data);
    } catch (err) {
        console.error("❌ Flask proxy error:", err.message);
        res.status(500).json({ error: "Flask server error" });
    }
});

app.get("/files", async (req, res) => {
    const fileTree = await generateFileTree(userDir);
    return res.json({ tree: fileTree });
});

app.get("/files/content", async (req, res) => {
    try {
        const filePath = req.query.path;
        const content = await fs.readFile(path.join(userDir, filePath), "utf-8");
        return res.json({ content });
    } catch (err) {
        console.error("Error reading file:", err);
        return res.status(500).json({ error: "File read error" });
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
