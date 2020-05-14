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

import { Tree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import {
  Schema as ApplicationOptions,
  Style,
} from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { addFixtureToTree } from '@dynatrace/testing/fixtures';
import { runExternalSchematic } from './run-schematic';
import { join } from 'path';

const fixturePath: string = join(__dirname, '../fixtures');

export async function createWorkspace(tree?: Tree): Promise<UnitTestTree> {
  let workTree: UnitTestTree;
  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'apps',
    version: '8.0.0',
  };
  const appOptions: ApplicationOptions = {
    name: 'myapp',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: true,
    skipPackageJson: false,
  };

  workTree = await runExternalSchematic(
    '@schematics/angular',
    'workspace',
    workspaceOptions,
    tree || Tree.empty(),
  );

  workTree = await runExternalSchematic(
    '@schematics/angular',
    'application',
    appOptions,
    workTree,
  );

  await addFixtureToTree({
    tree: workTree,
    source: 'barista-components-package.json',
    destination: 'node_modules/@dynatrace/barista-components/package.json',
    fixturePath,
  });

  return workTree;
}

export async function addLegacyComponents(tree: UnitTestTree): Promise<void> {
  await addFixtureToTree({
    tree: tree,
    source: 'package-simple-migration.json',
    destination: '/package.json',
    fixturePath,
  });

  await addFixtureToTree({
    tree: tree,
    source: 'exisiting-legacy-angular.json',
    destination: '/angular.json',
    fixturePath,
  });
}
