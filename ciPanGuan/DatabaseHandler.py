from pymongo import MongoClient
import hashlib, time


class mongoDBBase(object):

    def __init__(self):
        self.client = MongoClient("127.0.0.1", 27017)
        self.db = self.client["ciPanGuan"]


class userDBHandler(mongoDBBase):
    """
    用于操作用户数据
    """
    def __init__(self):
        super(userDBHandler, self).__init__()
        self.user_data = self.db.user_data

    def add_new_user(self, un_id, qq_data):

        # 用户的初始化数据
        user_data_init = {
            "_id" : un_id,
            "qq" : qq_data,
            "wordbooks" : {},
            "currentwb" : {
                "id" : "00",
                "unacc" : [],
                "acced" : [],
                "timeNeeded" : None
            },
            "setting" : {
                "01" : {
                    "name" : "发音选项",
                    "values" : {
                        "英式发音" : False,
                        "美式发音" : True
                    }
                }
            },
            "sumWord" : [],
            "level" : 1,
            "tLearnTime" : 0,
            "tLearnNum" : 0,
            "tLearnWord" : [],
            "reviewNum" : 0,
            "nextReview" : 0,
            "learnq" : "12",
            "sent" : None,
            "startTime" : 0,
            "studyLength" : 0
        }

        # 初始单词本数据
        for wb in self.db.wordbooks.find({}, {"sum"}):
            user_data_init["wordbooks"][wb["_id"]] = {"acced":[]}

        self.user_data.insert_one(user_data_init)

    def find_one_user(self, query, projection):

        return self.user_data.find_one(query, projection)

    def update_user_info(self, query, data):
        self.user_data.update(query, data)

    def visit_init(self):
        """
        当 home.html 被打开时调用此函数, 用于同步客户端和服务器的数据.
        :return: 返回用户数据
        """


class wordDBHandler(mongoDBBase):

    def __init__(self):
        super(wordDBHandler, self).__init__()
        self.word_data = self.db.word_data

    def find_words(self, query, projection):

        return self.word_data.find(query, projection)

    def find_wordbook(self, query, projection):

        return self.db.wordbooks.find(query, projection)



if __name__ == '__main__':
    ub = userDBHandler()
    wd = wordDBHandler()
