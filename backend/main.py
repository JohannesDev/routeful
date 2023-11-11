from flask import Flask, request
import requests

app = Flask(__name__)
api_key = open("APIKEY.txt").read()


# Point of intrest search
@app.route("/search")
def hello_world():
    query = request.args["q"]
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=48.210033,16.363449&radius=12000&keyword={query}&key={api_key}"
    res = requests.get(url)
    return res.json()
