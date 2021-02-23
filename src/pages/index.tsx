import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Next ui extension playground</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Next ui extension playground</h1>
        <ul>
          <li>
            <Link href="/extensions/shopify">
              <a>Shopify product input</a>
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
