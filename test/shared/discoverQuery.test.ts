/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, config } from 'chai';
import { transform, descriptionTransform, query } from '../../src/commands/plugins/discover/discoverQuery.js';
config.truncateThreshold = 0;

describe('query tranformations', () => {
  it('sorted by downloads', () => {
    const result = [
      [
        { name: '@salesforce/foo', description: 'blah', homepage: 'https://www.salesforce.com' },
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
        { name: '@salesforce/bar', description: 'blah', homepage: 'https://www.salesforce.com' },
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
        { name: '@salesforce/nodate', description: 'blah', homepage: 'https://www.salesforce.com' },
        { downloads: '1' },
        {
          objects: [
            { package: { name: '@salesforce/bar', date: '2021-11-02T17:34:14.637Z' } },
            // the search results yield a less optimal
            { package: { name: '@salesforce/foo', date: '2020-11-02T17:34:14.637Z' } },
          ],
        },
      ],
    ] satisfies Awaited<ReturnType<typeof query>>;
    const out = transform(result);
    const barIndex = out.findIndex((r) => r.name === '@salesforce/bar');
    const fooIndex = out.findIndex((r) => r.name === '@salesforce/foo');
    const nodateIndex = out.findIndex((r) => r.name === '@salesforce/nodate');

    expect(nodateIndex).to.be.greaterThan(-1);
    expect(barIndex).to.be.greaterThan(-1);
    expect(fooIndex).to.be.greaterThan(-1);

    expect(barIndex).to.be.lessThan(fooIndex);
    expect(fooIndex).to.be.lessThan(nodateIndex);
  });

  it('handles no matching search results', () => {
    expect(
      transform([
        [
          { name: '@salesforce/nodate', description: 'blah', homepage: 'https://www.salesforce.com' },
          { downloads: '1' },
          {
            objects: [
              { package: { name: '@salesforce/bar', date: '2021-11-02T17:34:14.637Z' } },
              { package: { name: '@salesforce/foo', date: '2020-11-02T17:34:14.637Z' } },
            ],
          },
        ],
      ])[0].published
    ).to.equal('');
  });
  it('handles no search results', () => {
    expect(
      transform([
        [
          { name: '@salesforce/nodate', description: 'blah', homepage: 'https://www.salesforce.com' },
          { downloads: '1' },
          {
            objects: [],
          },
        ],
      ])[0].published
    ).to.equal('');
  });

  describe('description transform', () => {
    it('removes markdown dividers', () => {
      expect(descriptionTransform('blah ================blah regular 2=2')).to.not.include('==');
      expect(descriptionTransform('blah ================blah regular 2=2')).to.include('2=2');
    });
    it('removes link urls', () => {
      expect(
        descriptionTransform(
          '[Lightning Flow Scanner Banner](https://github.com/Force-Config-Control/lightning-flow-scanner-sfdx) actual description'
        )
      ).to.equal('actual description');
    });
    it('removes image link urls', () => {
      expect(
        descriptionTransform(
          '[![Lightning Flow Scanner Banner](docs/images/banner.png)](https://github.com/Force-Config-Control/lightning-flow-scanner-sfdx) actual description'
        )
      ).to.equal('actual description');
    });
    it('removes empty lines', () => {
      expect(
        descriptionTransform(`blah


      blah`)
      ).to.not.include('\n\n');
    });
    it('handles long descriptions search results', () => {
      const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus a magna odio. Nullam bibendum magna a lectus faucibus, et viverra neque ornare. Vestibulum tellus augue, rutrum et semper id, pellentesque eget lacus. Nunc ac ultricies nulla, in sagittis arcu. Maecenas accumsan ac dui eget pharetra. Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque ac nisi pretium, suscipit metus ac, sodales nisl. Quisque eget finibus nunc, id iaculis quam. Fusce a ultrices leo. Morbi eu est condimentum sapien semper porttitor non ac nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Praesent viverra interdum enim commodo ullamcorper. Suspendisse potenti. Suspendisse tristique dignissim vestibulum. Maecenas non velit faucibus, dapibus tellus sit amet, hendrerit lacus. Nullam metus nunc, suscipit venenatis tempor eu, facilisis pulvinar tellus. Proin venenatis pretium justo, at venenatis sapien pharetra porttitor. Cras egestas eget mi tristique ullamcorper. Etiam pretium non risus quis maximus. Fusce in pulvinar ipsum, in elementum magna. Donec nec lacus sit amet est fringilla vehicula sit amet ac ante. Fusce non laoreet arcu. Sed nisi dolor, tempus nec tortor non, placerat tincidunt ligula.
`;
      expect(Array.from(descriptionTransform(lorem).matchAll(/\n/g))).to.have.length.greaterThanOrEqual(10);
    });
  });
});
