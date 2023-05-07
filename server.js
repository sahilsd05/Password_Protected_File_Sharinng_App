const res = require("express/lib/response")
const bcrypt = require ("bcrypt")
const File = require("./models/File")

const express = require("express")
const app = express()

app.use(express.urlencoded({ extended : true}))
require("dotenv").config()
const mongoose = require("mongoose")
mongoose.connect(process.env.DATABASE_URL)

const multer = require("multer")
const upload = multer({dest : "uploads"})
app.set("view engine","ejs")

app.use(express.static('public'));

app.get("/",(req,res) => {
    res.render("index")
})

app.post("/upload",upload.single("file"),async(req,res) => {
    const fileData = {
        path : req.file.path,
        originalName : req.file.originalname

    }
    if(req.body.password != null && req.body.password !== "" ){
        fileData.password = await bcrypt.hash(req.body.password,10)
    }
    const file = await File.create(fileData)
    res.render("index",{fileLink: `${req.headers.origin}/file/${file.id}`})
})

app.route("/file/:id").get(handleDownload).post(handleDownload)

//app.get("/file/:id",handleDownload)
//app.post("/file/:id",handleDownload)

async function handleDownload(req,res){
    const file = await File.findById(req.params.id)
    
    console.log(file.password) 
    console.log("Password entered : ") 
    console.log(req.body.password) 
    
    if(file.password != null){
        if(req.body.password == null){
            res.render("password")
            return
        }
        
        console.log("Password entered : ") 
        console.log(req.body.password) 
        if(! (await bcrypt.compare(req.body.password, file.password))){
            res.render("password", { error : true})
            return
        }
        console.log("If statement is over") 
    }
    
    console.log("File is downloading") 
    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)

    res.download(file.path,file.originalName)
}
app.listen(process.env.PORT)