/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { TestContext } from '@salesforce/core/lib/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import World from '../../../src/commands/plugins/discover';

describe('plugins world', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs plugins world', async () => {
    await World.run([]);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('Hello World');
  });

  it('runs plugins world with --json and no provided name', async () => {
    const result = await World.run([]);
    expect(result.name).to.equal('World');
  });

  it('runs plugins world --name Astro', async () => {
    await World.run(['--name', 'Astro']);
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.include('Hello Astro');
  });

  it('runs plugins world --name Astro --json', async () => {
    const result = await World.run(['--name', 'Astro', '--json']);
    expect(result.name).to.equal('Astro');
  });
});
