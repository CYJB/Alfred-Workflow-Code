/**
 * 读取指定路径的文件。
 */
function readFileSync(path) {
  try {
    return app.read(Path(path));
  } catch (ignored) { }
}

/**
 * 写入指定路径的文件。
 */
function writeFileSync(path, data) {
  try {
    const handle = app.openForAccess(Path(path), { writePermission: true });
    // 清空文件的旧内容。
    app.setEof(handle, { to: 0 })
    app.write(data, { to: handle, startingAt: 0 })
    app.closeAccess(handle)
  }
  catch (error) {
    try {
      app.closeAccess(path)
    } catch (ignored) { }
  }
}

module.exports = { readFileSync, writeFileSync };
