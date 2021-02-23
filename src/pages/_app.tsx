import type { AppProps } from 'next/app';
import '@shopify/polaris/dist/styles.css';

function MyApp({ Component, pageProps, router }: AppProps) {
  const {
    query: { extensionUid },
  } = router;
  // when calling the extension, graphcms injects a unique id in the url to ensure exclusive communication if multiple instances of the same extension exist
  return <Component {...pageProps} extensionUid={extensionUid} />;
}

export default MyApp;
