#!/usr/bin/env node
// @ts-check
import ts from "typescript";
import path from "path";
import { uniqueEnumTransformer } from "./transformer.js";

function build() {
    const configPath = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.json");
    if (!configPath) throw new Error("Could not find tsconfig.json");

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

    const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });

    const result = program.emit(
        undefined,
        undefined,
        undefined,
        undefined,
        { before: [uniqueEnumTransformer] }
    );

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics);

    allDiagnostics.forEach(d => {
        const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
        if (d.file && d.start !== undefined) {
            const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
            console.log(`${d.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.log(message);
        }
    });

    if (result.emitSkipped) process.exit(1);
}

build();
