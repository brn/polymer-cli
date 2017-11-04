/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import * as ts from 'typescript';

let cachedConfig: ts.CompilerOptions | null = null;

export function reportDiagnostics(diagnostics: ts.Diagnostic[]) {
  diagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      throw new Error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      throw new Error(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }
  });
}

/**
 * Load and cache tsconfig.json.
 */
export function loadTsConfig(): ts.CompilerOptions {
  if (cachedConfig) {
    return cachedConfig;
  }

  let optionsParseResult: {options: ts.CompilerOptions, errors: ts.Diagnostic[]};
  try {
    const { compilerOptions } = require('./tsconfig.json');
    optionsParseResult = ts.convertCompilerOptionsFromJson({ importHelpers: false, ...compilerOptions }, './', 'tsconfig.json');
  } catch (e) {
    optionsParseResult = ts.convertCompilerOptionsFromJson({
      target: 'ES6',
      module: 'commonjs',
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      importHelpers: false
    } as any, './', 'tsconfig.json');
  }

  if (optionsParseResult.errors) {
    reportDiagnostics(optionsParseResult.errors);
  }

  return cachedConfig = optionsParseResult.options;
}
