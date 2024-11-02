import stylistic from '@stylistic/eslint-plugin';
import parserTs from '@typescript-eslint/parser';

export default [
    stylistic.configs.customize({
        indent: 4,
        semi: true,
        quotes: 'single',
        braceStyle: '1tbs',
    }),
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        languageOptions: {
            parser: parserTs,
        },
        rules: {
            '@stylistic/arrow-parens': ['error', 'as-needed'],
        },
    },
    {
        ignores: ['dist'],
    },
];
