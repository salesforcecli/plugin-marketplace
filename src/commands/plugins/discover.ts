/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import shared, { DiscoverResult } from '../../shared/discoverQuery.js';
import { packages } from '../../shared/plugins.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-marketplace', 'plugins.discover');

export type DiscoverResults = DiscoverResult[];

export default class PluginsDiscover extends SfCommand<DiscoverResults> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');

  public async run(): Promise<DiscoverResults> {
    await this.parse(PluginsDiscover);
    this.spinner.start('Fetching details for plugins');
    const results = shared.transform(await shared.query(packages)).map(limitJson);

    this.table({
      data: results.map(formatRow),
      columns: [
        {
          key: 'name',
          name: 'Package',
        },
        'description',
        'homepage',
        {
          key: 'downloads',
          name: 'DL/Wk',
        },
        'published',
      ],
      overflow: 'wrap',
    });
    this.spinner.stop();
    this.log(); // Add a blank line before the disclaimer
    this.warn(messages.getMessage('disclaimer'));
    return results;
  }
}

/* there's a LOT more properties outside out types coming back from the APIs that we don't want people to build dependencies on  */
const limitJson = ({ name, description, homepage, downloads, published }: DiscoverResult): DiscoverResult => ({
  name,
  description,
  homepage,
  downloads,
  published,
});

const formatRow = (dr: DiscoverResult): DiscoverResult => ({
  ...dr,
  description: shared.descriptionTransform(dr.description),
});
