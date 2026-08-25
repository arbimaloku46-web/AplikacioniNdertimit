const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix the custom-scrollbar bg-[#111] container in BuildingConfigurator
  code = code.replace(
    'className="w-full h-full overflow-hidden custom-scrollbar relative bg-[#111]"',
    'className="flex-1 w-full h-full min-h-0 min-w-0 overflow-hidden relative bg-[#111] flex flex-col"'
  );
  
  // Fix the origin-center w-full h-full container
  code = code.replace(
    'className="flex items-center justify-center p-4 md:p-8 transition-all duration-300 origin-center w-full h-full"',
    'className="flex-1 flex items-center justify-center p-4 md:p-8 transition-all duration-300 origin-center w-full h-full min-h-0 min-w-0"'
  );
  
  // Make sure the wrapper is robust
  // relative inline-block min-h-0 min-w-0 max-w-full max-h-full
  code = code.replace(
    /className="relative flex items-center justify-center min-h-0 min-w-0 max-w-full max-h-full([^"]*)"/g,
    'className="relative flex min-h-0 min-w-0 max-w-full max-h-full$1"'
  );

  fs.writeFileSync(file, code);
}

fixFile('components/BuildingConfigurator.tsx');
console.log('Fixed BuildingConfigurator');

function fixInteractiveViewer(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // InteractiveViewer uses: w-full h-full flex items-center justify-center p-6 md:p-8 absolute inset-0 min-h-0 min-w-0 overflow-hidden
  // Wrapper: relative flex items-center justify-center min-h-0 min-w-0 max-w-full max-h-full
  code = code.replace(
    /className="relative flex items-center justify-center min-h-0 min-w-0 max-w-full max-h-full([^"]*)"/g,
    'className="relative flex min-h-0 min-w-0 max-w-full max-h-full$1"'
  );
  
  fs.writeFileSync(file, code);
}
fixInteractiveViewer('components/InteractiveViewer.tsx');
console.log('Fixed InteractiveViewer');

