import { Index } from '../src'
import { describe, it } from 'mocha'
import * as assert from 'assert'
import moment from 'moment'
import fs from 'fs'

describe('GIF generator', () => {
  it('calculates remaining time properly (when no difference)', () => {
    const gen = new Index({})
    const date = new Date().toISOString()
    gen.setTimer(date, 'UTC')
    assert.strictEqual(gen.getDiff(gen.timeResult), null)
  })

  it('calculates remaining time properly (when minute difference)', () => {
    const gen = new Index({})
    const date = moment().add(60, 'second').toJSON()
    gen.setTimer(date, 'UTC')
    const time = gen.timeResult.asSeconds()
    // time is running during test, so it should be either of those
    assert.strictEqual(time >=59  && time <= 60, true)
  })

  it('streams final gif into a file', async () => {
    const tmpDir = process.cwd() + '/test/'
    const filePath = tmpDir + 'test' + '.gif'
    const fileStream = fs.createWriteStream(filePath)

    await new Index()
      .setTimer(moment().add(60, 'second').toJSON(), 'UTC')
      .setOutputStream(fileStream)
      .encode()

    assert.strictEqual(fs.existsSync(filePath), true)
    fs.unlinkSync(filePath)
  })
})
