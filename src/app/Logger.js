export class Logger {
  static enabled = true;
  static enable(enabled) {
    Logger.enabled = !!enabled;
  }
  static log(...args) {
    if (!Logger.enabled) {
      return;
    }
    console.log.apply(null, args);
  }
}
