const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const express = require("express")
const fs = require("fs")
const app = express()

app.get("/", (req,res)=> res.send("Slow Gee Live"))

app.get("/pair", async (req,res)=>{
  let num = req.query.number?.replace(/[^0-9]/g,"")
  if(!num) return res.status(400).json({error:"number missing"})
  
  try{
    if(fs.existsSync("./auth")) fs.rmSync("./auth",{recursive:true, force:true})
    
    const { state, saveCreds } = await useMultiFileAuthState("./auth")
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, console.log)
      },
      printQRInTerminal: false,
      browser: ["Ubuntu","Chrome","20.0"],
      syncFullHistory: false
    })
    
    sock.ev.on("creds.update", saveCreds)
    await delay(3000)
    
    let code = await sock.requestPairingCode(num)
    console.log("CODE GENERATED:", code, "for", num)
    
    // RUDISHA HARAKA - Usisubiri
    res.json({code: code})
    
    // Acha socket wazi kwa dakika 3 uipe time ya ku-link
    setTimeout(async()=>{
      try{ await sock.ws.close() }catch{}
    }, 180000)
    
  }catch(e){
    console.error(e)
    if(!res.headersSent) res.json({error: e.toString()})
  }
})

app.listen(process.env.PORT||10000, ()=> console.log("Live"))
