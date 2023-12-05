/**
 * @typedef  {Object} CacheNode 缓存的节点。
 * @property {string} key 缓存的键。
 * @property {number} visitCount 访问次数。
 * @property {any} value 缓存的值。
 */

/**
 * LRU 缓存池。

 * 针对 Alfred 的操作特点进行一些特化，将淘汰时机后移到写配置之前。
 * @see https://www.cnblogs.com/cyjb/archive/2012/11/16/LruCache.html
 */
class Cache {
  /**
   * 缓存对象的字典。
   * @private
   * @type { Map<string, CacheNode> }
   */
  _cacheDict;
  /**
   * 缓存节点的数组。
   *
   * 节点顺序为 HotHead .. HotTail CodeHead .. CodeTail
   * @private
   * @type { CacheNode[] }
   */
  _nodes;
  /**
   * 缓冲池中热端的最大对象数目。
   * @private
   * @type { number }
   */
  _hotSize;

  /**
   * 使用指定的缓存数据初始化。
   * @param {string} data 缓存数据。
   */
  constructor(data) {
    this._nodes = [];
    this._cacheDict = new Map();
    this._hotSize = 0;
    try {
      data = JSON.parse(data);
      if (data.nodes) {
        this._nodes = data.nodes;
      }
      if (data.hotSize) {
        this._hotSize = data.hotSize;
      }
      for (let node of this._nodes) {
        this._cacheDict.set(node.key, node);
      }
    } catch (ignored) {
    }
  }

  /**
   * 读取指定键的缓存。
   * @param {string} key 缓存的键。
   */
  get(key) {
    const node = this._cacheDict.get(key);
    if (node) {
      node.visitCount++;
      return node.value;
    }
  }

  /**
   * 添加指定键的缓存。
   */
  add(key, value) {
    let node = this._cacheDict.get(key);
    if (node) {
      node.visitCount++;
      node.value = value;
    } else {
      // 节点不存在，创建新节点。
      node = { key, value, visitCount: 1 };
      this._cacheDict.set(key, node);
      // 总是将新节点添加到冷端的头。
      this._nodes.splice(this._hotSize, 0, node);
    }
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
   * @param {number} visitLimit 冷热节点的访问限制。
   */
  save(maxSize, visitLimit) {
    // 淘汰多余的缓存。
    this._hotSize = Math.floor(maxSize / 2);
    while (this._nodes.length > maxSize) {
      // 从冷端末尾尝试淘汰旧节点，将访问次数大于等于 visitLimit 的移动到热端的头。
      // 如果冷端末尾的访问次数大于等于 visitLimit，那么应当归属到热端。
      let node = this._nodes[this._nodes.length - 1];
      if (node.visitCount >= visitLimit) {
        // 清零访问计数。
        node.visitCount = 0;
        this._nodes.splice(0, 0, node);
      }
      this._nodes.length--;
    }
    return JSON.stringify({
      nodes: this._nodes,
      hotSize: this._hotSize,
    });
  }
}

module.exports = { Cache };
