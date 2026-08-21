const fs = require('fs');
let lines = fs.readFileSync('App.tsx', 'utf8').split('\n');
let recovered = 0;
for (let i = 0; i < lines.length; i++) {
    // If a line is just spaces, and it has an even number of spaces
    if (lines[i].trim() === '' && lines[i].length > 0) {
        // It might have been a </div>!
        // The original line was `lines[i] + "    </div>"`
        // Wait! `s/    <\/div>//g` removes `    </div>`.
        // So the spaces left are `lines[i]`.
        // We can just append `    </div>` to it!
        lines[i] = lines[i] + '    </div>';
        recovered++;
    }
}
console.log("Recovered:", recovered);
fs.writeFileSync('App_recovered.tsx', lines.join('\n'));
