import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <link
                        rel="icon"
                        href="ssi_tyron.svg"
                        type="image/svg+xml"
                        sizes="16x16"
                    />
                    <meta name="title" content="TYRON" />
                    <meta
                        name="description"
                        content="Be Your Own ₿ank | Hold Bitcoin to loan SYRON USD 🌎 - Overcollateralized with BTC for digital payments across the Americas"
                    />
                    <meta property="og:image" content="ssi_tyron.png" />
                    <meta property="og:title" content="TYRON" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
