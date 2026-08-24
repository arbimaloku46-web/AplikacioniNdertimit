const fs = require('fs');
let code = fs.readFileSync('components/BuildingConfigurator.tsx', 'utf8');

code = code.replace("import { X, Undo, Check, Map, Plus, Trash2, ArrowLeft, Save, ChevronRight, ChevronDown } from 'lucide-react';", 
                    "import { X, Undo, Check, Map, Plus, Minus, Trash2, ArrowLeft, Save, ChevronRight, ChevronDown } from 'lucide-react';");

fs.writeFileSync('components/BuildingConfigurator.tsx', code);
console.log('Added Minus icon');
