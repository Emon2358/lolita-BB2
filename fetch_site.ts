// fetch_site.ts
// Puppeteer for Deno を利用して指定 URL のページをレンダリングし、動的コンテンツも含めたHTMLを出力する例です。

import puppeteer from "https://deno.land/x/puppeteer/mod.ts";

// コマンドライン引数から URL と追加待機時間（ミリ秒）を受け取る
if (Deno.args.length < 1) {
  console.error("Usage: deno run --allow-net --allow-write fetch_site.ts <url> [delay_ms]");
  Deno.exit(1);
}

const url = Deno.args[0];
const delayMs = Deno.args.length >= 2 ? parseInt(Deno.args[1]) : 1000;

// Puppeteer を headless モードで起動（軽量化のためサンドボックス無効化オプションを追加）
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();

// 指定した URL に移動。ネットワーク接続が落ち着く (networkidle2) まで待機
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

// 必要に応じて追加の待機。これにより動的コンテンツが完全にレンダリングされる可能性が向上します。
if (delayMs > 0) {
  await page.waitForTimeout(delayMs);
}

// ページ全体の HTML を取得
const html = await page.content();

// URL からホスト名を抽出し、{hostname}.html というファイル名にする
const hostname = new URL(url).hostname;
const filename = `${hostname}.html`;

// 取得したHTMLをファイルに保存
await Deno.writeTextFile(filename, html);
console.log(`HTML has been saved to ${filename}`);

// ブラウザを終了
await browser.close();
