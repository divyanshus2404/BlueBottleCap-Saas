import React, { useEffect } from "react";

export const Cursor: React.FC = () => {
  useEffect(() => {
    const cursor = document.querySelector(".custom-cursor") as HTMLElement;
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return <div className="custom-cursor hidden md:block" />;
};
