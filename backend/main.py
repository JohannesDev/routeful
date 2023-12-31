from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import requests, json

app = Flask(__name__)
CORS(app)
api_key = open("APIKEY.txt").read()


# Point of interest search
@app.route("/")
def hello_world():
    return "Our custom backend"


# Point of interest search
@app.route("/search")
def search():
    query = request.args.get("q")
    location = request.args.get("location")

    if not query or not location:
        return {
            "error": "Please provide both 'q' (Query) and 'location' parameters."
        }, 400

    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius=12000&keyword={query}&key={api_key}"

    res = requests.get(url)
    res.headers.add("Access-Control-Allow-Origin", "*")
    return res.json()


@app.post("/calculate")
def calc_route():
    destinations = request.json.get("destinations", [])
    stay_durations = request.json.get("stay_durations", [])  # Stay durations in hours
    start_time_str = request.json.get("start_time", None)  # Start time as a string

    # Convert start time to a datetime object
    try:
        start_time = datetime.fromisoformat(start_time_str)
    except ValueError:
        return (
            jsonify({"error": "Invalid start time format. Please use ISO format."}),
            400,
        )

    if len(destinations) < 2 or len(destinations) != len(stay_durations):
        return (
            jsonify({"error": "Invalid number of destinations or stay durations"}),
            400,
        )

    routes = []
    current_time = start_time  # Update current time

    for i in range(len(destinations) - 1):
        start = destinations[i]
        end = destinations[i + 1]

        # Google Maps API call
        url = f"https://maps.googleapis.com/maps/api/directions/json?origin={start}&destination={end}&mode=transit&departure_time={int(current_time.timestamp())}&key={api_key}"
        response = requests.get(url)
        result = response.json()

        if result["status"] == "OK":
            # Route and travel time
            route_info = result["routes"][0]
            travel_time = route_info["legs"][0]["duration"][
                "value"
            ]  # Travel time in seconds

            # Calculate arrival time at the destination
            arrival_time = current_time + timedelta(seconds=travel_time)
            route_info["arrival_time"] = arrival_time.isoformat()

            # Convert stay duration at the current destination to seconds
            stay_duration_seconds = stay_durations[i] * 3600

            # Update current time for the next starting point
            current_time = arrival_time + timedelta(seconds=stay_duration_seconds)

            routes.append(route_info)
        else:
            return (
                jsonify({"error": f"Cannot find route from {start} to {end}"}),
                400,
            )
    res = jsonify({"routes": routes})
    res.headers.add("Access-Control-Allow-Origin", "*")
    return res


@app.route("/get_llm_response", methods=["POST"])
def get_combined_response():
    data = request.json
    model = data.get("model")
    prompt = data.get("prompt")

    api_url = "http://localhost:11434/api/generate"
    api_data = {"model": model, "prompt": prompt}
    response = requests.post(api_url, json=api_data)
    response.headers.add("Access-Control-Allow-Origin", "*")

    if response.status_code == 200:
        response_parts = response.text.split("\n")

        combined_response = ""
        for part in response_parts:
            if part:
                json_part = json.loads(part)
                combined_response += json_part.get("response", "").replace("\n", "")
                if json_part.get("done"):
                    break

        # Parsen des kombinierten Strings als JSON-Objekt
        try:
            parsed_response = json.loads(combined_response)
            return jsonify(parsed_response)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format in combined response"}), 500
    else:
        return (
            jsonify({"error": "Error in requesting the external API"}),
            response.status_code,
        )
