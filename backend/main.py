from flask import Flask, request, jsonify
from datetime import datetime, timedelta
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


@app.post("/calculate")
def calc_route():
    destinations = request.json.get("destinations", [])
    stay_durations = request.json.get("stay_durations", [])  # Verweildauern in Stunden
    start_time_str = request.json.get("start_time", None)  # Startzeitpunkt als String

    # Startzeitpunkt in ein datetime-Objekt umwandeln
    try:
        start_time = datetime.fromisoformat(start_time_str)
    except ValueError:
        return (
            jsonify(
                {"error": "Ungültiges Startzeit-Format. Bitte im ISO-Format angeben."}
            ),
            400,
        )

    if len(destinations) < 2 or len(destinations) != len(stay_durations):
        return jsonify({"error": "Ungültige Anzahl an Zielen oder Verweildauern"}), 400

    routes = []
    current_time = start_time  # Aktuelle Zeit aktualisieren

    for i in range(len(destinations) - 1):
        start = destinations[i]
        end = destinations[i + 1]

        # Google Maps API-Aufruf
        url = f"https://maps.googleapis.com/maps/api/directions/json?origin={start}&destination={end}&mode=transit&departure_time={int(current_time.timestamp())}&key={api_key}"
        response = requests.get(url)
        result = response.json()

        if result["status"] == "OK":
            # Route und Reisezeit
            route_info = result["routes"][0]
            travel_time = route_info["legs"][0]["duration"][
                "value"
            ]  # Reisezeit in Sekunden

            # Ankunftszeit am Ziel berechnen
            arrival_time = current_time + timedelta(seconds=travel_time)
            route_info["arrival_time"] = arrival_time.isoformat()

            # Verweildauer am aktuellen Ziel in Sekunden umrechnen
            stay_duration_seconds = stay_durations[i] * 3600

            # Aktualisieren der aktuellen Zeit für den nächsten Startpunkt
            current_time = arrival_time + timedelta(seconds=stay_duration_seconds)

            routes.append(route_info)
        else:
            return (
                jsonify({"error": f"Kann Route von {start} nach {end} nicht finden"}),
                400,
            )

    return jsonify({"routes": routes})
