const cnt = {};
let fixedLen;
let fixedNames;
let randomNames = [];
let threshold;
let tot;
let windows;
const vis = new Set();
const vis2 = new Set();
const namesBeingTested = [
  [],
  [],
  [],
  [],
];
let outputName = '';
/**
 * Save.
 */
function save() {
  const data = document.querySelector('.result').value;
  const name = ((new Date()).toLocaleDateString() + (new Date())
      .toLocaleTimeString()).replace(/ *[:\/]/g, '_') + '.txt';
  const urlObject = window.URL || window.webkitURL || window;
  const exportBlob = new Blob([data]);
  const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml',
      'a');
  saveLink.href = urlObject.createObjectURL(exportBlob);
  saveLink.download = name;
  const ev = document.createEvent('MouseEvents');
  ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false,
      false, false, 0, null);
  saveLink.dispatchEvent(ev);
}
const cw = [];
/**
 * @param {Number} id id.
 * New round.
 */
function newRound(id) {
  const w = cw[id].contentWindow.document;
  w.querySelector('#textdiv>textarea').value = `!test!\n!\n\n${fixedNames}\n`;
  namesBeingTested[id].length = 0;
  vis.clear();
  for (let i = 0; i < tot - fixedLen; i++) {
    let name = randomNames[Math.floor(Math.random() * randomNames.length)];
    while (vis.has(name)) {
      name = randomNames[Math.floor(Math.random() * randomNames.length)];
    }
    namesBeingTested[id].push(name);
    vis.add(name);
  }
  namesBeingTested[id].sort();
  if (vis2.has(namesBeingTested[id].join('+'))) {
    newRound(id);
    return;
  }
  vis2.add(namesBeingTested[id].join('+'));
  w.querySelector('#textdiv>textarea').value += namesBeingTested[id].join('\n');
  w.querySelector('.goBtn').click();
}
/**
 * Start.
 */
function start() {
  tot = Number(document.querySelector('#tot').value);
  windows = Number(document.querySelector('#windows').value);
  const fixed = Array.prototype.slice.call(document.querySelector('#fix').value
      .split('\n'));
  while (fixed[fixed.length - 1] === '') {
    fixed.pop();
  }
  fixedLen = fixed.length;
  fixedNames = fixed.join('\n');
  randomNames = Array.prototype.slice.call(document.querySelector('#ran').value
      .split('\n'));
  while (randomNames[randomNames.length - 1] === '') {
    randomNames.pop();
  }
  if (fixedLen + randomNames.length < tot || fixedLen > tot) {
    alert('请检查输入！');
    return;
  }
  document.querySelector('#start').disabled = true;
  randomNames.forEach((element) => {
    cnt[element] = 10;
  });
  randomNames = randomNames.concat(randomNames, randomNames, randomNames,
      randomNames, randomNames, randomNames, randomNames, randomNames,
      randomNames);
  threshold = Number(document.querySelector('#threshold').value);
  outputName = fixed.join('+');
  for (let i = 0; i < windows; i++) {
    const NW = document.createElement('iframe');
    NW.src = 'beta/index.html';
    // NW.hidden = true;
    NW.style.width = '400px';
    NW.style.height = '600px';
    document.body.appendChild(NW);
    cw.push(NW);
    NW.onload = setTimeout(() => {
      cw[i].contentWindow.addEventListener('message', (event) => {
        if (event.data !== 'run') {
          const score = Number(event.data.slice(6));
          if (score >= threshold) {
            let tmp = outputName;
            for (const nm of namesBeingTested[i]) {
              if (cnt[nm] <= 1000) {
                for (let j = 0; j <= Math.floor((score - threshold) /
                    100); j++) randomNames.push(nm);
                cnt[nm] += Math.floor((score - threshold) / 100) + 1;
              }
              tmp += '+' + nm;
            }
            if (!fixedLen) tmp = tmp.substr(1);
            document.querySelector('textarea.result').value +=
              `${tmp} ${score}\n`;
          }
          newRound(i);
        }
      });
      newRound(i);
    }, 3000 + i * 3000);
  }
}
