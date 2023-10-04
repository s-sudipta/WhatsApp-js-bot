const  { initializeApp } = require("firebase/app");
const fs = require('fs');
const { getFirestore, collection, getDocs }= require ('firebase/firestore/lite');
const {getDatabase, ref, set } = require('firebase/database')
//const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
    //firebase config
    const firebaseConfig = {
        apiKey: "...",
        authDomain: "...",
        projectId: "...",
        storageBucket: "...",
        messagingSenderId: "...",
        appId: "...",
        databaseURL: "..."
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const rtdb = getDatabase(app);
    const list = getCities(db)
    async function getCities(db) {
        const c = collection(db, 'commands');
        const docsSnapshot = await getDocs(c);
        return docsSnapshot.docs.map(doc => doc.data())
    }

    //storing data to JSON file
    var data = fs.readFileSync('data.json');    
    list.then(function(result) {
        //console.log(result)
        var newData = JSON.stringify(result);
        fs.writeFile('data.json', newData, err => {
            // error checking
            if(err) throw err;
            console.log("All data updated");
        });  
     })
     var myObject= JSON.parse(data);

 
   
     //whatsApp client generation
    const client = new Client({
    authStrategy: new LocalAuth()
    });

    //whatsapp qr code
    client.on('qr', (qr) => {
    //qrcode.generate(qr,{small:true})
    //sending qr to realtime database firebase
    console.log("QR generated")
    set(ref(rtdb, 'qr/'+ "user1"), {
        data: qr
      });
    });
   
    //client on authenticate
    client.on('authenticated', () => {
        console.log('AUTHENTICATED');
    });

    //client ready to use
    client.on('ready', () => {
        console.log('Client is ready!');
    });

    //response to messages
    client.on('message', async message =>{
    //console.log("a msg recieved")
    const content = message.body
    myObject.map((item)=>{
        if(item.title.toUpperCase() == content.toUpperCase())
        {
            //console.log("message send!")
            client.sendMessage(message.from, item.reply);
        }
    })
    });
    // Fired on all message creations, including your own
    client.on('message_create', (msg) => {
        if (msg.fromMe) {
           //console.log("Me: "+msg._data.body)
        }
    });
    
    //client disconnect
    client.on('disconnected', (reason) => {
        console.log('Client was logged out', reason);
    });
client.initialize();
