const fs = require('fs');
let code = fs.readFileSync('components/MediaGrid.tsx', 'utf8');

const badCode = `</div>
}> = ({ mediaItem, isAdmin, onUpdate }) => {`;

const goodCode = `</div>
);

const HotspotEditorOverlay: React.FC<{ mediaItem: MediaItem; isAdmin?: boolean; onUpdate?: (item: MediaItem) => void }> = ({ mediaItem, isAdmin, onUpdate }) => {`;

if (code.includes(badCode)) {
  code = code.replace(badCode, goodCode);
  fs.writeFileSync('components/MediaGrid.tsx', code);
  console.log('Fixed MediaGrid.tsx');
} else {
  console.log('Bad code not found');
}
