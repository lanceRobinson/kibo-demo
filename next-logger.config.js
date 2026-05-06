// // next-logger.config.js

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createLogger, format, transports } = require('winston')

const isDev = process.env.NODE_ENV !== 'production'

const SKIP_KEYS = new Set([
  'time',
  'pid',
  'hostname',
  'name',
  'prefix',
  'level',
  'message',
  'handlerName',
  'source',
  'http',
  'gql',
  'err',
  'stack',
  'duration',
  'response',
  'correlationId',
])

function esformatter(info) {
  return {
    ...info,
    message: info.message || '',
    err: info.err ? { message: info.err.message, stack: info.err.stack } : undefined,
    level: info.level,
  }
}

const devFormat = format.combine(
  format.colorize(),
  format.printf((info) => {
    const loc = info.handlerName ? `[${info.handlerName}]` : info.source ? `[${info.source}]` : ''
    const op = info.gql?.operationName ? ` <${info.gql.operationName}>` : ''
    const msg =
      typeof info.message === 'string' ? info.message : JSON.stringify(info.message, null, 2)
    const suffix =
      info.duration != null ? ` (${info.duration}ms → ${info.response?.statusCode ?? '?'})` : ''

    let out = `${info.level} ${loc}${op} ${msg}${suffix}`

    if (info.err?.stack) {
      out += `\n  ${info.err.stack.replace(/\n/g, '\n  ')}`
    }

    const extra = Object.entries(info).filter(([k, v]) => !SKIP_KEYS.has(k) && v !== undefined)
    if (extra.length) {
      out += `\n  ${JSON.stringify(Object.fromEntries(extra), null, 2).replace(/\n/g, '\n  ')}`
    }

    return out
  })
)

const prodFormat = format.combine(format(esformatter)(), format.json())

const logger = createLogger({
  transports: [
    new transports.Console({
      handleExceptions: true,
      format: isDev ? devFormat : prodFormat,
      level: process.env.LOG_LEVEL || 'info',
    }),
  ],
})

module.exports = {
  logger,
}
