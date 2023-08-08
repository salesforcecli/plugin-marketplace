/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import got from 'got';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-marketplace', 'plugins.discover');

type NpmInfo = {
  name: string;
  version: string;
  description: string;
  homepage: string;
  repository: { url: string };
};

type StarInfo = {
  downloads: string;
  package: string;
};

export default class PluginsDiscover extends SfCommand<void> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  // eslint-disable-next-line class-methods-use-this
  public async run(): Promise<void> {
    const packages = [
      '@muenzpraeger/sfdx-plugin',
      'sfdx-waw-plugin',
      'mo-dx-plugin',
      'sfdx-hardis',
      'sfdx-affirm',
      'expereo-sfdx-plugin',
      'heat-sfdx-cli',
      'bmsfdx',
      'shane-sfdx-plugins',
      'sfdx-cmdt-plugin',
      'etcopydata',
      'sfdx-migration-automatic',
      'sfdx-devhub-pool',
      '@dx-cli-toolbox/sfdx-toolbox-package-utils',
      '@dxatscale/sfpowerscripts',
      'soqlx-opener',
      'sfdx-git-packager',
      'texei-sfdx-plugin',
    ];

    const npmData = await Promise.all(
      packages.map((pkg) =>
        Promise.all([
          got<NpmInfo>(`https://registry.npmjs.org/${pkg}/latest`).json<NpmInfo>(),
          got<StarInfo>(`https://api.npmjs.org/downloads/point/last-week/${pkg}`).json<StarInfo>(),
        ])
      )
    );

    const combined = npmData
      .map((y) => ({ ...y[0], ...y[1] }))
      .sort((a, b) => (b.downloads > a.downloads ? 1 : -1))
      .map((y) => ({ ...y, description: `${y.description.match(/(.{1,100})(?:\s|$)/g)?.join('\n')}` }));

    this.table(combined, {
      name: { header: 'Package' },
      description: { header: 'Description' },
      homepage: { header: 'Homepage' },
      downloads: { header: 'Weekly Downloads' },
    });
  }
}
