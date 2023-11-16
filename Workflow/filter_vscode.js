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

const { Result } = require('./lib/alfred');

function run() {
  const result = new Result();
  // 未传入路径，使用 Finder 中打开的文件(夹)
  const finder = Application('Finder');
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
    uid: 'code',
    title: '在 Visual Studio Code 中打开文件' + suffix,
    subtitle: path,
    arg: path,
  });
  return result.toString();
}
