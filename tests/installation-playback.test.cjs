// Exercise media lifecycle transitions without browser/UI inspection.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('app/installation-video.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function mount({ reduced = false, saveData = false, blocked = false } = {}) {
  const refs = [], states = [], effects = [];
  let ri = 0, si = 0, first = true, tree, observer, cleanup;
  const document = { hidden: false, addEventListener(_, fn) { this.sync = fn; }, removeEventListener() {} };
  const motion = { matches: reduced, addEventListener(_, fn) { this.sync = fn; }, removeEventListener() {} };
  const video = {
    src: '', paused: true, playCount: 0, muted: false,
    getAttribute(key) { return this[key]; },
    play() {
      this.playCount++;
      if (blocked) return Promise.reject(new Error('NotAllowedError'));
      this.paused = false; this.props.onPlay();
      return Promise.resolve();
    },
    pause() {
      if (this.paused) return;
      this.paused = true; this.props.onPause();
    },
  };
  const react = {
    useRef(value) { return refs[ri++] ?? (refs[ri - 1] = { current: value }); },
    useState(value) {
      const i = si++;
      if (first) states[i] = value;
      return [states[i], (next) => { states[i] = next; render(); }];
    },
    useEffect(fn) { if (first) effects.push(fn); },
  };
  const jsx = (type, props) => {
    if (type === 'video') { video.props = props; props.ref.current = video; }
    if (type === 'figure') props.ref.current = {};
    return { type, props };
  };
  const exports = {};
  vm.runInNewContext(source, {
    exports, document, navigator: { connection: { saveData } },
    matchMedia: () => motion,
    IntersectionObserver: class {
      constructor(fn) { observer = this; this.callback = fn; }
      observe() {} disconnect() { this.disconnected = true; }
    },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'lucide-react') return { Play: 'play-icon', Pause: 'pause-icon', ArrowUpRight: 'arrow-icon' };
      if (name === '@/lib/asset-path') return { assetPath: (p) => '/precious-shield-website' + p };
      throw new Error(name);
    },
  });
  function render() { ri = si = 0; tree = exports.InstallationVideo(); first = false; }
  function find(type, node = tree) {
    if (!node || typeof node !== 'object') return;
    if (node.type === type) return node;
    for (const child of [node.props?.children].flat(Infinity)) {
      if (!child) continue;
      const result = find(type, child); if (result) return result;
    }
  }
  render(); cleanup = effects[0]();
  return {
    video, motion, document, find,
    enter(value) { observer.callback([{ isIntersecting: value }]); },
    click() { find('button').props.onClick(); },
    hide(value) { document.hidden = value; document.sync(); },
    reduce(value) { motion.matches = value; motion.sync(); },
    cleanup,
  };
}

test('lazy loading, visibility, persistent manual pause, and replay', async () => {
  const p = mount();
  assert.equal(p.video.src, '');
  p.enter(true);
  assert.equal(p.video.src, '/precious-shield-website/videos/installation-detail.mp4');
  assert.equal(p.video.muted, true);
  assert.equal(p.video.paused, false);
  p.click(); assert.equal(p.video.paused, true);
  p.enter(false); p.enter(true); assert.equal(p.video.paused, true);
  p.click(); assert.equal(p.video.paused, false);
  p.hide(true); assert.equal(p.video.paused, true);
  p.hide(false); assert.equal(p.video.paused, false);
  p.enter(false); assert.equal(p.video.paused, true);
  await Promise.resolve();
  assert.equal(p.video.paused, true);
  p.cleanup();
});

test('reduced motion and data saving require explicit play', () => {
  for (const option of [{ reduced: true }, { saveData: true }]) {
    const p = mount(option); p.enter(true);
    assert.equal(p.video.src, '');
    p.click(); assert.equal(p.video.paused, false);
    p.reduce(true); assert.equal(p.video.paused, true);
    p.cleanup();
  }
});

test('blocked autoplay leaves a play control; media failure leaves source and status', async () => {
  const p = mount({ blocked: true }); p.enter(true);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(p.video.paused, true);
  assert.equal(p.find('button').props['aria-label'], 'تشغيل الفيديو');
  p.video.props.onError();
  assert.ok(p.find('output')); assert.ok(p.find('a'));
  assert.equal(p.find('button'), undefined);
  p.cleanup();
});
