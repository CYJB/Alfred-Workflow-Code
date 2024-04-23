ObjC.import('Foundation');

/**
 * 读取指定路径的文件。
 */
function readFileSync(path) {
  return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, undefined));
}

/**
 * 写入指定路径的文件。
 */
function writeFileSync(path, data) {
  ObjC.wrap(data).writeToFileAtomicallyEncodingError(path, true, $.NSUTF8StringEncoding, undefined);
}

module.exports = { readFileSync, writeFileSync };
