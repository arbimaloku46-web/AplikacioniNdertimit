const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

if (!code.includes("const [isNavigating, setIsNavigating] = useState(false);")) {
  code = code.replace(
    "const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);",
    "const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);\n  const [isNavigating, setIsNavigating] = useState(false);"
  );
  
  // When opening a project
  code = code.replace(
    `    setActiveProject(pCopy);
    setActiveUpdateIndex(firstIndex);
    setCurrentView(AppView.PROJECT_DETAIL);`,
    `    setActiveProject(pCopy);
    setActiveUpdateIndex(firstIndex);
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      setCurrentView(AppView.PROJECT_DETAIL);
    }, 600);`
  );
  
  // Also when going back to home?
  code = code.replace(
    `setActiveProject(null);
          setCurrentView(AppView.HOME);`,
    `setIsNavigating(true);
          setTimeout(() => {
            setActiveProject(null);
            setCurrentView(AppView.HOME);
            setIsNavigating(false);
          }, 400);`
  );

  // When binning a project
  code = code.replace(
    `                                    setActiveProject(null);
                                    setCurrentView(AppView.HOME);`,
    `                                    setIsNavigating(true);
                                    setTimeout(() => {
                                      setActiveProject(null);
                                      setCurrentView(AppView.HOME);
                                      setIsNavigating(false);
                                    }, 400);`
  );

  // And in the render loop, add the loading spinner
  const returnStart = "  return (\n    <div";
  const newReturnStart = `  return (
    <div className="relative">
      {isNavigating && (
        <LoadingSpinner message="Loading..." fullScreen />
      )}
    <div`;
  code = code.replace(returnStart, newReturnStart);
  
  // We need to close the extra div
  const returnEnd = "    </div>\n  );\n};";
  const newReturnEnd = "    </div>\n    </div>\n  );\n};";
  code = code.replace(returnEnd, newReturnEnd);

  fs.writeFileSync('App.tsx', code);
}
