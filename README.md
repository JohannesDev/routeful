# Routeful

Welcome to Routeful, our innovative solution crafted for the Gastrohackathon 2023 in Salzburg.  
This project is split into two main components: the frontend and the backend, ensuring a seamless and interactive user experience.

## Getting Started

To get started with Routeful, you'll need to set up both the frontend and backend. Follow the instructions below to set up each part.  

### Prerequisites

Before you begin, ensure you have the following installed:  
- [Node.js and npm](https://nodejs.org/en/download/) (for the frontend)  
- [Python 3](https://www.python.org/downloads/) (for the backend)  

### Build the Frontend

Navigate to the frontend directory and install the dependencies, then start the development server:

```bash
cd frontend
npm install
npm run dev
```

This will start the frontend development server, making the frontend accessible via http://localhost:3000 (or a similar local URL).  

### Build the Backend

For the backend, you need to set up a Python virtual environment and install the required dependencies. Additionally, you'll need to provide a Google API key.  

Create a file named APIKEY.txt in the backend directory. Insert your Google API key into this file.  

Navigate to the backend directory, set up the Python virtual environment, and activate it:  

```bash

cd backend
python3 -m venv venv
source venv/bin/activate

```

Install the necessary Python packages:

```bash
pip install -r requirements.txt
```

Start the Flask server with debugging enabled:

```bash
flask --app main run --debug
```

This will start the backend server, typically accessible via http://localhost:5000.
## Contributing
Contributions to Routeful are welcome! If you have suggestions or improvements, feel free to fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. Please see the LICENSE file for more details.
