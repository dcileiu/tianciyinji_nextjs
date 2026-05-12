interface HomeTitleSvgProps {
  className?: string;
  lines: [string, string, string];
}

const VIEWBOX_WIDTH = 860;
const VIEWBOX_HEIGHT = 76;
const BASELINE_Y = 42;
const FONT_SIZE = 40;

export default function HomeTitleSvg({ className, lines }: HomeTitleSvgProps) {
  const pathIds = ['home-title-path-0', 'home-title-path-1', 'home-title-path-2'] as const;
  const animationIds = ['home-title-d0', 'home-title-d1', 'home-title-d2'] as const;

  return (
    <div aria-hidden="true" className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMinYMid meet"
        className="h-auto w-full overflow-visible"
      >
        {lines.map((line, index) => {
          const begin =
            index === 0 ? `0s;${animationIds[2]}.end` : `${animationIds[index - 1]}.end`;

          return (
            <g key={pathIds[index]}>
              <path id={pathIds[index]} d={`m0,${BASELINE_Y} h0`}>
                <animate
                  id={animationIds[index]}
                  attributeName="d"
                  begin={begin}
                  dur="6000ms"
                  fill="remove"
                  values={`m0,${BASELINE_Y} h0 ; m0,${BASELINE_Y} h${VIEWBOX_WIDTH} ; m0,${BASELINE_Y} h${VIEWBOX_WIDTH} ; m0,${BASELINE_Y} h0`}
                  keyTimes="0;0.66666666666667;0.83333333333333;1"
                />
              </path>
              <text
                fontFamily="'Fira Code', 'JetBrains Mono', 'SF Mono', ui-monospace, monospace"
                fill="#2E97F7"
                fontSize={FONT_SIZE}
                x="0%"
                textAnchor="start"
                letterSpacing="normal"
              >
                <textPath href={`#${pathIds[index]}`} xlinkHref={`#${pathIds[index]}`}>
                  {line}
                </textPath>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
