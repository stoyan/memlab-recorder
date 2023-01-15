function getURL(url) {
  return `
// initial page load
function url() {
  return '${url}';
}`;
}

function getAction(selector) {
  return `
// action where we want to detect memory leaks
async function action(page /* Puppeteer page API */) {
  const el = await page.waitForSelector('${selector}');
  await el.evaluate(b => b.click());
}`;
}

function getActions(actions) {
  let acts = '// TODO: one or more actions here to change the state of the app'
  if (actions.length) {
    actions.unshift('let el;');
    acts = actions.join('\n  ');
  }
  return `
// action where we want to detect memory leaks
async function action(page /* Puppeteer page API */) {
  ${acts}
}`;
}

function getBack(selector) {
  let line;
  if (!selector) {
    line = '// TODO: need an action here to revert to the original state';
  } else {
    line = [
      `const el = await page.waitForSelector('${selector}');`,
      'await el.evaluate(b => b.click());'
    ].join('\n  ');
  }
  return `
// go back to the initial state
async function back(page /* Puppeteer page API */) {
  ${line}
}`;
}

function getOneSelector(selectors) {
  let sel = '/* selector goes here */';
  selectors.forEach(selector => {
    if (!selector[0].startsWith("aria/") && !selector[0].startsWith("xpath/") && !selector[0].startsWith("text/")) {
      sel = selector[0];
    }
  });
  return sel;
}


export class MemlabRecorderPlugin {
  async stringify(recording) {
    let backed = getBack();
    let actions = [];
    let navigate = '';

    recording.steps.findLast((step, idx, arr) => {
      if (step.type === 'click') {
        backed = getBack(getOneSelector(step.selectors));
        arr.splice(idx, 1);
        return 1;
      }
    });

    recording.steps.forEach(step => {
      if (step.type === 'navigate') {
        if (navigate) {
          // new navigation, clear old actions
          actions = [];
        }
        navigate = getURL(step.url);
      }
      if (step.type === 'click') {
        const selector = getOneSelector(step.selectors);
        actions.push(`el = await page.waitForSelector('${selector}');`);
        actions.push('await el.evaluate(b => b.click());');
      }

    });
    let res = navigate;
    res += '\n' + getActions(actions);
    res += '\n' + backed;
    res += '\n\nmodule.exports = {action, back, url};';


    return res;
  }
  async stringifyStep(step) {
    if (step.type === 'navigate') {
      return getURL(step.url);
    }
    if (step.type === 'click') {
      return getAction(step.type, getOneSelector(step.selectors));
    }
    return '/* unrecognised step */';
  }
}

chrome.devtools.recorder.registerRecorderExtensionPlugin(
  new MemlabRecorderPlugin(),
  'MemLab Scenario',
  'application/javascript',
);
