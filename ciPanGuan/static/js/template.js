/*************************************************
                  单词详细信息模板
 *************************************************/
let wordDetailedTemplate = document.createDocumentFragment();
let wrap = document.createElement("div");
wrap.id = "word-detailed";
wrap.innerHTML = '<div class="gl_close"><div class="gl_close-1"></div><div class="gl_close-2"></div></div><div class="wd_key-point"><div id="wd_word"></div><div class="wd_phonetic-symbol"><span class="wd_uk-ps-box">UK<span id="wd_uk-ps"></span></span><span class="wd_us-ps-box">US<span id="wd_us-ps"></span></span></div><div id="wd_high-paras"></div></div><div class="wd_main-wrap"><div class="wd_main"><div class="wd_paraphrase-wrap"><div class="wd_para-titles"><span class="wd_title-icon"></span><span id="wd_para_focus" class="wd_zh-para">中文释义</span><span class="wd_en-para">英文释义</span></div><ul id="wd_zh-para-content"></ul><ul id="wd_en-para-content"></ul></div><div class="wd_root"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">词根词缀</span></div><div class="wd_content"></div></div><div class="wd_example"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">例句</span></div><div class="wd_content"></div></div><div class="wd_phrase"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">词组</span></div><div class="wd_content"></div></div><div class="wd_synonym"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">近义词</span></div><div class="wd_content"></div></div><div class="wd_antonym"><div class="wd_title-wrap"><span class="wd_title-icon"></span><span class="wd_title">近义词</span></div><div class="wd_content"></div></div></div><div class="scroll-bar"></div></div>';
wordDetailedTemplate.appendChild(wrap);


/*************************************************
                    我的目标模板
 *************************************************/
let myGoalTemplate = document.createDocumentFragment();
wrap = document.createElement("div");
wrap.id = "my-goal";
wrap.innerHTML = '<h2 class="mg_title">我的目标</h2><div class="gl_close"><div class="gl_close-1"></div><div class="gl_close-2"></div></div><div class="mg_main"><div class="mg_wordbooks"><ul class="mg_classify"></ul><div class="mg_class-wbs-box"><ul class="mg_class-wbs"></ul></div><div class="scroll-bar"></div></div><div class="mg_word-num-box"><div class="mg_add"><div class="mg_1"></div><div class="mg_2"></div></div><p class="mg_text">每天学习多少单词？</p><span class="mg_word-num">N/A</span><div class="mg_sub"><div class="mg_1"></div></div></div></div>';
myGoalTemplate.appendChild(wrap);

// 单词本分类
let wordbookClassTemplate = document.createDocumentFragment();
wrap = document.createElement("li");
wrap.classList.add("mg_classify-item");
wrap.innerHTML = '<span></span>';
wordbookClassTemplate.appendChild(wrap);

// 单词本
let wordbookTemplate = document.createDocumentFragment();
wrap = document.createElement("li");
wrap.dataset["bookId"] = "";
wrap.innerHTML = '<span class="mg_wb-name"></span><span class="mg_word-count"><span class="mg_complete"></span> / <span class="mg_sum"></span></span><span class="mg_select_btn mg_unselected"></span>\n';
wordbookTemplate.appendChild(wrap);


/*************************************************
                      设置模板
 *************************************************/
let settingTemplate = document.createDocumentFragment();
wrap = document.createElement("div");
wrap.id = "setting";
wrap.innerHTML = '<h2 class="sg_title">设置</h2><div class="gl_close"><div class="gl_close-1"></div><div class="gl_close-2"></div></div><div class="sg_main"></div>';
settingTemplate.appendChild(wrap);

// 设置项
let optionTemplate = document.createDocumentFragment();
wrap = document.createElement("div");
wrap.classList.add("sg_option");
wrap.innerHTML = '<span class="sg_option-text"></span><div class="sg_values"></div>';
optionTemplate.appendChild(wrap);

// 设置项子选项
let valueTemplate = document.createDocumentFragment();
wrap = document.createElement("div");
wrap.classList.add("sg_value");
wrap.innerHTML = '<div class="sg_radio-box"><div class="sg_radio"></div></div><span class="sg_radio-text"></span>';
valueTemplate.appendChild(wrap);


/*************************************************
                    学习新词模板
 *************************************************/
// 学习进度信息板模板
let scheduleBoxTemplate = document.createDocumentFragment();
wrap = document.createElement("div");
wrap.id = "q_schedule-box";
wrap.innerHTML = '<div id="q_count"><span id="finish"></span>/<span id="sum"></span></div><a href="#" id="q_quit" ondragstart="return false">退出</a>';
scheduleBoxTemplate.appendChild(wrap);

// 学习完成时模板
let learnEndTemplate = document.createDocumentFragment();
wrap = document.createElement("div");
wrap.id = "accomplish-learn";
wrap.innerHTML = '<span class="al_text">已完成今日的学习</span><div class="al_btn-box"><a id="al_home">返回主页</a></div>';
learnEndTemplate.appendChild(wrap);


/*************************************************
                     其他部件模板
 *************************************************/
// alert 弹窗
let alertWinTemplate = document.createDocumentFragment();
wrap = document.createElement("div");
wrap.classList.add("gl_msg-box");
wrap.innerHTML = '<span class="gl_msg-text"></span><a class="gl_msg-btn">确定</a>';
alertWinTemplate.appendChild(wrap);

wrap = null;