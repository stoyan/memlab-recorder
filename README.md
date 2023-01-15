# memlab-recorder
 DevTools extension that exports MemLab scenario files from the Recorder panel.

# Installation

1. Download and unzip: https://github.com/stoyan/memlab-recorder/archive/refs/heads/main.zip
2. Follow the instructions on how to install locally: https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked

# Running

This is an extension to the Recorder panel in DevTools. So Open DevTools and click on More options -> More tools -> Recorder. This is needed only once.

Then start a new recording and then export the Memlab Scenario file:

![Export scenario](/sshot.png)

## Sample exported scenario:

```js
// initial page load
function url() {
  return 'https://www.webpagetest.org/';
}

// action where we want to detect memory leaks
async function action(page /* Puppeteer page API */) {
  let el;
  el = await page.waitForSelector('#analytical-review > div:nth-child(3) > label');
  await el.evaluate(b => b.click());
}

// go back to the initial state
async function back(page /* Puppeteer page API */) {
  const el = await page.waitForSelector('#analytical-review > div:nth-child(2) > label');
  await el.evaluate(b => b.click());
}

module.exports = {action, back, url};
```

# Extra info

* Memlab: https://github.com/facebook/memlab
* Recorder panel: https://developer.chrome.com/docs/devtools/recorder/
