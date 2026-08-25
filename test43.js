const imageRatio = 0.5; // e.g. 1000x2000
const containerWidth = 1000;
const containerHeight = 1000; // containerRatio = 1

const containerRatio = containerWidth / containerHeight;

let renderedWidth, renderedHeight;
if (imageRatio > containerRatio) {
    renderedWidth = containerWidth;
    renderedHeight = containerWidth / imageRatio;
} else {
    renderedHeight = containerHeight;
    renderedWidth = containerHeight * imageRatio;
}

console.log('rendered width:', renderedWidth, 'rendered height:', renderedHeight);
console.log('offset top:', (containerHeight - renderedHeight) / 2);
console.log('offset left:', (containerWidth - renderedWidth) / 2);
