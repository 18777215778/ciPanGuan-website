from DatabaseHandler import *
from parameter import *
import math, time, random, json, pickle

class MainHandlers(object):

    ud = userDBHandler()
    wd = wordDBHandler()

    @classmethod
    def learn_new_words(cls, id):

        unwb_info = cls.ud.find_one_user({"_id":id}, {"_id":False, "currentwb":True, "learnq":True, "tLearnWord":True, "tLearnNum":True})

        if unwb_info["currentwb"]["id"] == "00": return 1
        if unwb_info["tLearnNum"] > 0: return 2

        word_arr = []

        # 构建查询语句
        query = []

        if (len(unwb_info["tLearnWord"]) > 0):
            for w in unwb_info["tLearnWord"][-1]:
                query.append({"word": w})
        else:
            for i in range(int(unwb_info["learnq"])):
                try:
                    word = unwb_info["currentwb"]["unacc"][i]
                    query.append({"word":word})
                    word_arr.append(word)
                except IndexError:
                    pass

        # 当单词数量不够时, 从已学单词中随机抽抽取, 直到单词数量满足指定的数量
        while len(query) < int(unwb_info["learnq"]):
            word = {"word": random.choice(unwb_info["currentwb"]["acced"])}
            if word not in query:
                query.append({"word":word})
                word_arr.append(word)

        # 获取待学但单词的数据
        words_info = [w for w in cls.wd.find_words({"$or":query}, {"_id":False, "lastTime":False})]

        # 将本次学习的单词添加到今日新学
        if word_arr: unwb_info["tLearnWord"].append(word_arr)
        cls.ud.update_user_info({"_id":id}, {
            "$set":{"tLearnWord":unwb_info["tLearnWord"],
                    "tLearnTime":cls.get_today()
                    }
        })

        return words_info

    @classmethod
    def update_today_learn(cls, id):

        # 从数据库中取出需要的数据
        ui = cls.ud.find_one_user({"_id":id}, {"_id":False, "tLearnNum":True, "tLearnWord":True, "nextReview":True})

        # 更新今日新学的单词量
        ui["tLearnNum"] += len(ui["tLearnWord"][-1])

        # 更新下次复习的时间
        ui["nextReview"] = int(time.time()) + 3600 * 4

        # 更新所有已修改的数据
        cls.ud.update_user_info({"_id":id}, {"$set":ui})

        return None

    @classmethod
    def review(cls, id):
        ui = cls.ud.find_one_user({"_id": id}, {"_id": False, "tLearnWord":True})
        query = []
        for w in ui["tLearnWord"][-1]:
            query.append({"word":w})
        words_info = [w for w in cls.wd.find_words({"$or": query}, {"_id": False, "lastTime": False})]

        return words_info

    @classmethod
    def update_review(cls, id):
        ui = cls.ud.find_one_user({"_id": id}, {"_id": False, "qq": False, "setting": False})

        ui["reviewNum"] += 1
        ui["nextReview"] = int(time.time()) + 3600 * 4

        # 当完成两次复习后
        if ui["reviewNum"] >= 2:
            # 更新所有的单词本和词汇量的数据
            wbs = [w for w in cls.wd.find_wordbook({}, None)]
            for w in ui["tLearnWord"][-1]:
                if w in ui["sumWord"]: continue

                ui["sumWord"].append({"word": w})
                ui["currentwb"]["acced"].append(w)
                ui["currentwb"]["unacc"].remove(w)

                for wb in wbs:
                    if (w in wb["words"]):
                        ui["wordbooks"][wb["_id"]]["acced"].append(w)

            # 更新等级
            if len(ui["sumWord"]) > WORD_QUANTITY_GRADE[ui["level"]]:
                ui["level"] += 1

        cls.ud.update_user_info({"_id": id}, {"$set": ui})

        return None

    @classmethod
    def show_my_goal(cls, id):

        wbk_data = cls.wd.find_wordbook({}, {"words": False})
        user_wbk = cls.ud.find_one_user({"_id":id}, {"wordbooks": True, "currentwb": True, "learnq": True})
        wbks = {}

        for wbk in wbk_data:
            if wbk["class"] not in wbks:
                wbks[wbk["class"]] = []

            item = {
                "id": wbk["_id"],
                "name": wbk["name"],
                "accedNum":  len(user_wbk["wordbooks"][wbk["_id"]]["acced"]) if user_wbk["wordbooks"].get(wbk["_id"]) else "N\A",
                "sum": wbk["sum"],
            }
            wbks[wbk["class"]].append(item)

        return {"wb_data":wbks, "word_num":user_wbk["learnq"], "selected":user_wbk["currentwb"]["id"]}

    @classmethod
    def update_my_goal(cls, id, data):
        
        word_num = data["word_num"]
        selected = data["selected"]
        wordbook = None
        return_data = {}

        try:
            # 验证参数是否合法
            if 12 > int(word_num) or int(word_num)  > 120:
                return False
            wordbook = [i for i in cls.wd.find_wordbook({"_id":selected}, None)][0]
        except:
            return None

        un_info = cls.ud.find_one_user({"_id":id}, {"_id": False, "wordbooks": True, "currentwb":True, "learnq": True})

        # 更新数据
        if (un_info["currentwb"]["id"] != selected) or (un_info["learnq"] != word_num):
            un_info["currentwb"]["id"] = selected
            un_info["learnq"] = word_num
            if selected in un_info["wordbooks"]:
                un_info["currentwb"]["acced"] = un_info["wordbooks"][selected]["acced"]
            else:
                un_info["currentwb"]["acced"] = []
            un_info["currentwb"]["unacc"] = [w for w in wordbook["words"] if w not in un_info["wordbooks"][selected]["acced"]]
            un_info["currentwb"]["timeNeeded"] = math.ceil(len(un_info["currentwb"]["unacc"]) / int(un_info["learnq"])) * 86400
            del un_info["wordbooks"]

            cls.ud.update_user_info({"_id":id}, {"$set":un_info})
        return cls.show_my_wordbook(id)

    @classmethod
    def show_my_wordbook(cls, id):
        return_data = dict()
        current_wb = cls.ud.find_one_user({"_id":id}, {"_id":False, "currentwb":True})["currentwb"]

        if(current_wb["id"] == "00"):
            return_data["wbName"] = "先给自己定个目标吧!"
            return_data["scale"] = [0, 1]
            return_data["predict"] = ""
            return return_data

        wb_name = [w for w in cls.wd.find_wordbook({"_id":current_wb["id"]}, {"_id":False, "name":True})][0]

        return_data["wbName"] = wb_name["name"]
        return_data["scale"] = [len(current_wb["acced"]), len(current_wb["unacc"]) + len(current_wb["acced"])]
        return_data["predict"] = cls.compute_ect(current_wb["timeNeeded"])

        return return_data

    @classmethod
    def show_my_sum_word(cls, id):
        word_sum = cls.ud.find_one_user({"_id":id}, {"_id":False, "sumWord":True, "level":True})
        current_num = len(word_sum["sumWord"])
        next_level_num = WORD_QUANTITY_GRADE[word_sum["level"]]

        return_data = dict()
        return_data["level"] = word_sum["level"]
        return_data["scale"] = [current_num, next_level_num]

        return return_data

    @classmethod
    def show_my_setting(cls, id):

        return cls.ud.find_one_user({"_id":id}, {"_id":False, "setting":True})["setting"]

    @classmethod
    def update_my_setting(cls, id, data):
        cls.ud.update_user_info({"_id":id}, {"$set":{"setting":data}})
        return None

    @classmethod
    def show_learn_info(cls, id):
        learn_info = cls.ud.find_one_user({"_id":id}, {"_id":False, "tLearnNum":True, "reviewNum":True, "nextReview":True, "studyLength":True})

        return_data = dict()
        reviewNum = learn_info["reviewNum"]
        nextReview = learn_info["nextReview"]
        tLearnNum = learn_info["tLearnNum"]

        if reviewNum < 2 and tLearnNum > 0:
            c_down = int(time.time()) - nextReview
            if (c_down < 0):
                return_data["Countdown"] = ['下次复习时间在 <span id="lib-time"></span> 后', nextReview]
                return_data["btnText"] = ["复习", False]
            else:
                return_data["Countdown"] = ['<span id="lib-time">-</span>', None]
                return_data["btnText"] = ["复习", True]
        else:
            if tLearnNum == 0:
                return_data["Countdown"] = ['<span id="lib-time">-</span>', None]
                return_data["btnText"] = ["学习新词", True]
            else:
                return_data["Countdown"] = ['今日的学习任务已<span id="lib-time"> 完成!</span>', None]
                return_data["btnText"] = ["学习新词", False]

        return_data["reviewNum"] = reviewNum
        return_data["tLearnNum"] = tLearnNum
        return_data["reviewNum"] = reviewNum
        return_data["studyLength"] = round(learn_info["studyLength"]/3600, 1)

        return return_data

    @classmethod
    def update_sentence(cls, id, data):

        cls.ud.update_user_info({"_id":id}, {"$set":{"sent":data[:30]}})

    @classmethod
    def get_sum_word(cls, id):

        sum_word = cls.ud.find_one_user({"_id":id}, {"_id":False, "sumWord":True, "tLearnWord":True})
        word_list = sum_word["sumWord"]
        if len(sum_word["tLearnWord"]) > 0:
            word_list.extend([{"word":w} for w in sum_word["tLearnWord"][-1]])

        return word_list

    @classmethod
    def get_my_wordbook_id(cls, id):
        currentwb = cls.ud.find_one_user({"_id":id}, {"_id":False, "currentwb":True})
        return currentwb["currentwb"]["id"]

    @classmethod
    def get_my_learned_word(cls, id):
        return cls.ud.find_one_user({"_id":id}, {"_id":False, "sumWord":True})

    @classmethod
    def get_one_word(cls, word):
        word_info = [w for w in cls.wd.find_words({"word":word}, {"_id":False, "lastTime":False})][0]
        return word_info

    @classmethod
    def compute_ect(cls, time_needed):
        ect = time_needed + int(time.time())
        return "{}年{}月{}日".format(*time.strftime("%Y-%m-%d", time.localtime(ect)).split("-"))

    @classmethod
    def get_today(cls):
        date = time.strftime("%Y-%m-%d", time.localtime(time.time()))
        return int(time.mktime(time.strptime(date, "%Y-%m-%d")))



if __name__ == '__main__':
    # MainHandlers.learn_new_words("217289c0b19e720bbaba70054a2f20cb")
    print(MainHandlers.get_today())