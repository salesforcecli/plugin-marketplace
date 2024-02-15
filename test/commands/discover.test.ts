/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { TestContext } from '@salesforce/core/lib/testSetup.js';
import { expect, config } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import Discover from '../../src/commands/plugins/discover/index.js';
import queryStubs from '../../src/commands/plugins/discover/discoverQuery.js';

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ============================= Phasellus a magna odio. Nullam bibendum magna a lectus faucibus, et viverra neque ornare. Vestibulum tellus augue, rutrum et semper id, pellentesque eget lacus. Nunc ac ultricies nulla, in sagittis arcu. Maecenas accumsan ac dui eget pharetra. Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque ac nisi pretium, suscipit metus ac, sodales nisl. Quisque eget finibus nunc, id iaculis quam. Fusce a ultrices leo. Morbi eu est condimentum sapien semper porttitor non ac nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Praesent viverra interdum enim commodo ullamcorper. Suspendisse potenti. Suspendisse tristique dignissim vestibulum. Maecenas non velit faucibus, dapibus tellus sit amet, hendrerit lacus. Nullam metus nunc, suscipit venenatis tempor eu, facilisis pulvinar tellus. Proin venenatis pretium justo, at venenatis sapien pharetra porttitor. Cras egestas eget mi tristique ullamcorper. Etiam pretium non risus quis maximus. Fusce in pulvinar ipsum, in elementum magna. Donec nec lacus sit amet est fringilla vehicula sit amet ac ante. Fusce non laoreet arcu. Sed nisi dolor, tempus nec tortor non, placerat tincidunt ligula.
`;

config.truncateThreshold = 0;
describe('plugins discover', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
    $$.SANDBOX.stub(queryStubs, 'query').resolves([
      [
        { name: '@salesforce/foo', description: 'FooDesc', homepage: 'https://www.salesforce.com' },
        { downloads: '10' },
        {
          objects: [
            { package: { name: '@salesforce/bar', date: '2021-11-02T17:34:14.637Z' } },
            // the search results yield a less optimal
            { package: { name: '@salesforce/foo', date: '2020-11-02T17:34:14.637Z' } },
          ],
        },
      ],
      [
        { name: '@salesforce/bar', description: lorem, homepage: 'https://www.salesforce.com' },
        { downloads: '100' },
        {
          objects: [
            { package: { name: '@salesforce/bar', date: '2021-11-02T17:34:14.637Z' } },
            // the search results yield a less optimal
            { package: { name: '@salesforce/foo', date: '2020-11-02T17:34:14.637Z' } },
          ],
        },
      ],
      [
        { name: '@salesforce/nodate', description: lorem, homepage: 'https://www.salesforce.com' },
        { downloads: '1' },
        {
          objects: [
            { package: { name: '@salesforce/bar', date: '2021-11-02T17:34:14.637Z' } },
            // the search results yield a less optimal
            { package: { name: '@salesforce/foo', date: '2020-11-02T17:34:14.637Z' } },
          ],
        },
      ],
    ]);
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
    expect(result.length).to.equal(3);
    result.map((pkg) => {
      expect(pkg).to.have.all.keys('name', 'description', 'homepage', 'downloads', 'published');
      expect(pkg.name.startsWith('@salesforce')).to.be.true;
    });
  });
});
