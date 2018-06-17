import tornado.web
import tornado.ioloop
import tornado.auth
import os


class BaseHandler(tornado.web.RequestHandler):

    def get_current_user(self):
        return self.get_secure_cookie("username")


class LoginHandler(BaseHandler):

    def get(self, *args, **kwargs):
        self.render("login.html")

    def post(self):
        self.set_secure_cookie("username", self.get_argument("username"))
        self.redirect("/")


class LogoutHandler(BaseHandler):

    def get(self, *args, **kwargs):
        if self.get_argument("logout", None):
            self.clear_cookie("username")
            self.redirect("/")


class WelcomHandler(BaseHandler):

    @tornado.web.authenticated
    def get(self, *args, **kwargs):
        self.render("home.html", user=self.current_user)


class Application(tornado.web.Application):

    def __init__(self):
        handlers = [
            (r"/", WelcomHandler),
            (r"/login", LoginHandler),
            (r"/logout", LogoutHandler),
        ]

        setting = {
            "template_path":os.path.join(os.path.dirname(__file__), "template"),
            "cookie_secret":"bZJc2sWbQLKos6GkHn/VB9oXwQt8S0R0kRvJ5/xJ89E=",
            "xsrf_cookies":True,
            "login_url":"/login"
        }

        tornado.web.Application.__init__(self, handlers=handlers, **setting)


if __name__ == '__main__':
    app = Application()
    app.listen(80)
    tornado.ioloop.IOLoop.instance().start()