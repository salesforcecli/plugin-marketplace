/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import got from 'got';
import { ProxyAgent } from 'proxy-agent';

export type NpmInfo = {
  name: string;
  // version: string;
  description: string;
  homepage: string;
  // repository: { url: string };
};

export type StarInfo = {
  downloads: string;
  // package: string;
};

export type SearchInfo = {
  objects: Array<{
    package: {
      name: string;
      date: string;
    };
  }>;
};

export type DiscoverResult = NpmInfo & StarInfo & { published: string };

type QueryResult = [NpmInfo, StarInfo, SearchInfo];
const agent = { https: new ProxyAgent() };

export const query = async (packages: string[]): Promise<Array<[NpmInfo, StarInfo, SearchInfo]>> =>
  Promise.all(
    packages.map((pkg) =>
      Promise.all([
        got<NpmInfo>(`https://registry.npmjs.org/${pkg}/latest`, { agent }).json<NpmInfo>(),
        got<StarInfo>(`https://api.npmjs.org/downloads/point/last-week/${pkg}`, { agent }).json<StarInfo>(),
        // use yarn to spread the load around some
        got<SearchInfo>(`https://registry.yarnpkg.com/-/v1/search?text=${pkg}`, { agent }).json<SearchInfo>(),
      ])
    )
  );

export const transform = (queryResult: QueryResult[]): DiscoverResult[] =>
  queryResult
    .map((y) => ({ ...y[0], ...y[1], published: dateFromSearchObjects(y[0].name, y[2]) }))
    .sort((a, b) => (b.downloads > a.downloads ? 1 : -1))
    .map((y) => ({
      ...y,
      homepage: y.homepage.replace('https://github.com/https://github.com', 'https://github.com'),
    }));

const dateFromSearchObjects = (pkgName: string, searchInfo: SearchInfo): string =>
  searchInfo.objects.find((o) => o.package.name === pkgName)?.package.date.split('T')[0] ?? '';

/** word wrap inside the description.  Also removes line empty lines and markdown dividers */
export const descriptionTransform = (description: string): string =>
  (
    description
      // links and image links
      .replace(/\[.*\]\(.*\)/g, '')
      // line dividers
      .replace(/={2,}/g, '')
      .trim()
      // separate into shorter lines
      .match(/(.{1,50})(?:\s|$)/g)
      ?.map((line) => line.trim())
      .join('\n') ?? ''
  )
    // remove empty lines
    .replace(/\n{2,}/gm, '\n');

export default {
  query,
  transform,
  descriptionTransform,
};
