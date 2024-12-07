import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig([
    {
        entries: ['./src/index'],
        outDir: 'dist',
        // at this time, 'dist/repl.cjs' is still missing, so a warning will appear.
        failOnWarn: false,
        declaration: true,
        rollup: {
            emitCJS: true,
        },
    },
    {
        entries: ['./src/repl'],
        outDir: 'dist',
        rollup: {
            inlineDependencies: false,
            emitCJS: true,
        },
    },
]);
