const { execSync } = require("child_process");

const addVector3 = function (array1, array2) {
    return new Uint32Array([
        array1[0] + array2[0], 
        array1[1] + array2[1], 
        array1[2] + array2[2],
    ]);
}

const getGitInfo = path => {
    const output = execSync(`
        git log --shortstat -p ${path} | \n
        grep -E "Author: |^Date: |file changed,|Merge: " | \n      
        awk 'NR%3{printf "%s^",$0;next}1'  
    `).toString();
    if (!output) return {};

    const result = new Map();
    const lines = output.split("\n");

    for(let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if(line === "") break;
        let [author, date, fileChanges] = line.split("^");
        if(author.includes("Merge")) {
            author = date;
            date = fileChanges;
            fileChanges = [];
        } else {
            author = author.split(": ")[1].split(" <")[0];
            date = new Date(date.split("Date:   ")[1]);
        }
        if(typeof fileChanges !== "string" || fileChanges.match(/Merge branch/)) fileChanges = [0, 0, 0];
        else {
          const segments = fileChanges.split(", ");
          fileChanges = new Uint32Array(3).fill(0);
          segments.forEach(segment => {
            const segmentNumber = segment.match(/file changed/) ? [0, segment.split("f")[0]]
            : segment.match(/insertions/) ? [1, segment.split("i")[0]]
            : segment.match(/deletion/) ? [2, segment.split("d")[0]]
            : undefined;
            if(segmentNumber === undefined) return;
            else fileChanges[segmentNumber[0]] += Number(segmentNumber[1]);
          });
        }
        if(result.has(author)) result.set(author, addVector3(result.get(author), fileChanges));
        else result.set(author, fileChanges);
    }

    return Object.fromEntries(result);
};

const { readFileSync } = require("fs");

module.exports = function addComponentNameAndMap(source) {
    const { path } = this.getOptions();
    if (
        path.includes("node_modules") || 
        !/(\.js$)|(\.ts$)|(\.tsx$)/i.test(path) || 
        typeof source !== "string" || 
        /export default function \(/gi.test(source)
    ) return source;

    const componentName = source.match(/(?<=export default function )[a-zA-Z0-9_]+/gi) ?? 
        source.match(/(?<=export default new )[a-zA-Z0-9_]+/gi) ?? 
        source.match(/(?<=export default class )[a-zA-Z0-9_]+/gi) ?? 
        source.match(/(?<=export default )[a-zA-Z0-9_]+/gi);

    source = source + readFileSync(require.resolve("./layout.js")).toString();

    if (!componentName) return source;
    return source + `

        ${componentName}.path = "${path}";
        ${componentName}.identifier = "${componentName}";
        ${componentName}.contInfo = ${JSON.stringify(getGitInfo(path))};

    `;
};

process.on('uncaughtException', err => {
    console.log(err);
});