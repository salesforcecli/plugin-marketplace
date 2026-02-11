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
