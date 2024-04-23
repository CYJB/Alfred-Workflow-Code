/**
 * @typedef  {Object} CacheNode 缓存的节点。
 * @property {string} key 缓存的键。
 * @property {any} value 缓存的值。
 */

const { readFileSync, writeFileSync } = require('./file');

/**
 * LRU 缓存池。
 *
 * Alfred 只能在用户选择某一结果后再更新访问信息，因此只需要在写配置时更新 LRU 即可。
 * 并且优化读取接口，能够按照最近访问顺序排序。
 */
class Cache {
  /**
   * 缓存文件名。
   * @private
   * @type { string }
   */
  _filename;
  /**
   * 缓存对象的字典。
   * @private
   * @type { Map<string, CacheNode> }
   */
  _cacheDict;
  /**
   * 缓存节点的数组。
   *
   * 节点顺序按照最近访问时间从大到小排序。
   * @private
   * @type { CacheNode[] }
   */
  _nodes;

  /**
   * 使用指定的缓存文件名初始化。
   * @param {string} filename 缓存文件名。
   */
  constructor(filename) {
    this._filename = filename;
    this._nodes = [];
    this._cacheDict = new Map();
    try {
      const data = JSON.parse(readFileSync(filename));
      if (data.nodes) {
        this._nodes = data.nodes;
      }
      for (let node of this._nodes) {
        this._cacheDict.set(node.key, node);
      }
    } catch (e) {
      console.log('read cache', filename, 'failed: ', e)
    }
  }

  /**
   * 读取指定键的缓存。
   * @param {string} key 缓存的键。
   */
  get(key) {
    const node = this._cacheDict.get(key);
    if (node) {
      const idx = this._nodes.indexOf(node);
      if (idx >= 0) {
        this._nodes.splice(idx, 1);
      }
      this._nodes.unshift(node);
      return node.value;
    }
  }

  /**
   * 添加指定键的缓存。
   */
  add(key, value) {
    let node = this._cacheDict.get(key);
    if (node) {
      const idx = this._nodes.indexOf(node);
      if (idx >= 0) {
        this._nodes.splice(idx, 1);
      }
      node.value = value;
    } else {
      // 节点不存在，创建新节点。
      node = { key, value };
      this._cacheDict.set(key, node);
    }
    this._nodes.unshift(node);
  }

  /**
   * 遍历缓存中的所有键值对。
   * @param {(key:string, value:any)=>void} callback
   */
  forEach(callback) {
    this._nodes.forEach((node) => callback(node.key, node.value));
  }

  /**
   * 将缓存序列化为字符串。
   * @param {number} maxSize 缓存的最大个数。
   */
  save(maxSize) {
    // 淘汰多余的缓存。
    if (this._nodes.length > maxSize) {
      this._nodes.length = maxSize;
    }
    writeFileSync(this._filename, JSON.stringify({ nodes: this._nodes }));
  }
}

module.exports = { Cache };
