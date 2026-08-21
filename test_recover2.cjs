const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
let recovered = 0;
for (let i = 0; i < lines.length; i++) {
    // If a line was exactly `<spaces></div>{" "}` it became `<spaces>{" "}`
    // If we look for lines that are just spaces followed by `{" "}`
    let match = lines[i].match(/^(\s*)\{" "\}$/);
    if (match) {
        // Wait, did it have `</div>` before?
        // Not necessarily. `<button> {" "} </button>` is often split.
        // But if it was `</div>{" "}`, it would have matched `s/    <\/div>//g`.
        // So `    </div>{" "}` -> `{" "}`.
        // Wait, `s/    <\/div>//g` takes exactly 4 spaces and `</div>`.
        // So `        </div>{" "}` becomes `    {" "}`.
        console.log("Found:", lines[i]);
    }
}
