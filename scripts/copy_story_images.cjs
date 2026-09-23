const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Arnav\\.gemini\\antigravity-ide\\brain\\1f86ec3d-32e1-4e84-a95c-dc4f4b826623';
const destDir = path.join(__dirname, '..', 'public', 'assets', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  { src: 'story_slide1_ratio_intro_1790140063428.jpg', dest: 'slide1-what-is-a-ratio.jpg' },
  { src: 'story_slide2_find_part_1790140082108.jpg', dest: 'slide2-add-the-parts.jpg' },
  { src: 'story_slide3_multiply_shares_1790140102963.jpg', dest: 'slide3-multiply-out.jpg' },
  { src: 'story_slide4_check_total_1790140123443.jpg', dest: 'slide4-check-it.jpg' },
];

files.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${src} -> ${dest}`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
});
