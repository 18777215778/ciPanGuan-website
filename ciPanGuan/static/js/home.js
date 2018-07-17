socket = null;
indexDB = null;

window.onload = function () {

    // 建立 socket 连接
    let socketCallback = [
        IndexDBInit.openIndexDB,
        updateLS.setting
    ];
    socket = buildSocket(socketCallback);

};


let IndexDBInit = {

    openIndexDB: function() {

        let indexDBCallback = [
            IndexDBInit.closeWords
        ];
        indexDB = openDB("ciPanGuan", 1, indexDBCallback);
    },

    closeWords: function () {
        indexDB.handler("words", "closeData");
        IndexDBInit.getWords();
    },

    getWords: function() {
        socket.send(JSON.stringify([{"qNum":"12", "callback":"IndexDBInit.addWords", "data":null}]));
    },

    addWords: function (data) {
        i = 0;
        for (let w of data){
            indexDB.handler("words", "add", {"id":i, "word":w["word"]});
            i++;
        }
        updateLS.getWordsCount();
        homepageInit();
    }
};


// homepage 初始化
function homepageInit() {

    // 显示主页面
    $("#head").style.transform = "";
    $("#bottom").style.transform = "";
    $("#barrage-area").style.display = "block";

    // 绑定事件
    document.addEventListener("click", homeClickEventEntrust, false);
    $("#hd_ambition").addEventListener("blur", homeBlurEventEntrust, false);

    startPop.startLoop();
}


// 更新 localStorage 里的数据
let  updateLS = {

    setting: function (data) {
        if(data){
            localStorage.setItem("setting", JSON.stringify(data));
        }else{
            socket.send(JSON.stringify([{"qNum":"06","callback":"updateLS.setting", "data":null}]));
        }
    },

    getWordsCount: function() {
        indexDB.handler("words", "count", null, updateLS.saveWordCount)
    },

    saveWordCount: function (data) {
        localStorage.setItem("wordCount", data)
    }
};


// 开始发送弹幕
let startPop = {

    timer: null,

    record: [],

    startLoop: function () {
        if (Number(localStorage.getItem("wordCount")) !== 0) {
            startPop.running();
            startPop.timer = setInterval(startPop.running, 3000)
        }
    },

    running: function () {
        let sum = Number(localStorage.getItem("wordCount"));
        if (sum === 0){ return }
        let index = selectFrom(0, sum - 1, startPop.record);
        if (startPop.record.length > 10){startPop.record.shift()}
        startPop.record.push(index);
        indexDB.handler("words", "get", index, createWordBullet);
    },

    stop: function() {
        clearInterval(startPop.timer)
    }
};


// 更新 homepage 中的数据
let update = {
    // 更新学习信息板
    learnInfo: function (data){
        $("#lib_new-learn-num").textContent = data["tLearnNum"];
        $("#lib_review-num").textContent = data["reviewNum"];
        $("#lib_duration-num").textContent = parseFloat(data["studyLength"]);
        $(".lib-point").innerHTML = data["Countdown"][0];
        let learnBtn = $(".hd_learn","one");
        learnBtn.textContent = data["btnText"][0];

        if(!data["btnText"][1]){
            learnBtn.classList.add("hd_learn-not-allowed");
            learnBtn.dataset["click"] = "false"
        }

        if (data["Countdown"][1])
        {
            let timeEle = $("#lib-time");
            let cd = data["Countdown"][1];
            let interval = null;

            function countdown() {
                let d = new Date();
                let nowTime = Math.ceil(d.getTime() / 1000);
                let diffTime = cd - nowTime;

                let h = Math.floor(diffTime/3600); //时
                let m = Math.floor(diffTime%3600/60); // 分
                let s = diffTime%60; //秒

                if (h===0 && m===0) {
                    clearInterval(interval);
                    $(".hd_learn").classList.remove("hd_learn-not-allowed");
                    $(".lib-point").innerHTML = '<span id="lib-time">-</span>';
                    return
                }

                timeEle.textContent = h + ":" +  m;
            }
            countdown();
            interval = setInterval(countdown, 60000)
        }
    },
    // 当前单词本的学习进度
    crop: function (data) {
        if (data["wbName"] !== undefined){
            $("#wqb_wordbook").innerText = data["wbName"];
        }
        if (data["scale"] !== undefined){
            $("#wqd_complete").innerText = data["scale"][0];
            $("#wqd_sum").innerText = data["scale"][1];
            let scale = data["scale"][0] / data["scale"][1];
            $("#wqd_cl-progress-bar").style.width = scale * 100 + "%";
        }
        if (data["predict"] !== undefined){
            $("#wqb_time").innerText = data["predict"];
        }
    },
    // 总单词量
    sumWord: function (data) {
        if (data["level"] !== undefined){
            $("#wqb_level_num").innerText = data["level"];
        }
        if (data["scale"] !== undefined){
            $("#wqd_current-sum").innerText = data["scale"][0];
            $("#wqd_next-level").innerText = data["scale"][1];
            let scale = data["scale"][0] / data["scale"][1];
            $("#wqd_sw-progress-bar").style.width = scale * 100 + "%";
        }
    }
};


/*************************************************
                       事件
 *************************************************/
// 主页的 click 事件委托
let homeClickEventEntrust = function (event) {
    let target = event.target,
        classList = target.classList,
        id = target.id;

    switch (true)
    {
        /*************************************************
                              其他部件
         *************************************************/
        // 关闭板块的按钮
        case classList.contains("gl_close"): glQuitF(target);break;
        case classList.contains("gl_close-1"):
        case classList.contains("gl_close-2"): glQuitF(target.parentElement); break;
        // 未完成功能提示
        case classList.contains("hd_game"):
        case classList.contains("wqb_upgrade"): showMsg("^_^ 敬请期待!");break;


        /*************************************************
                            我的目标板块
         *************************************************/
        // 显示我的目标板块
        case classList.contains("wqb_revise"):myGoal.open(); break;
        // 选择单词本的种类
        case classList.contains("mg_classify-item"): myGoal.selectClassifyF(target); break;
        // 选择单词本
        case classList.contains("mg_select_btn"): myGoal.selectWordbook(target); break;
        // 增加或减少每组单词量
        case classList.contains("mg_add"):
        case classList.contains("mg_2"): myGoal.addLearnNum(); break;
        case classList.contains("mg_sub"): myGoal.subLearnNum(); break;
        case classList.contains("mg_1"):  target.parentElement.className === "mg_add"? myGoal.addLearnNum() : myGoal.subLearnNum(); break;


        /*************************************************
                              设置板块
         *************************************************/
        // 显示设置板块
        case classList.contains("hd_setting"):setting.show(); break;
        // 设置选项
        case classList.contains("sg_radio-box"):
        case classList.contains("sg_radio-text"): setting.update(target.parentElement); break;
        case classList.contains("sg_value"): setting.update(target); break;


        /*************************************************
                            单词详细模块
         *************************************************/
        case classList.contains("ba_item"): wordDetailed.fromDB(target.textContent); break;
        case target.id === "wd_uk-ps": wordDetailed.playA("uk"); break;
        case target.id === "wd_us-ps": wordDetailed.playA("us"); break;
        case classList.contains("wd_zh-para"): wordDetailed.showZhPara(target); break;
        case classList.contains("wd_en-para"): wordDetailed.showEnPara(target); break;


        /*************************************************
                              学习新词
         *************************************************/
        case classList.contains("hd_learn") && target.dataset["click"]!=="false": learnNewWord.getData(); break;


        /*************************************************
                              退出登录
         *************************************************/
        case  id === "hd_logout": logout(); break;
    }

};

// 主页 blur 事件委托
let homeBlurEventEntrust = function (event) {

    let sent = event.target.value;
    socket.send(JSON.stringify([{"qNum":"09", "callback":null, "data":sent}]))
};



/*************************************************
                     其他部件
 *************************************************/
// 关闭板块的按钮
function glQuitF(ele) {

    let eleId = ele.parentElement.id;

    switch (eleId)
    {
        case "my-goal": myGoal.close(); break;
        case "setting": setting.close();break;
        case "word-detailed": wordDetailed.close(); break;
    }

    document.body.removeChild(ele.parentElement);
}

// 未完成功能提示
function showMsg(msg) {
    let glMsgBox = alertWinTemplate.cloneNode(true);
    $(".gl_msg-text", "one", glMsgBox).textContent = msg;
    let btn = $(".gl_msg-btn", "one", glMsgBox);

    btn.onclick = function () {
        document.body.removeChild($(".gl_msg-box"));
        btn.onclick = null;
    };

    document.body.appendChild(glMsgBox);
}


/*************************************************
                    我的目标板块
 *************************************************/
let myGoal = {

    // 打开我的目标板块
    open: function(){
        let mg = myGoalTemplate.cloneNode(true);
        document.body.appendChild(mg);
        socket.send(JSON.stringify([{"qNum":"01", "callback":"myGoal.add", "data":null}]))
    },

    // 填充数据
    add: function(data) {
        localStorage.setItem("word_num", data["word_num"]);
        localStorage.setItem("wb_data", JSON.stringify(data["wb_data"]));
        localStorage.setItem("selected", data["selected"]);

        $(".mg_word-num").textContent = data["word_num"];

        for (let cls in data["wb_data"])
        {
            if (!data["wb_data"].hasOwnProperty(cls)) {continue}

            wbc = wordbookClassTemplate.cloneNode(true);
            $(".mg_classify-item", "one", wbc).appendChild(document.createTextNode(cls));
            $(".mg_classify-item", "one", wbc).dataset["clsName"] = cls;
            $(".mg_classify").appendChild(wbc);
        }
        selector = "li[data-cls-name=" + Object.keys(data["wb_data"])[0] + "]";
        myGoal.selectClassifyF($(selector))
    },

    // 选择单词本的种类
    selectClassifyF: function(ele){
        try {
            $("#mg_class-focus").id = "";
            $("#mg_classify-icon").id = "";
        }catch (e) {}

        ele.id = "mg_class-focus";
        $("#mg_class-focus span").id = "mg_classify-icon";

        let classWbs = $(".mg_class-wbs");
        classWbs.innerHTML = "";

        let wb_data = JSON.parse(localStorage.getItem("wb_data"));
        let selected = localStorage.getItem("selected");
        for (let wb of wb_data[ele.dataset["clsName"]])
        {
            let wbt = wordbookTemplate.cloneNode(true);
            $(".mg_wb-name", "one", wbt).textContent = wb["name"];
            $(".mg_complete", "one", wbt).textContent = wb["accedNum"];
            $(".mg_sum", "one", wbt).textContent = wb["sum"];
            $("li", "one", wbt).dataset["bookId"] = wb["id"];

            if (wb["id"] === selected){
                $(".mg_select_btn", "one", wbt).classList.remove("mg_unselected");
                $(".mg_select_btn", "one", wbt).classList.add("mg_select_current");
            }
            classWbs.appendChild(wbt);
        }

        let win = document.querySelector(".mg_class-wbs-box");
        let scroll = document.querySelector(".mg_class-wbs");
        let bar = document.querySelector(".mg_wordbooks .scroll-bar");
        definedScrollBar(win, scroll, bar);
    },

    // 选择单词本
    selectWordbook: function(ele){
        let bId = ele.parentElement.dataset["bookId"];
        let selected = localStorage.getItem("selected");

        if (bId === selected) {return false}

        let newBId = $("[data-book-id='"+bId+"'] .mg_select_btn");
        newBId.classList.remove("mg_unselected");
        newBId.classList.add("mg_select_current");

        try {
            let oldBId = $("[data-book-id='"+selected+"'] .mg_select_btn");
            oldBId.classList.remove("mg_select_current");
            oldBId.classList.add("mg_unselected");
        }catch (e) {}

        localStorage.setItem("selected", bId);
    },

    // 增加学习量
    addLearnNum: function(){
        let numEle = $(".mg_word-num");
        let num = parseInt(localStorage.getItem("word_num"));
        num += 12;
        if (num > 120){num = 12}
        localStorage.setItem("word_num", num);
        numEle.textContent = num;
    },

    // 减少学习量
    subLearnNum: function(){
        let numEle = $(".mg_word-num");
        let num = parseInt(localStorage.getItem("word_num"));
        num -= 12;
        if (num < 12){num = 120}
        localStorage.setItem("word_num", num);
        numEle.textContent = num;
    },

    // 关闭我的目标板块
    close: function () {
        $(".hd_learn").dataset["click"] = "";
        let selected = localStorage.getItem("selected");
        let word_num = localStorage.getItem("word_num");
        socket.send(JSON.stringify([{"qNum":"02", "callback":"update.crop", "data":{"selected":selected, "word_num":word_num}}]));

        localStorage.removeItem("selected");
        localStorage.removeItem("word_num");
        localStorage.removeItem("wb_data");
    }
};


/*************************************************
                      设置板块
 *************************************************/
let setting = {

    show: function () {
        let sg = settingTemplate.cloneNode(true);
        document.body.appendChild(sg);
        data = JSON.parse(localStorage.getItem("setting"));

        for (let o in data)
        {
            if (!data.hasOwnProperty(o)) {continue}

            let optionT = optionTemplate.cloneNode(true);
            $(".sg_option", "one", optionT).dataset["option"] = o;
            $(".sg_option-text", "one", optionT).textContent = data[o]["name"];

            for (let v in data[o]["values"])
            {
                if (!data[o]["values"].hasOwnProperty(v)) {continue}

                let valueT = valueTemplate.cloneNode(true);
                $(".sg_value", "one", valueT).dataset["value"] = v;
                $(".sg_radio-text", "one", valueT).textContent = v;

                if (data[o]["values"][v]){
                    $(".sg_radio", "one", valueT).classList.add("sg_true")
                }
                $(".sg_values", "one", optionT).appendChild(valueT);
            }
            $(".sg_main").appendChild(optionT);
        }
    },

    update: function (ele) {
        let optionEle = ele.parentElement.parentElement;

        optionEle.querySelector(".sg_true").classList.remove("sg_true");
        ele.querySelector(".sg_radio").classList.add("sg_true");

        let option = optionEle.dataset["option"];
        let value = ele.dataset["value"];
        let setting = JSON.parse(localStorage.getItem("setting"));

        for (let v in setting[option]["values"]){
            if (!setting[option]["values"].hasOwnProperty(v)) {continue}
            setting[option]["values"][v] = false;
        }
        setting[option]["values"][value] = true;

        localStorage.setItem("setting", JSON.stringify(setting));
    },

    close: function () {
        let setting = JSON.parse(localStorage.getItem("setting"));
        socket.send(JSON.stringify([{"qNum":"07", "callback":null, "data":setting}]))
    }
};


/*************************************************
                    单词详细版块
 *************************************************/
let wordDetailed = {

    data: null,
    word: null,

    check: function(data) {
        if(!!data){
            createWordDetailed(data);
        }else{
            socket.send(JSON.stringify([{"qNum":"11","callback":"wordDetailed.fromServer", "data":wordDetailed.word}]));
        }
    },

    fromDB:function(word) {
        wordDetailed.word = word;
        indexDB.handler("words_info", "get", word, wordDetailed.check)
    },

    fromServer: function(data) {
        createWordDetailed(data);
        indexDB.handler("words_info", "add", data);
    },

    show: function () {
        document.body.appendChild(wordDetailed.data[0]);

        let win = document.querySelector(".wd_main-wrap");
        let scroll = document.querySelector(".wd_main");
        let bar = document.querySelector(".wd_main-wrap .scroll-bar");
        definedScrollBar(win, scroll, bar);
    },

    playA: function (speak) {
        playAudio(wordDetailed.data[1], speak);
    },

    showZhPara: function (target) {
        $(".wd_en-para").id = "";
        $("#wd_en-para-content").style.display = "none";
        target.id = "wd_para_focus";
        $("#wd_zh-para-content").style.display = "block";
    },

    showEnPara: function (target) {
        $(".wd_zh-para").id = "";
        $("#wd_zh-para-content").style.display = "none";
        target.id = "wd_para_focus";
        $("#wd_en-para-content").style.display = "block";
    },

    close: function () {
        wordDetailed.data = null;
        wordDetailed.word = null;
    }
};


/*************************************************
                     学习新词
 *************************************************/
let learnNewWord = {
    getData: function() {
        let learnBtn = $(".hd_learn");
        learnBtn.dataset["click"] = "false";

        if (learnBtn.textContent === "学习新词"){
            socket.send(JSON.stringify([{"qNum":"05","callback":"learnNewWord.addData", "data":null}]));
        } else {
            socket.send(JSON.stringify([{"qNum":"13","callback":"learnNewWord.addData", "data":null}]));
        }
    },

    addData: function(data) {
        words = [];
        wordCount = Number(localStorage.getItem("wordCount"));
        ii = 0;
        for (let i of data){
            indexDB.handler("words_info", "add", i);
            indexDB.handler("words", "add", {"id":wordCount + ii, "word":i["word"]});
            words.push(i["word"]);
            ii++;
        }
        learnNewWord.startLearn(data);
        updateLS.getWordsCount();
    },

    startLearn: function(data) {
        // 移除主页的事件
        document.removeEventListener("click", homeClickEventEntrust, false);
        // 开始学习
        startLearn(data);
        // 隐藏或移除主页的内容
        let head = $("#head"), bottom = $("#bottom");
        let barrageArea = $("#barrage-area");
        let boxes = [$("#my-goal"), $("#setting"), $("#word-detailed")];

        head.style.transform = "translateY(-150px)";
        bottom.style.transform = "translateY(280px)";
        barrageArea.style.display = "none";
        clearInterval(startPop.stop());
        barrageArea.innerHTML = "";

        for (box of boxes) {
            if (box) {document.body.removeChild(box)}
        }
        $(".hd_learn").dataset["click"] = "";
    }
};


/*************************************************
                      模拟事件
 *************************************************/
// 打开我的目标
let eventImitate = {
  openMyGoal: function () {
      let event = document.createEvent("MouseEvents");
      event.initMouseEvent("click", true, true, document.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      $(".wqb_revise").dispatchEvent(event);
  },
};


/*************************************************
                       退出登录
 *************************************************/
function logout() {
    localStorage.clear();
    indexDB.handler("ciPanGuan", "deleteDB")
}



function test(data) {
    console.log(data)
}