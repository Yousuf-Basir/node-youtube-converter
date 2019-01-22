var express = require('express');
var path = require('path');
var ffmpeg = require('ffmpeg-static');
var YoutubeMp3Downloader = require("./extra");
var os = require('os');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
var fs = require('fs');
var serviceAccount = require("./mediaconverter-firebase-adminsdk-n6n52-c0995ed091.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mediaconverter.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("downloader");


var app =  express();
const PORT = process.env.PORT || 5000;

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.set('views', path.join(__dirname, 'views')) ;
app.set('view engine', 'ejs');
app.get('/', function(req, res){
    res.render("pages/index", {
        dataText: "Youtube to mp3 converter"
     });
}) ; 

app.get('/download', function(req, res){
     res.redirect('/');
}) ; 

app.post('/download', function(req, res, next){
    res.render("pages/downloadPage");
    startDownload(req, res);
})
app.post('/startDownload', function(req, res){
    postDownload(req, res);
});


var postDownload = function(req, res){
    var linkData = req.body.urlData;
    var songName = req.body.songName;
    fs.readFile(linkData, function (err, content) {
        if (err) {
            res.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
            res.end("No such file");    
        } else {
            var progRef = ref.child("progresses");  
              progRef.set({
                progressData: 0
                });
              res.setHeader('Content-disposition', 'attachment; filename='+songName);
              res.send(content);
              //res.write("foo");
              res.end(); 
              
              
        }
      });
}


var startDownload = function(req, res){
    var linkData = req.body.urlData; var dir = os.tmpdir();
    var YD = new YoutubeMp3Downloader({
        "ffmpegPath": ffmpeg.path,        // Where is the FFmpeg binary located?
        "outputPath": dir,    // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "highest",       // What video quality should be used?
        "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000                 // How long should be the interval of the progress reports
    });
    YD.download(linkData);
    console.log("started");
    YD.on("progress", function(progress) {
        console.log(progress.progress.percentage);
        var progRef = ref.child("progresses");
        progRef.set({
            progressData: {
                progress: progress.progress.percentage
            }
        })
        
    });
    //ON FINISHES
    YD.on("finished", function(err, data) {
        var progRef = ref.child("progresses");
        var filePath = path.join(os.tmpdir(), data.videoTitle);
        filePathWithName = filePath + ".mp3";
        progRef.set({
            progressData: {
                progress: 100,
                linkData: filePathWithName,
                songName: data.videoTitle + ".mp3"
            }
        });
    });
}


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));