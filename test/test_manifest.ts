import {expect} from 'chai';

import {parseManifest} from '../server/manifest.js';

describe('parseManifest', function() {
  it('returns hashed paths from the manifest', function() {
    const content = JSON.stringify({
      'main.js': '/dist/main.abc123.js',
      'main.css': '/dist/main.def456.css',
    });
    const paths = parseManifest(content);
    expect(paths.MAIN_JS).to.equal('/dist/main.abc123.js');
    expect(paths.MAIN_CSS).to.equal('/dist/main.def456.css');
  });
  it('falls back to unhashed defaults when there is no manifest', function() {
    const paths = parseManifest(null);
    expect(paths.MAIN_JS).to.equal('/dist/main.js');
    expect(paths.MAIN_CSS).to.equal('/dist/main.css');
  });
  it('falls back per-asset when a key is missing', function() {
    const content = JSON.stringify({'main.js': '/dist/main.abc123.js'});
    const paths = parseManifest(content);
    expect(paths.MAIN_JS).to.equal('/dist/main.abc123.js');
    expect(paths.MAIN_CSS).to.equal('/dist/main.css');
  });
  it('falls back to all defaults for an empty manifest', function() {
    const paths = parseManifest('{}');
    expect(paths.MAIN_JS).to.equal('/dist/main.js');
    expect(paths.MAIN_CSS).to.equal('/dist/main.css');
  });
});
