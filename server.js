const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys")
const express = require("express")
const fs = require("fs")
const app = express()
const PORT = process.env.PORT || 10000

app.get("/", (req,res)=> res.send("Slow Gee Session Running"))

app.get("/pair", async (req,res)=>{
  let num = req.query.number?.replace(/[^0-9]/g,"")
  if(!num) return res.send({error:"weka number"})
  
  // Futa session ya zamani kila mara
  if(fs.existsSync("./auth")){
    fs.rmSync("./auth",{recursive:true, force:true})
  }
  
  const { state, saveCreds } = await useMultiFileAuthState("./auth")
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["SlowGee","Chrome","1.0"]
  })
  
  sock.ev.on("creds.update", saveCreds)
  
  await delay(2000)
  
  try {
    let code = await sock.requestPairingCode(num)
    console.log("CODE:", code)
    // USIFUNGE SOCKET - iache wazi kwa dakika 2
    setTimeout(()=>{ try{sock.end()}catch{} }, 120000)
    return res.send({code: code, message:"weka haraka ndani ya 20 sec"})
  } catch(e){
    console.log(e)
    return res.send({error: e.message})
  }
})

app.listen(PORT, ()=> console.log("Live on "+PORT))
