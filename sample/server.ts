import express from 'express'
import compression from 'compression'
import { Generator, ImageOptions } from '../src/generator'
import fs from 'fs'

const server = express()

// https://github.com/expressjs/compression/issues/82
/*
On the fly compression, pretty heavy for cpu, use carefully,
ideal in combination with some kind of varnish in front of this service
*/
server.use(
  compression({
    filter: function shouldCompress(req, res) {
      if (/^image\//.test(res.getHeader('Content-Type'))) {
        // compress any image format
        return true
      }

      // fallback to standard filter function
      return compression.filter(req, res)
    }
  })
)

// when you need physical file to furthers processing
server.get('/file', (req, res) => {
  const options: ImageOptions = {
    height: 100, width: 300, bg: '00FF00', color: 'FF0000', frames: 60, fontSize: 48
  }

  const tmpDir = process.cwd() + '/tmp/'
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir)
  }
  const filePath = tmpDir + req.query.name + '.gif'
  const fileStream = fs.createWriteStream(filePath)

  new Generator(options)
    .setTimer(req.query.end || new Date(), req.query.timezone || 'UTC')
    .setOutputStream(fileStream)
    .encode().then(() => {
    // good for storing the file to CDN etc
    res.sendFile(filePath)
  })
})

// when you want to deliver image as fast as possible
server.get('/stream', (req, res) => {
  const options: ImageOptions = {
    height: 100, width: 300, bg: '00FF00', color: 'FF0000', frames: 60, fontSize: 36, fontFamily: 'Arial'
  }
  new Generator(options)
    .setTimer(req.query.end || new Date(), req.query.timezone || 'UTC')
    .setOutputStream(res)
    .encode()
})

server.listen(process.env.PORT || 3000, function () {
  console.log('listening on http://localhost:%d/stream in %s mode', this.address().port, server.settings.env)
})

module.exports = server
