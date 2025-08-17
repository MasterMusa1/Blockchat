import React from 'react';

const containerStyle = {
    width: '100%',
    maxWidth: '280px',
    fontFamily: 'var(--font-family)',
    fontSize: '0.8rem',
};

const svgStyle = {
    width: '100%',
    overflow: 'visible',
};

const BondingCurveDisplay = ({ percentage = 0 }) => {
    const width = 200;
    const height = 100;
    const padding = 20;

    // Define the curve path (a simple quadratic curve)
    const startX = padding;
    const startY = height - padding;
    const endX = width - padding;
    const endY = padding;
    const controlX = padding;
    const controlY = padding;
    const pathData = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;

    // Function to get a point on the quadratic bezier curve
    const getPointAtPercent = (t) => {
        const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
        const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;
        return { x, y };
    };

    const currentPoint = getPointAtPercent(percentage / 100);
    const point5 = getPointAtPercent(0.05);
    const point20 = getPointAtPercent(0.20);
    
    return (
        <div style={containerStyle}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: '500' }}>Bonding Curve Activity</div>
            <svg viewBox={`0 0 ${width} ${height}`} style={svgStyle}>
                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />

                {/* Curve */}
                <path d={pathData} stroke="var(--primary-color)" strokeWidth="2" fill="none" />
                
                {/* Markers */}
                <line x1={point5.x} y1={point5.y} x2={padding} y2={point5.y} stroke="var(--text-secondary)" strokeWidth="0.5" strokeDasharray="2,2" />
                <text x={padding - 5} y={point5.y + 3} fill="var(--text-secondary)" fontSize="8" textAnchor="end">5%</text>

                <line x1={point20.x} y1={point20.y} x2={padding} y2={point20.y} stroke="var(--text-secondary)" strokeWidth="0.5" strokeDasharray="2,2" />
                <text x={padding - 5} y={point20.y + 3} fill="var(--text-secondary)" fontSize="8" textAnchor="end">20%</text>


                {/* Current Position Dot */}
                <circle cx={currentPoint.x} cy={currentPoint.y} r="4" fill="var(--accent-color)" stroke="var(--surface-color)" strokeWidth="1.5" />
                
                {/* Current Position Line and Text */}
                 <line x1={currentPoint.x} y1={currentPoint.y} x2={currentPoint.x} y2={height - padding} stroke="var(--accent-color)" strokeWidth="1" strokeDasharray="2,2" />
                <text x={currentPoint.x} y={height - padding + 12} fill="var(--accent-color)" fontSize="9" textAnchor="middle" fontWeight="bold">{percentage.toFixed(1)}%</text>

                {/* Labels */}
                <text x={width / 2} y={height} fill="var(--text-secondary)" fontSize="9" textAnchor="middle">Supply Sold</text>
                 <text x={padding - 10} y={height / 2} fill="var(--text-secondary)" fontSize="9" textAnchor="middle" transform={`rotate(-90, ${padding-10}, ${height/2})`}>Price</text>
            </svg>
        </div>
    );
};

export default BondingCurveDisplay;