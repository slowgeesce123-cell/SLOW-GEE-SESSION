const express=require('express');
const {default:makeWASocket,useMultiFileAuthState,delay}=require('@whiskeysockets/baileys');
const path=require('path');
const fs=require('fs');
const pino=require('pino');
const app=express();
const PORT=process.env.PORT||3000;
app.use(express.json());
app.get('/',(req,res)=>{
res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SLOW GEE</title><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:sans-serif}
body{height:100vh;background:linear-gradient(rgba(5,15,45,0.82),rgba(5,15,45,0.92)),url('https://i.imgur.com/8Km9tLL.jpg') center/cover fixed}
nav{padding:16px 20px;display:flex;justify-content:space-between;background:rgba(0,0,0,0.35);backdrop-filter:blur(10px)}
.logo{color:#fff;font-weight:900;font-size:20px}
.logo span{color:#3b82ff}
ul{display:flex;gap:12px;list-style:none}
a{color:#dde8ff;text-decoration:none;font-size:11px}
.center{min-height:88vh;display:flex;justify-content:center;align-items:center;padding:15px}
.glass{width:100%;max-width:480px;background:rgba(255,255,255,0.11);border:1px solid rgba(255,255,255,0.25);backdrop-filter:blur(18px);border-radius:26px;padding:30px;text-align:center;box-shadow:0 0 35px rgba(59,130,255,0.4)}
h1{color:#fff;font-size:26px}
p{color:#a9c4ff;font-size:12px}
input{width:100%;margin:16px 0;padding:14px;border-radius:30px;border:1px solid #6a9bff88;background:rgba(0,0,0,0.35);color:#fff;text-align:center;outline:none}
button{width:100%;padding:14px;border-radius:30px;border:none;background:#2563eb;color:#fff;font-weight:800;box-shadow:0 0 22px #2563eb}
#code{margin-top:14px;font-size:28px;color:#00ff88;font-weight:900;letter-spacing:4px;display:none}
</style></head><body>
<nav><div class="logo"><span>SLOW</span> GEE</div><ul><li><a href="/">Home</a></li><li><a href="#">Pair</a></li><li><a href="#">GitHub</a></li></ul></nav>
<div class="center"><div class="glass">
<h1>Link Your Device</h1>
<p>Enter number e.g 2547XXXXXXXX</p>
<input id="num" placeholder="2547XXXXXXXX">
<button id="btn" onclick="gen()">GENERATE PAIR CODE</button>
<div id="code"></div>
<p id="msg" style="color:#ffaa66;font-size:11px;margin-top:10px"></p>
</div></div>
<script>
async function gen(){
 const n=document.getElementById('num').value;
 if(!n){alert('Weka namba');return;}
 const b=document.getElementById('btn');
 b.innerText='Generating...';b.disabled=true;
 document.getElementById('msg').innerText='Subiri 15 sec...';
 try{
  const r=await fetch('/pair?number='+n);
  const d=await r.json();
  if(d.code){
   document.getElementById('code').style.display='block';
   document.getElementById('code').innerText=d.code;
   document.getElementById('msg').innerText='Copy to WhatsApp > Linked Devices';
  }else{
   document.getElementById('msg').innerText=d.error;
  }
 }catch(e){
  document.getElementById('msg').innerText=e.message;
 }
 b.innerText='GENERATE PAIR CODE';b.disabled=false;
}
</script></body></html>`);
});
app.get('/pair',async(req,res)=>{
 let num=req.query.number;
 if(!num) return res.status(400).json({error:'Weka namba'});
 num=num.replace(/[^0-9]/g,'');
 if(num.startsWith('0')) num='254'+num.slice(1);
 const sessionId='session_'+Date.now();
 const sessionPath=path.join(__dirname,sessionId);
 fs.mkdirSync(sessionPath,{recursive:true});
 try{
  const {state,saveCreds}=await useMultiFileAuthState(sessionPath);
  const sock=makeWASocket({auth:state,printQRInTerminal:false,logger:pino({level:'silent'}),browser:['SLOW GEE','Chrome','1.0']});
  sock.ev.on('creds.update',saveCreds);
  if(!sock.authState.creds.registered){
   await delay(2000);
   const code=await sock.requestPairingCode(num);
   res.json({code:code});
  }
  sock.ev.on('connection.update',async(u)=>{
   if(u.connection==='open'){
    await delay(3000);
    try{fs.rmSync(sessionPath,{recursive:true,force:true});}catch{}
   }
  });
 }catch(e){
  res.status(500).json({error:e.message});
  try{fs.rmSync(sessionPath,{recursive:true,force:true});}catch{}
 }
});
app.listen(PORT,()=>console.log('Live on '+PORT));
