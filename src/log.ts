export function debug (msg?: any, ...args: any[]): void {
  if (process.env['AUTOSCALE_DEBUG'] != null) {
    console.log(msg, ...args)
  }
}
