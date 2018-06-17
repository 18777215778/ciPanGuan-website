
let learnData = {
    wordData: null,
    sequence: [],
    index:0,
    current: null,
};


// 第一题 DOM 构建
let qOne = function () {
        let fragment = document.createDocumentFragment();
        let questionOne = document.createElement("div");
        questionOne.id = "question-one";

        let qWord = document.createElement("div");
        qWord.classList.add("q_word");
        questionOne.appendChild(qWord);

        let qPhoneticSymbol = document.createElement("div");
        qPhoneticSymbol.classList.add("q_phonetic-symbol");

        let qUkPsBox = document.createElement("span");
        qUkPsBox.classList.add("q_uk-ps-box");
        qUkPsBox.appendChild(document.createTextNode("UK"));

        let qUkPs = document.createElement("span");
        qUkPs.classList.add("q_uk-ps");
        qUkPsBox.appendChild(qUkPs);
        qPhoneticSymbol.appendChild(qUkPsBox);

        let qUsPsBox = document.createElement("span");
        qUsPsBox.classList.add("q_us-ps-box");
        qUsPsBox.appendChild(document.createTextNode("US"));

        let qUsPs = document.createElement("span");
        qUsPs.classList.add("q_us-ps");
        qUsPsBox.appendChild(qUsPs);
        qPhoneticSymbol.appendChild(qUsPsBox);
        questionOne.appendChild(qPhoneticSymbol);

        let qHighParas = document.createElement("div");
        qHighParas.id = "q_high-paras";
        questionOne.appendChild(qHighParas);

        let qZhParaContent = document.createElement("ul");
        qZhParaContent.classList.add("q_zh-para-content");
        questionOne.appendChild(qZhParaContent);
        fragment.appendChild(questionOne);

        function insideF(item)
        {
            let fmt = fragment.cloneNode(true);

            /* 音节 */
            let syll = (typeof item["syll"] === "string" ? [item["word"]] : item["syll"] || false) || [item["word"]];
            let info = {letter:[], len: 0, index: 0};
            for (let i=0; i < syll.length; i++)
            {   // 第一循环时对音节的循环
                for (l of syll[i])
                {   // 第二层循环是对字母的循环
                    let span = document.createElement("span");
                    span.classList.add("q_l");
                    span.innerText = l;
                    fmt.querySelector(".q_word").appendChild(span);
                    info.letter.push(span);
                    info.len++;
                }
                if (i < syll.length - 1)
                {
                    fmt.querySelector(".q_word").appendChild(document.createTextNode("·"))
                }
            }
            fmt.querySelector(".q_word").info = info;
            fmt.querySelector(".q_word").addEventListener("animationend", function () {
                this.style.animationName = "";
            });
            /* 音节END */

            /* 音标 */
            if (item["symbolUK"]) {
                fmt.querySelector(".q_uk-ps").appendChild(document.createTextNode("/ " + item["symbolUK"] + " /"))
            }else{
                fmt.querySelector(".q_uk-ps").style.display = "none";
            }

            if (item["symbolUS"]) {
                fmt.querySelector(".q_us-ps").appendChild(document.createTextNode("/ " + item["symbolUS"] + " /"))
            } else {
                fmt.querySelector(".q_us-ps").style.display = "none";
            }
            /* 音标END */

            /* 高频释义 */
            if (!item["highFrePara"]){fmt.querySelector("#q_high-paras").style.display = "none";}

            for (let i in item["highFrePara"]){

                if (!item["highFrePara"].hasOwnProperty(i)){return}

                let span = document.createElement("span");
                span.classList.add("q_para");
                span.title = "使用率：" + item["highFrePara"][i]["percent"] + "%";
                span.appendChild(document.createTextNode(item["highFrePara"][i]["sense"]));
                fmt.querySelector("#q_high-paras").appendChild(span);
            }
            /* 高频释义END */

            /* 释义 */
            if (!item["paraZh"]){fmt.querySelector(".q_zh-para-content").style.display = "none";}

            for (let i in item["paraZh"])
            {
                if (!item["paraZh"].hasOwnProperty(i)) {continue}

                let li = document.createElement("li");
                let span = document.createElement("span");
                span.classList.add("q_zh-property");
                span.appendChild(document.createTextNode(i));
                li.appendChild(span);
                li.appendChild(document.createTextNode(item["paraZh"][i]));
                fmt.querySelector(".q_zh-para-content").appendChild(li);
            }
            /* 释义END */
            return fmt;
        }
        return insideF;
    }();

/* 第一题的键盘事件处理函数 */
function qOneEventHandle(event) {
    let wordEle = $(".q_word", "one", learnData.current);
    let info = wordEle.info;
    nextQuestion();
    // switch (true)
    // {
    //     case (info.index === info.len) && (event.keyCode === 13): nextQuestion(); break;
    //     case info.index < info.len: input(); break;
    // }

    function input()
    {
        if (info.index === 0)
        {   // 当开始输入时, 字体颜色变黑色
            for (let i=0; i < info.len; i++)
            {
                info.letter[i].style.color = "#0f0f0f";
            }
        }

        if (info.index >= info.len) {return}

        // 检查输入的字母是否正确
        if (info.letter[info.index].textContent === event.key) {
            info.letter[info.index].style.color = "";
            info.index++;

            // 每输入一个字母, 模糊适当降低. 直到单词拼写完成时, 模糊度将为0
            let blur = 10 - (10/(info.len))*(info.index);
            $("#q_high-paras").style.filter = "blur("+ blur +"px)";
            $(".q_zh-para-content").style.filter = "blur("+ blur +"px)";
        }
        else {
            // 输入错误时, 单词左右抖动
            wordEle.style.animationName = "shake";
        }

    }
}

// 第二题 DOM 构建
let qTwo = function () {
    let fragment = document.createDocumentFragment();
    let questionTow = document.createElement("div");
    questionTow.id = "question-two";

    let qWord = document.createElement("div");
    qWord.classList.add("q_word");
    questionTow.appendChild(qWord);

    let qPhoneticSymbol = document.createElement("div");
    qPhoneticSymbol.classList.add("q_phonetic-symbol");

    let qUkPsBox = document.createElement("span");
    qUkPsBox.classList.add("q_uk-ps-box");
    qUkPsBox.appendChild(document.createTextNode("UK"));

    let qUkPs = document.createElement("span");
    qUkPs.classList.add("q_uk-ps");
    qUkPsBox.appendChild(qUkPs);
    qPhoneticSymbol.appendChild(qUkPsBox);

    let qUsPsBox = document.createElement("span");
    qUsPsBox.classList.add("q_us-ps-box");
    qUsPsBox.appendChild(document.createTextNode("US"));

    let qUsPs = document.createElement("span");
    qUsPs.classList.add("q_us-ps");
    qUsPsBox.appendChild(qUsPs);
    qPhoneticSymbol.appendChild(qUsPsBox);
    questionTow.appendChild(qPhoneticSymbol);

    let qPotion = document.createElement("div");
    qPotion.classList.add("q_potion");
    questionTow.appendChild(qPotion);
    fragment.appendChild(questionTow);

    /* 选项元素 */
    let itemFmt = document.createDocumentFragment();
    let qpItem = document.createElement("div");
    qpItem.classList.add("q_p-item");

    let spanFlag = document.createElement("span");
    spanFlag.classList.add("q_p-flag");
    qpItem.appendChild(spanFlag);

    let textBox = document.createElement("div");
    textBox.classList.add("q_p-text-box");

    let spanText = document.createElement("span");
    spanText.classList.add("q_p-text");
    textBox.appendChild(spanText);

    let shade = document.createElement("span");
    shade.classList.add("q_p-shade");
    textBox.appendChild(shade);

    qpItem.appendChild(textBox);
    itemFmt.appendChild(qpItem);
    /* 选项元素END */

    // 把高频释义对象转换成字符串
    let objToString = function (obj) {
        let arr = [];
        for (let i in obj)
        {
            if (!obj.hasOwnProperty(i)) {continue}
            arr.push(obj[i]["sense"]);
        }
        return arr.join("；");
    };

    // 从所有释义中随机选出一条释义并返回
    let selectPara = function (paraOpj) {
        let property = Object.keys(paraOpj);
        let select = selectFrom(0, property.length - 1);
        return paraOpj[property[select]];
    };

    function insideF(item)
    {
        let fmt = fragment.cloneNode(true);

        /* 音节 */
        let syll = (typeof item["syll"] === "string" ? [item["word"]] : item["syll"] || false) || [item["word"]];
        for (let i=0; i < syll.length; i++)
        {   // 第一循环是对音节的循环
            for (l of syll[i])
            {   // 第二层循环是对字母的循环
                let span = document.createElement("span");
                span.classList.add("q_l");
                span.innerText = l;
                fmt.querySelector(".q_word").appendChild(span);
            }
            if (i < syll.length - 1)
            {
                fmt.querySelector(".q_word").appendChild(document.createTextNode("·"))
            }
        }
        /* 音节END */

        /* 音标 */
        if (item["symbolUK"]) {
            fmt.querySelector(".q_uk-ps").appendChild(document.createTextNode("/ " + item["symbolUK"] + " /"))
        }else{
            fmt.querySelector(".q_uk-ps").style.display = "none";
        }

        if (item["symbolUS"]) {
            fmt.querySelector(".q_us-ps").appendChild(document.createTextNode("/ " + item["symbolUS"] + " /"))
        } else {
            fmt.querySelector(".q_us-ps").style.display = "none";
        }
        /* 音标END */

        /* 选项 */
        let flag = ["A", "B", "C", "D"];
        let correct = selectFrom(0, flag.length - 1);
        let allOption = [learnData.wordData.indexOf(item)];
        let info = {index:-1, cor: correct, options:[]};
        for (let i=0; i < flag.length; i++)
        {
            let iFmt = itemFmt.cloneNode(true);
            iFmt.querySelector(".q_p-flag").appendChild(document.createTextNode(flag[i]));

            if (i === correct)
            {   // 正确的答案
                let para = item["highFrePara"] ? objToString(item["highFrePara"]) : selectPara(item["paraZh"]);
                iFmt.querySelector(".q_p-text").innerHTML = "<span>" + para +"</span>";
            }
            else
            {   // 错误的答案
                let select = selectFrom(0, learnData.wordData.length-1, allOption);
                allOption.push(select);
                let para = learnData.wordData[select]["highFrePara"] ? objToString(learnData.wordData[select]["highFrePara"]) : selectPara(learnData.wordData[select]["paraZh"]);
                iFmt.querySelector(".q_p-text").innerHTML = "<span>" + para +"</span>";
            }
            info.options.push($(".q_p-item", "one", iFmt));
            fmt.querySelector(".q_potion").appendChild(iFmt);
        }
        /* 选项END */
        $("#question-two", "one", fmt).info = info;
        return fmt
    }
    return insideF
}();

/* 第二题的键盘事件处理函数 */
function qTwoEventHandle(event) {
    let info = learnData.current.info;
    nextQuestion();
    // switch (true)
    // {
    //     case (info.cor === -1) && (event.keyCode === 13): nextQuestion(); break;
    //     case (info.index === -1) && (event.keyCode !== 9) :
    //     case info.cor === -1 : break;
    //     case event.keyCode === 9:changeOver(); break;
    //     case event.keyCode === 13: confirm(); break;
    // }

    /* 切换选项 */
    function changeOver() {
        // 清除样式
        if (info.options[info.index]){
            $(".q_p-text", "one", info.options[info.index]).style.color = "";
        }
        info.index++;
        if (info.index >= info.options.length) {info.index = 0}

        // 修改文本颜色
        let qpText = $(".q_p-text", "one", info.options[info.index]);
        qpText.style.color = "#FF9332";

        // 当文本过长时, 使其能够滚动显示
        // let text = $("span", "one", qpText);
        // let diffW = qpText.offsetWidth - text.offsetWidth;
        // if (diffW < 0)
        // {
        //     info.timeout = setTimeout(function () {
        //         text.addEventListener("transitionend", TextScrollingEnd, false);
        //         text.style.transitionProperty = "margin-left";
        //         text.style.transitionDuration = "1s";
        //         text.style.transitionTimingFunction = "linear";
        //         text.nextP = diffW - 50;
        //         text.style.marginLeft = diffW - 50 + "px";
        //     }, 500)
        // }

    }

    /* 确定选项 */
    function confirm() {
        $(".q_p-shade", "one", info.options[info.cor]).classList.add("q_p-correct");
        if (info.index === info.cor)
        {
            // TODO 播放选择正确的音效
        }
        else
        {
            // TODO 播放选择错误的音效
            $(".q_p-shade", "one", info.options[info.index]).classList.add("q_p-wrong");
        }
        // 将 info.cor 设置成 -1 表示这道题目已做
        info.cor = -1;
    }
    
    /* 监听文本滚动过度动画结束时 */
    function TextScrollingEnd () {
       if(this.style.marginLeft  === "0px" )
       {
           this.style.marginLeft = this.nextP + "px";
       }
       else
       {
           this.style.marginLeft = "0px";
       }
    }
}

// 第三题 DOM 构建
let qThree = function () {
    let fragment = document.createDocumentFragment();
    let questionThree = document.createElement("div");
    questionThree.id = "question-three";

    let qZhParaContent = document.createElement("ul");
    qZhParaContent.classList.add("q_zh-para-content");
    questionThree.appendChild(qZhParaContent);

    let qPotion = document.createElement("div");
    qPotion.classList.add("q_potion");
    questionThree.appendChild(qPotion);
    fragment.appendChild(questionThree);

    /* 选项 */
    let itemFmt = document.createDocumentFragment();
    let qpItem = document.createElement("div");
    qpItem.classList.add("q_p-item");

    let spanFlag = document.createElement("span");
    spanFlag.classList.add("q_p-flag");
    qpItem.appendChild(spanFlag);

    let textBox = document.createElement("div");
    textBox.classList.add("q_p-text-box");

    let spanText = document.createElement("span");
    spanText.classList.add("q_p-text");
    textBox.appendChild(spanText);

    let shade = document.createElement("span");
    shade.classList.add("q_p-shade");
    textBox.appendChild(shade);

    qpItem.appendChild(textBox);
    itemFmt.appendChild(qpItem);
    /* 选项END */

    function insideF(item) {
        let fmt = fragment.cloneNode(true);

        /* 释义 */
        if (!item["paraZh"]){fmt.querySelector(".q_zh-para-content").style.display = "none";}

        for (let i in item["paraZh"])
        {
            if (!item["paraZh"].hasOwnProperty(i)) {continue}

            let li = document.createElement("li");
            let span = document.createElement("span");
            span.classList.add("q_zh-property");
            span.appendChild(document.createTextNode(i));
            li.appendChild(span);
            li.appendChild(document.createTextNode(item["paraZh"][i]));
            fmt.querySelector(".q_zh-para-content").appendChild(li);
        }
        /* 释义END */

        /* 选项 */
        let flag = ["A", "B", "C", "D"];
        let correct = selectFrom(0, flag.length - 1);
        let allOption = [learnData.wordData.indexOf(item)];
        let info = {index:-1, cor: correct, options:[]};
        for (let i=0; i < flag.length; i++)
        {
            let iFmt = itemFmt.cloneNode(true);
            iFmt.querySelector(".q_p-flag").appendChild(document.createTextNode(flag[i]));

            if (i === correct)
            {   // 正确的答案
                iFmt.querySelector(".q_p-text").innerHTML = "<span>" + item["word"] + "</span>";
                iFmt.querySelector(".q_p-text").dataset["answer"] = "correct";
            }
            else
            {   // 错误的答案
                let select = selectFrom(0, learnData.wordData.length-1, allOption);
                allOption.push(select);
                iFmt.querySelector(".q_p-text").innerHTML = "<span>" + learnData.wordData[select]["word"] + "</span>";
                iFmt.querySelector(".q_p-text").dataset["answer"] = "wrong";
            }
            info.options.push($(".q_p-item", "one", iFmt));
            fmt.querySelector(".q_potion").appendChild(iFmt);
        }
        /* 选项END */
        $("#question-three", "one", fmt).info = info;
        return fmt
    }

    return insideF;
}();

/* 第三题的键盘事件处理函数 */
function qThreeEventHandle(event) {
    let info = learnData.current.info;
    nextQuestion();
    // switch (true)
    // {
    //     case (info.cor === -1) && (event.keyCode === 13): nextQuestion(); break;
    //     case (info.index === -1) && (event.keyCode !== 9) :
    //     case info.cor === -1 : break;
    //     case event.keyCode === 9:changeOver(); break;
    //     case event.keyCode === 13: confirm(); break;
    // }

    /* 切换选项 */
    function changeOver()
    {
        // 清除样式
        if (info.options[info.index]) {
            $(".q_p-text", "one", info.options[info.index]).style.color = "";
        }
        info.index++;
        if (info.index >= info.options.length) {
            info.index = 0
        }

        // 修改文本颜色
        let qpText = $(".q_p-text", "one", info.options[info.index]);
        qpText.style.color = "#FF9332";
    }

    /* 确定选项 */
    function confirm()
    {
        $(".q_p-shade", "one", info.options[info.cor]).classList.add("q_p-correct");
        if (info.index === info.cor)
        {
            // TODO 播放选择正确的音效
        }
        else
        {
            // TODO 播放选择错误的音效
            $(".q_p-shade", "one", info.options[info.index]).classList.add("q_p-wrong");
        }
        // 将 info.cor 设置成 -1 表示这道题目已做
        info.cor = -1;
    }
}

// keyUp 事件
let keyUpEventEntrust = function (event) {
    switch (learnData.current.id)
    {
        // 交由第一题的键盘事件处理函数
        case "question-one": qOneEventHandle(event); break;
        // 交由第二题的键盘事件处理函数
        case "question-two": qTwoEventHandle(event); break;
        // 交由第三题的键盘事件处理函数
        case "question-three": qThreeEventHandle(event); break;
    }

};

// click 事件
let clickEventEntrust = function (event) {
    let target = event.target,
        classList = target.classList,
        id = target.id;

    switch (true)
    {
        case id === "q_quit":
        case id === "al_home": endLearn(); break;
        case id === "al_again": startLearn(wordDDD);break;
    }
};

// 注册事件
let registrationEvent = function () {
    document.addEventListener("keyup", keyUpEventEntrust, false);
    document.addEventListener("click", clickEventEntrust, false);
    document.onkeypress = document.onkeyup = function (event) {
        if (event.keyCode === 9)
        {
            return false;
        }
    }
};

// 显示学习进度信息板
function showSchedule() {
    let scheduleBox = scheduleBoxTemplate.cloneNode(true);
    document.body.appendChild(scheduleBox);
    setTimeout(function () {
        $("#q_schedule-box").style.top = "0px";
    },50);
}

// 更新学习进度信息板
function updateSchedule() {
    $("#sum").textContent = learnData.sequence.length;
    $("#finish").textContent = learnData.index;
}

// 移除学习进度信息板
function removeSchedule() {
    let scheduleBox = $("#q_schedule-box");
    let tranEnd = function (){
        document.body.removeChild(scheduleBox);
        document.removeEventListener("transitionend", tranEnd, false);
    };
    document.addEventListener("transitionend", tranEnd, false);
    scheduleBox.style.top = "-90px";
}

// 进入下一题
function nextQuestion() {
    // 移除当前题目的 DOM
    if (learnData.current) {
        document.body.removeChild(learnData.current);
        learnData.index++;
        updateSchedule();
    }

    // 准备下一题
    if (learnData.sequence[learnData.index]){
        let wordIndex = learnData.sequence[learnData.index][0];
        let question = learnData.sequence[learnData.index][1];
        let selector = learnData.sequence[learnData.index][2];
        let qDOM = eval(question)(learnData.wordData[wordIndex]);
        learnData.current = $(selector, "one", qDOM);
        document.body.appendChild(qDOM);
    }
    else
    {
        // 完成学习
        accomplishLearn();
    }
}

// 开始学习
function startLearn(data) {
    learnData.wordData = data;
    registrationEvent();
    let group = data.length/12;
    let mapping = {
        1: ["qOne", "#question-one"],
        2: ["qTwo", "#question-two"],
        3: ["qThree", "#question-three"],
    };

    for (let g=1; g <= group; g++)
    {
        for (let i=0; i < 6; i++)
        {   // 第一题
            learnData.sequence.push([data.indexOf(data[g*i]), mapping[1][0], mapping[1][1]])
        }
        for (let i=0; i < 6; i++)
        {   // 第二题
            learnData.sequence.push([data.indexOf(data[g*i]), mapping[2][0], mapping[2][1]])
        }
        for (let i=6; i < 12; i++)
        {   // 第一题
            learnData.sequence.push([data.indexOf(data[g*i]), mapping[1][0], mapping[1][1]])
        }
        for (let i=6; i < 12; i++)
        {   // 第二题
            learnData.sequence.push([data.indexOf(data[g*i]), mapping[2][0], mapping[2][1]])
        }
        for (let i=0; i < 12; i++)
        {   // 第三题
            learnData.sequence.push([data.indexOf(data[g*i]), mapping[3][0], mapping[3][1]])
        }
        for (let i=0, s=selectFrom(1, 3, [3]); i < g*12; i++, s = selectFrom(1, 3, [s]))
        {   // 随机题
            learnData.sequence.push([data.indexOf(data[i]), mapping[s][0], mapping[s][1]]);
        }
    }

    setTimeout(function () {
        showSchedule();
        updateSchedule();
        nextQuestion();
    }, 500)
}

// 完成学习
function accomplishLearn() {
    document.body.appendChild(learnEndTemplate.cloneNode(true));
    learnData.current = $("#accomplish-learn");
    learnData.wordData = null;
    learnData.sequence = [];
    learnData.index = 0;
}

// 结束学习
function endLearn() {
    document.removeEventListener("keyup", keyUpEventEntrust, false);
    document.removeEventListener("click", clickEventEntrust, false);
    document.body.removeChild(learnData.current);
    removeSchedule();
    appInit();
}



