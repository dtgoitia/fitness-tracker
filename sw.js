if(!self.define){let e,s={};const n=(n,i)=>(n=new URL(n+".js",i).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,o)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let t={};const l=e=>n(e,r),u={module:{uri:r},exports:t,require:l};s[r]=Promise.all(i.map((e=>u[e]||l(e)))).then((e=>(o(...e),t)))}}define(["./workbox-22b23f3b"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-CnoV90fU.js",revision:null},{url:"assets/index-DX0VPvzN.css",revision:null},{url:"assets/workbox-window.prod.es5-B_6ZJHoI.js",revision:null},{url:"index.html",revision:"a6ccf191e336e9f14b0ec40e1dcbab4e"},{url:"manifest.webmanifest",revision:"8feb35cf41054f7c94a4d5949edda600"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
