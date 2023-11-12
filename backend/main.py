from flask import Flask, request
import requests

app = Flask(__name__)
api_key = open("APIKEY.txt").read()


# Point of intrest search
@app.route("/")
def hello_world():
    return "Our custom backend"


# Point of intrest search
@app.route("/search")
def search():
    query = request.args["q"]
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=48.210033,16.363449&radius=12000&keyword={query}&key={api_key}"
    res = requests.get(url)
    return res.json()


# You get a list of names of destinations and you just request them all and
# merge them into one. It doesn't matter if the response is huge we can render
# that in the frontend.
@app.post("/calculate")
def calc_route():
    # TODO: Implement
    return "oh something or another or so"
