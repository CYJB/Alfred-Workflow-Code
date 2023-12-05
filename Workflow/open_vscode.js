#! /usr/bin/osascript -l JavaScript

const app = Application.currentApplication();
app.includeStandardAdditions = true;

// 引入 require 方法。
let require;
{
  const requirePath = './lib/require.js';
  const handle = app.openForAccess(requirePath);
  const content = app.read(handle);
  app.closeAccess(requirePath);
  require = eval(content)(app);
}

const { Cache } = require('./lib/cache');
const { readFileSync, writeFileSync } = require('./lib/file');

function run(argv) {
  const path = argv[0];
  if (!path) {
    return;
  }

  ObjC.import("stdlib");
  const historyCount = Number.parseInt($.getenv("HISTORY_COUNT"));
  if (historyCount > 0) {
    // 在打开文件时记录历史记录。
    const historyPath = './history.json';
    const history = new Cache(readFileSync(historyPath));
    history.add(path, {});
    writeFileSync(historyPath, history.save(historyCount));
  }

  if (path.endsWith('/')) {
    // 是文件夹，总是使用新实例。
    app.doShellScript(`"$VSC_PATH/Contents/Resources/app/bin/code" "${path}"`);
  } else {
    // 是文件，尽量复用现有实例。
    app.doShellScript(`"$VSC_PATH/Contents/Resources/app/bin/code" -r "${path}"`);
  }
}
