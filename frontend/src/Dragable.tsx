import React, { useState, useCallback } from "react";

import List, { ItemDragging } from "devextreme-react/list";

export default function Dragable() {
  return (
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
  );
}
