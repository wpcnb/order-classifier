(function () {
  "use strict";
  var root = document.getElementById("orderGroups");
  var actions = document.querySelector(".actions");
  if (!root || !actions) return;
  if (!window.indexedDB) {
    var warning = document.createElement("span");
    warning.textContent = "浏览器不支持图片附件存储";
    actions.appendChild(warning);
    return;
  }
  var dbPromise = new Promise(function (resolve, reject) {
    var req = indexedDB.open("logistics_receipt_images_v1", 1);
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains("photos")) {
        req.result.createObjectStore("photos", { keyPath: "id" });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error || Error("图片数据库无法打开")); };
  });
  function transact(mode, action) {
    return dbPromise.then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("photos", mode);
        var request = action(tx.objectStore("photos"));
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error || Error("图片存储失败")); };
        tx.onabort = function () { reject(tx.error || Error("图片存储失败")); };
      });
    });
  }
  function getAll() { return transact("readonly", function (s) { return s.getAll(); }); }
  function put(item) { return transact("readwrite", function (s) { return s.put(item); }); }
  function remove(id) { return transact("readwrite", function (s) { return s.delete(id); }); }
  function message(s) { alert(s); }
  var urls = [];
  var renderSerial = 0;
  async function renderImages() {
    var serial = ++renderSerial;
    try {
      var photos = await getAll();
      if (serial !== renderSerial) return;
      urls.forEach(function (u) { URL.revokeObjectURL(u); });
      urls = [];
      var byOrder = {};
      photos.forEach(function (p) { (byOrder[p.orderId] || (byOrder[p.orderId] = [])).push(p); });
      Array.from(root.querySelectorAll(".photo-cell[data-photo-order]")).forEach(function (cell) {
        var id = cell.getAttribute("data-photo-order");
        cell.textContent = "";
        var wrap = document.createElement("div");
        wrap.className = "order-photos";
        (byOrder[id] || []).forEach(function (p) {
          var tile = document.createElement("span");
          tile.className = "photo-tile";
          var link = document.createElement("a");
          var url = URL.createObjectURL(p.blob);
          urls.push(url);
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.title = p.name || "查看原图";
          var img = document.createElement("img");
          img.src = url;
          img.loading = "lazy";
          img.alt = p.name || "订单附件";
          link.appendChild(img);
          var del = document.createElement("button");
          del.type = "button";
          del.className = "photo-delete";
          del.dataset.deletePhoto = p.id;
          del.title = "删除图片";
          del.setAttribute("aria-label", "删除图片");
          del.textContent = "×";
          tile.appendChild(link);
          tile.appendChild(del);
          wrap.appendChild(tile);
        });
        var add = document.createElement("label");
        add.className = "photo-add";
        add.textContent = "+ 添加图片";
        var input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.dataset.photoOrder = id;
        input.setAttribute("aria-label", "给此订单添加图片");
        input.hidden = true;
        add.appendChild(input);
        wrap.appendChild(add);
        cell.appendChild(wrap);
      });
    } catch (e) {
      console.error("加载图片失败", e);
      message("图片无法加载：" + e.message);
    }
  }
  var observer = new MutationObserver(function () { renderImages(); });
  observer.observe(root, { childList: true });
  root.addEventListener("change", async function (e) {
    var input = e.target;
    if (!input.matches('input[type="file"][data-photo-order]')) return;
    var id = input.dataset.photoOrder;
    var files = Array.from(input.files || []);
    input.value = "";
    if (!files.length) return;
    try {
      var existing = await getAll();
      var count = existing.filter(function (p) { return p.orderId === id; }).length;
      if (count + files.length > 15) throw Error("每笔订单最多保存15张图片");
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (!f.type.startsWith("image/")) throw Error("只支持图片文件");
        if (f.size > 12 * 1024 * 1024) throw Error("每张图片不得超过12MB");
        await put({
          id: id + "-" + Date.now() + "-" + i + "-" + Math.random().toString(36).slice(2),
          orderId: id, name: f.name, type: f.type, createdAt: new Date().toISOString(), blob: f
        });
      }
      await renderImages();
    } catch (err) { message("添加图片失败：" + err.message); }
  });
  root.addEventListener("click", async function (e) {
    var btn = e.target.closest("[data-delete-photo]");
    if (!btn) return;
    if (!confirm("确认删除这张订单图片？")) return;
    try { await remove(btn.dataset.deletePhoto); await renderImages(); }
    catch (err) { message("删除图片失败：" + err.message); }
  });
  function download(name, content) {
    var blob = new Blob([content], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
  }
  function toDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error || Error("读取图片失败")); };
      r.readAsDataURL(blob);
    });
  }
  var backup = document.createElement("button");
  backup.type = "button";
  backup.className = "btn";
  backup.textContent = "备份图片";
  backup.title = "图片只存储在当前浏览器，需要单独备份";
  actions.appendChild(backup);
  backup.addEventListener("click", async function () {
    backup.disabled = true;
    try {
      var records = await getAll(), out = [];
      for (var i = 0; i < records.length; i++) {
        var p = records[i];
        out.push({ id: p.id, orderId: p.orderId, name: p.name, type: p.type, createdAt: p.createdAt, data: await toDataURL(p.blob) });
      }
      download("后勤订单图片备份.json", JSON.stringify({ version: 1, images: out, exportedAt: new Date().toISOString() }));
      message("已备份" + out.length + "张图片。更换设备时请导入这份备份。");
    } catch (err) { message("图片备份失败：" + err.message); }
    finally { backup.disabled = false; }
  });
  var restoreLabel = document.createElement("label");
  restoreLabel.className = "btn";
  restoreLabel.textContent = "恢复图片";
  var restoreInput = document.createElement("input");
  restoreInput.type = "file";
  restoreInput.accept = ".json,application/json";
  restoreInput.hidden = true;
  restoreLabel.appendChild(restoreInput);
  actions.appendChild(restoreLabel);
  restoreInput.addEventListener("change", async function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      var pack = JSON.parse(await file.text());
      if (!Array.isArray(pack.images)) throw Error("不是有效的图片备份文件");
      if (!confirm("将备份图片合并到本设备现有图片，确认继续？")) return;
      var valid = new Set(JSON.parse(document.getElementById("initial-data").textContent).map(function (o) { return o.id; }));
      var added = 0;
      for (var i = 0; i < pack.images.length; i++) {
        var p = pack.images[i];
        if (!p || !valid.has(p.orderId) || typeof p.data !== "string" || !/^data:image\/(png|jpeg|webp|gif|bmp|heic|heif);base64,/i.test(p.data)) continue;
        var comma = p.data.indexOf(",");
        var binary = atob(p.data.slice(comma + 1));
        if (binary.length > 12 * 1024 * 1024) continue;
        var bytes = new Uint8Array(binary.length);
        for (var j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
        await put({
          id: String(p.id || (p.orderId + "-" + Date.now() + "-" + i)),
          orderId: p.orderId, name: String(p.name || "订单图片"),
          type: String(p.type || "image/png"), createdAt: String(p.createdAt || ""),
          blob: new Blob([bytes], { type: String(p.type || "image/png") })
        });
        added++;
      }
      await renderImages();
      message("已恢复" + added + "张图片。");
    } catch (err) { message("恢复图片失败：" + err.message); }
  });
  renderImages();
})();