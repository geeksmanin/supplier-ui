const fs = require('fs');
const path = require('path');

function pointInRoundedRect(x, y, rx, ry, rw, rh, rad) {
  if (x < rx || x > rx + rw || y < ry || y > ry + rh) return false;
  const cx = x < rx + rad ? rx + rad : x > rx + rw - rad ? rx + rw - rad : x;
  const cy = y < ry + rad ? ry + rad : y > ry + rh - rad ? ry + rh - rad : y;
  const dx = x - cx;
  const dy = y - cy;
  return (dx * dx + dy * dy) <= rad * rad;
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax, v0y = cy - ay;
  const v1x = bx - ax, v1y = by - ay;
  const v2x = px - ax, v2y = py - ay;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  return (u >= 0) && (v >= 0) && (u + v <= 1);
}

function generatePoints() {
  const step = 0.024;
  const blueBubble = [];
  const greenBubble = [];
  const whiteDots = [];

  // 1. Blue Upper Bubble
  // Main body: centered around (-0.05, -0.15), width 0.58, height 0.32, radius 0.12
  const blueX = -0.34, blueY = -0.30, blueW = 0.58, blueH = 0.30, blueRad = 0.11;
  // Blue speech tail: triangle from (-0.22, 0.0), (-0.10, 0.0), to (-0.26, 0.10)
  
  // 3 Conversation Dots inside Blue Bubble:
  const dot1 = { x: -0.18, y: -0.15, r: 0.038 };
  const dot2 = { x: -0.05, y: -0.15, r: 0.038 };
  const dot3 = { x: 0.08, y: -0.15, r: 0.038 };

  // 2. Green Lower Bubble (interlocking, offset to bottom-right)
  // Main body: centered around (0.12, 0.10), width 0.52, height 0.28, radius 0.10
  const greenX = -0.14, greenY = -0.04, greenW = 0.52, greenH = 0.28, greenRad = 0.10;
  // Green speech tail: triangle from (0.02, 0.24), (0.16, 0.24), to (0.24, 0.36)

  const bluePalette = ['#60A5FA', '#3B82F6', '#2563EB', '#93C5FD', '#1D4ED8'];
  const greenPalette = ['#10B981', '#008069', '#25D366', '#34D399', '#A7F3D0', '#059669'];

  // Sample grid
  for (let x = -0.45; x <= 0.45; x += step) {
    for (let y = -0.40; y <= 0.42; y += step) {
      const rx = Math.round(x * 1000) / 1000;
      const ry = Math.round(y * 1000) / 1000;

      // Check White 3-dots
      const inDot1 = ((rx - dot1.x)**2 + (ry - dot1.y)**2) <= dot1.r**2;
      const inDot2 = ((rx - dot2.x)**2 + (ry - dot2.y)**2) <= dot2.r**2;
      const inDot3 = ((rx - dot3.x)**2 + (ry - dot3.y)**2) <= dot3.r**2;

      if (inDot1 || inDot2 || inDot3) {
        whiteDots.push([rx, ry, '#FFFFFF']);
        continue;
      }

      // Check Green Bubble first (it overlaps in front on the bottom right)
      const inGreenBody = pointInRoundedRect(rx, ry, greenX, greenY, greenW, greenH, greenRad);
      const inGreenTail = pointInTriangle(rx, ry, 0.04, 0.24, 0.18, 0.24, 0.12, 0.35);

      if (inGreenBody || inGreenTail) {
        // Exclude bottom tail overlap with blue
        const color = greenPalette[Math.floor(Math.random() * greenPalette.length)];
        greenBubble.push([rx, ry, color]);
        continue;
      }

      // Check Blue Bubble
      const inBlueBody = pointInRoundedRect(rx, ry, blueX, blueY, blueW, blueH, blueRad);
      const inBlueTail = pointInTriangle(rx, ry, -0.20, 0.0, -0.08, 0.0, -0.24, 0.09);

      if (inBlueBody || inBlueTail) {
        const color = bluePalette[Math.floor(Math.random() * bluePalette.length)];
        blueBubble.push([rx, ry, color]);
      }
    }
  }

  const allPoints = [
    ...blueBubble.map(p => ({ x: p[0], y: p[1], color: p[2], group: 'blue' })),
    ...greenBubble.map(p => ({ x: p[0], y: p[1], color: p[2], group: 'green' })),
    ...whiteDots.map(p => ({ x: p[0], y: p[1], color: p[2], group: 'white' })),
  ];

  console.log(`Generated: Blue=${blueBubble.length}, Green=${greenBubble.length}, White=${whiteDots.length}, Total=${allPoints.length}`);

  const fileContent = `// Auto-generated precision Samwad dual-bubble logo particle coordinates
export interface SamwadLogoPoint {
  x: number;
  y: number;
  color: string;
  group: 'blue' | 'green' | 'white';
}

export const SAMWAD_LOGO_POINTS: SamwadLogoPoint[] = ${JSON.stringify(allPoints, null, 2)};
`;

  const outputPath = path.join(__dirname, '../src/components/samwadLogoPoints.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log('Saved to:', outputPath);
}

generatePoints();
