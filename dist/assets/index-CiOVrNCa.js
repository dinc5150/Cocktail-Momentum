(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const z=globalThis,Q=z.ShadowRoot&&(z.ShadyCSS===void 0||z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,X=Symbol(),st=new WeakMap;let gt=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==X)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(Q&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=st.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&st.set(e,t))}return t}toString(){return this.cssText}};const At=r=>new gt(typeof r=="string"?r:r+"",void 0,X),V=(r,...t)=>{const e=r.length===1?r[0]:t.reduce((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new gt(e,r,X)},wt=(r,t)=>{if(Q)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),i=z.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},rt=Q?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return At(e)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Et,defineProperty:St,getOwnPropertyDescriptor:kt,getOwnPropertyNames:Pt,getOwnPropertySymbols:Ct,getPrototypeOf:Ot}=Object,b=globalThis,nt=b.trustedTypes,Ut=nt?nt.emptyScript:"",W=b.reactiveElementPolyfillSupport,O=(r,t)=>r,j={toAttribute(r,t){switch(t){case Boolean:r=r?Ut:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},tt=(r,t)=>!Et(r,t),ot={attribute:!0,type:String,converter:j,reflect:!1,useDefault:!1,hasChanged:tt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),b.litPropertyMetadata??(b.litPropertyMetadata=new WeakMap);let E=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ot){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&St(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=kt(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){const l=i==null?void 0:i.call(this);n==null||n.call(this,o),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ot}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;const t=Ot(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){const e=this.properties,s=[...Pt(e),...Ct(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(rt(i))}else t!==void 0&&e.push(rt(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return wt(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostConnected)==null?void 0:s.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var s;return(s=e.hostDisconnected)==null?void 0:s.call(e)})}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){var n;const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const o=(((n=s.converter)==null?void 0:n.toAttribute)!==void 0?s.converter:j).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){var n,o;const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const l=s.getPropertyOptions(i),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((n=l.converter)==null?void 0:n.fromAttribute)!==void 0?l.converter:j;this._$Em=i;const d=a.fromAttribute(e,l.type);this[i]=d??((o=this._$Ej)==null?void 0:o.get(i))??d,this._$Em=null}}requestUpdate(t,e,s,i=!1,n){var o;if(t!==void 0){const l=this.constructor;if(i===!1&&(n=this[t]),s??(s=l.getPropertyOptions(t)),!((s.hasChanged??tt)(n,e)||s.useDefault&&s.reflect&&n===((o=this._$Ej)==null?void 0:o.get(t))&&!this.hasAttribute(l._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var s;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[n,o]of i){const{wrapped:l}=o,a=this[n];l!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,o,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(s=this._$EO)==null||s.forEach(i=>{var n;return(n=i.hostUpdate)==null?void 0:n.call(i)}),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(s=>{var i;return(i=s.hostUpdated)==null?void 0:i.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[O("elementProperties")]=new Map,E[O("finalized")]=new Map,W==null||W({ReactiveElement:E}),(b.reactiveElementVersions??(b.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const U=globalThis,at=r=>r,I=U.trustedTypes,lt=I?I.createPolicy("lit-html",{createHTML:r=>r}):void 0,mt="$lit$",m=`lit$${Math.random().toFixed(9).slice(2)}$`,bt="?"+m,Nt=`<${bt}>`,x=document,N=()=>x.createComment(""),M=r=>r===null||typeof r!="object"&&typeof r!="function",et=Array.isArray,Mt=r=>et(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",Z=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ct=/-->/g,dt=/>/g,v=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ht=/'/g,pt=/"/g,$t=/^(?:script|style|textarea|title)$/i,Tt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),f=Tt(1),S=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),ut=new WeakMap,_=x.createTreeWalker(x,129);function vt(r,t){if(!et(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return lt!==void 0?lt.createHTML(t):t}const Rt=(r,t)=>{const e=r.length-1,s=[];let i,n=t===2?"<svg>":t===3?"<math>":"",o=C;for(let l=0;l<e;l++){const a=r[l];let d,p,c=-1,u=0;for(;u<a.length&&(o.lastIndex=u,p=o.exec(a),p!==null);)u=o.lastIndex,o===C?p[1]==="!--"?o=ct:p[1]!==void 0?o=dt:p[2]!==void 0?($t.test(p[2])&&(i=RegExp("</"+p[2],"g")),o=v):p[3]!==void 0&&(o=v):o===v?p[0]===">"?(o=i??C,c=-1):p[1]===void 0?c=-2:(c=o.lastIndex-p[2].length,d=p[1],o=p[3]===void 0?v:p[3]==='"'?pt:ht):o===pt||o===ht?o=v:o===ct||o===dt?o=C:(o=v,i=void 0);const g=o===v&&r[l+1].startsWith("/>")?" ":"";n+=o===C?a+Nt:c>=0?(s.push(d),a.slice(0,c)+mt+a.slice(c)+m+g):a+m+(c===-2?l:g)}return[vt(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class T{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[d,p]=Rt(t,e);if(this.el=T.createElement(d,s),_.currentNode=this.el.content,e===2||e===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(i=_.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const c of i.getAttributeNames())if(c.endsWith(mt)){const u=p[o++],g=i.getAttribute(c).split(m),D=/([.?@])?(.*)/.exec(u);a.push({type:1,index:n,name:D[2],strings:g,ctor:D[1]==="."?Dt:D[1]==="?"?zt:D[1]==="@"?jt:B}),i.removeAttribute(c)}else c.startsWith(m)&&(a.push({type:6,index:n}),i.removeAttribute(c));if($t.test(i.tagName)){const c=i.textContent.split(m),u=c.length-1;if(u>0){i.textContent=I?I.emptyScript:"";for(let g=0;g<u;g++)i.append(c[g],N()),_.nextNode(),a.push({type:2,index:++n});i.append(c[u],N())}}}else if(i.nodeType===8)if(i.data===bt)a.push({type:2,index:n});else{let c=-1;for(;(c=i.data.indexOf(m,c+1))!==-1;)a.push({type:7,index:n}),c+=m.length-1}n++}}static createElement(t,e){const s=x.createElement("template");return s.innerHTML=t,s}}function k(r,t,e=r,s){var o,l;if(t===S)return t;let i=s!==void 0?(o=e._$Co)==null?void 0:o[s]:e._$Cl;const n=M(t)?void 0:t._$litDirective$;return(i==null?void 0:i.constructor)!==n&&((l=i==null?void 0:i._$AO)==null||l.call(i,!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=i:e._$Cl=i),i!==void 0&&(t=k(r,i._$AS(r,t.values),i,s)),t}class Ht{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=((t==null?void 0:t.creationScope)??x).importNode(e,!0);_.currentNode=i;let n=_.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let d;a.type===2?d=new R(n,n.nextSibling,this,t):a.type===1?d=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(d=new It(n,this,t)),this._$AV.push(d),a=s[++l]}o!==(a==null?void 0:a.index)&&(n=_.nextNode(),o++)}return _.currentNode=x,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class R{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),M(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Mt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(x.createTextNode(t)),this._$AH=t}$(t){var n;const{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=T.createElement(vt(s.h,s.h[0]),this.options)),s);if(((n=this._$AH)==null?void 0:n._$AD)===i)this._$AH.p(e);else{const o=new Ht(i,this),l=o.u(this.options);o.p(e),this.T(l),this._$AH=o}}_$AC(t){let e=ut.get(t.strings);return e===void 0&&ut.set(t.strings,e=new T(t)),e}k(t){et(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new R(this.O(N()),this.O(N()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,e);t!==this._$AB;){const i=at(t).nextSibling;at(t).remove(),t=i}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class B{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=h}_$AI(t,e=this,s,i){const n=this.strings;let o=!1;if(n===void 0)t=k(this,t,e,0),o=!M(t)||t!==this._$AH&&t!==S,o&&(this._$AH=t);else{const l=t;let a,d;for(t=n[0],a=0;a<n.length-1;a++)d=k(this,l[s+a],e,a),d===S&&(d=this._$AH[a]),o||(o=!M(d)||d!==this._$AH[a]),d===h?t=h:t!==h&&(t+=(d??"")+n[a+1]),this._$AH[a]=d}o&&!i&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Dt extends B{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}}class zt extends B{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}}class jt extends B{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??h)===S)return;const s=this._$AH,i=t===h&&s!==h||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==h&&(s===h||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class It{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}}const J=U.litHtmlPolyfillSupport;J==null||J(T,R),(U.litHtmlVersions??(U.litHtmlVersions=[])).push("3.3.3");const Lt=(r,t,e)=>{const s=(e==null?void 0:e.renderBefore)??t;let i=s._$litPart$;if(i===void 0){const n=(e==null?void 0:e.renderBefore)??null;s._$litPart$=i=new R(t.insertBefore(N(),n),n,void 0,e??{})}return i._$AI(r),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const y=globalThis;class $ extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Lt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return S}}var ft;$._$litElement$=!0,$.finalized=!0,(ft=y.litElementHydrateSupport)==null||ft.call(y,{LitElement:$});const Y=y.litElementPolyfillSupport;Y==null||Y({LitElement:$});(y.litElementVersions??(y.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const F=r=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(r,t)}):customElements.define(r,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const qt={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:tt},Vt=(r=qt,t,e)=>{const{kind:s,metadata:i}=e;let n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(e.name,r),s==="accessor"){const{name:o}=e;return{set(l){const a=t.get.call(this);t.set.call(this,l),this.requestUpdate(o,a,r,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,r,l),l}}}if(s==="setter"){const{name:o}=e;return function(l){const a=this[o];t.call(this,l),this.requestUpdate(o,a,r,!0,l)}}throw Error("Unsupported decorator location: "+s)};function it(r){return(t,e)=>typeof e=="object"?Vt(r,t,e):((s,i,n)=>{const o=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),o?Object.getOwnPropertyDescriptor(i,n):void 0})(r,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function w(r){return it({...r,state:!0,attribute:!1})}const _t="cocktail-pantry";function Bt(){try{const r=localStorage.getItem(_t);if(!r)return[];const t=JSON.parse(r);return Array.isArray(t)?t:[]}catch{return[]}}function G(r){localStorage.setItem(_t,JSON.stringify(r))}var Ft=Object.defineProperty,Kt=Object.getOwnPropertyDescriptor,yt=(r,t,e,s)=>{for(var i=s>1?void 0:s?Kt(t,e):t,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=(s?o(t,e,i):o(i))||i);return s&&i&&Ft(t,e,i),i};let L=class extends ${constructor(){super(...arguments),this.value=""}_submit(){const r=this.value.trim();r&&(this.dispatchEvent(new CustomEvent("ingredient-add",{bubbles:!0,composed:!0,detail:{name:r}})),this.value="")}_onKeydown(r){r.key==="Enter"&&(r.preventDefault(),this._submit())}render(){return f`
      <div class="form">
        <input
          class="input"
          type="text"
          placeholder="e.g. Bourbon, Campari, Sweet Vermouth…"
          .value=${this.value}
          @input=${r=>{this.value=r.target.value}}
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
    `}};L.styles=V`
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
  `;yt([w()],L.prototype,"value",2);L=yt([F("ingredient-form")],L);var Wt=Object.defineProperty,Zt=Object.getOwnPropertyDescriptor,K=(r,t,e,s)=>{for(var i=s>1?void 0:s?Zt(t,e):t,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=(s?o(t,e,i):o(i))||i);return s&&i&&Wt(t,e,i),i};let P=class extends ${constructor(){super(...arguments),this.editing=!1,this.editValue=""}updated(r){var t;if(r.has("editing")&&this.editing){const e=(t=this.shadowRoot)==null?void 0:t.querySelector(".edit-input");e&&(e.focus(),e.select())}}_startEdit(){this.editValue=this.ingredient.name,this.editing=!0}_confirmEdit(){const r=this.editValue.trim();r&&r!==this.ingredient.name&&this.dispatchEvent(new CustomEvent("ingredient-update",{bubbles:!0,composed:!0,detail:{ingredient:{...this.ingredient,name:r}}})),this.editing=!1}_onEditKeydown(r){r.key==="Enter"?(r.preventDefault(),this._confirmEdit()):r.key==="Escape"&&(this.editing=!1)}_toggleStock(){this.dispatchEvent(new CustomEvent("ingredient-update",{bubbles:!0,composed:!0,detail:{ingredient:{...this.ingredient,inStock:!this.ingredient.inStock}}}))}_remove(){this.dispatchEvent(new CustomEvent("ingredient-remove",{bubbles:!0,composed:!0,detail:{id:this.ingredient.id}}))}render(){const{name:r,inStock:t}=this.ingredient;return f`
      <div class="item ${t?"in-stock":"out-of-stock"}">
        <button
          class="stock-pill ${t?"pill-in":"pill-out"}"
          @click=${this._toggleStock}
          title="Toggle stock status"
        >
          ${t?"In Stock":"Out of Stock"}
        </button>

        ${this.editing?f`
              <input
                class="edit-input"
                type="text"
                .value=${this.editValue}
                @input=${e=>{this.editValue=e.target.value}}
                @keydown=${this._onEditKeydown}
                @blur=${this._confirmEdit}
              />
            `:f`<span class="name">${r}</span>`}

        <div class="actions">
          <button class="icon-btn" title="Edit name" @click=${this._startEdit}>✎</button>
          <button class="icon-btn danger" title="Delete" @click=${this._remove}>✕</button>
        </div>
      </div>
    `}};P.styles=V`
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
  `;K([it({type:Object})],P.prototype,"ingredient",2);K([w()],P.prototype,"editing",2);K([w()],P.prototype,"editValue",2);P=K([F("ingredient-item")],P);var Jt=Object.defineProperty,Yt=Object.getOwnPropertyDescriptor,H=(r,t,e,s)=>{for(var i=s>1?void 0:s?Yt(t,e):t,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=(s?o(t,e,i):o(i))||i);return s&&i&&Jt(t,e,i),i};let A=class extends ${constructor(){super(...arguments),this.ingredients=[],this.query="",this.sort="newest",this.stockFilter="all"}get _filtered(){let r=[...this.ingredients];this.stockFilter==="in-stock"?r=r.filter(e=>e.inStock):this.stockFilter==="out-of-stock"&&(r=r.filter(e=>!e.inStock));const t=this.query.trim().toLowerCase();switch(t&&(r=r.filter(e=>e.name.toLowerCase().includes(t))),this.sort){case"alpha-asc":r.sort((e,s)=>e.name.localeCompare(s.name));break;case"alpha-desc":r.sort((e,s)=>s.name.localeCompare(e.name));break;case"newest":r.sort((e,s)=>s.addedAt-e.addedAt);break;case"oldest":r.sort((e,s)=>e.addedAt-s.addedAt);break}return r}render(){const r=this._filtered,t=this.ingredients.length,e=this.ingredients.filter(i=>i.inStock).length,s={all:`All (${t})`,"in-stock":`In Stock (${e})`,"out-of-stock":`Out of Stock (${t-e})`};return f`
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
          @input=${i=>{this.query=i.target.value}}
        />
        <select
          class="sort-select"
          @change=${i=>{this.sort=i.target.value}}
        >
          <option value="newest" ?selected=${this.sort==="newest"}>Newest first</option>
          <option value="oldest" ?selected=${this.sort==="oldest"}>Oldest first</option>
          <option value="alpha-asc" ?selected=${this.sort==="alpha-asc"}>A → Z</option>
          <option value="alpha-desc" ?selected=${this.sort==="alpha-desc"}>Z → A</option>
        </select>
      </div>

      <div class="stock-filters">
        ${["all","in-stock","out-of-stock"].map(i=>f`
            <button
              class="filter-btn ${this.stockFilter===i?"active":""}"
              @click=${()=>{this.stockFilter=i}}
            >
              ${s[i]}
            </button>
          `)}
      </div>

      <div class="list">
        ${r.length===0?f`
              <p class="empty">
                ${t===0?`Your pantry is empty.
Add an ingredient above.`:"No ingredients match your filters."}
              </p>
            `:r.map(i=>f`<ingredient-item .ingredient=${i}></ingredient-item>`)}
      </div>
    `}};A.styles=V`
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
  `;H([it({type:Array})],A.prototype,"ingredients",2);H([w()],A.prototype,"query",2);H([w()],A.prototype,"sort",2);H([w()],A.prototype,"stockFilter",2);A=H([F("ingredient-list")],A);var Gt=Object.defineProperty,Qt=Object.getOwnPropertyDescriptor,xt=(r,t,e,s)=>{for(var i=s>1?void 0:s?Qt(t,e):t,n=r.length-1,o;n>=0;n--)(o=r[n])&&(i=(s?o(t,e,i):o(i))||i);return s&&i&&Gt(t,e,i),i};let q=class extends ${constructor(){super(...arguments),this.ingredients=[]}connectedCallback(){super.connectedCallback(),this.ingredients=Bt()}_handleAdd(r){const{name:t}=r.detail,e={id:crypto.randomUUID(),name:t,addedAt:Date.now(),inStock:!0};this.ingredients=[e,...this.ingredients],G(this.ingredients)}_handleUpdate(r){const{ingredient:t}=r.detail;this.ingredients=this.ingredients.map(e=>e.id===t.id?t:e),G(this.ingredients)}_handleRemove(r){const{id:t}=r.detail;this.ingredients=this.ingredients.filter(e=>e.id!==t),G(this.ingredients)}render(){return f`
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
      </div>
    `}};q.styles=V`
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
  `;xt([w()],q.prototype,"ingredients",2);q=xt([F("pantry-app")],q);
