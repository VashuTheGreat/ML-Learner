import http from 'http';
import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public', 'video-frames');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
} else {
  // Clear old frames if any
  fs.readdirSync(targetDir).forEach(file => {
    fs.unlinkSync(path.join(targetDir, file));
  });
}

const html = `
<!DOCTYPE html>
<html>
<head><title>Generating Frames...</title></head>
<body style="background: #09090b; color: #fff; font-family: sans-serif; text-align: center; padding-top: 50px;">
  <h1>Generating ML Neural Network Animation Frames...</h1>
  <p>Please keep this tab open for ~10 seconds. It will close automatically.</p>
  <h2 id="status" style="color: #2adee4;">0 / 150</h2>
  <canvas id="c" width="1920" height="1080" style="display:none;"></canvas>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const frames = 150;
  let currentFrame = 0;

  // Set up particles
  const numParticles = 140;
  const particles = [];
  for(let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      z: Math.random() * 2 + 1
    });
  }

  async function renderFrame() {
    // Background gradient
    const grd = ctx.createLinearGradient(0, 0, 1920, 1080);
    grd.addColorStop(0, '#020617'); // super dark blue
    grd.addColorStop(1, '#0f172a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Abstract ML network background
    particles.forEach(p => {
      // Gentle drift + sine wave motion
      p.x += p.vx + Math.sin(currentFrame * 0.05 + p.y * 0.01) * 2;
      p.y += p.vy + Math.cos(currentFrame * 0.05 + p.x * 0.01) * 2;
      
      if (p.x < -150) p.x = 2070;
      if (p.x > 2070) p.x = -150;
      if (p.y < -150) p.y = 1230;
      if (p.y > 1230) p.y = -150;
    });

    particles.forEach((p, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
          ctx.globalAlpha = Math.pow(1 - dist / 250, 2);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          // Sleek blue/purple line
          const lineGrd = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
          lineGrd.addColorStop(0, '#38bdf8'); // sky blue
          lineGrd.addColorStop(1, '#818cf8'); // indigo
          ctx.strokeStyle = lineGrd;
          ctx.lineWidth = (250 - dist) / 80;
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.z * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    document.getElementById('status').innerText = (currentFrame + 1) + " / " + frames;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // 85% quality keeps size low
    await fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frame: currentFrame + 1,
        image: dataUrl
      })
    });

    currentFrame++;
    if (currentFrame < frames) {
      setTimeout(renderFrame, 0); // let UI update briefly
    } else {
      document.getElementById('status').innerText = "Done! You can close this tab.";
      await fetch('/done');
      window.close(); // Attempt to close the tab automatically
    }
  }

  // Start with slight delay
  setTimeout(renderFrame, 300);
</script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { frame, image } = JSON.parse(body);
        const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
        const fileName = `frame_${frame.toString().padStart(4, '0')}.jpg`;
        fs.writeFileSync(path.join(targetDir, fileName), base64Data, 'base64');
        process.stdout.write(`\rSaved ${fileName} (${frame}/150)...`);
        res.writeHead(200);
        res.end();
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end();
      }
    });
  } else if (req.method === 'GET' && req.url === '/done') {
    res.writeHead(200);
    res.end();
    console.log("\\n\\nSuccessfully generated all 150 frames. Shutting down.");
    server.close();
    process.exit(0);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(9999, async () => {
  console.log('Server running on http://localhost:9999');
  console.log('Launching browser to generate frames locally using your GPU...');
  const { exec } = await import('child_process');
  
  // Open the browser automatically to trigger generation
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} http://localhost:9999`);
});
