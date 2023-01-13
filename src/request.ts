import type { IncomingMessage } from 'http'
import https from 'https'

interface Headers {
  [key: string]: string
}

interface PostPromise {
  response: IncomingMessage
  body: string
}

export async function dispatch (
  body: string,
  token: string
): Promise<PostPromise> {
  const url =
    process.env['AUTOSCALE_METRICS_URL'] ?? 'https://metrics.autoscale.app'
  const headers = {
    'User-Agent': 'Autoscale Agent (Node)',
    'Content-Type': 'application/json',
    'Content-Length': String(body.length),
    'Autoscale-Metric-Token': token
  }

  return await post(url, body, headers)
}

async function post (
  url: string,
  body: string,
  headers: Headers
): Promise<PostPromise> {
  const uri = new URL(url)
  const options = {
    hostname: uri.hostname,
    port: 443,
    path: uri.pathname,
    method: 'POST',
    headers,
    timeout: 5000
  }

  return await new Promise((resolve, reject) => {
    const request = https.request(options, (response: IncomingMessage) => {
      if (response.statusCode == null || response.statusCode > 399) {
        reject(response)
      } else {
        let body = ''
        response.on('data', (chunk: string) => (body += chunk))
        response.on('end', () => resolve({ response, body }))
      }
    })

    request.on('error', reject)
    request.write(body)
    request.end()
  })
}
