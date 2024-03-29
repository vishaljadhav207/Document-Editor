const mongoose=require('mongoose')
const Document=require("./Document.js")
mongoose.connect('mongodb://127.0.0.1:27017/document-editor');

const defaultValue = ""

const io = require("socket.io")(3001, {
  //cross origin network support
  cors: {
    origin: "http://localhost:3000", //client url
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId); //room id
    socket.emit('load-document',document.data)


    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document",async data=>{
        await Document.findByIdAndUpdate(documentId,{data})
    })
  });
});

async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document 
    return await Document.create({ _id: id, data: defaultValue })
  }