
// DOM 选择器
function $(selector, sModel, startNode) {
    startNode = startNode || document;

    if (sModel === "all"){
        return startNode.querySelectorAll(selector);
    }
    else {
        return startNode.querySelector(selector);
    }
}


// 获取指定范围内色随机数
function selectFrom(lowerValue, upperValue, debar) {
    debar = debar || [];
    let choices = upperValue - lowerValue + 1;
    while (true)
    {
        let randomNum = Math.floor(Math.random() * choices + lowerValue);
        if (debar.indexOf(randomNum) === -1){return randomNum;}
    }
}


// 自定义滚动条
function definedScrollBar(winOj, scrollOj, barOj) {

    // 初始化
    let everyScroll = 100,
        winH = null,
        scrollH = null,
        barH = null,
        scale = null,
        diff = null,
        mTop = 0,
        detail = null;
    scrollOj.style.marginTop = "0px";
    barOj.style.marginTop = "0px";
    barOj.style.height = "100%";

    // 鼠标滚动事件兼容性设置
    let compatible = document.onmousewheel === null ? "mousewheel" : "DOMMouseScroll";

    function getHeight() {
        /*
        * 获取对象的高度
        * */
        winH = winOj.offsetHeight;
        scrollH = scrollOj.offsetHeight;
        scrollH += winH / 4;
        barH = barOj.offsetHeight;
        scale = winH / scrollH;
        diff = scrollH - winH;
        if (scale < 1) {barOj.style.height = scale * 100 + "%"}
    }

    winOj.addEventListener(compatible, function (event)
    {

        if (scale > 1){return}

        // 兼容性设置
        detail = compatible === "mousewheel" ? event.wheelDelta * -1 : detail = event.detail;

        if (detail < 0)
        {
            // 鼠标向前滚动
            mTop += everyScroll;
            if (mTop > 0) {mTop = 0}
        }
        else
        {
            // 鼠标向后滚动
            mTop -= everyScroll;
            if (mTop < -diff) {mTop = -diff}
        }

        // 同过修改 margin-top 来达到滚动的目的
        scrollOj.style.marginTop = mTop + "px";
        barOj.style.marginTop = -mTop * scale + "px";
    });

    // 监听DOM的变动
    let observer = new MutationObserver(function(mutations) {mutations.forEach(getHeight);});
    observer.observe(scrollOj, { attributes: true, childList: true, characterData: true, subtree: true});

    getHeight();
}


// 创建 WebSocket
function buildSocket(callbacks) {
    this.socket = new WebSocket("ws://127.0.0.1/socket");

    this.ping = function(){

        socket.send("ping")
    };
    setInterval(this.ping, 50000);

    this.socket.onopen = function () {

        console.log("连接建立");

        // 执行回调函数
        if (!callbacks){return }
        for (let i=0; i<callbacks.length; i++){
            callbacks[i]()
        }
    };

    this.socket.onerror = function () {

        console.log("发送数据时, 出现未知错误");
    };

    this.socket.onclose = function () {

        console.log("连接关闭");
    };

    this.socket.onmessage = function (event) {

        let jsonData = JSON.parse(event.data);
        if (! jsonData instanceof Array){jsonData = [jsonData]}
        for (let func of jsonData)
        {
            if (func["callback"])
            {
                setTimeout(function () {
                    eval(func["callback"])(func["data"]);
                }, 0);
            }
        }
    };

    return this.socket;
}


// 数据库方法
let dbHandler = function () {

    this.handler = function (objSName, method, data, callback) {
        let except = ["deleteDB", "closeDB"];
        let objStorage = null;
        if (except.indexOf(method) === -1){
            objStorage = this.db.transaction(objSName, "readwrite").objectStore(objSName);
        }

        switch (method){
            case "add": this.add(objStorage, data, callback); break;
            case "get": this.get(objStorage, data, callback); break;
            case "put": this.put(objStorage, data, callback); break;
            case "indexGet": this.indexGet(objStorage, data, callback); break;
            case "count": this.count(objStorage, callback); break;
            case "delItem": this.delItem(objStorage, objSName, data); break;
            case "closeData": this.closeData(objStorage, objSName); break;
            case "deleteDB": this.deleteDB(objSName); break;
            case "closeDB": this.closeDB(); break;
        }
    };


    /****************************************
                  操作存储对象的方法
     ****************************************/

    // 添加一条数据
    this.add = function(objStorage, data, callback){
        let re = objStorage.add(data);

        re.onsuccess = function (event) {
            if(callback){callback(event.target.result);}
        };

        re.onerror = function (event) {
            console.log("add error", event.target.error);
        }
    };

    // 获取一条数据
    this.get = function (objStorage, key, callback) {
        let re = objStorage.get(key);

        re.onsuccess = function (event) {
            if(callback){callback(event.target.result);}
        };

        re.onerror = function (event) {
            console.log("get error", event.target.error);
        }
    };

    // 更新一条数据
    this.put = function (objStorage, data, callback) {
        let re = objStorage.put(data);

        re.onsuccess = function (event) {
            if(callback){callback(event.target.result);}
        };

        re.onerror = function (event) {
            console.log("put error", event.target.error);
        }
    };

    // 删除某一条记录
    this.delItem = function (objStorage, objSName, key) {

        objStorage.delete(key);
        console.log("已删除存储空间 <" + objSName + "> 中的" + key);
    };

    // 通过索引获取值
    this.indexGet = function (objStorage, data, callback) {

        let index = objStorage.index(data["i"]);
        let re = index.get(data["k"]);

        re.onsuccess = function (event) {
            if(callback){callback(event.target.result);}
        };

        re.onerror = function (event) {
            console.log("indexGet error", event.target.error);
        }
    };

    // 存储对象的记录总数
    this.count = function (objStorage, callback) {

        let re = objStorage.count();

        re.onsuccess = function(event) {
            let c = event.explicitOriginalTarget.result;

            if (callback){
                callback(c)
            }else{
                localStorage.setItem("wordCount", c)
            }
        };

        re.onerror = function (event) {
            console.log(event)
        }
    };

    // 删除存储空间全部记录
    this.closeData = function (objStorage, objSName) {

        objStorage.clear();
        console.log("已清空存储空间 <" + objSName + "> 里的所有数据!");
    };

    // 删除数据库
    this.deleteDB = function (dbName) {

        window.indexedDB.deleteDatabase(dbName);
        console.log(dbName + "数据库已删除!");
    };

    //关闭数据库
    this.closeDB = function () {

        this.db.close();
    }
};


// 打开和创建 IndexDB
let openDB = function(dbName, dbV, callbacks) {

    let handler = new dbHandler();
    let request = window.indexedDB.open(dbName, dbV);

    request.onsuccess = function (event) {
        console.log("数据库连接成功");
        handler.db = event.target.result;

        // 执行回调函数
        if (!callbacks){return }
        for (let i=0; i<callbacks.length; i++){
            callbacks[i]()
        }
    };

    request.onerror = function (event) {
        console.log("数据库连接失败!" + event.target.error.message + "错误码:" + event.target.errorCode);
    };

    request.onupgradeneeded = function (event) {
        let db = event.target.result;

        // 单词信息数据存储对象
        let wordsDB = db.createObjectStore("words_info", {keyPath: "word"});

        // 单词存储对象
        let words = db.createObjectStore("words", {keyPath: "id"});
        words.createIndex("word", "word", {unique: true});
    };

    return handler;
};


// 播放发音
let playAudio = function () {

    let audioEle = document.createElement("audio");
    function insideF(data, speak) {
        if (speak === "uk") {
            audioEle.src = "data:audio/mp3;base64," + data["proUK"][0];
        }else{
            audioEle.src = "data:audio/mp3;base64," + data["proUS"][0];
        }
        audioEle.play()
    }
    return insideF
}();


// 生成弹幕
let popWord = function() {
    let popTemplate = document.createElement("a");
    popTemplate.classList.add("ba_item");
    popTemplate.setAttribute("ondragstart", "return false");
    let speed = window.screen.width/500;

    function insideF(data) {

        let word = data["word"];
        let item = popTemplate.cloneNode(true);
        item.style.top = "calc(" + selectFrom(5, 95) + "%)";
        len = word.length < 5 ? 5 : word.length;
        item.style.animationDuration = len * speed + "s";
        item.textContent = word;
        item.addEventListener("animationend", function () {
            this.parentNode.removeChild(this);
        });
        document.querySelector("#barrage-area").appendChild(item);
    }
    return insideF;
}();


// 生成单词详细信息 DOM
function createWordDetailed(word)
{

    // TODO 这里需要从 indexDB 里获取数据
    let wData = word;
    let tle = wordDetailedTemplate.cloneNode(true);

    /* 单词 */
    let wrapWord = $("#wd_word", "one", tle);
    if (wData.syll)
    {
        for (let i=0; i < wData["syll"].length; i++)
        {
            let span = document.createElement("span");
            span.classList.add("wd_syllable");
            span.textContent = wData["syll"][i];
            wrapWord.appendChild(span);
            if (i + 1 < wData.syll.length) {wrapWord.appendChild(document.createTextNode("·"))}
        }
    }
    /* 单词END */

    /* 音标 */
    $("#wd_uk-ps", "one", tle).textContent = "\\ " + wData["symbolUK"] + " \\";
    $("#wd_us-ps", "one", tle).textContent = "\\ " + wData["symbolUS"] + " \\";
    /* 音标END */

    /* 高频释义 */
    let wrapHP = $("#wd_high-paras", "one", tle);
    for (let i in wData["highFrePara"])
    {
        if (!wData["highFrePara"].hasOwnProperty(i)){return}

        let span = document.createElement("span");
        span.classList.add("wd_para");
        span.title = "使用率：" + wData["highFrePara"][i]["percent"] + "%";
        span.appendChild(document.createTextNode(wData["highFrePara"][i]["sense"]));
        wrapHP.appendChild(span);
    }
    /* 高频释义END */

    /* 中文释义 */
    let wrapZP = $("#wd_zh-para-content", "one", tle);
    for (let i in wData["paraZh"])
    {
        if (!wData["paraZh"].hasOwnProperty(i)){continue}

        let li = document.createElement("li");
        let span = document.createElement("span");
        span.classList.add("wd_zh-property");
        span.textContent = i;
        li.appendChild(span);
        li.appendChild(document.createTextNode(wData["paraZh"][i]));
        wrapZP.appendChild(li);
    }
    /* 中文释义END */

    /* 英文释义 */
    let wrapEP = $("#wd_en-para-content", "one", tle);
    for (let p in wData["paraEn"])
    {
        if (!wData["paraEn"].hasOwnProperty(p)){continue}

        for (let i in wData["paraEn"][p])
        {
            if (!wData["paraEn"][p].hasOwnProperty(i)){continue}

            let li = document.createElement("li");
            let span = document.createElement("span");
            span.classList.add("wd_en-property");
            span.textContent = p;
            li.appendChild(span);
            li.appendChild(document.createTextNode(wData["paraEn"][p][i]["def"]));
            wrapEP.appendChild(li);
        }
    }
    /* 英文释义END */

    /* 词根词缀 */
    let warpRoot = $(".wd_root > .wd_content", "one", tle);

    if (wData["affixes"])
    {
        for (let i of wData["affixes"])
        {
            let span = document.createElement("span");
            span.classList.add("wd_root-item");
            let type = i["type"] + "：";
            let typeExp = i["typeExp"];
            let typeValue = i["typeValue"];
            span.textContent = type + typeValue + typeExp;
            warpRoot.appendChild(span);
        }
    }
    else
    {
        $(".wd_root", "one", tle).style.display = "none";
    }
    /* 词根词缀END */

    /* 例句 */
    let warpEe = $(".wd_example > .wd_content", "one", tle);

    if (wData["sentDB"])
    {
        for (let i of wData["sentDB"])
        {
            let div = document.createElement("div");
            div.classList.add("wd_ee-item");
            let pEn = document.createElement("p");
            pEn.classList.add("wd_ee-en");
            pEn.innerHTML = i[0];
            let pZh = document.createElement("p");
            pZh.classList.add("wd_ee-zh");
            pZh.textContent = i[1];
            div.appendChild(pEn);
            div.appendChild(pZh);
            warpEe.appendChild(div);
        }
    }
    else
    {
        $(".wd_exampl", "one", tle).style.display = "none";
    }
    /* 例句END */

    /* 词组 */
    let warpPe = $(".wd_phrase > .wd_content", "one", tle);

    if (wData["phrase"])
    {
        for (let i of wData["phrase"])
        {
            let div = document.createElement("div");
            div.classList.add("wd_pe-item");
            let spanEn = document.createElement("span");
            spanEn.classList.add("wd_pe-en");
            spanEn.innerHTML = i[0];
            let spanZh = document.createElement("span");
            spanZh.classList.add("wd_pe-zh");
            spanZh.textContent = i[1];
            div.appendChild(spanEn);
            div.appendChild(spanZh);
            warpPe.appendChild(div);
        }
    }
    else
    {
        $(".wd_phrase", "one", tle).style.display = "none";
    }
    /* 词组END */

    /* 近义词 */
    let wrapSm = $(".wd_synonym > .wd_content", "one", tle);

    if (wData["synonym"])
    {
        for (let i of wData["synonym"])
        {
            let span = document.createElement("span");
            span.classList.add("wd_am-item");
            span.textContent = i;
            wrapSm.appendChild(span);
        }
    }
    else
    {
        $(".wd_synonym", "one", tle).style.display = "none";
    }
    /* 近义词END */

    /* 近义词 */
    let wrapAm = $(".wd_antonym > .wd_content", "one", tle);

    if (wData["antonym"])
    {
        for (let i of wData["antonym"])
        {
            let span = document.createElement("span");
            span.classList.add("wd_am-item");
            span.textContent = i;
            wrapAm.appendChild(span);
        }
    }
    else
    {
        $(".wd_antonym", "one", tle).style.display = "none";
    }
    /* 近义词END */


    wordDetailed.data = [tle, wData];
    wordDetailed.show();
}

