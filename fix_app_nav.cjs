const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const oldNav = `    setActiveUpdateIndex(firstIndex);
    setCurrentView(AppView.PROJECT_DETAIL);
  };`;
const newNav = `    setActiveUpdateIndex(firstIndex);
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      setCurrentView(AppView.PROJECT_DETAIL);
    }, 600);
  };`;

code = code.replace(oldNav, newNav);

const oldGoBack = `setActiveProject(null);
          setCurrentView(AppView.HOME);`;
const newGoBack = `setIsNavigating(true);
          setTimeout(() => {
            setActiveProject(null);
            setCurrentView(AppView.HOME);
            setIsNavigating(false);
          }, 400);`;

// It might be used multiple times, so regex or loop
code = code.split(oldGoBack).join(newGoBack);

fs.writeFileSync('App.tsx', code);
