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

function run(argv) {
  const path = argv[0];
  if (!path) {
    return;
  }

  ObjC.import("stdlib");
  const historyCount = Number.parseInt($.getenv("HISTORY_COUNT"));
  if (historyCount > 0) {
    // 在打开文件时记录历史记录。
    const history = new Cache('./history.json');
    history.add(path, {});
    history.save(historyCount);
  }

  if (path.endsWith('/')) {
    // 是文件夹，总是使用新实例。
    app.doShellScript(`"$VSC_PATH/Contents/Resources/app/bin/code" "${path}"`);
  } else {
    // 是文件，尽量复用现有实例。
    app.doShellScript(`"$VSC_PATH/Contents/Resources/app/bin/code" -r "${path}"`);
  }
}
