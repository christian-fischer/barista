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
import { Rule, Tree, chain, noop } from '@angular-devkit/schematics';

export default function (options: DtComponentE2EOptions): Rule {
  return async (_host: Tree) => {
    console.log(options);

    return chain([noop()]);
  };
}
