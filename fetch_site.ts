// fetch_site.ts
import puppeteer from "https://deno.land/x/puppeteer/mod.ts";

if (Deno.args.length < 1) {
  console.error("Usage: deno run --allow-net --allow-write --allow-env --allow-read --allow-run fetch_site.ts <url> [delay_ms]");
  Deno.exit(1);
}

const url = Deno.args[0];
const delayMs = Deno.args.length >= 2 ? parseInt(Deno.args[1]) : 1000;

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();

// 設定：ユーザーエージェント
await page.setUserAgent(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
);

// 設定：リファラなど追加のヘッダー
await page.setExtraHTTPHeaders({
  "referer": "https://note.com/"
});

// 任意：画面サイズやその他の設定を追加で行うことも可能
await page.setViewport({ width: 1280, height: 800 });

// ページにアクセス。ネットワークアイドル状態になるまで待機
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
if (delayMs > 0) {
  await page.waitForTimeout(delayMs);
}

// ページ全体のHTMLを取得
const html = await page.content();

// URL のホスト名からファイル名を生成（例: note.com.html）
const hostname = new URL(url).hostname;
const filename = `${hostname}.html`;

// ファイルに保存
await Deno.writeTextFile(filename, html);
console.log(`HTML has been saved to ${filename}`);

await browser.close();
