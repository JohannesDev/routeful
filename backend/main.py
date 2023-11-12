from flask import Flask, request
import requests

app = Flask(__name__)
api_key = open("APIKEY.txt").read()


# Point of interest search
@app.route("/")
def hello_world():
    return "Our custom backend"


# Point of interest search
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
    destinations = request.json.get("destinations", [])

    if len(destinations) < 2:
        return jsonify({"error": "Mindestens zwei Ziele erforderlich"}), 400

    routes = []

    # Iterieren durch jedes Ziel, außer das letzte
    for i in range(len(destinations) - 1):
        start = destinations[i]
        end = destinations[i + 1]

        url = f"https://maps.googleapis.com/maps/api/directions/json?origin={start}&destination={end}&mode=transit&key={api_key}"
        response = requests.get(url)
        result = response.json()

        if result["status"] == "OK":
            routes.append(
                result["routes"][0]
            )  # Nehmen Sie die erste Route (können auch Alternativen sein)
        else:
            return (
                jsonify({"error": f"Kann Route von {start} nach {end} nicht finden"}),
                400,
            )

    return jsonify({"routes": routes})
