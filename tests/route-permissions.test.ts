import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { CAPABILITIES, can, requireCapability } from "@/config/permissions";
import { EXECUTIVES_LIST } from "@/config/executives";

function sourceFiles(directory: string, extension: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const file = path.join(directory, entry);
    return statSync(file).isDirectory()
      ? sourceFiles(file, extension)
      : file.endsWith(extension) ? [file] : [];
  });
}

function getStringLiterals(node: ts.Node): string[] {
  const found: string[] = [];
  const visit = (current: ts.Node) => {
    if (ts.isStringLiteral(current) || ts.isNoSubstitutionTemplateLiteral(current)) found.push(current.text);
    current.forEachChild(visit);
  };
  visit(node);
  return found;
}

function getVariableInitializer(scope: ts.Node, name: string): ts.Expression | undefined {
  let initializer: ts.Expression | undefined;
  const visit = (current: ts.Node) => {
    if (
      ts.isVariableDeclaration(current) &&
      ts.isIdentifier(current.name) &&
      current.name.text === name &&
      current.initializer
    ) initializer = current.initializer;
    current.forEachChild(visit);
  };
  visit(scope);
  return initializer;
}

function capabilitiesForExpression(expression: ts.Expression, scope: ts.Node): string[] {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return [expression.text];
  if (ts.isIdentifier(expression)) {
    const initializer = getVariableInitializer(scope, expression.text);
    return initializer ? getStringLiterals(initializer) : [];
  }
  return getStringLiterals(expression);
}

function exportedHttpMethods(sourceFile: ts.SourceFile): ts.FunctionDeclaration[] {
  return sourceFile.statements.filter((statement): statement is ts.FunctionDeclaration =>
    ts.isFunctionDeclaration(statement) &&
    statement.name !== undefined &&
    ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(statement.name.text) &&
    statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) === true
  );
}

function capabilityCalls(method: ts.FunctionDeclaration): string[] {
  const names: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "gateOfficeCapability" &&
      node.arguments[0]
    ) {
      names.push(...capabilitiesForExpression(node.arguments[0], method));
    }
    node.forEachChild(visit);
  };
  method.forEachChild(visit);
  return [...new Set(names)].filter((name) => CAPABILITIES.includes(name as (typeof CAPABILITIES)[number]));
}

test("every executive page and API method is explicitly capability-gated for all offices", () => {
  const root = process.cwd();
  const pageFiles = sourceFiles(path.join(root, "app", "office"), ".tsx")
    .filter((file) => path.basename(file) === "page.tsx" || path.basename(file) === "layout.tsx");
  const apiFiles = sourceFiles(path.join(root, "app", "api", "office"), ".ts")
    .filter((file) => path.basename(file) === "route.ts");
  assert.ok(pageFiles.length > 0);
  assert.ok(apiFiles.length > 0);

  for (const file of pageFiles) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const requirements: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "requirePageCapability" && node.arguments[0]) {
        requirements.push(...getStringLiterals(node.arguments[0]));
      }
      node.forEachChild(visit);
    };
    visit(source);
    assert.ok(requirements.length > 0, `${path.relative(root, file)} has no server-side page capability check`);
    for (const capability of requirements) {
      assert.ok(CAPABILITIES.includes(capability as (typeof CAPABILITIES)[number]), `${file} uses unknown capability ${capability}`);
      for (const { officeSlug } of EXECUTIVES_LIST) {
        if (can(officeSlug, capability as (typeof CAPABILITIES)[number])) {
          assert.doesNotThrow(() => requireCapability(officeSlug, capability as (typeof CAPABILITIES)[number]));
        } else {
          assert.throws(() => requireCapability(officeSlug, capability as (typeof CAPABILITIES)[number]));
        }
      }
    }
  }

  for (const file of apiFiles) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const methods = exportedHttpMethods(source);
    assert.ok(methods.length > 0, `${path.relative(root, file)} has no HTTP method`);
    for (const method of methods) {
      const methodName = method.name?.text ?? "unknown";
      const requirements = capabilityCalls(method);
      assert.ok(requirements.length > 0, `${path.relative(root, file)} ${methodName} has no server-side office gate`);
      for (const capability of requirements) {
        assert.ok(CAPABILITIES.includes(capability as (typeof CAPABILITIES)[number]), `${file} uses unknown capability ${capability}`);
        for (const { officeSlug } of EXECUTIVES_LIST) {
          if (can(officeSlug, capability as (typeof CAPABILITIES)[number])) {
            assert.doesNotThrow(() => requireCapability(officeSlug, capability as (typeof CAPABILITIES)[number]));
          } else {
            assert.throws(() => requireCapability(officeSlug, capability as (typeof CAPABILITIES)[number]));
          }
        }
      }
    }
  }
});
