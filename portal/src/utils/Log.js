const level = {
  none: 0,
  trace: 1,
  log: 2,
  warn: 4,
  error: 8,
  all: 0xff
};

//let defaultLevel = level.warn | level.error;
let defaultLevel = level.all;

let modules = {
  Comm: defaultLevel,
  DataElements: defaultLevel,
  ElementAttributes: level.all,
  ElementCategories: defaultLevel,
  GddContainer: defaultLevel,
  RegistryDataElements: defaultLevel,
  RegistryRoles: defaultLevel,
  RegistryTabs: defaultLevel,
  RegistryForms: level.all,
  Registries: level.al,
  RegistryContainer: defaultLevel,
  RolesAndFeaturesContainer: defaultLevel,
  Domains: defaultLevel,
  Terms: defaultLevel,
  Vocabularies: defaultLevel,
  VocabularyContainer: defaultLevel,
  Forms: level.all,
  MiscTables: level.all
};

class Log {
  constructor(moduleName) {
    this.name = moduleName;
    if (!modules[moduleName]) {
      console.error("Log: unknown module name:" + moduleName);
      this.level = defaultLevel;
      return;
    }
    this.level = modules[moduleName];
  }

  _logprint(levelName, ...args) {
    let clog = console.log;
    switch (levelName) {
      case "error":
        clog = console.error;
        break;
      case "warn":
        clog = console.warn;
        break;
      case "info":
        clog = console.info;
        break;
      default:
        clog = console.log;
    }
    if (this.level & level[levelName])
      clog(this.name + " [" + levelName + "]", ...args);
  }

  trace(...args) {
    this._logprint("trace", ...args);
  }

  log(...args) {
    this._logprint("log", ...args);
  }

  warn(...args) {
    this._logprint("warn", ...args);
  }

  error(...args) {
    this._logprint("error", ...args);
  }
}

module.exports = Log;
