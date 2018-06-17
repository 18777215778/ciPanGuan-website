/*************************************************
                  单词详细信息模板
 *************************************************/
let wordDetailedTemplate = document.createDocumentFragment();
let wordDetailed = document.createElement("div");
wordDetailed.id = "word-detailed";
wordDetailed.innerHTML = '<div class="gl_close"><div class="gl_close-1"></div><div class="gl_close-2"></div></div><div class="wd_key-point"><div id="wd_word"></div><div class="wd_phonetic-symbol"><span class="wd_uk-ps-box">UK<span id="wd_uk-ps"></span></span><span class="wd_us-ps-box">US<span id="wd_us-ps"></span></span></div><div id="wd_high-paras"></div></div><div class="wd_main-wrap"><div class="wd_main"><div class="wd_paraphrase-wrap"><div class="wd_para-titles"><span class="wd_title-icon"></span><span id="wd_para_focus" class="wd_zh-para">中文释义</span><span class="wd_en-para">英文释义</span></div><ul id="wd_zh-para-content"></ul><ul id="wd_en-para-content"></ul></div><div class="wd_root"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">词根词缀</span></div><div class="wd_content"></div></div><div class="wd_example"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">例句</span></div><div class="wd_content"></div></div><div class="wd_phrase"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">词组</span></div><div class="wd_content"></div></div><div class="wd_synonym"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">近义词</span></div><div class="wd_content"></div></div><div class="wd_antonym"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">近义词</span></div><div class="wd_content"></div></div></div><div class="scroll-bar"></div></div>';
wordDetailedTemplate.appendChild(wordDetailed);


/*************************************************
                    我的目标模板
 *************************************************/
let myGoalTemplate = document.createDocumentFragment();
let myGoal = document.createElement("div");
myGoal.id = "my-goal";
myGoal.innerHTML = '<h2 class="mg_title">我的目标</h2><div class="gl_close"><div class="gl_close-1"></div><div class="gl_close-2"></div></div><div class="mg_main"><div class="mg_wordbooks"><ul class="mg_classify"><li id="mg_class-focus" class="mg_classify-item"><span id="mg_classify-icon"></span>应试考试</li><li class="mg_classify-item"><span></span>专业词汇</li><li class="mg_classify-item"><span></span>分频词汇</li><li class="mg_classify-item"><span></span>其他</li></ul><div class="mg_class-wbs-box"><ul class="mg_class-wbs"></ul></div><div class="scroll-bar"></div></div><div class="mg_word-num-box"><div class="mg_add"><div class="mg_1"></div><div class="mg_2"></div></div><p class="mg_text">每组单词量是多少？</p><span class="mg_word-num">24</span><div class="mg_sub"><div class="mg_1"></div></div></div></div>';
myGoalTemplate.appendChild(myGoal);

// 单词本分类
let wordbookClassTemplate = document.createDocumentFragment();
let wbClass = document.createElement("li");
wbClass.classList.add("mg_classify-item");
wbClass.innerHTML = '<span></span>';
wordbookClassTemplate.appendChild(wbClass);

// 单词本
let wordbookTemplate = document.createDocumentFragment();
let wordbook = document.createElement("li");
wordbook.dataset["dataBookId"] = "";
wordbook.innerHTML = '<span class="mg_wb-name"></span><span class="mg_word-count"><span class="mg_complete"></span> / <span class="mg_sum"></span></span><span class="mg_select_btn mg_unselected"></span>\n';
wordbookTemplate.appendChild(wordbook);


/*************************************************
                      设置模板
 *************************************************/
let settingTemplate = document.createDocumentFragment();
let setting = document.createElement("div");
setting.id = "setting";
setting.innerHTML = '<h2 class="sg_title">设置</h2><div class="gl_close"><div class="gl_close-1"></div><div class="gl_close-2"></div></div><div class="sg_main"></div>';
settingTemplate.appendChild(setting);

// 设置项
let optionTemplate = document.createDocumentFragment();
let option = document.createElement("div");
option.classList.add("sg_option");
option.innerHTML = '<div class="sg_option" data-option=""><span class="sg_option-text"></span><div class="sg_values"></div></div>';
optionTemplate.appendChild(option);

// 设置项子选项
let valueTemplate = document.createDocumentFragment();
let value = document.createElement("div");
value.classList.add("sg_value");
value.innerHTML = '<div class="sg_radio-box"><div class="sg_radio sg_true"></div></div><span class="sg_radio-text"></span>';
valueTemplate.appendChild(value);


/*************************************************
                    学习新词模板
 *************************************************/
// 学习进度信息板模板
let scheduleBoxTemplate = document.createDocumentFragment();
let scheduleBox = document.createElement("div");
scheduleBox.id = "q_schedule-box";
scheduleBox.innerHTML = '<div id="q_count"><span id="finish"></span>/<span id="sum"></span></div><a href="#" id="q_quit" ondragstart="return false">退出</a>';
scheduleBoxTemplate.appendChild(scheduleBox);

// 学习完成时模板
let learnEndTemplate = document.createDocumentFragment();
let learnEnd = document.createElement("div");
learnEnd.id = "accomplish-learn";
learnEnd.innerHTML = '<span class="al_text">已完成今日的学习</span><div class="al_btn-box"><a id="al_again">再来一组</a><a id="al_home">返回主页</a></div>';
learnEndTemplate.appendChild(learnEnd);


/*************************************************
                     其他部件模板
 *************************************************/
// alert 弹窗
let alertWinTemplate = document.createDocumentFragment();
let alertWin = document.createElement("div");
alertWin.classList.add("gl_msg-box");
alertWin.innerHTML = '<span class="gl_msg-text"></span><a class="gl_msg-btn">确定</a>';
alertWinTemplate.appendChild(alertWin);
