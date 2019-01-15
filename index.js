const express = require('express');
const path = require('path');
var ffmpeg = require('ffmpeg-static');
var YoutubeMp3Downloader = require("./extra");
var os = require('os');

var app = express();

const PORT = process.env.PORT || 5000;

    
var cb0 = function (req, res, next) {
  console.log('DOWNLOAD STARTED')
  var YD = new YoutubeMp3Downloader({
      "ffmpegPath": ffmpeg.path,        // Where is the FFmpeg binary located?
      "outputPath": "./",    // Where should the downloaded and encoded files be stored?
      "youtubeVideoQuality": "highest",       // What video quality should be used?
      "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
      "progressTimeout": 2000                 // How long should be the interval of the progress reports
  });

  YD.download("https://www.youtube.com/watch?v=tJuivqCGCpI&start_radio=1&list=RDMMtJuivqCGCpI");

  YD.on("finished", function(err, data) {
      console.log(JSON.stringify(data));
      next();
  });
   
  YD.on("error", function(error) {
      console.log(error);
  });
   
  YD.on("progress", function(progress) {
      console.log(JSON.stringify(progress));
  });
}

var cb1 = function (req, res, next) {
  console.log('CB1')
  next()
}

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', [cb0, cb1], (req, res) => res.render('pages/index',{
      title:  os.type()+os.arch(),
      ffmpegPath: ffmpeg.path
    }));








   

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));