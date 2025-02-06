import type { NextConfig } from "next";
import withTM from 'next-transpile-modules';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      dns: false,
    };
    return config;
  },
  transpilePackages: [
    '@ant-design/pro-components',
    'rc-util',
    'antd',
    '@ant-design/icons',
    'rc-pagination',
    'rc-picker'
  ],
};

export default withTM([
  '@ant-design/pro-components',
  'rc-util',
  'antd',
  '@ant-design/icons',
  'rc-pagination',
  'rc-picker'
])(nextConfig);
