/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    experimental: { appDir: true },
    webpack(config) {
        config.experiments = { ...config.experiments, topLevelAwait: true }
        return config
    },
};

export default nextConfig;
