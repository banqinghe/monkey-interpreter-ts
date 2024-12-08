/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        fontFamily: {
            mono: ['Consolas', 'Source Code Pro', 'ui-monospace'],
        },
        extend: {},
    },
    plugins: [],
};
