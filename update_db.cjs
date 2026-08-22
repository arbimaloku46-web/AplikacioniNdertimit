const fs = require('fs');

let content = fs.readFileSync('services/db.ts', 'utf8');

content = content.replace(/let deletedAt = undefined;/, "let deletedAt = undefined;\n  let coordinates = undefined;");
content = content.replace(/deletedAt = meta\.deletedAt;/, "deletedAt = meta.deletedAt;\n      coordinates = meta.coordinates;");
content = content.replace(/deletedAt: deletedAt,/, "deletedAt: deletedAt,\n    coordinates: coordinates,");

content = content.replace(/if \(project\.deletedAt\) \{\n    description \+= META_SEPARATOR \+ JSON\.stringify\(\{ deletedAt: project\.deletedAt \}\);\n  \}/, `let meta: any = {};
  if (project.deletedAt) meta.deletedAt = project.deletedAt;
  if (project.coordinates) meta.coordinates = project.coordinates;
  if (Object.keys(meta).length > 0) {
    description += META_SEPARATOR + JSON.stringify(meta);
  }`);

fs.writeFileSync('services/db.ts', content);
