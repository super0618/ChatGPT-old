import { DocumentProps, Head, Html, Main, NextScript } from 'next/document';
import { Metadata } from 'next';

import i18nextConfig from '../next-i18next.config';

type Props = DocumentProps & {
  // add custom document props
};

export default function Document(props: Props) {
  const currentLocale =
    props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale;
  return (
    <Html lang={currentLocale} dir={currentLocale === 'he' ? 'rtl' : 'ltr'}>
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Chatbot UI"></meta>
        {/* <script async src='https://platform.foremedia.net/code/37959/analytics' />
        <script id='pixel-script-poptin' src='https://cdn.popt.in/pixel.js?id=f14d8776d54de' async /> */}
        <script dangerouslySetInnerHTML={{__html: `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TPNNJTJ');
        `}}>
        </script>
      </Head>
      <body>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TPNNJTJ" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export const metadata: Metadata = {
  title: 'ChatGPT',
  description: 'A chat page based on premium CHATGPT with special features. The page is translated into Hebrew, easy to use and completely free. Come in to try'
};