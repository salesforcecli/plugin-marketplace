/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { TestContext } from '@salesforce/core/lib/testSetup';
import { expect, config } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import Discover from '../../src/commands/plugins/discover';
import { packages } from '../../src/shared/plugins';
config.truncateThreshold = 0;

describe('plugins discover (no mocks)', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('plugins:discover returns a table', async () => {
    await Discover.run([]);

    expect(sfCommandStubs.table.callCount).to.equal(1);
  });

  it('plugins:discover returns proper json', async () => {
    const result = await Discover.run(['--json']);
    expect(result.length).to.equal(packages.length);
    result.map((pkg) => {
      expect(pkg).to.have.all.keys('name', 'description', 'homepage', 'downloads', 'date');
      expect(pkg.date).to.match(/\d{4}-\d{2}-\d{2}/);
      expect(pkg.name).to.be.oneOf(packages);
      expect(pkg.downloads).to.be.a('number');
      expect(pkg.homepage).to.be.a('string').with.length.greaterThan(0);
    });
  });
});
