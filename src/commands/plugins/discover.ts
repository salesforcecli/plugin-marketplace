/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { EOL } from 'node:os';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfCommand, StandardColors } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import shared, { DiscoverResult } from '../../shared/discoverQuery.js';
import { packages } from '../../shared/plugins.js';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-marketplace', 'plugins.discover');

export type DiscoverResults = DiscoverResult[];

export default class PluginsDiscover extends SfCommand<DiscoverResults> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');

  public async run(): Promise<DiscoverResults> {
    await this.parse(PluginsDiscover);
    const results = shared.transform(await shared.query(packages)).map(limitJson);

    this.table(results.map(formatRow).map(colorizeRow), {
      name: { header: 'Package' },
      description: { header: 'Description' },
      homepage: { header: 'Homepage' },
      downloads: { header: 'DL/Wk' },
      published: { header: 'Published' },
    });

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
  name: dr.name.split('/').join(`/${EOL}  `),
  description: shared.descriptionTransform(dr.description),
});

const colorizeRow = (row: DiscoverResult, index: number): DiscoverResult =>
  index % 2 === 0
    ? row
    : (Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, StandardColors.info(value)])
      ) as DiscoverResult);
