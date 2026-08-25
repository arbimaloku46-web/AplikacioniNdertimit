const imageRatio = 2; // e.g. 2000x1000
const containerWidth = 1000;
const containerHeight = 1000; // containerRatio = 1

const containerRatio = containerWidth / containerHeight;

let renderedWidth, renderedHeight;
if (imageRatio > containerRatio) {
    // image is wider than container, so it will hit the sides first
    renderedWidth = containerWidth;
    renderedHeight = containerWidth / imageRatio;
} else {
    // image is taller than container, so it will hit top/bottom first
    renderedHeight = containerHeight;
    renderedWidth = containerHeight * imageRatio;
}

console.log('rendered width:', renderedWidth, 'rendered height:', renderedHeight);
console.log('offset top:', (containerHeight - renderedHeight) / 2);
console.log('offset left:', (containerWidth - renderedWidth) / 2);
