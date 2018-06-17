
window.onload = function () {
    appInit();
};

// app 初始化
function appInit() {
    $("#head").style.transform = "";
    $("#bottom").style.transform = "";
    $("#barrage-area").style.display = "block";
    poppingWord = setInterval(popWord, 2000);

    // 添加事件
    document.addEventListener("click", homeClickEventEntrust, false);
}

// 更新home中的数据
let update = {
    // 今日新学
    todayLearn: function (data) {
        let ele = $("#lib_new-learn-num");
        ele.innerText = data;
    },
    // 今日复习
    todayReview: function (data) {
        let ele = $("#lib_review-num");
        ele.innerText = data;
    },
    // 本月学习时长
    monthLD: function (data) {
        let ele = $("#lib_duration-num");
        ele.innerText = data;
        // TODO 给个定时器开始计时, 不需要与服务器的时间同步, 下次开启页面以服务器的时间为准
    },
    // 下次复习时间
    nextReview: function (targetTime) {
        let ele = $("#lib-time");
        // TODO 给个定时器开始倒计时, 不需要与服务器的时间同步, 下次开启页面以服务器的时间为准
        let d = new Date();
        setInterval(function () {
            let nowTime = Math.floor(d.getTime() / 1000);
            let diffTime = targetTime - nowTime;
            let h = Math.floor(diffTime/3600); //时
            let m = Math.floor(diffTime%3600/60); // 分
            let s = diffTime%60; //秒
            ele.textContent = h + " : " +  m;
        }, 60000)
    },
    // 当前单词本的学习进度
    crop: function (data) {
        if (data["wbName"] !== undefined){
            $("#wqb_wordbook").innerText = data["wbName"];
        }
        if (data["scale"] !== undefined){
            $("#wqd_complete").innerText = data["scale"][0];
            $("#wqd_sum").innerText = data["scale"][1];
            let scale = data["scale"][0] / data["scale"][0];
            $("#wqd_cl-progress-bar").style.width = scale * 100 + "%";
        }
        if (data["predict"] !== undefined){
            $("#wqb_time").innerText = data["predict"];
        }
    },
    // 总单词量
    sumWord: function (data) {
        if (data["rank"] !== undefined){
            $("#wqb_rank_num").innerText = data["rank"];
        }
        if (data["scale"] !== undefined){
            $("#wqd_current-sum").innerText = data["scale"][0];
            $("#wqd_next-rank").innerText = data["scale"][1];
            let scale = data["scale"][0] / data["scale"][0];
            $("#wqd_sw-progress-bar").style.width = scale * 100 + "%";
        }
    }
};

// 主页的click事件委托
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
        case classList.contains("wqb_revise"):showMyGoal(); break;
        // 选择单词本的种类
        case classList.contains("mg_classify-item"): mgClassifyF(target); break;
        // 选择单词本
        case classList.contains("mg_select_btn"): mgSelectBtnF(target); break;
        // 增加或减少每组单词量
        case classList.contains("mg_add"):
        case classList.contains("mg_2"): mgAddF(); break;
        case classList.contains("mg_sub"): mgSubF(); break;
        case classList.contains("mg_1"):  target.parentElement.className === "mg_add"? mgAddF() : mgSubF(); break;


        /*************************************************
                              设置板块
         *************************************************/
        // 显示设置板块
        case classList.contains("hd_setting"):showSetting(); break;
        // 设置选项
        case classList.contains("sg_radio-box"):
        case classList.contains("sg_radio-text"): options(target.parentElement); break;
        case classList.contains("sg_value"): options(target); break;


        /*************************************************
                            单词详细模块
         *************************************************/
        case classList.contains("ba_item"): showWordDetailed(target); break;
        case target.id === "wd_uk-ps": playAudioUK(); break;
        case target.id === "wd_us-ps": playAudioUS(); break;
        case classList.contains("wd_zh-para"): showZhPara(target); break;
        case classList.contains("wd_en-para"): showEnPara(target); break;


        /*************************************************
                              学习新词
         *************************************************/
        case classList.contains("hd_learn"): learnNewWord(); break;
    }


    /*************************************************
                          其他部件
     *************************************************/
    // 关闭板块的按钮
    function glQuitF(ele) {
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
    // 显示我的目标板块
    function showMyGoal() {
        // TODO 向服务器请求本板块需要的数据 (单词本种类, 单词本, 学习量)
        let mg = myGoalTemplate.cloneNode(true);
        document.body.appendChild(mg);
        let win = document.querySelector(".mg_class-wbs-box");
        let scroll = document.querySelector(".mg_class-wbs");
        let bar = document.querySelector(".mg_wordbooks .scroll-bar");
        definedScrollBar(win, scroll, bar);
    }

    // 选择单词本
    function mgSelectBtnF(ele) {
        let bId = ele.parentElement.dataset["bookId"];
        if (bId === bookId) {return false}
        // TODO 向服务器发送选择的单词本 ID
        let newBId = $("[data-book-id="+bId+"] .mg_select_btn","one");
        newBId.classList.remove("mg_unselected");
        newBId.classList.add("mg_select_current");

        let oldBId = $("[data-book-id="+bookId+"] .mg_select_btn");
        oldBId.classList.remove("mg_select_current");
        oldBId.classList.add("mg_unselected");

        bookId = bId;
    }

    // 增加每组单词量
    function mgAddF() {
        // TODO 向服务器发送 +12
        let numEle = $(".mg_word-num");
        let num = Number(numEle.innerHTML) + 12;
        if (num > 120){num = 12}
        numEle.innerHTML = num;
    }

    // 减少每组单词量
    function mgSubF() {
        // TODO 向服务器发送 -12
        let ele = $(".mg_word-num");
        let num = Number(ele.innerHTML) - 12;
        if (num < 12){num = 120}
        ele.innerHTML = num;
    }

    //选择单词本的种类
    function mgClassifyF(ele) {
        $("#mg_class-focus").id = "";
        $("#mg_classify-icon").id = "";

        ele.id = "mg_class-focus";
        $("#mg_class-focus span").id = "mg_classify-icon";
    }


    /*************************************************
                         设置板块
     *************************************************/
    // 显示设置板块
    function showSetting() {
        let sg = settingTemplate.cloneNode(true);
        // TODO 从服务器中获取设置项, 并保存到本地数据库
        document.body.appendChild(sg);
    }
    // 设置选项
    function options(ele) {
        // TODO 向服务器发送更改的选项
        let option = ele.parentElement.parentElement;
        option.querySelector(".sg_true").classList.remove("sg_true");
        ele.querySelector(".sg_radio").classList.add("sg_true");
    }


    /*************************************************
                       单词详细版块
     *************************************************/
    function showWordDetailed(ele) {
        let win = document.querySelector(".wd_main-wrap");
        let scroll = document.querySelector(".wd_main");
        let bar = document.querySelector(".wd_main-wrap .scroll-bar");

        // TODO 根据单词从 IndexDB 或服务器上获取数据
        let word = ele.dataset["word"];
        $("#word-detailed").style.display = "block";
        definedScrollBar(win, scroll, bar);
    }

    function playAudioUK() {
        // TODO 播放英音
    }

    function playAudioUS() {
        // TODO 播放美音
    }
    
    function showZhPara(target) {
        $(".wd_en-para").id = "";
        $("#wd_en-para-content").style.display = "none";
        target.id = "wd_para_focus";
        $("#wd_zh-para-content").style.display = "block";
    }

    function showEnPara(target) {
        $(".wd_zh-para").id = "";
        $("#wd_zh-para-content").style.display = "none";
        target.id = "wd_para_focus";
        $("#wd_en-para-content").style.display = "block";
    }


    /*************************************************
                          学习新词
     *************************************************/
    function learnNewWord() {
        // 移除主页的事件
        document.removeEventListener("click", homeClickEventEntrust, false);
        // 开始学习
        startLearn(wordDDD);
        // 隐藏或移除主页的内容
        let head = $("#head"), bottom = $("#bottom");
        let barrageArea = $("#barrage-area");
        let boxes = [$("#my-goal"), $("#setting"), $("#word-detailed")];

        head.style.transform = "translateY(-150px)";
        bottom.style.transform = "translateY(280px)";
        barrageArea.style.display = "none";
        clearInterval(poppingWord);
        barrageArea.innerHTML = "";

        for (box of boxes) {
            if (box) {document.body.removeChild(box)}
        }
    }

};



