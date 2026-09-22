import React from 'react';
import { totalParts, fmt } from '../../data/ratioData';

// Renders a ratio as a segmented "bar model" — the classic Singapore-method
// visual for sharing problems. Each ratio number becomes that many equal
// blocks, colour-coded per share. This is the module's equivalent of the
// previous module's NumberLineViewer: one flat, purpose-built 2D SVG reused
// across the Wonder, Simulate and Play phases.
export default function RatioBarViewer({
  parts = [2, 3],
  names = null,
  amount = null,          // when given, each block is labelled with its value
  unit = '',
  width = 640,
  height = 160,
  highlightIndex = null,  // dim every share except this one
  showOnePart = false,    // annotate a single block as "1 part"
  colors = null,
}) {
  const PALETTE = colors || ['#4A90D9', '#FF8A50', '#A78BFA', '#34D399'];
  const tp = totalParts(parts);
  const onePart = amount !== null ? amount / tp : null;

  const padX = 16;
  const labelW = 110;                   // room for the row label on the left
  const barX = padX + labelW;
  const rightPad = amount !== null ? 100 : 20; // room for row total "= XX"
  const barW = width - barX - padX - rightPad;
  const rowH = 38;                      // bold prominent block height
  const gap = 7;                        // gap between rows
  const blockGap = 5;
  const topY = showOnePart ? 24 : 8;    // top margin for annotation

  const maxP = Math.max(...parts, 1);
  const blockW = barW / maxP;           // every block is the exact same width across rows

  const rows = [];

  parts.forEach((p, i) => {
    const y = topY + i * (rowH + gap);
    const color = PALETTE[i % PALETTE.length];
    const dim = highlightIndex !== null && highlightIndex !== i;
    const rowName = names ? names[i] : `Share ${String.fromCharCode(65 + i)}`;

    // Row label (Extra Large & Ultra Bold)
    rows.push(
      <text key={`n-${i}`} x={padX} y={y + rowH / 2 + 7} fill={dim ? 'rgba(255,255,255,0.3)' : color}
        fontSize="20" fontWeight="900" fontFamily="'Fredoka', 'Inter', sans-serif">
        {rowName}
      </text>
    );

    // Equal blocks starting from barX
    for (let b = 0; b < p; b++) {
      const bx = barX + b * blockW;
      rows.push(
        <g key={`b-${i}-${b}`}>
          <rect
            x={bx + blockGap / 2} y={y}
            width={Math.max(2, blockW - blockGap)} height={rowH}
            rx="7"
            fill={color} fillOpacity={dim ? 0.15 : 0.55}
            stroke={dim ? 'rgba(255,255,255,0.18)' : color} strokeWidth="3"
          />
          {amount !== null && blockW > 24 && (
            <text x={bx + blockW / 2} y={y + rowH / 2 + 7} textAnchor="middle"
              fill={dim ? 'rgba(255,255,255,0.3)' : '#ffffff'}
              fontSize={blockW > 45 ? "19" : "16"} fontWeight="900" fontFamily="'Fredoka', 'Inter', sans-serif">
              {fmt(onePart)}
            </text>
          )}
        </g>
      );
    }

    // Total for this row (Extra Large & Ultra Bold)
    if (amount !== null) {
      rows.push(
        <text key={`t-${i}`} x={barX + p * blockW + 12} y={y + rowH / 2 + 7}
          fill={dim ? 'rgba(255,255,255,0.3)' : color}
          fontSize="20" fontWeight="900" fontFamily="'Fredoka', 'Inter', sans-serif">
          = {fmt(p * onePart)}{unit}
        </text>
      );
    }
  });

  // "1 part" annotation on the very first block
  const annotate = [];
  if (showOnePart) {
    const bx = barX;
    annotate.push(
      <g key="onepart">
        <line x1={bx + blockW / 2} y1={topY - 2} x2={bx + blockW / 2} y2={topY - 14} stroke="#ffbe1a" strokeWidth="2.5" />
        <text x={bx + blockW / 2} y={topY - 17} textAnchor="middle" fill="#ffbe1a"
          fontSize="17.5" fontWeight="900" fontFamily="'Fredoka', 'Inter', sans-serif">
          1 part{amount !== null ? ` = ${fmt(onePart)}${unit}` : ''}
        </text>
      </g>
    );
  }

  const contentH = topY + parts.length * (rowH + gap) + 6;

  return (
    <svg
      viewBox={`0 0 ${width} ${contentH + 18}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', margin: '0 auto', overflow: 'visible', width: '100%', maxWidth: `${width}px` }}
    >
      {annotate}
      {rows}

      {/* Total-parts caption under the model (Extra Large, Ultra Bold) */}
      <text x={barX} y={contentH + 13} fill="#ffffff" fontSize="18.5" fontWeight="900" fontFamily="'Fredoka', 'Inter', sans-serif">
        {parts.join(' + ')} = {tp} equal parts{amount !== null ? `  •  total ${fmt(amount)}${unit}` : ''}
      </text>
    </svg>
  );
}
