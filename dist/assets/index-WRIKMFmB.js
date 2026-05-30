(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=e(r);fetch(r.href,n)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const q=globalThis,et=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rt=Symbol(),nt=new WeakMap;let mt=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==rt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(et&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=nt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&nt.set(e,t))}return t}toString(){return this.cssText}};const St=s=>new mt(typeof s=="string"?s:s+"",void 0,rt),D=(s,...t)=>{const e=s.length===1?s[0]:t.reduce((i,r,n)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new mt(e,s,rt)},Et=(s,t)=>{if(et)s.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const i=document.createElement("style"),r=q.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=e.cssText,s.appendChild(i)}},ot=et?s=>s:s=>s instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return St(e)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Pt,defineProperty:Ct,getOwnPropertyDescriptor:Ot,getOwnPropertyNames:Tt,getOwnPropertySymbols:Mt,getPrototypeOf:Ut}=Object,y=globalThis,at=y.trustedTypes,Nt=at?at.emptyScript:"",Y=y.reactiveElementPolyfillSupport,M=(s,t)=>s,B={toAttribute(s,t){switch(t){case Boolean:s=s?Nt:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,t){let e=s;switch(t){case Boolean:e=s!==null;break;case Number:e=s===null?null:Number(s);break;case Object:case Array:try{e=JSON.parse(s)}catch{e=null}}return e}},it=(s,t)=>!Pt(s,t),lt={attribute:!0,type:String,converter:B,reflect:!1,useDefault:!1,hasChanged:it};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),y.litPropertyMetadata??(y.litPropertyMetadata=new WeakMap);let P=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=lt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);r!==void 0&&Ct(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:n}=Ot(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:r,set(o){const l=r==null?void 0:r.call(this);n==null||n.call(this,o),this.requestUpdate(t,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??lt}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;const t=Ut(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){const e=this.properties,i=[...Tt(e),...Mt(e)];for(const r of i)this.createProperty(r,e[r])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[i,r]of e)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const r=this._$Eu(e,i);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const r of i)e.unshift(ot(r))}else t!==void 0&&e.push(ot(t));return e}static _$Eu(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Et(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostConnected)==null?void 0:i.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostDisconnected)==null?void 0:i.call(e)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){var n;const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(r!==void 0&&i.reflect===!0){const o=(((n=i.converter)==null?void 0:n.toAttribute)!==void 0?i.converter:B).toAttribute(e,i.type);this._$Em=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(t,e){var n,o;const i=this.constructor,r=i._$Eh.get(t);if(r!==void 0&&this._$Em!==r){const l=i.getPropertyOptions(r),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((n=l.converter)==null?void 0:n.fromAttribute)!==void 0?l.converter:B;this._$Em=r;const d=a.fromAttribute(e,l.type);this[r]=d??((o=this._$Ej)==null?void 0:o.get(r))??d,this._$Em=null}}requestUpdate(t,e,i,r=!1,n){var o;if(t!==void 0){const l=this.constructor;if(r===!1&&(n=this[t]),i??(i=l.getPropertyOptions(t)),!((i.hasChanged??it)(n,e)||i.useDefault&&i.reflect&&n===((o=this._$Ej)==null?void 0:o.get(t))&&!this.hasAttribute(l._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:n},o){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[n,o]of r){const{wrapped:l}=o,a=this[n];l!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,o,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(i=this._$EO)==null||i.forEach(r=>{var n;return(n=r.hostUpdate)==null?void 0:n.call(r)}),this.update(e)):this._$EM()}catch(r){throw t=!1,this._$EM(),r}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(i=>{var r;return(r=i.hostUpdated)==null?void 0:r.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};P.elementStyles=[],P.shadowRootOptions={mode:"open"},P[M("elementProperties")]=new Map,P[M("finalized")]=new Map,Y==null||Y({ReactiveElement:P}),(y.reactiveElementVersions??(y.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const U=globalThis,ct=s=>s,V=U.trustedTypes,dt=V?V.createPolicy("lit-html",{createHTML:s=>s}):void 0,vt="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,$t="?"+$,zt=`<${$t}>`,k=document,N=()=>k.createComment(""),z=s=>s===null||typeof s!="object"&&typeof s!="function",st=Array.isArray,Rt=s=>st(s)||typeof(s==null?void 0:s[Symbol.iterator])=="function",J=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,pt=/>/g,x=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,gt=/"/g,yt=/^(?:script|style|textarea|title)$/i,Dt=s=>(t,...e)=>({_$litType$:s,strings:t,values:e}),h=Dt(1),S=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),bt=new WeakMap,w=k.createTreeWalker(k,129);function _t(s,t){if(!st(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(t):t}const It=(s,t)=>{const e=s.length-1,i=[];let r,n=t===2?"<svg>":t===3?"<math>":"",o=T;for(let l=0;l<e;l++){const a=s[l];let d,u,c=-1,f=0;for(;f<a.length&&(o.lastIndex=f,u=o.exec(a),u!==null);)f=o.lastIndex,o===T?u[1]==="!--"?o=ht:u[1]!==void 0?o=pt:u[2]!==void 0?(yt.test(u[2])&&(r=RegExp("</"+u[2],"g")),o=x):u[3]!==void 0&&(o=x):o===x?u[0]===">"?(o=r??T,c=-1):u[1]===void 0?c=-2:(c=o.lastIndex-u[2].length,d=u[1],o=u[3]===void 0?x:u[3]==='"'?gt:ut):o===gt||o===ut?o=x:o===ht||o===pt?o=T:(o=x,r=void 0);const v=o===x&&s[l+1].startsWith("/>")?" ":"";n+=o===T?a+zt:c>=0?(i.push(d),a.slice(0,c)+vt+a.slice(c)+$+v):a+$+(c===-2?l:v)}return[_t(s,n+(s[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};class R{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[d,u]=It(t,e);if(this.el=R.createElement(d,i),w.currentNode=this.el.content,e===2||e===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(r=w.nextNode())!==null&&a.length<l;){if(r.nodeType===1){if(r.hasAttributes())for(const c of r.getAttributeNames())if(c.endsWith(vt)){const f=u[o++],v=r.getAttribute(c).split($),L=/([.?@])?(.*)/.exec(f);a.push({type:1,index:n,name:L[2],strings:v,ctor:L[1]==="."?jt:L[1]==="?"?Lt:L[1]==="@"?qt:F}),r.removeAttribute(c)}else c.startsWith($)&&(a.push({type:6,index:n}),r.removeAttribute(c));if(yt.test(r.tagName)){const c=r.textContent.split($),f=c.length-1;if(f>0){r.textContent=V?V.emptyScript:"";for(let v=0;v<f;v++)r.append(c[v],N()),w.nextNode(),a.push({type:2,index:++n});r.append(c[f],N())}}}else if(r.nodeType===8)if(r.data===$t)a.push({type:2,index:n});else{let c=-1;for(;(c=r.data.indexOf($,c+1))!==-1;)a.push({type:7,index:n}),c+=$.length-1}n++}}static createElement(t,e){const i=k.createElement("template");return i.innerHTML=t,i}}function C(s,t,e=s,i){var o,l;if(t===S)return t;let r=i!==void 0?(o=e._$Co)==null?void 0:o[i]:e._$Cl;const n=z(t)?void 0:t._$litDirective$;return(r==null?void 0:r.constructor)!==n&&((l=r==null?void 0:r._$AO)==null||l.call(r,!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,e,i)),i!==void 0?(e._$Co??(e._$Co=[]))[i]=r:e._$Cl=r),r!==void 0&&(t=C(s,r._$AS(s,t.values),r,i)),t}class Ht{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=((t==null?void 0:t.creationScope)??k).importNode(e,!0);w.currentNode=r;let n=w.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let d;a.type===2?d=new I(n,n.nextSibling,this,t):a.type===1?d=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(d=new Bt(n,this,t)),this._$AV.push(d),a=i[++l]}o!==(a==null?void 0:a.index)&&(n=w.nextNode(),o++)}return w.currentNode=k,r}p(t){let e=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class I{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=(r==null?void 0:r.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=C(this,t,e),z(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Rt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&z(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){var n;const{values:e,_$litType$:i}=t,r=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=R.createElement(_t(i.h,i.h[0]),this.options)),i);if(((n=this._$AH)==null?void 0:n._$AD)===r)this._$AH.p(e);else{const o=new Ht(r,this),l=o.u(this.options);o.p(e),this.T(l),this._$AH=o}}_$AC(t){let e=bt.get(t.strings);return e===void 0&&bt.set(t.strings,e=new R(t)),e}k(t){st(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const n of t)r===e.length?e.push(i=new I(this.O(N()),this.O(N()),this,this.options)):i=e[r],i._$AI(n),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,e);t!==this._$AB;){const r=ct(t).nextSibling;ct(t).remove(),t=r}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class F{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,r){const n=this.strings;let o=!1;if(n===void 0)t=C(this,t,e,0),o=!z(t)||t!==this._$AH&&t!==S,o&&(this._$AH=t);else{const l=t;let a,d;for(t=n[0],a=0;a<n.length-1;a++)d=C(this,l[i+a],e,a),d===S&&(d=this._$AH[a]),o||(o=!z(d)||d!==this._$AH[a]),d===p?t=p:t!==p&&(t+=(d??"")+n[a+1]),this._$AH[a]=d}o&&!r&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class jt extends F{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}}class Lt extends F{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}}class qt extends F{constructor(t,e,i,r,n){super(t,e,i,r,n),this.type=5}_$AI(t,e=this){if((t=C(this,t,e,0)??p)===S)return;const i=this._$AH,r=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==p&&(i===p||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class Bt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){C(this,t)}}const Q=U.litHtmlPolyfillSupport;Q==null||Q(R,I),(U.litHtmlVersions??(U.litHtmlVersions=[])).push("3.3.3");const Vt=(s,t,e)=>{const i=(e==null?void 0:e.renderBefore)??t;let r=i._$litPart$;if(r===void 0){const n=(e==null?void 0:e.renderBefore)??null;i._$litPart$=r=new I(t.insertBefore(N(),n),n,void 0,e??{})}return r._$AI(s),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const A=globalThis;let m=class extends P{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Vt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return S}};var ft;m._$litElement$=!0,m.finalized=!0,(ft=A.litElementHydrateSupport)==null||ft.call(A,{LitElement:m});const X=A.litElementPolyfillSupport;X==null||X({LitElement:m});(A.litElementVersions??(A.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const H=s=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(s,t)}):customElements.define(s,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Wt={attribute:!0,type:String,converter:B,reflect:!1,hasChanged:it},Gt=(s=Wt,t,e)=>{const{kind:i,metadata:r}=e;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(e.name,s),i==="accessor"){const{name:o}=e;return{set(l){const a=t.get.call(this);t.set.call(this,l),this.requestUpdate(o,a,s,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,s,l),l}}}if(i==="setter"){const{name:o}=e;return function(l){const a=this[o];t.call(this,l),this.requestUpdate(o,a,s,!0,l)}}throw Error("Unsupported decorator location: "+i)};function K(s){return(t,e)=>typeof e=="object"?Gt(s,t,e):((i,r,n)=>{const o=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),o?Object.getOwnPropertyDescriptor(r,n):void 0})(s,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function g(s){return K({...s,state:!0,attribute:!1})}const xt="cocktail-pantry";function Ft(){try{const s=localStorage.getItem(xt);if(!s)return[];const t=JSON.parse(s);return Array.isArray(t)?t:[]}catch{return[]}}function tt(s){localStorage.setItem(xt,JSON.stringify(s))}var Kt=Object.defineProperty,Zt=Object.getOwnPropertyDescriptor,wt=(s,t,e,i)=>{for(var r=i>1?void 0:i?Zt(t,e):t,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(t,e,r):o(r))||r);return i&&r&&Kt(t,e,r),r};let W=class extends m{constructor(){super(...arguments),this.value=""}_submit(){const s=this.value.trim();s&&(this.dispatchEvent(new CustomEvent("ingredient-add",{bubbles:!0,composed:!0,detail:{name:s}})),this.value="")}_onKeydown(s){s.key==="Enter"&&(s.preventDefault(),this._submit())}render(){return h`
      <div class="form">
        <input
          class="input"
          type="text"
          placeholder="e.g. Bourbon, Campari, Sweet Vermouth…"
          .value=${this.value}
          @input=${s=>{this.value=s.target.value}}
          @keydown=${this._onKeydown}
        />
        <button
          class="btn-add"
          ?disabled=${!this.value.trim()}
          @click=${this._submit}
        >
          Add
        </button>
      </div>
    `}};W.styles=D`
    :host {
      display: block;
    }

    .form {
      display: flex;
      gap: 10px;
    }

    .input {
      flex: 1;
      min-width: 0;
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.95rem;
      font-family: inherit;
      padding: 10px 14px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input::placeholder {
      color: var(--text-muted, #5a5045);
    }

    .input:focus {
      border-color: var(--accent, #c8922a);
      box-shadow: 0 0 0 3px var(--accent-glow, rgba(200, 146, 42, 0.2));
    }

    .btn-add {
      flex-shrink: 0;
      padding: 10px 22px;
      background: var(--accent, #c8922a);
      border: none;
      border-radius: 8px;
      color: #0d0d0d;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: 0.04em;
      transition: background 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
    }

    .btn-add:hover:not(:disabled) {
      background: var(--accent-light, #f0b544);
      box-shadow: 0 0 14px var(--accent-glow, rgba(200, 146, 42, 0.4));
    }

    .btn-add:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `;wt([g()],W.prototype,"value",2);W=wt([H("ingredient-form")],W);var Yt=Object.defineProperty,Jt=Object.getOwnPropertyDescriptor,Z=(s,t,e,i)=>{for(var r=i>1?void 0:i?Jt(t,e):t,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(t,e,r):o(r))||r);return i&&r&&Yt(t,e,r),r};let O=class extends m{constructor(){super(...arguments),this.editing=!1,this.editValue=""}updated(s){var t;if(s.has("editing")&&this.editing){const e=(t=this.shadowRoot)==null?void 0:t.querySelector(".edit-input");e&&(e.focus(),e.select())}}_startEdit(){this.editValue=this.ingredient.name,this.editing=!0}_confirmEdit(){const s=this.editValue.trim();s&&s!==this.ingredient.name&&this.dispatchEvent(new CustomEvent("ingredient-update",{bubbles:!0,composed:!0,detail:{ingredient:{...this.ingredient,name:s}}})),this.editing=!1}_onEditKeydown(s){s.key==="Enter"?(s.preventDefault(),this._confirmEdit()):s.key==="Escape"&&(this.editing=!1)}_toggleStock(){this.dispatchEvent(new CustomEvent("ingredient-update",{bubbles:!0,composed:!0,detail:{ingredient:{...this.ingredient,inStock:!this.ingredient.inStock}}}))}_remove(){this.dispatchEvent(new CustomEvent("ingredient-remove",{bubbles:!0,composed:!0,detail:{id:this.ingredient.id}}))}render(){const{name:s,inStock:t}=this.ingredient;return h`
      <div class="item ${t?"in-stock":"out-of-stock"}">
        <button
          class="stock-pill ${t?"pill-in":"pill-out"}"
          @click=${this._toggleStock}
          title="Toggle stock status"
        >
          ${t?"In Stock":"Out of Stock"}
        </button>

        ${this.editing?h`
              <input
                class="edit-input"
                type="text"
                .value=${this.editValue}
                @input=${e=>{this.editValue=e.target.value}}
                @keydown=${this._onEditKeydown}
                @blur=${this._confirmEdit}
              />
            `:h`<span class="name">${s}</span>`}

        <div class="actions">
          <button class="icon-btn" title="Edit name" @click=${this._startEdit}>✎</button>
          <button class="icon-btn danger" title="Delete" @click=${this._remove}>✕</button>
        </div>
      </div>
    `}};O.styles=D`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      transition: border-color 0.2s ease, background 0.2s ease;
    }

    .item:hover {
      border-color: var(--accent, #c8922a);
      background: var(--bg-hover, #2a2a2a);
    }

    .item.out-of-stock {
      opacity: 0.55;
    }

    .stock-pill {
      flex-shrink: 0;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid;
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
      font-family: inherit;
      white-space: nowrap;
    }

    .pill-in {
      background: rgba(74, 158, 92, 0.15);
      border-color: #4a9e5c;
      color: #6bbf7a;
    }

    .pill-in:hover {
      background: rgba(74, 158, 92, 0.28);
      box-shadow: 0 0 8px rgba(74, 158, 92, 0.3);
    }

    .pill-out {
      background: rgba(90, 80, 69, 0.2);
      border-color: #5a5045;
      color: #7a6e60;
    }

    .pill-out:hover {
      background: rgba(90, 80, 69, 0.35);
    }

    .name {
      flex: 1;
      font-size: 0.95rem;
      color: var(--text-primary, #e8dcc8);
      font-weight: 400;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item.out-of-stock .name {
      text-decoration: line-through;
      color: var(--text-muted, #5a5045);
    }

    .edit-input {
      flex: 1;
      min-width: 0;
      background: var(--bg-page, #0d0d0d);
      border: 1px solid var(--accent, #c8922a);
      border-radius: 5px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.95rem;
      font-family: inherit;
      padding: 5px 10px;
      outline: none;
      box-shadow: 0 0 10px var(--accent-glow, rgba(200, 146, 42, 0.25));
    }

    .actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      color: var(--text-muted, #5a5045);
      font-size: 0.85rem;
      line-height: 1;
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-primary, #e8dcc8);
    }

    .icon-btn.danger:hover {
      background: rgba(160, 48, 48, 0.22);
      color: #e06060;
    }
  `;Z([K({type:Object})],O.prototype,"ingredient",2);Z([g()],O.prototype,"editing",2);Z([g()],O.prototype,"editValue",2);O=Z([H("ingredient-item")],O);var Qt=Object.defineProperty,Xt=Object.getOwnPropertyDescriptor,j=(s,t,e,i)=>{for(var r=i>1?void 0:i?Xt(t,e):t,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(t,e,r):o(r))||r);return i&&r&&Qt(t,e,r),r};let E=class extends m{constructor(){super(...arguments),this.ingredients=[],this.query="",this.sort="newest",this.stockFilter="all"}get _filtered(){let s=[...this.ingredients];this.stockFilter==="in-stock"?s=s.filter(e=>e.inStock):this.stockFilter==="out-of-stock"&&(s=s.filter(e=>!e.inStock));const t=this.query.trim().toLowerCase();switch(t&&(s=s.filter(e=>e.name.toLowerCase().includes(t))),this.sort){case"alpha-asc":s.sort((e,i)=>e.name.localeCompare(i.name));break;case"alpha-desc":s.sort((e,i)=>i.name.localeCompare(e.name));break;case"newest":s.sort((e,i)=>i.addedAt-e.addedAt);break;case"oldest":s.sort((e,i)=>e.addedAt-i.addedAt);break}return s}render(){const s=this._filtered,t=this.ingredients.length,e=this.ingredients.filter(r=>r.inStock).length,i={all:`All (${t})`,"in-stock":`In Stock (${e})`,"out-of-stock":`Out of Stock (${t-e})`};return h`
      <div class="section-header">
        <span class="section-label">Your Pantry</span>
        <span class="count-badge">
          ${t} ingredient${t!==1?"s":""} · ${e} in stock
        </span>
      </div>

      <div class="controls">
        <input
          class="search-input"
          type="search"
          placeholder="Search ingredients…"
          .value=${this.query}
          @input=${r=>{this.query=r.target.value}}
        />
        <select
          class="sort-select"
          @change=${r=>{this.sort=r.target.value}}
        >
          <option value="newest" ?selected=${this.sort==="newest"}>Newest first</option>
          <option value="oldest" ?selected=${this.sort==="oldest"}>Oldest first</option>
          <option value="alpha-asc" ?selected=${this.sort==="alpha-asc"}>A → Z</option>
          <option value="alpha-desc" ?selected=${this.sort==="alpha-desc"}>Z → A</option>
        </select>
      </div>

      <div class="stock-filters">
        ${["all","in-stock","out-of-stock"].map(r=>h`
            <button
              class="filter-btn ${this.stockFilter===r?"active":""}"
              @click=${()=>{this.stockFilter=r}}
            >
              ${i[r]}
            </button>
          `)}
      </div>

      <div class="list">
        ${s.length===0?h`
              <p class="empty">
                ${t===0?`Your pantry is empty.
Add an ingredient above.`:"No ingredients match your filters."}
              </p>
            `:s.map(r=>h`<ingredient-item .ingredient=${r}></ingredient-item>`)}
      </div>
    `}};E.styles=D`
    :host {
      display: block;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 16px;
    }

    .section-label {
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--text-secondary, #8a7d6e);
    }

    .count-badge {
      font-size: 0.72rem;
      color: var(--text-muted, #5a5045);
      letter-spacing: 0.03em;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .search-input {
      flex: 1;
      min-width: 0;
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.875rem;
      font-family: inherit;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input::placeholder {
      color: var(--text-muted, #5a5045);
    }

    .search-input:focus {
      border-color: var(--accent, #c8922a);
    }

    /* Remove default search-input clear button styling */
    .search-input::-webkit-search-cancel-button {
      filter: invert(0.4);
    }

    .sort-select {
      background: var(--bg-surface, #242424);
      border: 1px solid var(--border, #333333);
      border-radius: 8px;
      color: var(--text-primary, #e8dcc8);
      font-size: 0.875rem;
      font-family: inherit;
      padding: 8px 32px 8px 12px;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a7d6e' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      transition: border-color 0.2s ease;
      flex-shrink: 0;
    }

    .sort-select:focus {
      border-color: var(--accent, #c8922a);
    }

    .sort-select option {
      background: #242424;
    }

    .stock-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 5px 13px;
      border-radius: 20px;
      border: 1px solid var(--border, #333333);
      background: transparent;
      color: var(--text-secondary, #8a7d6e);
      font-size: 0.75rem;
      font-family: inherit;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s, color 0.2s;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .filter-btn:hover {
      border-color: var(--accent, #c8922a);
      color: var(--text-primary, #e8dcc8);
    }

    .filter-btn.active {
      background: var(--accent, #c8922a);
      border-color: var(--accent, #c8922a);
      color: #0d0d0d;
      font-weight: 500;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .empty {
      text-align: center;
      color: var(--text-muted, #5a5045);
      font-size: 0.875rem;
      padding: 36px 0;
      font-style: italic;
      line-height: 1.6;
    }
  `;j([K({type:Array})],E.prototype,"ingredients",2);j([g()],E.prototype,"query",2);j([g()],E.prototype,"sort",2);j([g()],E.prototype,"stockFilter",2);E=j([H("ingredient-list")],E);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const te={ATTRIBUTE:1},ee=s=>(...t)=>({_$litDirective$:s,values:t});let re=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const At="important",ie=" !"+At,se=ee(class extends re{constructor(s){var t;if(super(s),s.type!==te.ATTRIBUTE||s.name!=="style"||((t=s.strings)==null?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(s){return Object.keys(s).reduce((t,e)=>{const i=s[e];return i==null?t:t+`${e=e.includes("-")?e:e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(s,[t]){const{style:e}=s.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(const i of this.ft)t[i]==null&&(this.ft.delete(i),i.includes("-")?e.removeProperty(i):e[i]=null);for(const i in t){const r=t[i];if(r!=null){this.ft.add(i);const n=typeof r=="string"&&r.endsWith(ie);i.includes("-")||n?e.setProperty(i,n?r.slice(0,-11):r,n?At:""):e[i]=r}}return S}});var ne=Object.defineProperty,oe=Object.getOwnPropertyDescriptor,_=(s,t,e,i)=>{for(var r=i>1?void 0:i?oe(t,e):t,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(t,e,r):o(r))||r);return i&&r&&ne(t,e,r),r};let b=class extends m{constructor(){super(...arguments),this.ingredients=[],this.query="",this.availability="checking",this.genStatus="idle",this.streamedText="",this.downloadPct=0,this.errorMsg="",this._controller=null}connectedCallback(){super.connectedCallback(),this._checkAvailability()}disconnectedCallback(){var s;super.disconnectedCallback(),(s=this._controller)==null||s.abort()}async _checkAvailability(){try{if(!("LanguageModel"in globalThis)){this.availability="unsupported";return}const s=await LanguageModel.availability();s==="unavailable"?this.availability="unsupported":s==="downloadable"||s==="downloading"?this.availability="downloadable":this.availability="available"}catch{this.availability="unsupported"}}async _generate(){const s=this.ingredients.filter(o=>o.inStock);if(s.length===0||this.genStatus==="loading"||this.genStatus==="streaming")return;this._controller=new AbortController;const t=this._controller.signal;this.genStatus="loading",this.streamedText="",this.errorMsg="",this.downloadPct=0;const i=`You are an expert cocktail mixologist. The user's home bar has these ingredients in stock: ${s.map(o=>o.name).join(", ")}. Basic pantry items like ice, water, sugar, salt, and soda water are also available. Suggest 3 to 5 cocktails they can make. For each cocktail provide: the cocktail name as a heading, a one-sentence description, ingredients with measurements, and numbered step-by-step instructions. Use plain text only, no markdown symbols like asterisks or hashes.`,r=this.query.trim()?`I want something ${this.query.trim()}. What cocktails can I make?`:"What cocktails can I make with my ingredients?";let n;try{n=await LanguageModel.create({signal:t,initialPrompts:[{role:"system",content:i}],monitor:l=>{l.addEventListener("downloadprogress",a=>{const d=a;this.downloadPct=Math.round(d.loaded*100)})}}),this.genStatus="streaming";const o=n.promptStreaming(r,{signal:t});for await(const l of o)this.streamedText=l;this.genStatus="done"}catch(o){t.aborted?this.genStatus="done":(this.genStatus="error",this.errorMsg=o instanceof Error?o.message:"An unknown error occurred.")}finally{n==null||n.destroy(),this._controller=null}}_stop(){var s;(s=this._controller)==null||s.abort(),this.genStatus="done"}_clear(){var s;(s=this._controller)==null||s.abort(),this.genStatus="idle",this.streamedText="",this.errorMsg="",this.downloadPct=0}render(){const s=this.ingredients.filter(e=>e.inStock).length,t=this.genStatus==="loading"||this.genStatus==="streaming";return h`
      <div class="section-header">
        <span class="section-title">Cocktail Suggestions</span>
        <span class="badge">Gemini Nano</span>
      </div>

      ${this.availability==="checking"?h`
            <div class="checking">
              <div class="spinner"></div>
              Checking AI availability…
            </div>
          `:this.availability==="unsupported"?h`
            <div class="notice unsupported">
              Chrome's built-in AI (Gemini Nano) is not available in this
              browser. This feature requires Chrome&nbsp;127+ on Windows&nbsp;10/11
              or macOS&nbsp;13+ with the Prompt API enabled.
              <br /><br />
              <a
                href="https://developer.chrome.com/docs/ai/get-started"
                target="_blank"
                rel="noopener noreferrer"
                >Learn how to enable Chrome AI →</a
              >
            </div>
          `:s===0?h`
            <p class="empty-notice">
              Mark some ingredients as <strong>In Stock</strong> in your pantry
              to generate cocktail suggestions.
            </p>
          `:h`
            ${this.availability==="downloadable"?h`
                  <div class="notice downloadable">
                    Gemini Nano will be downloaded (~1.7 GB) the first time you
                    generate suggestions. A progress bar will appear below.
                  </div>
                `:""}

            <div class="form-row">
              <input
                class="mood-input"
                type="text"
                placeholder="e.g. refreshing, tropical, citrusy, stirred &amp; spirit-forward…"
                .value=${this.query}
                ?disabled=${t}
                @input=${e=>{this.query=e.target.value}}
                @keydown=${e=>{e.key==="Enter"&&!t&&this._generate()}}
              />
              ${t?h`
                    <button class="btn btn-stop" @click=${this._stop}>
                      Stop
                    </button>
                  `:h`
                    <button
                      class="btn btn-generate"
                      ?disabled=${s===0}
                      @click=${this._generate}
                    >
                      Generate
                    </button>
                  `}
            </div>

            <p class="hint">
              ${s} ingredient${s===1?"":"s"} in
              stock · press Enter or click Generate
            </p>

            ${this.downloadPct>0&&this.downloadPct<100?h`
                  <div class="progress-wrap">
                    <p class="progress-label">
                      Downloading Gemini Nano… ${this.downloadPct}%
                    </p>
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        style=${se({width:`${this.downloadPct}%`})}
                      ></div>
                    </div>
                  </div>
                `:""}

            ${this.streamedText||this.genStatus==="streaming"?h`
                  <div
                    class="result-area ${this.genStatus==="streaming"?"streaming":""}"
                  >${this.streamedText}${this.genStatus==="streaming"?h`<span class="cursor"></span>`:""}</div>
                `:""}

            ${this.genStatus==="error"?h`<div class="error-msg">${this.errorMsg}</div>`:""}

            ${this.genStatus==="done"&&this.streamedText?h`
                  <div class="result-actions">
                    <button class="btn btn-secondary" @click=${this._clear}>
                      Clear
                    </button>
                    <button class="btn btn-generate" @click=${this._generate}>
                      Generate Again
                    </button>
                  </div>
                `:""}
          `}
    `}};b.styles=D`
    :host {
      display: block;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }

    .badge {
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--accent);
      border: 1px solid var(--accent);
      border-radius: 4px;
      padding: 2px 6px;
      opacity: 0.8;
    }

    .notice {
      padding: 14px 16px;
      border-radius: 8px;
      font-size: 0.82rem;
      line-height: 1.5;
      color: var(--text-secondary);
    }

    .notice.unsupported {
      background: rgba(180, 60, 60, 0.08);
      border: 1px solid rgba(180, 60, 60, 0.25);
    }

    .notice.downloadable {
      background: rgba(200, 146, 42, 0.08);
      border: 1px solid rgba(200, 146, 42, 0.2);
    }

    .notice a {
      color: var(--accent-light);
      text-decoration: none;
    }

    .notice a:hover {
      text-decoration: underline;
    }

    .checking {
      color: var(--text-muted);
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-row {
      display: flex;
      gap: 10px;
    }

    .mood-input {
      flex: 1;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.9rem;
      padding: 10px 14px;
      outline: none;
      transition: border-color 0.15s;
      font-family: inherit;
    }

    .mood-input::placeholder {
      color: var(--text-muted);
    }

    .mood-input:focus {
      border-color: var(--accent);
    }

    .btn {
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 10px 18px;
      transition: opacity 0.15s, background 0.15s;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-generate {
      background: var(--accent);
      color: #0d0d0d;
    }

    .btn-generate:hover:not(:disabled) {
      background: var(--accent-light);
    }

    .btn-stop {
      background: rgba(180, 60, 60, 0.15);
      color: #e07070;
      border: 1px solid rgba(180, 60, 60, 0.3);
    }

    .btn-stop:hover:not(:disabled) {
      background: rgba(180, 60, 60, 0.25);
    }

    .btn-secondary {
      background: var(--bg-surface);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 8px;
    }

    .progress-wrap {
      margin-top: 12px;
    }

    .progress-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .progress-track {
      height: 3px;
      background: var(--bg-surface);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .result-area {
      margin-top: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      font-size: 0.85rem;
      line-height: 1.65;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .result-area.streaming {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .cursor {
      display: inline-block;
      width: 2px;
      height: 0.9em;
      background: var(--accent);
      margin-left: 2px;
      vertical-align: text-bottom;
      animation: blink 0.9s step-end infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .result-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .error-msg {
      margin-top: 12px;
      padding: 10px 14px;
      background: rgba(180, 60, 60, 0.08);
      border: 1px solid rgba(180, 60, 60, 0.25);
      border-radius: 8px;
      font-size: 0.8rem;
      color: #e07070;
    }

    .empty-notice {
      font-size: 0.82rem;
      color: var(--text-muted);
      padding: 10px 0 2px;
    }
  `;_([K({type:Array})],b.prototype,"ingredients",2);_([g()],b.prototype,"query",2);_([g()],b.prototype,"availability",2);_([g()],b.prototype,"genStatus",2);_([g()],b.prototype,"streamedText",2);_([g()],b.prototype,"downloadPct",2);_([g()],b.prototype,"errorMsg",2);b=_([H("cocktail-ai")],b);var ae=Object.defineProperty,le=Object.getOwnPropertyDescriptor,kt=(s,t,e,i)=>{for(var r=i>1?void 0:i?le(t,e):t,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(t,e,r):o(r))||r);return i&&r&&ae(t,e,r),r};let G=class extends m{constructor(){super(...arguments),this.ingredients=[]}connectedCallback(){super.connectedCallback(),this.ingredients=Ft()}_handleAdd(s){const{name:t}=s.detail,e={id:crypto.randomUUID(),name:t,addedAt:Date.now(),inStock:!0};this.ingredients=[e,...this.ingredients],tt(this.ingredients)}_handleUpdate(s){const{ingredient:t}=s.detail;this.ingredients=this.ingredients.map(e=>e.id===t.id?t:e),tt(this.ingredients)}_handleRemove(s){const{id:t}=s.detail;this.ingredients=this.ingredients.filter(e=>e.id!==t),tt(this.ingredients)}render(){return h`
      <div
        class="app"
        @ingredient-add=${this._handleAdd}
        @ingredient-update=${this._handleUpdate}
        @ingredient-remove=${this._handleRemove}
      >
        <header>
          <h1 class="app-title">Cocktail Pantry</h1>
          <div class="divider"></div>
          <p class="app-subtitle">Your home bar inventory</p>
        </header>

        <div class="card">
          <p class="card-label">Add Ingredient</p>
          <ingredient-form></ingredient-form>
        </div>

        <div class="card">
          <ingredient-list .ingredients=${this.ingredients}></ingredient-list>
        </div>

        <div class="card">
          <cocktail-ai .ingredients=${this.ingredients}></cocktail-ai>
        </div>
      </div>
    `}};G.styles=D`
    :host {
      display: block;
      min-height: 100vh;

      /* Design tokens — inherited by all child shadow DOMs */
      --bg-page: #0d0d0d;
      --bg-card: #161616;
      --bg-surface: #1e1e1e;
      --bg-hover: #262626;
      --border: #2e2e2e;
      --text-primary: #e8dcc8;
      --text-secondary: #8a7d6e;
      --text-muted: #5a5045;
      --accent: #c8922a;
      --accent-light: #f0b544;
      --accent-glow: rgba(200, 146, 42, 0.25);
    }

    .app {
      max-width: 680px;
      margin: 0 auto;
      padding: 48px 20px 80px;
    }

    header {
      text-align: center;
      margin-bottom: 44px;
    }

    .app-title {
      font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
      font-size: 2.6rem;
      font-weight: 600;
      color: var(--accent-light);
      letter-spacing: 0.02em;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .divider {
      width: 48px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--accent),
        transparent
      );
      margin: 14px auto;
      opacity: 0.7;
    }

    .app-subtitle {
      color: var(--text-muted);
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .card-label {
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }
  `;kt([g()],G.prototype,"ingredients",2);G=kt([H("pantry-app")],G);
