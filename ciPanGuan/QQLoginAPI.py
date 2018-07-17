import urllib.parse, re, json
import tornado.web
import tornado.ioloop
import tornado.httpclient


class QQLoginAPI(object):

    def __init__(self):
        self.client = tornado.httpclient.HTTPClient()
        self.client_id = "101486278"
        self.client_secret = "9656aafc7c20cc749e7fa1f976bf346c"
        self.redirect_uri = "http://www.cipanguan.xin/login/qqlogin"

    def get_Access_Token(self, code):
        para = urllib.parse.urlencode({
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri
        })
        url = "https://graph.qq.com/oauth2.0/token?{}".format(para)
        response = self.client.fetch(url)
        return re.findall("access_token=([A-Z\d]{32}).+refresh_token=([A-Z\d]{32})", response.body.decode("utf-8"))

    def get_open_ID(self, access_token):
        para = urllib.parse.urlencode({"access_token": access_token})
        url = "https://graph.qq.com/oauth2.0/me?{}".format(para)
        response = self.client.fetch(url)
        return re.findall('''"client_id":"([\d]{9}).+"openid":"([A-Z\d]{32})''', response.body.decode("utf-8"))

    def get_user_info(self, access_token, openid):
        para = urllib.parse.urlencode({
            "access_token": access_token,
            "oauth_consumer_key": self.client_id,
            "openid": openid
        })
        url = "https://graph.qq.com/user/get_user_info?{}".format(para)
        response = self.client.fetch(url)
        return json.loads(response.body.decode("utf-8"))