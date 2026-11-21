import { encode } from 'fast-png';
import fs from 'fs';
import path from 'path';

function generateIcon(size) {
  const data = new Uint8ClampedArray(size * size * 4);
  const center = size / 2;
  const radius = size * 0.44;

  // Background colors: Navy blue gradient
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Rounded squircle mask
      const dx = Math.abs(x - center) / radius;
      const dy = Math.abs(y - center) / radius;
      // superellipse formula |dx|^4 + |dy|^4 <= 1
      const isInside = Math.pow(dx, 4) + Math.pow(dy, 4) <= 1;

      if (isInside) {
        // Gradient from #1E3A8A (Navy) to #2563EB (Royal blue)
        const t = (x + y) / (size * 2);
        data[idx] = Math.round(30 + t * 7);     // R: 30 -> 37
        data[idx + 1] = Math.round(58 + t * 41); // G: 58 -> 99
        data[idx + 2] = Math.round(138 + t * 97);// B: 138 -> 235
        data[idx + 3] = 255;
      } else {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
      }
    }
  }

  // Draw a graduation cap emblem in the center
  // Cap dimensions normalized to size
  const capTopY = center - size * 0.12;
  const capMidY = center - size * 0.02;
  const capBotY = center + size * 0.08;
  const capLeftX = center - size * 0.28;
  const capRightX = center + size * 0.28;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      if (data[idx + 3] === 0) continue;

      // 1. Top Diamond of graduation cap
      // Check if point (x,y) is inside rhombus: top(center, capTopY), bottom(center, capMidY + size*0.08), left(capLeftX, capMidY), right(capRightX, capMidY)
      const dy = y - (capTopY + (capMidY + size * 0.08 - capTopY) / 2);
      const dx = x - center;
      const normX = Math.abs(dx) / (size * 0.28);
      const normY = Math.abs(dy) / (size * 0.10);

      if (normX + normY <= 1) {
        // White cap surface
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }

      // 2. Skull cap / Headband below diamond
      if (y >= capMidY + size * 0.04 && y <= capBotY + size * 0.08) {
        const skullRadiusX = size * 0.16;
        if (Math.abs(x - center) <= skullRadiusX) {
          data[idx] = 241;
          data[idx + 1] = 245;
          data[idx + 2] = 249; // Slate 100
          data[idx + 3] = 255;
        }
      }

      // 3. Tassel (Gold/Amber strand)
      // from center to right side and drops down
      const tasselDropX = center + size * 0.24;
      if (Math.abs(x - tasselDropX) <= size * 0.015 && y >= capMidY && y <= center + size * 0.20) {
        data[idx] = 251;
        data[idx + 1] = 191;
        data[idx + 2] = 36; // Amber-400 #FBBF24
        data[idx + 3] = 255;
      }
      // Tassel knot at center
      if (Math.hypot(x - center, y - (capTopY + size * 0.09)) <= size * 0.025) {
        data[idx] = 245;
        data[idx + 1] = 158;
        data[idx + 2] = 11; // Amber-500 #F59E0B
        data[idx + 3] = 255;
      }
    }
  }

  const png = encode({
    width: size,
    height: size,
    data: new Uint8Array(data.buffer),
  });

  return png;
}

const dir = path.resolve('public');
fs.writeFileSync(path.join(dir, 'pwa-192.png'), generateIcon(192));
fs.writeFileSync(path.join(dir, 'pwa-512.png'), generateIcon(512));
console.log('Successfully generated pwa-192.png and pwa-512.png in public/');
