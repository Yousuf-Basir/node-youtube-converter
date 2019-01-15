const express = require('express')
const path = require('path')
var ffmpeg = require('ffmpeg-static');
const PORT = process.env.PORT || 5000
var os = require('os');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index',{
    title:  os.type()+os.arch(),
    ffmpegPath: ffmpeg.path
  }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

// const express = require('express')
// const app = express()
// const port = 3000

// app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
