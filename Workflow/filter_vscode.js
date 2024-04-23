#! /usr/bin/osascript -l JavaScript

const app = Application.currentApplication();
app.includeStandardAdditions = true;

// 引入 require 方法。
let require;
{
  const requirePath = './lib/require.js';
  const handle = app.openForAccess(requirePath);
  require = eval(app.read(handle))();
  app.closeAccess(requirePath);
}

const { Result } = require('./lib/alfred');
const { Cache } = require('./lib/cache');
const { finder } = require('./lib/finder');
const { basename, summaryPath } = require('./lib/path');

function run(args) {
  const result = new Result();
  ObjC.import("stdlib");
  const historyCount = Number.parseInt($.getenv("HISTORY_COUNT"));
  if (args.length > 0 && historyCount > 0) {
    // 带有查询，从历史记录中查找。
    const queries = [];
    for (let i = 0; i < args.length; i++) {
      let arg = args[i].trim().toLowerCase();
      if (arg.indexOf(' ') >= 0) {
        arg.split(' ').forEach(q => q && queries.push(q))
      } else {
        queries.push(arg);
      }
    }
    new Cache('./history.json').forEach((key) => {
      if (matchQuery(key, queries)) {
        let suffix = '';
        if (key.endsWith('/')) {
          suffix = '夹';
        }
        result.add({
          uid: key,
          title: `在 Visual Studio Code 中打开文件${suffix} ${basename(key)}`,
          subtitle: summaryPath(key, 70),
          arg: key,
        });
      }
    });
    if (result.length === 0) {
      return Result.error('在 Visual Studio Code 中打开', '未找到符合条件的历史记录');
    }
  } else {
    // 无查询或禁止历史记录，使用 Finder 中打开的文件(夹)
    // 使用 Finder 中打开的文件(夹)
    const selection = finder.selection();
    // 未选择时不打开 vscode。
    if (selection.length === 0) {
      return Result.error('在 Visual Studio Code 中打开', '未选择文件或文件夹');
    }
    const path = decodeURIComponent(selection[0].url()).slice(7);
    let suffix = '';
    if (path.endsWith('/')) {
      suffix = '夹';
    }
    result.add({
      uid: 'finder',
      title: `在 Visual Studio Code 中打开文件${suffix} ${basename(path)}`,
      subtitle: summaryPath(path, 70),
      arg: path,
    });
  }
  return result.toString();
}

/**
 * 检查指定文本是否可以与指定查询匹配。
 * @param {string} text 要检查的文本。
 * @param {string[]} queries 查询字符串。
 */
function matchQuery(text, queries) {
  text = text.toLowerCase();
  let start = 0;
  for (let i = 0; i < queries.length; i++) {
    const idx = text.indexOf(queries[i], start);
    if (idx < 0) {
      return false;
    }
    start = idx + queries[i].length;
  }
  return true;
}
