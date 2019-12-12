import GIFEncoder from 'gifencoder'
import { CanvasRenderingContext2D, createCanvas } from 'canvas'
import moment from 'moment-timezone'
import { Stream } from 'stream'

export type ImageOptions = {
  width?: number
  height?: number
  color?: string
  bg?: string
  frames?: number
  fontSize?: number
  fontFamily?: string
  fontStyle?: string
  expired?: string
  quality?: number
}

export class Index {
  public timeResult
  private stream
  private readonly encoder
  private readonly ctx
  private readonly options

  private readonly defaultOptions: ImageOptions = {
    width: 200,
    height: 200,
    color: 'ffffff',
    bg: '000000',
    frames: 30,
    fontSize: 26,
    fontFamily: 'Courier New',
    fontStyle: 'bold',
    expired: '00:00:00',
    quality: 90
  }

  constructor(options?: ImageOptions) {
    this.options = { ...this.defaultOptions, ...options }
    this.encoder = new GIFEncoder(this.options.width, this.options.height)
    this.ctx = this.createContext()
  }

  createContext(): CanvasRenderingContext2D {
    const canvas = createCanvas(this.options.width, this.options.height)
    const ctx = canvas.getContext('2d')
    ctx.font = `${this.options.fontStyle} ${this.options.fontSize}px ${this.options.fontFamily}`.trim()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    return ctx
  }

  setTimer(end: Date | string, timezone = 'UTC'): Index {
    if (typeof end === 'string') {
      end = moment(end).toDate()
    }
    this.timeResult = this.getDiff(end as Date, timezone)
    return this
  }

  setOutputStream(stream: Stream): Index {
    this.stream = stream
    return this
  }

  /**
   * Calculate the diffeence between timeString and current time
   */
  getDiff(end: Date, tz = 'UTC'): moment.Duration | null {
    const target = moment.tz(end, tz)
    const current = moment()
    const difference = target.diff(current)
    if (difference > 0) {
      return moment.duration(difference)
    }
    return null
  }

  getFormattedTime(): string {
    if (!this.timeResult) {
      return ''
    }

    const days = Math.floor(this.timeResult.asDays())
    const hours = Math.floor(this.timeResult.asHours() - (days * 24))
    const minutes = Math.floor(this.timeResult.asMinutes()) - (days * 24 * 60) - (hours * 60)
    const seconds = Math.floor(this.timeResult.asSeconds()) - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60)

    const finalArr = []
    if (days > 0) {
      days.toString().length === 1 ? finalArr.push('0' + days) : finalArr.push(days)
      finalArr.push('d ')
    }
    if (hours.toString().length === 1) {
      finalArr.push('0' + hours)
    } else {
      finalArr.push(hours)
    }
    finalArr.push(':')
    if (minutes.toString().length === 1) {
      finalArr.push('0' + minutes)
    } else {
      finalArr.push(minutes)
    }
    finalArr.push(':')
    if (seconds.toString().length === 1) {
      finalArr.push('0' + seconds)
    } else {
      finalArr.push(seconds)
    }
    return finalArr.join('')
  }

  /**
   * Encode the GIF with the information provided by the time function
   */
  async encode(): Promise<void> {
    // pipe the image to the filesystem to be written
    const imageStream = this.encoder.createReadStream().pipe(this.stream)

    // start encoding gif with following settings
    this.encoder.start()
    this.encoder.setRepeat(0)
    this.encoder.setDelay(1000)
    this.encoder.setQuality(this.options.quality)

    let frames
    let shouldFormatTime = false
    if (this.timeResult && typeof this.timeResult === 'object') {
      frames = this.options.frames
      shouldFormatTime = true
    } else {
      frames = 2 // for blinking expired text
    }

    for (let i = 0; i < frames; i++) {
      const timeStr = shouldFormatTime ? this.getFormattedTime() : (i ? this.options.expired : '')

      this.ctx.fillStyle = '#' + this.options.bg
      this.ctx.fillRect(0, 0, this.options.width, this.options.height)
      this.ctx.fillStyle = '#' + this.options.color
      this.ctx.fillText(timeStr, this.options.width / 2, this.options.height / 2)
      this.encoder.addFrame(this.ctx)

      // remove a second for the next loop
      this.timeResult && this.timeResult.subtract(1, 'seconds')
    }

    this.encoder.finish()
    return new Promise((resolve, reject) => {
      imageStream.on('finish', resolve)
      imageStream.on('error', reject)
    })
  }
}
