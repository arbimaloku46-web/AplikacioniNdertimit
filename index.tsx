import React from'react';
import ReactDOM from'react-dom/client';
import App from'./App'; if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function(registrations) { for(let registration of registrations) { registration.unregister(); } });
} const rootElement = document.getElementById('root');
if (!rootElement) { throw new Error("Could not find root element to mount to");
} const root = ReactDOM.createRoot(rootElement);
root.render( <React.StrictMode> <App /> </React.StrictMode>
);
