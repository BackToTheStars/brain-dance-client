const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Иначе каждый `next dev` дописывает в CLAUDE.md репозитория свой блок правил.
  agentRules: false,
};

module.exports = withNextIntl(nextConfig);
