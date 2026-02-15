# ペイ得ナビ — Claude Code 引継ぎ資料

## 1. プロジェクト概要

「ペイ得ナビ」は、現在地周辺の店舗に対して最も還元率の高い支払い手段（クレジットカード・コード決済・電子マネーなど）を提示するWebアプリ（PWA）。

### コンセプト
- ユーザーが店に入る前に「この店では何で払うのが一番お得か」を即座に確認できる
- 例: サイゼリヤ → 三井住友NL（タッチ決済）で7%還元

### ターゲットユーザー
- 複数のクレジットカード・コード決済を使い分けている日本の消費者
- ポイ活に関心があるが、全店舗の還元率を覚えきれない人

---

## 2. 技術スタック（確定）

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フレームワーク | **Next.js (App Router)** | SSR/SSG対応、Vercelとの親和性 |
| 地図 | **OpenStreetMap + Leaflet** | 完全無料、商用利用可 |
| 店舗検索 | **Overpass API** | OSMのデータをクエリ可能、無料 |
| ホスティング | **Vercel** | 無料枠で十分、Next.jsネイティブ対応 |
| PWA | **next-pwa** or 手動設定 | ホーム画面追加、オフライン対応 |
| 還元率DB | **JSONファイル（初期）** | 将来的にSupabase等に移行可能 |
| スタイリング | **CSS Modules or Tailwind** | フラットデザイン（Google/Apple風） |
| 言語 | **TypeScript** | 型安全性 |

### 完全無料の制約
- Google Maps / Places APIは使わない（従量課金のため）
- Overpass APIは無料だがレートリミットあり（1秒1リクエスト程度）。キャッシュ戦略が必要

---

## 3. プロトタイプの現状

### 添付ファイル
- `pay-navi.html` — 単一HTMLファイルの動作するプロトタイプ

### 実装済みの機能
1. **マップタブ**: Leaflet + OSMタイルで地図表示、店舗マーカー（還元率表示付き）
2. **検索タブ**: テキスト検索 + カテゴリフィルタ（コンビニ/飲食店/カフェ/ショッピング）
3. **マイカードタブ**: 持っている決済手段の登録・解除（LocalStorageに保存）
4. **店舗カード**: タップで展開、支払い方法を還元率順にランキング表示
5. **マイカード連動**: 未登録のカードはグレーアウト、登録済みの中でのベスト表示

### 未実装（Claude Codeで実装すべき）
1. Overpass APIによるリアルタイム店舗検索
2. Next.jsプロジェクト化
3. PWA化（manifest.json, Service Worker）
4. Vercelデプロイ設定
5. 還元率データの外部JSON化と管理構造
6. レスポンシブ最適化の仕上げ

---

## 4. デザイン方針

### フラットデザイン（Google Material You / Apple HIG風）
- **背景**: #F8F9FA（Surface Dim）
- **カード**: #FFFFFF、border-radius: 12px、shadow: 0 1px 2px rgba(60,64,67,0.1)
- **アクセントカラー**: #1A73E8（Google Blue）
- **テキスト**: #202124 / #5F6368 / #9AA0A6（3段階）
- **ボーダー**: #DADCE0 / #E8EAED
- **フォント**: Noto Sans JP（本文）、DM Mono（数値）
- **インタラクション**: シンプルなタップフィードバック、控えめなアニメーション
- **装飾は最小限**: グラデーション・影・エフェクトは控えめに

### 還元率の色分け
| 還元率 | 色 | 用途 |
|--------|-----|------|
| 5%以上 | #EA4335（赤） | 超高還元 |
| 3%以上 | #FA7B17（オレンジ） | 高還元 |
| 1.5%以上 | #1A73E8（青） | 中還元 |
| それ以下 | #9AA0A6（グレー） | 通常 |

---

## 5. 還元率データ構造

### 現在のデータ形式（これを踏襲すること）

```typescript
// types.ts
interface PaymentMethod {
  id: string;           // "smbc_nl"
  name: string;         // "三井住友NL"
  fullName: string;     // "三井住友カード(NL)"
  icon: string;         // "💳"
  color: string;        // "#00A650"
  type: "credit" | "qr" | "emoney" | "transport";
  group: string;        // "クレジットカード"
}

interface StoreReward {
  method: string;       // PaymentMethod.id
  rate: number;         // 7.0（%）
  note: string;         // "対象のコンビニ・飲食店で最大7%還元"
}

// store-rewards.json
{
  "サイゼリヤ": [
    { "method": "smbc_nl", "rate": 7.0, "note": "対象のコンビニ・飲食店で最大7%還元" },
    { "method": "paypay", "rate": 1.0, "note": "PayPay残高払い" }
  ]
}
```

### 収録済み決済手段（17種）
**クレジットカード**: 三井住友NL、三井住友ゴールドNL、楽天カード、JCB CARD W、au PAYカード、dカード、dカード GOLD
**コード決済**: PayPay、楽天ペイ、d払い、au PAY、LINE Pay
**電子マネー**: WAON、nanaco、iD、QUICPay
**交通系IC**: Suica

### 収録済み店舗（15店舗）
サイゼリヤ、ガスト、マクドナルド、セブンイレブン、ローソン、ファミリーマート、すき家、スターバックス、ドトール、吉野家、松屋、イオン、ユニクロ、ビックカメラ、モスバーガー、ココス

### データ管理の方針
- 初期は `data/store-rewards.json` と `data/payment-methods.json` で管理
- 店舗名はOSMの `name` タグとの部分一致でマッチングする
- 還元率の正確性はユーザー（開発者）が手動で更新する前提
- 将来的にはSupabase等に移行し、ユーザー投稿・管理画面を追加

---

## 6. Overpass API 店舗検索の実装方針

### 基本的なクエリ例
```
[out:json][timeout:10];
(
  node["shop"](around:1000, {lat}, {lng});
  node["amenity"~"restaurant|cafe|fast_food"](around:1000, {lat}, {lng});
  node["shop"="convenience"](around:500, {lat}, {lng});
);
out body;
```

### マッチングロジック
1. Overpass APIで周辺のPOI（Point of Interest）を取得
2. OSMの `name` タグと還元率DBのキーを部分一致で照合
3. マッチした店舗にのみ還元率情報を表示
4. マッチしない店舗は「データなし」として表示

### 注意点
- Overpass APIのエンドポイント: `https://overpass-api.de/api/interpreter`
- レートリミット: 控えめに使う（キャッシュ必須）
- 日本のチェーン店はOSMにかなり登録されているが、個人店は少ない
- `brand` タグも活用すると精度が上がる（例: `brand=セブン-イレブン`）

---

## 7. 推奨ディレクトリ構造

```
pay-navi/
├── app/
│   ├── layout.tsx          # ルートレイアウト（ヘッダー + タブバー）
│   ├── page.tsx            # マップページ（デフォルト）
│   ├── search/
│   │   └── page.tsx        # 検索ページ
│   ├── wallet/
│   │   └── page.tsx        # マイカードページ
│   └── globals.css
├── components/
│   ├── Map.tsx             # Leaflet地図コンポーネント（dynamic import）
│   ├── StoreCard.tsx       # 店舗カード
│   ├── PaymentRow.tsx      # 支払い方法行
│   ├── RateBadge.tsx       # 還元率バッジ
│   ├── TabBar.tsx          # 下部タブバー
│   └── Header.tsx          # 上部ヘッダー
├── data/
│   ├── payment-methods.json
│   └── store-rewards.json
├── lib/
│   ├── overpass.ts         # Overpass APIクライアント
│   ├── matching.ts         # 店舗名マッチングロジック
│   └── geo.ts              # 位置情報ユーティリティ
├── hooks/
│   ├── useGeolocation.ts
│   ├── useNearbyStores.ts
│   └── useWallet.ts        # マイカード状態管理
├── public/
│   ├── manifest.json       # PWAマニフェスト
│   ├── sw.js               # Service Worker
│   └── icons/              # PWAアイコン
├── next.config.js
├── package.json
└── tsconfig.json
```

### Leafletの注意点（Next.js）
- LeafletはSSR非対応のため `dynamic import` + `ssr: false` が必須
- `next/dynamic` でMapコンポーネントを読み込む

```typescript
// app/page.tsx
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });
```

---

## 8. PWA設定

### manifest.json
```json
{
  "name": "ペイ得ナビ",
  "short_name": "ペイ得ナビ",
  "description": "近くのお店で一番おトクな支払い方法を見つけよう",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8F9FA",
  "theme_color": "#1A73E8",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 9. 実装の優先順位

### Phase 1: 基本動作（まずここまで）
1. `create-next-app` でプロジェクト初期化（TypeScript）
2. プロトタイプのUIをReactコンポーネントに分解
3. 還元率データをJSONファイルに外出し
4. Leaflet地図の表示（dynamic import）
5. マイカード機能（localStorage）
6. Vercelにデプロイ

### Phase 2: 実店舗連携
7. Overpass APIで周辺店舗を取得
8. 店舗名マッチングロジック実装
9. 検索結果のキャッシュ（API負荷軽減）
10. ローディング状態・エラーハンドリング

### Phase 3: PWA化
11. manifest.json + Service Worker
12. オフラインキャッシュ（還元率データ）
13. PWAアイコン生成

### Phase 4: 拡張（将来）
14. 還元率データの管理画面
15. ユーザー投稿機能
16. プッシュ通知（店舗接近時）
17. バーコード読み取りで店舗特定

---

## 10. 注意事項・既知の課題

### 還元率データの正確性
- **現在のデータはデモ用サンプル**。カード会社の公式サイトで確認の上、手動で修正が必要
- 三井住友NLの7%還元は「スマホのタッチ決済」が条件。こうした条件分岐は `note` フィールドで説明している
- キャンペーンで一時的に還元率が変わることがある

### Overpass API
- 本番環境ではOverpass APIに過度なリクエストを送らないこと
- 独自のOverpassサーバーを立てることも将来的に検討
- 結果はSessionStorageまたはReact Stateでキャッシュする

### 法的注意
- 還元率情報の正確性について免責事項を必ず表示すること（実装済み）
- 特定のカードを推奨する形にならないよう、中立的な表示を心がける

---

## 11. 参考：プロトタイプのスクリーンショット的な説明

### マップ画面
- 上半分: OSM地図。店舗位置にマーカー（カテゴリアイコン + 最大還元率%）
- 下半分: 店舗カードのスクロールリスト。距離順ソート
- 右下: 現在地ボタン

### 店舗カード（展開時）
- ヘッダー: カテゴリアイコン、店名、距離、最大還元率バッジ
- 展開部: 支払い方法ランキング（持っているカード優先、還元率降順）
- 1位にはグリーンのハイライト、未登録カードはグレーアウト + 「未登録」ラベル

### マイカード画面
- 上部: 登録済み件数の表示
- カテゴリ別グリッド: 2列で決済手段を表示
- タップでON/OFF切替（チェックマーク付き）
- 選択状態は青ボーダー + 青背景

---

*この資料と `pay-navi.html` をClaude Codeに渡して、Phase 1から順に実装を進めてください。*
