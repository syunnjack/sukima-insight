# @sukima-insight/analytics-web

利用者が分析に同意した場合だけ、許可済みイベントを収集APIへ送信します。

```js
const insight=createInsight({apiUrl,projectId,writeKey,hasConsent:()=>localStorage.getItem('analytics-consent')==='granted'})
insight.start()
insight.track('offer_impression',{properties:{placement:'hero'}})
insight.track('affiliate_click',{properties:{placement:'hero'}})
```
