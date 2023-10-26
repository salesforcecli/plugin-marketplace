/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, config, assert } from 'chai';
import { Messages } from '@salesforce/core';
import { execCmd } from '@salesforce/cli-plugins-testkit';
import { DiscoverResults } from '../../src/commands/plugins/discover.js';
import { packages } from '../../src/shared/plugins.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-marketplace', 'plugins.discover');

config.truncateThreshold = 0;

describe('plugins discover (no mocks)', () => {
  it('plugins:discover returns human output', async () => {
    const output = execCmd('plugins:discover', { ensureExitCode: 0 }).shellOutput;
    packages
      // there may be line breaks
      .flatMap((pkg) => pkg.split('/'))
      .map((pkg) => {
        expect(output.stdout).to.include(pkg);
      });
    expect(output.stderr).to.include(messages.getMessage('disclaimer'));
  });

  it('plugins:discover returns proper json', async () => {
    const result = execCmd<DiscoverResults>('plugins:discover --json', { ensureExitCode: 0 }).jsonOutput?.result;
    assert(result);
    expect(result.length).to.equal(packages.length);
    result.map((pkg) => {
      expect(pkg).to.have.all.keys('name', 'description', 'homepage', 'downloads', 'published');
      expect(pkg.published).to.match(/\d{4}-\d{2}-\d{2}/);
      expect(pkg.name).to.be.oneOf(packages);
      expect(pkg.downloads).to.be.a('number');
      expect(pkg.homepage).to.be.a('string').with.length.greaterThan(0);
    });
  });
});
