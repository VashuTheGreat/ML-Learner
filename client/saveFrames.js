import http from 'http';
import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public', 'video-frames');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const html = `
<!DOCTYPE html>
<html>
<head><title>Generating Frames...</title></head>
<body style="background: #09090b; color: #fff; font-family: sans-serif; text-align: center; padding-top: 50px;">
  <h1>Generating ML Neural Network Animation Frames...</h1>
  <p>Please keep this tab open for ~10 seconds. It will close automatically.</p>
  <h2 id="status" style="color: #2adee4;">0 / 148</h2>
  <canvas id="c" width="1080" height="720" style="display:none;"></canvas>
<script>
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const frames = 148;
  let currentFrame = 0;

  const numParticles = 100;
  const particles = [];
  for(let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * 1080,
      y: Math.random() * 720,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      z: Math.random() * 2 + 1
    });
  }

  async function renderFrame() {
    // Basic animated gradient background
    const grd = ctx.createLinearGradient(0, 0, 1080, 720);
    const progress = currentFrame / frames;
    grd.addColorStop(0, '#0f172a');
    grd.addColorStop(1, progress < 0.5 ? '#1e1b4b' : '#312e81');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 1080, 720);
    
    // Abstract ML network background
    particles.forEach(p => {
      p.x += p.vx + Math.sin(currentFrame * 0.05 + p.y * 0.01) * 2;
      p.y += p.vy + Math.cos(currentFrame * 0.05 + p.x * 0.01) * 2;
      
      if (p.x < -100) p.x = 1180;
      if (p.x > 1180) p.x = -100;
      if (p.y < -100) p.y = 820;
      if (p.y > 820) p.y = -100;
    });

    particles.forEach((p, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.globalAlpha = Math.pow(1 - dist / 150, 2);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.z, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add some random tech data texts
    ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
    ctx.font = "14px monospace";
    for(let t=0; t<5; t++) {
        ctx.fillText("EPOCH: " + (currentFrame * 10) + " LOSS: " + Math.random().toFixed(4), 50, 50 + t * 40);
    }

    document.getElementById('status').innerText = (currentFrame + 1) + " / " + frames;

    // Small jpeg format to keep it speedy
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
    
    try {
        await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            frame: currentFrame + 1,
            image: dataUrl
        })
        });
    } catch(e) {}

    currentFrame++;
    if (currentFrame < frames) {
      requestAnimationFrame(renderFrame); 
    } else {
      document.getElementById('status').innerText = "Done! You can close this tab now.";
      await fetch('/done').catch(()=>null);
      window.close();
    }
  }

  setTimeout(renderFrame, 500);
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
        const parsed = JSON.parse(body);
        const base64Data = parsed.image.replace(/^data:image\/jpeg;base64,/, "");
        const fileName = "frame_" + parsed.frame.toString().padStart(4, '0') + ".jpg";
        fs.writeFileSync(path.join(targetDir, fileName), base64Data, 'base64');
        process.stdout.write("\\rSaved " + fileName + " (" + parsed.frame + "/148)...");
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
    console.log("\\n\\nSuccessfully generated all 148 frames. Shutting down.");
    server.close();
    process.exit(0);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(9999, () => {
  console.log('Server running on http://localhost:9999');
  console.log('CLICK THE LINK ABOVE IN YOUR BROWSER to start generating the frames using your GPU!');
});
