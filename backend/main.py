from flask import Flask, request

app = Flask(__name__)
api_key = open("APIKEY.txt").read()


# Point of intrest search
@app.route("/search")
def hello_world():
    query = request.args["q"]
    return "flotschi"
