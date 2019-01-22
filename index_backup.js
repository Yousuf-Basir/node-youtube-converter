const express = require('express');
const path = require('path');
const axios = require('axios');
var ffmpeg = require('ffmpeg-static');
var YoutubeMp3Downloader = require("./extra");
var os = require('os');
var http = require('http'),
    url = require('url'),
    fs = require('fs');
var bodyParser = require('body-parser');


var app = express();

const PORT = process.env.PORT || 5000;


var cb0 = function (req, res, next) {
    res.redirect('/');
}

var cb1 = function (req, res, next) {
  console.log('CB1')
  next()
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', [cb1], (req, res) => res.render('pages/index',{
      title:  os.type()+os.arch(),
      ffmpegPath: ffmpeg.path
    }));
app.get('/download', (req, res) => res.render('pages/index'));


app.post('/download', function(req, res, next){
    var linkData = req.body.urlData;
    console.log(linkData);
    console.log('DOWNLOAD STARTED');
    var dir = os.tmpdir()
    var YD = new YoutubeMp3Downloader({
        "ffmpegPath": ffmpeg.path,        // Where is the FFmpeg binary located?
        "outputPath": dir,    // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "highest",       // What video quality should be used?
        "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000                 // How long should be the interval of the progress reports
    });
    
    YD.download(linkData);
  
    YD.on("finished", function(err, data) {
  
        var filePath = path.join(os.tmpdir(), data.videoTitle);
        //filePath = filePath+".mp3";
        //res.write(JSON.stringify(filePath));
        //res.writeHead(200, {'Content-Type': 'audio/mpeg'});
        //res.setHeader('Content-disposition', 'attachment; filename='+data.videoTitle + ".mp3");
        
        // var myReadStream = fs.createReadStream(filePath+".mp3");
        // myReadStream.pipe(res);
        //res.download(filePath+".mp3", data.videoTitle + ".mp3"

        // var pathUrl = req.path;
        // if(pathUrl !== '/download') {
        //     res.download(filePath + '.mp3', data.videoTitle + ".mp3", function(err){
        //         console.log(err);
        //     });
        // } else {
        //     next();
        // }


        // res.write('<html>');
        // res.write('<body>');
        // res.write('<h1>COMPLETED</h1>');
        // res.write('<a href= "'+ filePath+'" download="song.mp3"> DOWNLOAD '+filePath+' </a>');
        // res.write('</body>');
        // res.write('</html>');
        // res.end();




        //res.end();
        //var query = url.parse(req.url, true).query;

        fs.readFile(filePath + ".mp3", function (err, content) {
          if (err) {
              res.writeHead(400, {'Content-type':'text/html'})
              console.log(err);
              res.end("No such file");    
          } else {
              var j = "zero";
              //specify Content will be an attachment
              if(z="zero"){
                res.setHeader('Content-disposition', 'attachment; filename='+data.videoTitle + ".mp3");
                res.send(content);
                z="hero";
              }else{
                res.redirect('/');
              }
              
              
          }
        });
  
        
    });
     
    YD.on("error", function(error) {
        console.log(error);
    });
     
    YD.on("progress", function(progress) {
        console.log(JSON.stringify(progress));
        res.write(JSON.stringify(progress));
        
    });
    
    
})






   

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));