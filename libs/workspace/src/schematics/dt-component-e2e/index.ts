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
import {
  Rule,
  Tree,
  chain,
  apply,
  url,
  template,
  mergeWith,
} from '@angular-devkit/schematics';

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

// TODO: extract reusable naming functions and move to utils

export default function (options: DtComponentE2EOptions): Rule {
  return async (_host: Tree) => {
    const extendedOptions = {
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

    return chain([mergeWith(templateSource)]);
  };
}
