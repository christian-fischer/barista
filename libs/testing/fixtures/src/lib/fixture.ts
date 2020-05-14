/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function getFixture(
  filePath: string,
  fixturePath: string,
): Promise<string> {
  return fs.readFile(join(fixturePath, filePath), {
    encoding: 'utf-8',
  });
}

export async function addFixtureToTree({
  tree,
  source,
  destination,
  fixturePath,
}: FixtureAdditionParam): Promise<void> {
  const content = await getFixture(source, fixturePath);
  if (tree.exists(destination)) {
    tree.overwrite(destination, content);
    return;
  }
  tree.create(destination, content);
}

export type FixtureAdditionParam = {
  tree: Tree;
  source: string;
  destination: string;
  fixturePath: string;
};
