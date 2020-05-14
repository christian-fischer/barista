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

import { externalSchematic, noop, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { addFixtureToTree } from '@dynatrace/testing/fixtures';
import { addLegacyComponents, createWorkspace, runSchematic } from '../testing';
import { readFileFromTree, readJsonFromTree } from '../utils';
// use glob import for mocking
import * as rules from './rules';
import { Schema } from './schema';
import { join } from 'path';

export async function testNgAdd(
  testTree: Tree,
  options: Partial<Schema> = {},
): Promise<void> {
  const schemaOptions: Schema = {
    project: 'testProject',
    animations: true,
    module: '',
    typography: true,
    skipInstall: true,
    ...options,
  };
  await runSchematic('ng-add', schemaOptions, testTree);
}

let tree: UnitTestTree;
const fixturePath: string = join(__dirname, '../fixtures');

beforeEach(async () => {
  tree = await createWorkspace();
});

// Testing of Dynatrace Ng-Add Schematic
describe('Migrate existing angular-components to barista components', () => {
  let externalSchematicsSpy: jest.SpyInstance;

  beforeEach(async () => {
    externalSchematicsSpy = (externalSchematic as any) = jest
      .fn()
      .mockReturnValue(noop());
    await addLegacyComponents(tree);
  });

  afterEach(() => {
    externalSchematicsSpy.mockClear();
  });

  it('should throw an error if no default project or project is provided', async () => {
    try {
      await testNgAdd(tree);
    } catch (e) {
      expect(e.message).toBe(rules.COULD_NOT_FIND_DEFAULT_PROJECT_ERROR);
    } finally {
      expect.assertions(1);
    }
  });

  it('should call the migration schematic when legacy imports are detected', async () => {
    const ruleSpy = jest
      .spyOn(rules, 'updateWorkspaceRule')
      .mockReturnValue(noop);
    await testNgAdd(tree);
    expect(externalSchematicsSpy).toBeCalledTimes(1);
    expect(externalSchematicsSpy).toBeCalledWith(
      expect.stringMatching(/collection\.json$/),
      'update-5.0.0',
      {},
    );
    ruleSpy.mockRestore();
  });

  it('should update imports of @dynatrace/angular-components to barista-components in package.json', async () => {
    const ruleSpy = jest
      .spyOn(rules, 'updateWorkspaceRule')
      .mockReturnValue(noop);
    await testNgAdd(tree);
    expect(readJsonFromTree(tree, '/package.json')).toMatchSnapshot();
    ruleSpy.mockRestore();
  });

  it('should add barista icons to the angular.json', async () => {
    await addFixtureToTree({
      tree,
      source: 'package-animations-existing.json',
      destination: '/package.json',
      fixturePath,
    });

    await addFixtureToTree({
      tree,
      source: 'angular-simple.json',
      destination: '/angular.json',
      fixturePath,
    });
    await testNgAdd(tree, { project: 'myapp' });

    expect(readJsonFromTree(tree, '/angular.json')).toMatchSnapshot();
  });

  it('should include main.scss in angular.json, when typography is set to false ', async () => {
    await addFixtureToTree({
      tree,
      source: 'package-animations-existing.json',
      destination: '/package.json',
      fixturePath,
    });

    await addFixtureToTree({
      tree,
      source: 'angular-simple.json',
      destination: '/angular.json',
      fixturePath,
    });
    await testNgAdd(tree, { project: 'myapp', typography: false });

    expect(
      readJsonFromTree<any>(tree, '/angular.json').projects.myapp.architect
        .build.options.styles[1],
    ).toMatch(/main\.scss$/);
  });

  it('should add styles correctly even if there is no styles array in the angular.json ', async () => {
    await addFixtureToTree({
      tree,
      source: 'package-animations-existing.json',
      destination: '/package.json',
      fixturePath,
    });

    await addFixtureToTree({
      tree,
      source: 'angular-without-styles.json',
      destination: '/angular.json',
      fixturePath,
    });
    await testNgAdd(tree, { project: 'myapp' });

    expect(readJsonFromTree(tree, '/angular.json')).toMatchSnapshot();
  });

  it('should update the main ngModule with the correct providers', async () => {
    await testNgAdd(tree, {
      project: 'myapp',
      module: '/apps/myapp/src/app/app.module.ts',
    });

    expect(
      readFileFromTree(tree, '/apps/myapp/src/app/app.module.ts'),
    ).toMatchSnapshot();
  });

  it('should update the legacy angular json', async () => {
    await testNgAdd(tree, { project: 'myapp' });

    expect(readJsonFromTree(tree, '/angular.json')).toMatchSnapshot();
  });
});

describe('New workspace', () => {
  it('should add all the required modules in a fresh create angular app', async () => {
    await testNgAdd(tree, {
      project: 'myapp',
      module: '/apps/myapp/src/app/app.module.ts',
    });

    expect(
      readFileFromTree(tree, '/apps/myapp/src/app/app.module.ts'),
    ).toMatchSnapshot('app.module.ts');
    expect(readJsonFromTree(tree, '/angular.json')).toMatchSnapshot(
      'angular.json',
    );
    expect(readJsonFromTree(tree, '/package.json')).toMatchSnapshot(
      'package.json',
    );
  });

  it('should add import the No operation animations module from angular when animations is set to false', async () => {
    await addFixtureToTree({
      tree,
      source: 'package-empty.json',
      destination: '/package.json',
      fixturePath,
    });
    await testNgAdd(tree, {
      animations: false,
      project: 'myapp',
      module: '/apps/myapp/src/app/app.module.ts',
    });
    expect(
      readFileFromTree(tree, '/apps/myapp/src/app/app.module.ts'),
    ).toMatchSnapshot();
  });

  it('should add the `@angular/animations` package with the same version as the `@angular/core` package when specified', async () => {
    await addFixtureToTree({
      tree,
      source: 'package-empty.json',
      destination: '/package.json',
      fixturePath,
    });
    await testNgAdd(tree, { project: undefined });
    expect(readJsonFromTree(tree, '/package.json')).toMatchSnapshot();
  });

  it("shouldn't add @angular/animations` package if already installed", async () => {
    await addFixtureToTree({
      tree,
      source: 'package-animations-existing.json',
      destination: '/package.json',
      fixturePath,
    });

    await testNgAdd(tree, { animations: true, project: undefined });

    // check if the angular animations package is used more than once
    expect(
      readFileFromTree(tree, '/package.json').match(/\@angular\/animations/gim),
    ).toHaveLength(1);
    expect(readJsonFromTree(tree, '/package.json')).toMatchSnapshot();
  });

  it('should add @angular/platform-browser-dynamic', async () => {
    await addFixtureToTree({
      tree,
      source: 'package-empty.json',
      destination: '/package.json',
      fixturePath,
    });

    expect(readFileFromTree(tree, '/package.json')).not.toMatch(
      '@angular/platform-browser-dynamic',
    );

    await testNgAdd(tree, { project: undefined });
    expect(readJsonFromTree(tree, '/package.json')).toMatchSnapshot();
  });

  it('should install all the dependencies when skipInstall is set to false', async () => {
    const devkitTasksMock = ((NodePackageInstallTask as any) = jest
      .fn()
      .mockImplementation(() => ({
        toConfiguration: jest.fn().mockReturnValue({
          name: 'node-package',
        }),
      })));

    await testNgAdd(tree, { project: undefined, skipInstall: false });
    expect(devkitTasksMock).toHaveBeenCalledTimes(1);
  });

  it('should throw if a project is provided that does not exist', async () => {
    try {
      await testNgAdd(tree, { project: 'asdf' });
    } catch (e) {
      expect(e.message).toBe(rules.COULD_NOT_FIND_PROJECT_ERROR('asdf'));
    } finally {
      expect.assertions(1);
    }
  });
});
