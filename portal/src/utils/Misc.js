export default class Misc {
  static getCookie(which, def) {
    let cookies = document.cookie;
    if (cookies) {
      let kvs = cookies.split(";");
      for (let idx in kvs) {
        let kv = kvs[idx];
        let k = kv.split("=")[0].trim();
        let v = kv.split("=")[1].trim();
        v = v.split(";")[0];
        if (k === which) return v;
      }
    }
    return def;
  }
}
