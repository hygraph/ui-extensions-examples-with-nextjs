import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html style={{ minHeight: 'initial', height: 'initial' }}>
        <Head />
        <body
          style={{
            minHeight: 'initial',
            height: 'initial',
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
