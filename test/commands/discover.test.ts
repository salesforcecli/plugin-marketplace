/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TestContext } from '@salesforce/core/testSetup';
import { expect, config } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import Discover from '../../src/commands/plugins/discover.js';
import queryStubs from '../../src/shared/discoverQuery.js';

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
