import { useState } from 'react'
import { apiConfigured,getGithubStatus,getSummary,syncGithub } from './api.js'
import './Onboarding.css'

const sample={
  sessions:84260,views:238940,impressions:108640,clicks:9847,ctr:9.1,conversions:823,cvr:8.4,revenue:2184600,rps:25,
  projects:[
    {name:'task-dashboard',      status:'計測中',  type:'Web',     views:28840,ctr:15.2,conversions:182,revenue:421400},
    {name:'oshi-route-web',      status:'計測中',  type:'PWA',     views:22920,ctr:11.5,conversions:143,revenue:324800},
    {name:'korea-cheer-guide',   status:'計測中',  type:'Web',     views:18340,ctr:8.9, conversions: 96,revenue:186800},
    {name:'taiwan-gourmet-map',  status:'計測中',  type:'Web',     views:14920,ctr:8.6, conversions: 72,revenue:139700},
    {name:'darekore-jp',         status:'計測中',  type:'Web',     views:32480,ctr:12.1,conversions:204,revenue:498200},
    {name:'juku-map',            status:'計測中',  type:'Web',     views:11240,ctr:6.8, conversions: 48,revenue: 94300},
    {name:'ai-365-calendar',     status:'計測中',  type:'Web',     views: 8620,ctr:9.4, conversions: 39,revenue: 76500},
    {name:'cosme-stock-alert',   status:'計測中',  type:'Web',     views: 7840,ctr:7.3, conversions: 32,revenue: 62800},
    {name:'content-stream-finder',status:'計測中', type:'Web',     views: 9120,ctr:8.1, conversions: 44,revenue: 87100},
    {name:'ranking-widget-hub',  status:'SDK待ち', type:'SaaS',    views: 4280,ctr:5.6, conversions: 18,revenue: 35200},
    {name:'licensed-video-guide',status:'SDK待ち', type:'Web',     views: 5640,ctr:6.2, conversions: 22,revenue: 43100},
    {name:'sukima-insight',      status:'開発中',  type:'SaaS',    views: 2180,ctr:4.8, conversions:  9,revenue: 17600},
    {name:'gyosei-yosou',        status:'計測中',  type:'Web',     views: 6840,ctr:7.9, conversions: 31,revenue: 60800},
    {name:'reservation-waiting-time-v1',status:'計測中',type:'Web',views: 5120,ctr:8.3, conversions: 27,revenue: 52900},
    {name:'miseoshi-app',        status:'SDK待ち', type:'App',     views: 3960,ctr:5.1, conversions: 15,revenue: 29400},
    {name:'game-ense-',          status:'開発中',  type:'Web',     views: 2840,ctr:4.2, conversions: 11,revenue: 21500},
    {name:'akecom-spa2x-ryu',    status:'計測中',  type:'PWA',     views: 4380,ctr:6.7, conversions: 20,revenue: 39200},
    {name:'wangan-base',         status:'開発中',  type:'Web',     views: 1920,ctr:3.8, conversions:  7,revenue: 13700},
    {name:'vs-jt',               status:'SDK待ち', type:'App',     views: 2640,ctr:4.5, conversions: 10,revenue: 19600},
    {name:'yuniba',              status:'開発中',  type:'App',     views: 1380,ctr:3.2, conversions:  5,revenue:  9800},
  ],
  funnel:[
    ['アクセス',84260],
    ['LP到達',61480],
    ['スクロール50%',42340],
    ['CTA表示',28640],
    ['AI準備開始',18920],
    ['準備完了',12280],
    ['広告クリック',9847],
    ['カート追加',4320],
    ['成果',823],
  ],
  topPages:[
    {path:'/',views:38240,avgTime:'2:12',bounceRate:38.4},
    {path:'/actress/',views:22480,avgTime:'3:45',bounceRate:31.2},
    {path:'/venues/',views:14820,avgTime:'2:58',bounceRate:42.1},
    {path:'/items/',views:11640,avgTime:'4:22',bounceRate:28.7},
    {path:'/search/',views:9380,avgTime:'1:48',bounceRate:54.3},
  ],
  recommendations:[
    'LP到達→スクロール50%の離脱が18%：ファーストビューのCTA位置を上に移動する',
    'CTA表示→AI準備開始の離脱が34%：ボタンコピーを「無料で試す」に変更するA/Bテストを実施',
    'korea-cheer-guideのCTR低下（先月比-1.2pt）：トップ画像をイベント写真に差し替える',
    'darekore-jpのCVR上位：成功パターンをjuku-mapのCTAデザインに横展開する',
    'SDK未設置プロジェクト3件：ranking-widget-hub・licensed-video-guide・miseoshi-appの計測を優先接続する',
    'モバイルセッションが全体の68%：task-dashboardのモバイルCTAを固定フッターに変更する',
    '成果単価がrps¥25：oshi-route-webのホテル提案ページのみrps¥31と高い、パターンを分析する',
    'taiwan-gourmet-mapのページ滞在時間が最短（1:42）：ページ内コンテンツをQ&A形式に再編する',
    'juku-mapの月謝口コミ投稿数が伸び悩み：投稿完了後のシェアボタンを追加して拡散を促す',
    'ai-365-calendarの新規セッション率92%：リピート施策（ブックマーク誘導・通知登録）を追加する',
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
<section className="panel setup" id="setup"><div><p className="kicker">3-STEP ONBOARDING</p><h3>全リポジトリを自動で取り込む</h3><p>① GitHub Appをインストール　② 計測SDKを追加　③ 成果イベントを送信</p></div><div className="connection"><strong>{github?.installations?.length?'接続済み':'未接続'}</strong><span>{github?`${github.repositoryCount}件同期・最終 ${github.installations[0]?.last_synced_at?new Date(github.installations[0].last_synced_at).toLocaleString('ja-JP'):'未同期'}`:'管理キーで状態を確認できます'}</span>{github?.installations?.length?<button onClick={synchronize}>今すぐ同期</button>:<a href={installUrl}>GitHub Appを導入</a>}</div></section>
<section className="panel repos" id="projects"><div className="panel-head"><div><p className="kicker">ALL GITHUB REPOSITORIES</p><h3>リポジトリ別パフォーマンス</h3></div><span>追加・移管・削除をGitHub Appで自動同期</span></div><div className="table"><div className="row heading"><span>プロジェクト</span><span>種別</span><span>状態</span><span>PV</span><span>CTR</span><span>成果</span><span>売上</span></div>{data.projects.map((p)=><div className="row" key={p.name}><strong>{p.name}</strong><span className="type-badge">{p.type}</span><span><i className={p.status==='計測中'?'online':''}/>{p.status}</span><span>{n(p.views)}</span><span>{p.ctr}%</span><span>{n(p.conversions)}</span><span>{yen(p.revenue)}</span></div>)}</div></section></section>
<section className="pricing" id="pricing"><p className="kicker">PRICING MODEL</p><h2>実証してから、販売する。</h2><div>{[['Starter','¥0','3プロジェクトまで','基本KPI・週次レポート・90日保存','今すぐ無料で始める'],['Growth','¥2,980/月','30プロジェクトまで','収益・A/Bテスト・日次レポート・通知・1年保存','成長プランを試す'],['Agency','¥9,800/月','複数顧客対応','権限管理・ホワイトラベル・月次レビュー','代理店向けを相談'],['Enterprise','要相談','全リポジトリ無制限','SSO・監査ログ・SLA・専任サポート','個別見積りを取得']].map(([name,price,limit,detail,cta])=><article key={name}><b>{name}</b><strong>{price}</strong><em>{limit}</em><p>{detail}</p><a href="mailto:hello@sukima-insight.jp">{cta} →</a></article>)}</div></section><footer><a href="#top" className="logo"><i/>SUKIMA INSIGHT</a><p>Privacy-first analytics for every product.</p><span>© 2026 SUKIMA INSIGHT</span></footer></main>}
