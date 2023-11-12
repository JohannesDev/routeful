import React, { useState, useRef } from "react";

const ITEMS = [
  { id: 0, label: "Item 1", order: 0 },
  { id: 1, label: "Item 2", order: 1 },
  { id: 2, label: "Item 3", order: 2 },
  { id: 3, label: "Item 4", order: 3 },
  { id: 4, label: "Item 5", order: 4 },
];

export default function Dragable() {
  const draggingPos = useRef(null);
  const dragOverPos = useRef(null);
  const [items, setItems] = useState(ITEMS.sort((a, b) => a.order - b.order));

  const handleDragStart = (position) => {
    draggingPos.current = position;
  };

  const handleDragEnter = (position) => {
    console.log("HELOO");
    dragOverPos.current = position;
    const newItems = [...items];
    const draggingItem = newItems[draggingPos.current];
    if (!draggingItem) return;

    newItems.splice(draggingPos.current, 1);
    newItems.splice(dragOverPos.current, 0, draggingItem);

    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    draggingPos.current = position;
    dragOverPos.current = null;

    setItems(reorderedItems);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="item"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragOver={(e) => e.preventDefault()}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
