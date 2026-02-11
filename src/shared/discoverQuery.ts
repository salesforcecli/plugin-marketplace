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
import got from 'got';
import { ProxyAgent } from 'proxy-agent';
import { sleep } from '@salesforce/kit';

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

const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (
      error instanceof Error &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'statusCode' in error.response &&
      error.response.statusCode === 429 &&
      maxRetries > 0
    ) {
      await sleep(initialDelay);
      return retryWithBackoff(fn, maxRetries - 1, initialDelay * 2);
    }
    throw error;
  }
};

export const query = async (packages: string[]): Promise<Array<[NpmInfo, StarInfo, SearchInfo]>> => {
  const results: Array<[NpmInfo, StarInfo, SearchInfo]> = [];

  for (const pkg of packages) {
    // eslint-disable-next-line no-await-in-loop
    const result = await Promise.all([
      retryWithBackoff(() => got<NpmInfo>(`https://registry.npmjs.org/${pkg}/latest`, { agent }).json<NpmInfo>()),
      retryWithBackoff(() =>
        got<StarInfo>(`https://api.npmjs.org/downloads/point/last-week/${pkg}`, { agent }).json<StarInfo>()
      ),
      retryWithBackoff(() =>
        got<SearchInfo>(`https://registry.yarnpkg.com/-/v1/search?text=${pkg}`, { agent }).json<SearchInfo>()
      ),
    ]);

    results.push(result as [NpmInfo, StarInfo, SearchInfo]);
    // Add a small delay between packages to avoid rate limiting
    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }

  return results;
};

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
