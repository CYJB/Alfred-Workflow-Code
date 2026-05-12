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
const { fileExistsSync } = require('./lib/file');

function run(argv) {
  const path = argv[0];
  if (!path) {
    return;
  }

  ObjC.import("stdlib");
  const historyPath = $.getenv("alfred_workflow_data") + '/history.json';
  // 仅在已记录历史记录的情况下移除。
  if (fileExistsSync(historyPath)) {
    const historyCount = Number.parseInt($.getenv("HISTORY_COUNT"));
    const history = new Cache(historyPath);
    history.remove(path);
    history.save(historyCount);
  }
  return `已移除历史记录 ${path}`;
}
