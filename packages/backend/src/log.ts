const enum LogLevel {
  None = 0,
  Benchmark,
  Error,
  Warn,
  Info,
  Log,
}

let loglevel = LogLevel.None;

const kConsoleLog = console.log;
const kConsoleInfo = console.info;
const kConsoleError = console.error;
const kConsoleWarn = console.warn;

export const bench = (message?: any, ...optionalParams: any[]) => {
  if (loglevel < LogLevel.Benchmark) return;
  kConsoleLog(message, optionalParams);
}

console.log = function(message?: any, ...optionalParams: any[]) {
  if (loglevel < LogLevel.Log) return;
  kConsoleLog(message, optionalParams);
}

console.info = function(message?: any, ...optionalParams: any[]) {
  if (loglevel < LogLevel.Info) return;
  kConsoleInfo(message, optionalParams);
}

console.warn = function(message?: any, ...optionalParams: any[]) {
  if (loglevel < LogLevel.Warn) return;
  kConsoleWarn(message, optionalParams);
}

console.error = function(message?: any, ...optionalParams: any[]) {
  if (loglevel < LogLevel.Error) return;
  kConsoleError(message, optionalParams);
}