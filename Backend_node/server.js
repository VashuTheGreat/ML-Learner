const express = require("express");
const http = require("http");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const router=require("./routes/auth")
const {dataRouter}=require("./routes/dataRouter")

const fs = require('fs/promises')
const { Server: SocketServer } = require('socket.io')
const path = require('path')
const chokidar = require('chokidar');
const os = require("os");
const pty = require('node-pty')

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env
});

const io = new SocketServer({
    cors: '*'
})



app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//Terminal and file system
io.attach(server);

chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh', path)
});


ptyProcess.onData(data => {
    io.emit('terminal:data', data)
})

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id)

    socket.emit('file:refresh')

    socket.on('file:change', async ({ path, content }) => {
        await fs.writeFile(`./user${path}`, content)
    })

    socket.on('terminal:write', (data) => {
        console.log('Term', data)
        ptyProcess.write(data);
    })
})

app.get('/files', async (req, res) => {
    const fileTree = await generateFileTree('./user');
    return res.json({ tree: fileTree })
})

app.get('/files/content', async (req, res) => {
    const path = req.query.path;
    const content = await fs.readFile(`./user${path}`, 'utf-8')
    return res.json({ content })
})




async function generateFileTree(directory) {
    const tree = {}

    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir)

        for (const file of files) {
            const filePath = path.join(currentDir, file)
            const stat = await fs.stat(filePath)

            if (stat.isDirectory()) {
                currentTree[file] = {}
                await buildTree(filePath, currentTree[file])
            } else {
                currentTree[file] = null
            }
        }
    }

    await buildTree(directory, tree);
    return tree
}

//Auth and data routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/auth", router);
app.use("/dataRoute", dataRouter);

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
