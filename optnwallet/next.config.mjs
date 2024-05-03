/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    webpack(config) {
        config.experiments = { ...config.experiments, topLevelAwait: true }
        return config
    },
};

export default nextConfig;
