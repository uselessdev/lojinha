/** @type {import("prettier").Config} */

const config = {
  plugins: [require.resolve("prettier-config-tailwindcss")],
  printWidth: 120,
};

module.exports = config;
