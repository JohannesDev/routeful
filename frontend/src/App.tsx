import { useState } from "react";
import "./App.css";
import Dragable from "./Dragable";
import { Direction } from "./routes";
import { create } from "zustand";
import { Place } from "./places";

interface AppState {
  errorMsg: string | null;
  finalRoute: Direction | null;
  suggestions: [Place] | null;
  selected: [Place] | [];
  calculateRoute: () => void;
  searchPlace: (name: string) => void;
}

const useAppStore = create<AppState>((set) => ({
  errorMsg: null,
  finalRoute: null,
  suggestions: null,
  selected: [],
  searchPlace: (name: string) => {},
  calculateRoute: () => {},
}));

function ResultView() {
  const state = useAppStore();
  return (
    <>
      <h1>ResultView</h1>
    </>
  );
}

function App() {
  const state = useAppStore();
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="text-left">
        <h1>Routiful</h1>

        <select name="cars" id="cars" className="mt-2">
          <option value="volvo">Technische Universität Wien </option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </select>

        <div className="mt-4">
          <span>starts at:</span>
          <input
            className="w-fit ml-4 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            id="inline-full-name"
            type="text"
            value="08:00"
          ></input>
        </div>

        <Dragable></Dragable>

        <div>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mt-4">
            Calculate route
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
