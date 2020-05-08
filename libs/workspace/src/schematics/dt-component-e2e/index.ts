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

import { DtComponentE2EOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { join } from 'path';
import {
  Rule,
  Tree,
  chain,
  apply,
  url,
  template,
  mergeWith,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { getSourceFile, findNodes, getIndentation } from '../utils/ast-utils';
import { InsertChange, commitChanges } from '../utils/change';

interface DtE2EExtendedOptions {
  selector: string;
  componentModule: {
    name: string;
    package: string;
  };
  e2eComponent: {
    component: string;
    module: string;
  };
  name: string;
}

function generateComponentOptions(
  name: string,
): { name: string; package: string } {
  return {
    name: `Dt${strings.classify(name)}Module`,
    package: `@dynatrace/barista-components/${strings.dasherize(name)}`,
  };
}

function generateE2EComponentOptions(
  name: string,
): { component: string; module: string } {
  return {
    component: `DtE2E${strings.classify(name)}`,
    module: `DtE2E${strings.classify(name)}Module`,
  };
}

/**
 * Adds a new route inside the ui-test routes
 */
function addRoute(options: DtE2EExtendedOptions): Rule {
  return (host: Tree) => {
    const modulePath = join(
      'apps',
      'components-e2e',
      'src',
      'app',
      'app.routing.module.ts',
    );
    const sourceFile = getSourceFile(host, modulePath);

    /**
     * find last route and add new route
     */
    const routesDeclaration = findNodes(
      sourceFile,
      ts.SyntaxKind.VariableDeclaration,
    ).find(
      (node: ts.VariableDeclaration) => node.name.getText() === 'routes',
    ) as ts.VariableDeclaration;
    const routesElements = (routesDeclaration.initializer as ts.ArrayLiteralExpression)
      .elements;
    const lastElement = routesElements[routesElements.length - 1];
    const end = routesElements.hasTrailingComma
      ? lastElement.getEnd() + 1
      : lastElement.getEnd();
    const indentation = getIndentation(routesElements);
    const toInsert = `${indentation}{
    path: '${strings.dasherize(options.name)}',
    loadChildren: () =>
      import('../components/${strings.dasherize(
        options.name,
      )}/${strings.dasherize(options.name)}.module').then(
        (module) => module.${options.e2eComponent.module},
      ),
  },`;
    const routesChange = new InsertChange(modulePath, end, toInsert);

    return commitChanges(host, [routesChange], modulePath);
  };
}

// TODO: extract reusable naming functions and move to utils

export default function (options: DtComponentE2EOptions): Rule {
  return async (_host: Tree) => {
    const extendedOptions: DtE2EExtendedOptions = {
      ...options,
      selector: `dt-${strings.dasherize(options.name)}`,
      componentModule: generateComponentOptions(options.name),
      e2eComponent: generateE2EComponentOptions(options.name),
    };

    console.log(extendedOptions);

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...extendedOptions,
      }),
    ]);

    return chain([mergeWith(templateSource), addRoute(extendedOptions)]);
  };
}
