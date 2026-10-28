const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.get('/', (req,res)=>{
res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>SLOW-GEE GHOST SESSION</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI,sans-serif}body{background:#0a0a0a;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:#111;border:1px solid #222;border-radius:20px;padding:30px;width:100%;max-width:400px;text-align:center;box-shadow:0 0 40px rgba(0,255,100,0.15)}h1{font-size:22px;margin-bottom:5px}.ghost{font-size:50px;margin-bottom:10px}p.sub{color:#888;font-size:13px;margin-bottom:25px}input{width:100%;padding:15px;border-radius:12px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:16px;outline:none;margin-bottom:15px}button{width:100%;padding:15px;border-radius:12px;border:none;background:linear-gradient(90deg,#00ff88,#00cc6a);color:#000;font-weight:bold;font-size:16px;cursor:pointer}.code-box{margin-top:25px;background:#000;border:1px dashed #00ff88;border-radius:12px;padding:20px;display:none}.code{font-size:28px;font-weight:bold;letter-spacing:3px;color:#00ff88;margin:10px 0;word-break:break-all}.steps{margin-top:15px;text-align:left;background:#1a1a1a;padding:15px;border-radius:12px;font-size:13px;line-height:1.6;color:#ccc}.copy{margin-top:10px;background:#222;color:#fff;padding:10px;border-radius:8px;border:none;width:100%}</style></head><body><div class="card"><div class="ghost">👻</div><h1>SLOW-GEE GHOST</h1><p class="sub">Session Generator - Direct Link</p><input id="num" placeholder="254791536079" type="tel"><button id="btn" onclick="getCode()">PATA PAIRING CODE</button><div id="box" class="code-box"><div>CODE YAKO:</div><div id="code" class="code">--------</div><button class="copy" onclick="navigator.clipboard.writeText(document.getElementById('code').innerText);alert('Copied!')">Copy Code</button><div class="steps"><b>Jinsi:</b><br>1. WhatsApp > Settings > Linked Devices<br>2. Link a Device<br>3. Link with phone number<br>4. Weka code</div></div></div><script>async function getCode(){let n=document.getElementById('num').value;if(!n)return alert('Weka namba');let btn=document.getElementById('btn');btn.disabled=true;btn.innerText='Inatengeneza...';try{let res=await fetch('/pair?number='+encodeURIComponent(n));let data=await res.json();if(data.error)throw new Error(data.error);document.getElementById('code').innerText=data.code;document.getElementById('box').style.display='block';}catch(e){alert('Error: '+e.message)}btn.disabled=false;btn.innerText='PATA PAIRING CODE';}</script></body></html>`);
});
app.get('/pair', async (req,res)=>{
  let num = req.query.number;
  if(!num) return res.status(400).json({error:'Weka namba'});
  num = num.replace(/[^0-9]/g,'');
  if(num.startsWith('0')) num = '254'+num.slice(1);
  const sessionId = 'session_' + Date.now();
  const sessionPath = path.join(__dirname, sessionId);
  fs.mkdirSync(sessionPath, {recursive:true});
  try{
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const sock = makeWASocket({auth: state, printQRInTerminal: false, browser: ["SLOW-GEE GHOST","Chrome","1.0"], logger: pino({level:'silent'})});
    sock.ev.on('creds.update', saveCreds);
    if(!sock.authState.creds.registered){
      await delay(2000);
      const code = await sock.requestPairingCode(num);
      res.json({code: code});
    }
    sock.ev.on('connection.update', async (u)=>{
      if(u.connection==='open'){ await delay(3000); try{ fs.rmSync(sessionPath,{recursive:true,force:true}); }catch{} }
    });
  }catch(e){ res.status(500).json({error:e.message}); try{ fs.rmSync(sessionPath,{recursive:true,force:true}); }catch{} }
});
app.listen(PORT, ()=> console.log('LIVE ON '+PORT));
