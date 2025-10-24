import ts from "typescript";
// tsc compile/transformer.js --module esnext --target esnext
/**
 * Unique enum transformer: rewrites all `enum X { ... }` into a runtime-safe frozen class
 */
export function uniqueEnumTransformer(context) {
    const factory = context.factory;
    return (sourceFile) => {
        function visit(node) {
            if (ts.isEnumDeclaration(node) &&
                !node.modifiers?.some(m => m.kind === ts.SyntaxKind.ConstKeyword)) {
                return transformEnum(node);
            }
            return ts.visitEachChild(node, visit, context);
        }
        function transformEnum(node) {
            const enumName = node.name.text;
            const members = node.members.map(m => {
                const name = m.name;
                if (ts.isIdentifier(name))
                    return name.text;
                if (ts.isStringLiteral(name))
                    return name.text;
                throw new Error("Unsupported enum member name type");
            });
            const constructVar = factory.createUniqueName("construct");
            // Class declaration
            const classDecl = factory.createClassDeclaration(undefined, enumName, undefined, undefined, [
                // static variants
                ...members.map(name => factory.createPropertyDeclaration([factory.createModifier(ts.SyntaxKind.StaticKeyword)], name, undefined, undefined, factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Object"), "freeze"), undefined, [
                    factory.createNewExpression(factory.createIdentifier(enumName), undefined, [factory.createStringLiteral(name)]),
                ]))),
                // constructor
                factory.createConstructorDeclaration(undefined, [
                    factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier("variant"), undefined, undefined, undefined),
                ], factory.createBlock([
                    factory.createIfStatement(factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, constructVar), factory.createBlock([
                        factory.createThrowStatement(factory.createNewExpression(factory.createIdentifier("Error"), undefined, [
                            factory.createStringLiteral(`Cannot instantiate ${enumName} variants after initialisation`),
                        ])),
                    ], true)),
                    factory.createExpressionStatement(factory.createBinaryExpression(factory.createPropertyAccessExpression(factory.createThis(), "variant"), ts.SyntaxKind.EqualsToken, factory.createIdentifier("variant"))),
                ], true)),
                // toString
                factory.createMethodDeclaration(undefined, undefined, "toString", undefined, undefined, [], undefined, factory.createBlock([
                    factory.createReturnStatement(factory.createTemplateExpression(factory.createTemplateHead(`${enumName}(`), [
                        factory.createTemplateSpan(factory.createPropertyAccessExpression(factory.createThis(), "variant"), factory.createTemplateTail(")")),
                    ])),
                ], true)),
            ]);
            const iife = factory.createCallExpression(factory.createParenthesizedExpression(factory.createArrowFunction(undefined, undefined, [], undefined, factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), factory.createBlock([
                factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
                    factory.createVariableDeclaration(constructVar, undefined, undefined, factory.createTrue()),
                ], ts.NodeFlags.Let)),
                classDecl,
                factory.createExpressionStatement(factory.createBinaryExpression(constructVar, ts.SyntaxKind.EqualsToken, factory.createFalse())),
                factory.createReturnStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Object"), "freeze"), undefined, [factory.createIdentifier(enumName)])),
            ], true))), undefined, []);
            return factory.createVariableStatement(undefined, factory.createVariableDeclarationList([
                factory.createVariableDeclaration(factory.createIdentifier(enumName), undefined, undefined, factory.createParenthesizedExpression(iife)),
            ], ts.NodeFlags.Const));
        }
        return ts.visitNode(sourceFile, visit);
    };
}
