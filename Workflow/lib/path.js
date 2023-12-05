#! /usr/bin/osascript -l JavaScript

/**
 * 对当前路径进行摘要，尽量确保结果的最大长度。
 *
 * @param {string} path 要摘要的路径。
 * @param {number} length 要摘要到的长度。
 */
function summaryPath(path, maxLength) {
  if (!path.length) {
    return '';
  }
  let prefix = '';
  let suffix = '';
  const parts = path.split('/');
  if (!parts[0]) {
    // 是以 / 开头的。
    prefix = '/';
    parts.shift();
  }
  if (!parts[parts.length - 1]) {
    // 是以 / 结尾的。
    suffix = '/';
    parts.pop();
  }
  // 最后一个部分总是会返回的。
  suffix = `${parts.pop()}${suffix}`;
  // 直接返回的场景。
  if (parts.length === 0) {
    return `${prefix}${suffix}`;
  } else if (prefix.length + suffix.length + 4 >= maxLength) {
    // 最后一个部分的长度已经超出最短长度时，注意这里是按照 .../{suffix} 来计算长度的。
    return `${prefix}../${suffix}`;
  }
  maxLength -= prefix.length + suffix.length;
  let fail = 0;
  let splitter = '/';
  for (let i = 1; parts.length > 0; i++) {
    const part = (i % 2) ? parts.shift() : parts.pop();
    // 这里计算长度的时候，要将中间的 /.../ 计入在内
    if (maxLength - part.length < 5) {
      if (fail === 0 || fail === (i % 2) + 1) {
        // 允许在某一方向长度过长时，在另一方向返回更多的部分。
        fail = (i % 2) + 1;
        splitter = '/../';
        continue;
      }
      return `${prefix}/.../${suffix}`;
    }
    maxLength -= part.length + 1;
    if (i % 2) {
      if (i > 1) {
        prefix += '/';
      }
      prefix += part;
    } else {
      suffix = `${part}/${suffix}`;
    }
  }
  return `${prefix}${splitter}${suffix}`;
}

module.exports = { summaryPath };

/*

console.log(summaryPath('/PartA/PartB/PartC/PartD/', 0))
console.log(summaryPath('/PartA/PartB/PartC/PartD/', 20))
console.log(summaryPath('/PartA/PartB/PartC/PartD/', 25))
console.log(summaryPath('/PartA/PartB/PartC/PartD/', 30))

console.log(summaryPath('PartA/PartB/PartC/PartD', 0))
console.log(summaryPath('PartA/PartB/PartC/PartD', 20))
console.log(summaryPath('PartA/PartB/PartC/PartD', 25))
console.log(summaryPath('PartA/PartB/PartC/PartD', 30))

console.log(summaryPath('PartA/PartB/PartCLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL/PartD', 30))

*/
