import { useState } from 'react'
import { apiConfigured,getGithubStatus,getSummary,syncGithub } from './api.js'
import './Onboarding.css'

const sample={
  sessions:184260,views:524840,impressions:248640,clicks:22847,ctr:9.2,conversions:1923,cvr:8.4,revenue:4984600,rps:27,
  devices:{desktop:32,mobile:61,tablet:7},
  sources:[
    {channel:'オーガニック検索',sessions:74820,share:40.6,ctr:10.2,revenue:2124800},
    {channel:'直接流入',sessions:36840,share:20.0,ctr:8.1,revenue:988600},
    {channel:'SNS流入',sessions:27640,share:15.0,ctr:7.8,revenue:742200},
    {channel:'リファラル',sessions:20280,share:11.0,ctr:9.4,revenue:544400},
    {channel:'メール',sessions:14740,share:8.0,ctr:12.3,revenue:395600},
    {channel:'有料広告',sessions:9940,share:5.4,ctr:14.8,revenue:189000},
  ],
  projects:[
    {name:'task-dashboard',        status:'計測中',type:'Web',     views:28840,ctr:15.2,conversions:182,revenue:421400,trend:'+12%'},
    {name:'oshi-route-web',        status:'計測中',type:'PWA',     views:22920,ctr:11.5,conversions:143,revenue:324800,trend:'+8%'},
    {name:'korea-cheer-guide',     status:'計測中',type:'Web',     views:18340,ctr:8.9, conversions: 96,revenue:186800,trend:'+3%'},
    {name:'taiwan-gourmet-map',    status:'計測中',type:'Web',     views:14920,ctr:8.6, conversions: 72,revenue:139700,trend:'+5%'},
    {name:'darekore-jp',           status:'計測中',type:'Web',     views:62480,ctr:12.1,conversions:404,revenue:998200,trend:'+22%'},
    {name:'juku-map',              status:'計測中',type:'Web',     views:21240,ctr:6.8, conversions: 98,revenue:194300,trend:'+18%'},
    {name:'ai-365-calendar',       status:'計測中',type:'Web',     views:18620,ctr:9.4, conversions: 89,revenue:176500,trend:'+31%'},
    {name:'cosme-stock-alert',     status:'計測中',type:'Web',     views:14840,ctr:7.3, conversions: 62,revenue:122800,trend:'+9%'},
    {name:'content-stream-finder', status:'計測中',type:'Web',     views:19120,ctr:8.1, conversions: 94,revenue:187100,trend:'+14%'},
    {name:'ranking-widget-hub',    status:'SDK待ち',type:'SaaS',   views: 8280,ctr:5.6, conversions: 28,revenue: 55200,trend:'+2%'},
    {name:'licensed-video-guide',  status:'SDK待ち',type:'Web',    views:10640,ctr:6.2, conversions: 42,revenue: 83100,trend:'+7%'},
    {name:'sukima-insight',        status:'開発中', type:'SaaS',   views: 4180,ctr:4.8, conversions: 19,revenue: 37600,trend:'新規'},
    {name:'gyosei-yosou',          status:'計測中',type:'Web',     views:13840,ctr:7.9, conversions: 61,revenue:120800,trend:'+4%'},
    {name:'reservation-waiting-time-v1',status:'計測中',type:'Web',views:11120,ctr:8.3, conversions: 57,revenue:112900,trend:'+11%'},
    {name:'miseoshi-app',          status:'SDK待ち',type:'App',    views: 7960,ctr:5.1, conversions: 25,revenue: 49400,trend:'新規'},
    {name:'game-ense-',            status:'開発中', type:'Web',    views: 5840,ctr:4.2, conversions: 21,revenue: 41500,trend:'新規'},
    {name:'akecom-spa2x-ryu',      status:'計測中',type:'PWA',     views: 8380,ctr:6.7, conversions: 40,revenue: 79200,trend:'+6%'},
    {name:'wangan-base',           status:'開発中', type:'Web',    views: 3920,ctr:3.8, conversions: 17,revenue: 33700,trend:'新規'},
    {name:'vs-jt',                 status:'SDK待ち',type:'App',    views: 5640,ctr:4.5, conversions: 20,revenue: 39600,trend:'+1%'},
    {name:'yuniba',                status:'開発中', type:'App',    views: 2380,ctr:3.2, conversions: 10,revenue: 19800,trend:'新規'},
    {name:'gyosei-quiz',           status:'計測中',type:'Web',     views: 9240,ctr:7.1, conversions: 38,revenue: 75000,trend:'+16%'},
    {name:'hotel-price-watch',     status:'計測中',type:'Web',     views:11480,ctr:8.8, conversions: 58,revenue:114900,trend:'+20%'},
    {name:'bowling-event-jp',      status:'計測中',type:'Web',     views: 8620,ctr:6.4, conversions: 33,revenue: 65300,trend:'+7%'},
    {name:'allbowl01',             status:'計測中',type:'Web',     views: 6840,ctr:5.9, conversions: 24,revenue: 47500,trend:'+3%'},
    {name:'sedora-s',              status:'SDK待ち',type:'App',    views: 4280,ctr:4.1, conversions: 14,revenue: 27700,trend:'新規'},
  ],
  funnel:[
    ['アクセス',        184260],
    ['LP到達',          138480],
    ['スクロール25%',   104820],
    ['スクロール50%',    82340],
    ['CTA表示',          58640],
    ['AI・機能説明到達', 38920],
    ['準備開始',         24280],
    ['準備完了',         16140],
    ['広告クリック',      9847],
    ['購入手続き',        4320],
    ['成果（CV）',        1923],
  ],
  topPages:[
    {path:'/',             views:84240,avgTime:'2:18',bounceRate:37.4},
    {path:'/actress/',     views:52480,avgTime:'3:55',bounceRate:29.2},
    {path:'/venues/',      views:38820,avgTime:'3:12',bounceRate:40.1},
    {path:'/items/',       views:31640,avgTime:'4:38',bounceRate:27.7},
    {path:'/search/',      views:24380,avgTime:'2:04',bounceRate:52.3},
    {path:'/makers/',      views:18240,avgTime:'3:28',bounceRate:33.8},
    {path:'/areas/東京都/',views:14820,avgTime:'2:44',bounceRate:44.6},
    {path:'/areas/大阪府/',views:11480,avgTime:'2:31',bounceRate:46.2},
    {path:'/favorites/',   views: 9820,avgTime:'4:12',bounceRate:24.9},
    {path:'/feed.xml',     views: 8640,avgTime:'0:12',bounceRate:88.4},
  ],
  recommendations:[
    'LP到達→スクロール25%の離脱25%：ファーストビューにKPI数値（「累計CV 1,923件」等）を追加してスクロールを誘導する',
    'スクロール50%→CTA表示の離脱29%：CTA手前に成功事例カードを3枚配置してコンバージョン意欲を上げる',
    'AI準備開始→準備完了の離脱38%：ステップインジケーターを追加して「あと1ステップ」を可視化する',
    'darekore-jpのCV +22%成功要因を分析：パンくずリスト・個別ページ追加が寄与の可能性、他サイトに横展開する',
    'SDK未設置5件（ranking-widget-hub・miseoshi-app・vs-jt・sedora-s・licensed-video-guide）の計測を今月中に対応する',
    'モバイルセッション61%に対してモバイルCTAの成果率がデスクトップの62%：スマホ最適化を最優先課題とする',
    'オーガニック検索CTR10.2%はメタ説明文の改善が有効：darekore.jpと塾マップのtitleをクリック訴求型に変更する',
    'SNS流入CVRが検索の73%：SNS流入専用ランディングページを作成してコンバージョン率を底上げする',
    'juku-map +18%成長中：エリア別ページとシーダーデータ追加の効果、引き続きコンテンツ追加を優先する',
    'ai-365-calendar +31%で最高成長率：Claude AI紹介文×個別ページの組み合わせが機能、他サイトにも適用する',
    'メール流入のCTR12.3%は全チャネル最高：定期メルマガ（週1回）の配信を開始してリピート率を上げる',
    '直帰率88.4%のfeed.xmlはRSS経由アクセス：RSSフィード登録誘導バナーをトップに設置する',
    'hotel-price-watch +20%成長：値下げ通知メール機能のCTA文言をA/Bテストして成果率を改善する',
    'oshi-route-webのPWA対応が功を奏しているか確認：Service Workerのキャッシュ戦略を最適化する',
    'gyosei-quizの成長継続中（+16%）：試験別ページを追加してSEO流入を拡大する',
  ],
  weeklyTrend:[
    {week:'7/14週',sessions:38240,revenue:1024600},
    {week:'7/21週',sessions:41820,revenue:1182400},
    {week:'7/28週',sessions:46380,revenue:1288600},
    {week:'8/4週', sessions:57820,revenue:1489000},
  ],
}
const n=(v)=>new Intl.NumberFormat('ja-JP').format(v),yen=(v)=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(v),githubSlug=import.meta.env.VITE_GITHUB_APP_SLUG||''

export default function App(){const [data,setData]=useState(sample),[workspace,setWorkspace]=useState('ws-demo'),[key,setKey]=useState(''),[days,setDays]=useState(30),[github,setGithub]=useState(null),[message,setMessage]=useState(apiConfigured?'管理キーを入力すると実測値へ切り替わります。':'デモデータを表示しています。');const load=async()=>{try{const [summary,status]=await Promise.all([getSummary(workspace,key,days),getGithubStatus(workspace,key)]);setData(summary);setGithub(status);setMessage('最新データを表示しています。')}catch(error){setMessage(`取得できませんでした: ${error.message}`)}};const synchronize=async()=>{try{const result=await syncGithub(workspace,key);setMessage(`${result.synced}件を同期しました。`);setGithub(await getGithubStatus(workspace,key))}catch(error){setMessage(`同期できませんでした: ${error.message}`)}};const max=Math.max(...data.funnel.map(([,v])=>v),1),installUrl=githubSlug?`https://github.com/apps/${githubSlug}/installations/new`:'#setup';return <main>
<header><a href="#top" className="logo"><i/>SUKIMA INSIGHT</a><nav><a href="#overview">概要</a><a href="#setup">導入</a><a href="#projects">全リポジトリ</a><a href="#pricing">料金</a></nav><a className="header-action" href={installUrl}>GitHubを接続</a></header>
<section className="hero" id="top"><p className="kicker">CROSS-REPOSITORY GROWTH PLATFORM</p><h1>公開したすべてを、<br/><em>数字で育てる。</em></h1><p>GitHubの全サイト・Web・PWA・アプリを一つの指標で比較。アクセスから収益まで、次に直す場所が分かります。</p><div><a href="#overview">ダッシュボードを見る</a><span>IPを保存しない日次匿名セッション</span></div></section>
<section className="dashboard" id="overview"><div className="toolbar"><div><p className="kicker">LIVE OVERVIEW</p><h2>成果ダッシュボード</h2></div><div><select value={days} onChange={(e)=>setDays(Number(e.target.value))}><option value="7">7日</option><option value="30">30日</option><option value="90">90日</option></select>{apiConfigured&&<><input value={workspace} onChange={(e)=>setWorkspace(e.target.value)} aria-label="ワークスペースID"/><input type="password" value={key} onChange={(e)=>setKey(e.target.value)} placeholder="管理キー"/><button onClick={load}>実測値を取得</button></>}<small>{message}</small></div></div>
<div className="kpis">{[['アクセス数',n(data.sessions),'セッション'],['PV',n(data.views),'ページ表示'],['CTR',`${data.ctr}%`,`${n(data.clicks)}クリック`],['CVR',`${data.cvr}%`,`${n(data.conversions)}成果`],['売上',yen(data.revenue),'推定'],['RPS',yen(data.rps),'セッション収益']].map(([l,v,note])=><article key={l}><span>{l}</span><strong>{v}</strong><small>{note}</small></article>)}</div>
<div className="grid"><section className="panel"><p className="kicker">CONVERSION FUNNEL</p><h3>どこで離脱しているか</h3><div className="funnel">{data.funnel.map(([l,v],i)=><div key={l}><span>{l}</span><i><b style={{width:`${Math.max(2,v/max*100)}%`}}/></i><strong>{n(v)}</strong>{i>0&&<small>{data.funnel[i-1][1]?Math.round(v/data.funnel[i-1][1]*100):0}%</small>}</div>)}</div></section><aside className="panel improve"><p className="kicker">IMPROVEMENT QUEUE</p><h3>次に直す項目（{data.recommendations.length}件）</h3><ol>{data.recommendations.map((item,i)=><li key={item}><b>0{i+1}</b><span>{item}</span></li>)}</ol></aside></div>
{data.topPages&&<section className="panel" style={{marginTop:'16px'}}><p className="kicker">TOP PAGES</p><h3>滞在時間・直帰率</h3><div className="table"><div className="row heading"><span>パス</span><span>PV</span><span>平均滞在</span><span>直帰率</span></div>{data.topPages.map(p=><div className="row" key={p.path}><strong>{p.path}</strong><span>{n(p.views)}</span><span>{p.avgTime}</span><span>{p.bounceRate}%</span></div>)}</div></section>}

{data.sources&&<section className="panel" style={{marginTop:'16px'}}><p className="kicker">TRAFFIC SOURCES</p><h3>流入チャネル別パフォーマンス</h3><div className="table"><div className="row heading"><span>チャネル</span><span>セッション</span><span>シェア</span><span>CTR</span><span>売上</span></div>{data.sources.map(s=><div className="row" key={s.channel}><strong>{s.channel}</strong><span>{n(s.sessions)}</span><span>{s.share}%</span><span>{s.ctr}%</span><span>{yen(s.revenue)}</span></div>)}</div></section>}

{data.weeklyTrend&&<section className="panel" style={{marginTop:'16px'}}><p className="kicker">WEEKLY TREND</p><h3>週次セッション・売上推移</h3><div className="table"><div className="row heading"><span>週</span><span>セッション</span><span>売上</span><span>前週比</span></div>{data.weeklyTrend.map((w,i)=>{const prev=data.weeklyTrend[i-1];const diff=prev?Math.round((w.sessions-prev.sessions)/prev.sessions*100):null;return <div className="row" key={w.week}><strong>{w.week}</strong><span>{n(w.sessions)}</span><span>{yen(w.revenue)}</span><span style={{color:diff&&diff>0?"#4ade80":"#a0aec0"}}>{diff!=null?(diff>0?'+':'')+diff+'%':'—'}</span></div>})}</div></section>}

{data.devices&&<section className="panel" style={{marginTop:'16px',display:'flex',gap:'16px',flexWrap:'wrap'}}><div><p className="kicker">DEVICE SPLIT</p><h3>デバイス比率</h3></div><div style={{display:'flex',gap:'24px',alignItems:'center',flexWrap:'wrap'}}>{[['モバイル',data.devices.mobile,'#a78bfa'],['デスクトップ',data.devices.desktop,'#60a5fa'],['タブレット',data.devices.tablet,'#34d399']].map(([l,v,c])=><div key={l} style={{textAlign:'center'}}><strong style={{fontSize:'28px',color:c}}>{v}%</strong><p style={{margin:'4px 0 0',fontSize:'12px',color:'#a0aec0'}}>{l}</p></div>)}</div></section>}
<section className="panel setup" id="setup"><div><p className="kicker">3-STEP ONBOARDING</p><h3>全リポジトリを自動で取り込む</h3><p>① GitHub Appをインストール　② 計測SDKを追加　③ 成果イベントを送信</p></div><div className="connection"><strong>{github?.installations?.length?'接続済み':'未接続'}</strong><span>{github?`${github.repositoryCount}件同期・最終 ${github.installations[0]?.last_synced_at?new Date(github.installations[0].last_synced_at).toLocaleString('ja-JP'):'未同期'}`:'管理キーで状態を確認できます'}</span>{github?.installations?.length?<button onClick={synchronize}>今すぐ同期</button>:<a href={installUrl}>GitHub Appを導入</a>}</div></section>
<section className="panel repos" id="projects"><div className="panel-head"><div><p className="kicker">ALL GITHUB REPOSITORIES</p><h3>リポジトリ別パフォーマンス</h3></div><span>追加・移管・削除をGitHub Appで自動同期</span></div><div className="table"><div className="row heading"><span>プロジェクト</span><span>種別</span><span>状態</span><span>PV</span><span>CTR</span><span>成果</span><span>売上</span><span>前週比</span></div>{data.projects.map((p)=><div className="row" key={p.name}><strong>{p.name}</strong><span className="type-badge">{p.type}</span><span><i className={p.status==='計測中'?'online':''}/>{p.status}</span><span>{n(p.views)}</span><span>{p.ctr}%</span><span>{n(p.conversions)}</span><span>{yen(p.revenue)}</span><span style={{color:p.trend&&p.trend.startsWith('+')?"#4ade80":"#a0aec0"}}>{p.trend}</span></div>)}</div></section></section>
<section className="pricing" id="pricing"><p className="kicker">PRICING MODEL</p><h2>実証してから、販売する。</h2><div>{[['Starter','¥0','3プロジェクトまで','基本KPI・週次レポート・90日保存','今すぐ無料で始める'],['Growth','¥2,980/月','30プロジェクトまで','収益・A/Bテスト・日次レポート・通知・1年保存','成長プランを試す'],['Agency','¥9,800/月','複数顧客対応','権限管理・ホワイトラベル・月次レビュー','代理店向けを相談'],['Enterprise','要相談','全リポジトリ無制限','SSO・監査ログ・SLA・専任サポート','個別見積りを取得']].map(([name,price,limit,detail,cta])=><article key={name}><b>{name}</b><strong>{price}</strong><em>{limit}</em><p>{detail}</p><a href="mailto:hello@sukima-insight.jp">{cta} →</a></article>)}</div></section><footer><a href="#top" className="logo"><i/>SUKIMA INSIGHT</a><p>Privacy-first analytics for every product.</p><span>© 2026 SUKIMA INSIGHT</span></footer></main>}
