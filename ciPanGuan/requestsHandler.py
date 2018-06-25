import tornado.web
import tornado.websocket
import tornado.ioloop
import tornado.gen
from tornado.concurrent import run_on_executor
from concurrent.futures import ThreadPoolExecutor
from DatabaseHandler import userDBHandler
from mainHandlers import MainHandlers
from QQLoginAPI import QQLoginAPI
import os, hashlib, urllib.parse, uuid, json, time, functools

LOGIN_USER = {}


class BaseHandler(tornado.web.RequestHandler):
    """
    代替 tornado.web.RequestHandler 成为请求处理函数的基类
    """
    def get_current_user(self):
        return self.get_secure_cookie("un_id")


class LoginHandler(BaseHandler):

    def get(self, *args, **kwargs):
        self.render("login.html")


class QQLoginHandler(BaseHandler):

    @tornado.gen.coroutine
    def get(self, *args, **kwargs):

        # 跳转QQ登录页面
        if self.get_argument("login", None):
            self.__redirectToQQ()

        # 如果 URL 中有 Authorization Code 值说明用户已授权
        if self.get_argument("code", None):
            self.__startToLoginQQ()

    @tornado.gen.coroutine
    def __redirectToQQ(self):

        id = str(uuid.uuid4())
        LOGIN_USER[id] = {}
        LOGIN_USER[id]["state"] = id
        para = urllib.parse.urlencode({
            "response_type": "code",
            "client_id": self.application.qq_api.client_id,
            "redirect_uri": self.application.qq_api.redirect_uri,
            "state": LOGIN_USER[id]["state"],
            "scope": "get_user_info"
        })
        return self.redirect("https://graph.qq.com/oauth2.0/authorize?{}".format(para))

    @tornado.gen.coroutine
    def __startToLoginQQ(self):
        '''

        :return:
        '''
        code = self.get_argument("code")
        state = self.get_argument("state")
        if (not LOGIN_USER) or (state not in LOGIN_USER):
            self.__404()
            return

        # 获取 access_token、refresh_token 值
        data = self.application.qq_api.get_Access_Token(code)
        if not data: self.__404(state)
        access_token, refresh_token = data[0]
        LOGIN_USER[state]["access_token"] = access_token
        LOGIN_USER[state]["refresh_token"] = refresh_token

        # 获取 client_id、openid 值
        data = self.application.qq_api.get_open_ID(access_token)
        if not data: self.__404(state)
        client_id, openid = data[0]
        LOGIN_USER[state]["client_id"] = client_id
        LOGIN_USER[state]["openid"] = openid

        # 获取用户数据（昵称、头像等）
        user_info = self.application.qq_api.get_user_info(access_token, openid)
        if user_info["ret"] < 0: self.__404(state)
        LOGIN_USER[state]["user_info"] = user_info

        del LOGIN_USER[state]["state"]

        # 设置 Cookie
        hl = hashlib.md5()
        hl.update(openid.encode())
        un_id = hl.hexdigest()
        user_data = self.application.ud.find_one_user({"_id": un_id}, {"_id": True})
        if (not user_data):
            self.application.ud.add_new_user(un_id, LOGIN_USER[state])

        self.set_secure_cookie("un_id", un_id)
        self.redirect("/")

        # 删除对应的登录信息，释放内存
        del LOGIN_USER[state]

        return

    def __404(self, id=None):
        if id: del LOGIN_USER[id]
        self.set_status(404)


class LogoutHandler(BaseHandler):

    def get(self, *args, **kwargs):
        self.clear_all_cookies()
        self.redirect("/login")


class HttpHandler(BaseHandler):

    @tornado.web.authenticated
    def get(self, *args, **kwargs):
        un_id = self.get_secure_cookie("un_id")
        user_info = self.application.ud.find_one_user({"_id":un_id.decode()}, {"_id":False, "qq":True, "sent": True})

        self.render("index.html", **user_info["qq"]["user_info"], sent=user_info["sent"])


class SocketHandler(tornado.websocket.WebSocketHandler, BaseHandler):
    executor = ThreadPoolExecutor(10)

    @tornado.web.authenticated
    def open(self, *args, **kwargs):

        un_id = self.get_secure_cookie("un_id")
        un_id = un_id.decode()
        ui = self.application.ud.find_one_user({"_id":un_id}, {
            "_id":False,
            "tLearnTime":True,
            "tLearnNum":True,
            "tLearnWord":True,
            "reviewNum":True,
            "nextReview":True,
            "startTime":True,
            "studyLength":True
        })
        today = MainHandlers.get_today()
        month = time.strftime("%y-%m", time.localtime(today))

        # 判断是否是今天
        if ui["tLearnTime"] != MainHandlers.get_today():
            ui["tLearnNum"] = 0
            ui["tLearnWord"] = []
            ui["reviewNum"] = 0
            ui["nextReview"] = 0

        # 判断是否为本月
        if month != time.strftime("%y-%m", time.localtime(today-86400)):
            ui["studyLength"] = 0

        ui["startTime"] = int(time.time())

        self.application.ud.update_user_info({"_id": un_id}, {"$set": ui})

        callbacks = [
            {"callback":"update.learnInfo", "data":MainHandlers.show_learn_info(un_id)},
            {"callback":"update.crop", "data":MainHandlers.show_my_wordbook(un_id)},
            {"callback":"update.sumWord", "data":MainHandlers.show_my_sum_word(un_id)}
        ]

        self.write_message(json.dumps(callbacks))

    @tornado.web.authenticated
    def on_message(self, message):
        if message == "ping": return

        msgs = json.loads(message)
        un_id = self.get_secure_cookie("un_id")
        un_id = un_id.decode()

        tornado.ioloop.IOLoop.instance().add_callback(functools.partial(self.__loop_work, **{"un_id": un_id, "msgs":msgs}))

    def on_close(self):
        un_id = self.get_secure_cookie("un_id")
        un_id = un_id.decode()
        ui = self.application.ud.find_one_user({"_id": un_id}, {"_id": False, "studyLength":True, "startTime": True})
        studyLength = ui["studyLength"] + (int(time.time()) - ui["startTime"])
        self.application.ud.update_user_info({"_id":un_id}, {"$set":{"studyLength":studyLength}})

    @run_on_executor
    @tornado.gen.coroutine
    def __loop_work(self, un_id, msgs):

        for i in range(len(msgs)):
            msgs[i] = self.__work(un_id, msgs[i])

        self.write_message(json.dumps(msgs))

    def __work(self, un_id, msg):

        if msg["qNo"] == "01":
            # 显示我的目标板板块
            msg["data"] = MainHandlers.show_my_goal(un_id)
            return msg

        elif msg["qNo"] == "02":
            # 修改我的目标
            msg["data"] = MainHandlers.update_my_goal(un_id, msg["data"])
            if msg["data"]:
                return msg
            else:
                msg["callback"] = None
                return msg

        elif msg["qNo"] == "03":
            # 查看当前正在学习的单词本的进度
            msg["data"] = MainHandlers.show_my_wordbook(un_id)
            return msg

        elif msg["qNo"] == "04":
            # 查看总单词量
            msg["data"] = MainHandlers.show_my_sum_word(un_id)
            return msg

        elif msg["qNo"] == "05":
            # 学习新词
            msg["data"] = MainHandlers.learn_new_words(un_id)
            if msg["data"] == 1:
                msg["callback"] = "eventImitate.openMyGoal"
            elif msg["data"] == 2:
                msg["callback"] = None
            return msg

        elif msg["qNo"] == "06":
            # 查看设置
            msg["data"] = MainHandlers.show_my_setting(un_id)
            return msg

        elif msg["qNo"] == "07":
            # 修改设置
            msg["data"] = MainHandlers.update_my_setting(un_id, msg["data"])
            return msg

        elif msg["qNo"] == "08":
            # 显示学习信息
            msg["data"] = MainHandlers.show_learn_info(un_id)
            return msg

        elif msg["qNo"] == "09":
            # 修改鸡汤
            msg["data"] = MainHandlers.update_sentence(un_id, msg["data"])
            return msg

        elif msg["qNo"] == "10":
            # 更新今日新学
            msg["data"] = MainHandlers.update_today_learn(un_id)
            return msg

        elif msg["qNo"] == "11":
            # 获取一个单词的信息
            msg["data"] = MainHandlers.get_one_word(msg["data"])
            return msg

        elif msg["qNo"] == "12":
            # 获取所有已学单词列表
            msg["data"] = MainHandlers.get_sum_word(un_id)
            return msg

        elif msg["qNo"] == "13":
            # 复习
            msg["data"] = MainHandlers.review(un_id)
            return msg

        elif msg["qNo"] == "14":
            # 完成复习
            msg["data"] = MainHandlers.update_review(un_id)
            return msg
        

class Application(tornado.web.Application):

    def __init__(self):

        handlers = [
            (r"/", HttpHandler),
            (r"/socket", SocketHandler),
            (r"/login", LoginHandler),
            (r"/login/qqlogin", QQLoginHandler),
            (r"/logout", LogoutHandler)
        ]

        setting = {
            "template_path": os.path.join(os.path.dirname(__file__), "templates"),
            "static_path": os.path.join(os.path.dirname(__file__), "static"),
            "login_url": "/login",
            "cookie_secret": "123",
        }

        self.ud = userDBHandler()
        self.qq_api = QQLoginAPI()

        tornado.web.Application.__init__(self, handlers=handlers, **setting)


if __name__ == '__main__':
    app = Application()
    app.listen(80)
    tornado.ioloop.IOLoop.instance().start()
