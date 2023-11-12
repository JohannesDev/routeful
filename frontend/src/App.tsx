import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Dragable from "./Dragable";

function App() {
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

        <div className="p-4 border border-gray-800 rounded-md text-center grid grid-cols-12 gap-y-4">
          <img
            className="w-10 col-span-1 row-span-3 my-auto"
            src="./public/hamburger.svg"
          ></img>
          <span className="col-span-11">Kunsthistorisches Museum</span>
          <input
            type="range"
            className="col-span-11 transparent h-1.5 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
            id="customRange1"
          />
          <span className="text-left">0h</span>
          <span className="col-span-9"></span>
          <span className="text-right">12h</span>
        </div>

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
