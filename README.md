# routeful
 
Our solution for the Gastrohackathon 2023 in Salzburg.

## Build the frontend

```
cd frontend
npm install
npm run dev
```

## Build the backend


First create a `APIKEY.txt` in the backend directory and just put the google
api key in there.

```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app main run --debug
```