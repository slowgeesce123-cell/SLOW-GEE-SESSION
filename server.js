const express = require('express');
const fs = require('fs');
const pino = require('pino');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req,res)=>{
  res.send('<h1>SLOW-GEE LIVE 🟢</h1>Use /pair?number=2547xx');
});

app.get('/pair', async (req,res)=>{
  let num = req.query.number;
  if(!num) return res.json({error:"Add ?number=2547..."});
  num = num.replace(/[^0-9]/g,'');
  let dir = './session/'+num;
  try{fs.rmSync(dir,{recursive:true,force:true});}catch{}
  fs.mkdirSync(dir,{recursive:true});
  try{
    let baileys = await import('@whiskeysockets/baileys');
    let {default:makeWASocket,useMultiFileAuthState,makeCacheableSignalKeyStore,Browsers,delay}=baileys;
    let {state,saveCreds}=await useMultiFileAuthState(dir);
    let sock = makeWASocket({
      auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,pino({level:"silent"}).child({level:"silent"}))},
      browser:Browsers.ubuntu("Chrome"),
      printQRInTerminal:false,
      logger:pino({level:"silent"})
    });
    sock.ev.on('creds.update',saveCreds);
    if(!sock.authState.creds.registered){
      await delay(3000);
      let code = await sock.requestPairingCode(num);
      console.log(code);
      return res.json({code:code});
    } else {
      return res.json({error:"Already registered"});
    }
  }catch(e){
    console.log(e);
    res.json({error:e.message});
  }
});

app.listen(PORT,()=>console.log('LIVE '+PORT));
