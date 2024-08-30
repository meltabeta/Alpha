function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  } 




  // Lock Screen Mode dev

  
  (function() {
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get() {
            window.location.replace("about:blank"); // Redirects if DevTools is detected
        }
    });

    setInterval(function() {
        console.log(element);
        console.clear();  // Keeps the console clear
    }, 1000);
})();


(function() {
    const start = () => { 
        const handleDevTools = () => {
            if (console.clear) console.clear();
            debugger;
            setTimeout(handleDevTools, 100); 
        };
        handleDevTools();
    };
    start();
})();

// Disable right-click
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// Disable specific keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Prevent common actions like F5 (reload), Ctrl+R (reload), Ctrl+Shift+I (DevTools), F12, etc.
    if (
        (event.ctrlKey && (event.key === 'r' || event.key === 'u' || event.key === 's')) ||
        event.key === 'F5' ||
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C'))
    ) {
        event.preventDefault();
    }
});

// Block DevTools by detecting if it's open
let devtoolsOpen = false;
const element = new Image();
Object.defineProperty(element, 'id', {
    get: function () {
        devtoolsOpen = true;
        throw new Error('DevTools Detected');
    }
});

setInterval(function () {
    devtoolsOpen = false;
    console.log(element);
    if (devtoolsOpen) {
        alert("DevTools are opened, and the page will now redirect.");
        window.location.replace("about:blank");  // redirect to a blank page
    }
}, 1000);



