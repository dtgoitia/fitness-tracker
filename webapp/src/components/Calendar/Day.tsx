import { SVGProps } from "react";

interface Props {
  text: string;
  x: number;
  y: number;
  daySize: number;
  isHighlighted?: boolean;
}

export function Day({ text, x, y, daySize, isHighlighted }: Props) {
  const rectangleStyle: SVGProps<SVGRectElement> = isHighlighted
    ? { fill: "white", opacity: 0.8 }
    : { fill: "black", opacity: 0.1 };

  const textStyle: SVGProps<SVGTextElement> = isHighlighted
    ? { fill: "black", opacity: 0.7 }
    : { fill: "white", opacity: 0.4 };

  return (
    <>
      <rect
        x={x}
        y={y}
        width={daySize}
        height={daySize}
        stroke="white"
        strokeWidth="1"
        {...rectangleStyle}
      />
      <text
        x={x + 0.5 * daySize}
        y={y + 0.5 * daySize}
        textAnchor="middle"
        alignmentBaseline="middle"
        {...textStyle}
      >
        {text}
      </text>
    </>
  );
}
