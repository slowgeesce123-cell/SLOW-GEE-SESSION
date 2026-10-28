const express = require('express');
const fs = require('fs');
const pino = require('pino');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req,res)=>{
  res.send(`
    <h2>SLOW-GEE-SESSION LIVE ✅</h2>
    <p>Pair: /pair?number=2547xxxxxx</p>
    <p>Example: <a href="/pair?number=254791536079">/pair?number=254791536079</a></p>
  `);
});

app.get('/pair', async (req,res)=>{
  let num = req.query.number;
  if(!num) return res.json({error:"weka ?number=2547..."});
  num = num.replace(/[^0-9]/g,'');

  const dir = './auth';
  if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true});

  try{
    const baileys = await import('@whiskeysockets/baileys');
    const makeWASocket = baileys.default;
    const { useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = baileys;
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({level:"fatal"})),
      },
      logger: pino({level:"fatal"}),
      browser: Browsers.macOS("Chrome"),
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);
    await delay(3000);

    let code = await sock.requestPairingCode(num);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    
    console.log("PAIR CODE:",code);
    if(!res.headersSent) return res.json({code:code});

    sock.ev.on('connection.update', async (s)=>{
      if(s.connection === 'open'){
        await delay(5000);
        const credsPath = dir+'/creds.json';
        if(fs.existsSync(credsPath)){
          const creds = fs.readFileSync(credsPath,'utf8');
          const sessionId = Buffer.from(creds).toString('base64');
          await sock.sendMessage(sock.user.id, {text: `*SLOW-GEE SESSION ID:*\n\n${sessionId}\n\nCopy hii weka kwa bot yako!`});
        }
        if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true});
      }
    });

  }catch(e){
    console.log(e);
    if(!res.headersSent) res.json({error:e.message});
  }
});

app.listen(PORT, ()=> console.log("Live on "+PORT));
