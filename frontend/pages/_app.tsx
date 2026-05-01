import type { AppProps } from 'next/app';
import 'antd/dist/reset.css';
import '../src/index.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
