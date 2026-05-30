(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=t(r);fetch(r.href,n)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const G=globalThis,te=G.ShadowRoot&&(G.ShadyCSS===void 0||G.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,re=Symbol(),ne=new WeakMap;let fe=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==re)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(te&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=ne.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ne.set(t,e))}return e}toString(){return this.cssText}};const Se=s=>new fe(typeof s=="string"?s:s+"",void 0,re),R=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,r,n)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new fe(t,s,re)},Ee=(s,e)=>{if(te)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),r=G.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=t.cssText,s.appendChild(i)}},oe=te?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return Se(t)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ce,defineProperty:Pe,getOwnPropertyDescriptor:Oe,getOwnPropertyNames:Te,getOwnPropertySymbols:Me,getPrototypeOf:Ue}=Object,$=globalThis,ae=$.trustedTypes,Ne=ae?ae.emptyScript:"",Y=$.reactiveElementPolyfillSupport,U=(s,e)=>s,V={toAttribute(s,e){switch(e){case Boolean:s=s?Ne:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},ie=(s,e)=>!Ce(s,e),le={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:ie};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),$.litPropertyMetadata??($.litPropertyMetadata=new WeakMap);let C=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=le){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);r!==void 0&&Pe(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=Oe(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:r,set(o){const l=r==null?void 0:r.call(this);n==null||n.call(this,o),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??le}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;const e=Ue(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){const t=this.properties,i=[...Te(t),...Me(t)];for(const r of i)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,r]of t)this.elementProperties.set(i,r)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const r=this._$Eu(t,i);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const r of i)t.unshift(oe(r))}else e!==void 0&&t.push(oe(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ee(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostConnected)==null?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostDisconnected)==null?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){var n;const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){const o=(((n=i.converter)==null?void 0:n.toAttribute)!==void 0?i.converter:V).toAttribute(t,i.type);this._$Em=e,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(e,t){var n,o;const i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const l=i.getPropertyOptions(r),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((n=l.converter)==null?void 0:n.fromAttribute)!==void 0?l.converter:V;this._$Em=r;const d=a.fromAttribute(t,l.type);this[r]=d??((o=this._$Ej)==null?void 0:o.get(r))??d,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){var o;if(e!==void 0){const l=this.constructor;if(r===!1&&(n=this[e]),i??(i=l.getPropertyOptions(e)),!((i.hasChanged??ie)(n,t)||i.useDefault&&i.reflect&&n===((o=this._$Ej)==null?void 0:o.get(e))&&!this.hasAttribute(l._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},o){i&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,o??t??this[e]),n!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[n,o]of r){const{wrapped:l}=o,a=this[n];l!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,o,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(i=this._$EO)==null||i.forEach(r=>{var n;return(n=r.hostUpdate)==null?void 0:n.call(r)}),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(i=>{var r;return(r=i.hostUpdated)==null?void 0:r.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};C.elementStyles=[],C.shadowRootOptions={mode:"open"},C[U("elementProperties")]=new Map,C[U("finalized")]=new Map,Y==null||Y({ReactiveElement:C}),($.reactiveElementVersions??($.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const N=globalThis,ce=s=>s,W=N.trustedTypes,de=W?W.createPolicy("lit-html",{createHTML:s=>s}):void 0,ve="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,ye="?"+y,ze=`<${ye}>`,k=document,z=()=>k.createComment(""),I=s=>s===null||typeof s!="object"&&typeof s!="function",se=Array.isArray,Ie=s=>se(s)||typeof(s==null?void 0:s[Symbol.iterator])=="function",X=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,he=/-->/g,pe=/>/g,_=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ue=/'/g,ge=/"/g,$e=/^(?:script|style|textarea|title)$/i,De=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),h=De(1),S=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),me=new WeakMap,w=k.createTreeWalker(k,129);function xe(s,e){if(!se(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return de!==void 0?de.createHTML(e):e}const Re=(s,e)=>{const t=s.length-1,i=[];let r,n=e===2?"<svg>":e===3?"<math>":"",o=M;for(let l=0;l<t;l++){const a=s[l];let d,u,c=-1,b=0;for(;b<a.length&&(o.lastIndex=b,u=o.exec(a),u!==null);)b=o.lastIndex,o===M?u[1]==="!--"?o=he:u[1]!==void 0?o=pe:u[2]!==void 0?($e.test(u[2])&&(r=RegExp("</"+u[2],"g")),o=_):u[3]!==void 0&&(o=_):o===_?u[0]===">"?(o=r??M,c=-1):u[1]===void 0?c=-2:(c=o.lastIndex-u[2].length,d=u[1],o=u[3]===void 0?_:u[3]==='"'?ge:ue):o===ge||o===ue?o=_:o===he||o===pe?o=M:(o=_,r=void 0);const v=o===_&&s[l+1].startsWith("/>")?" ":"";n+=o===M?a+ze:c>=0?(i.push(d),a.slice(0,c)+ve+a.slice(c)+y+v):a+y+(c===-2?l:v)}return[xe(s,n+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class D{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,o=0;const l=e.length-1,a=this.parts,[d,u]=Re(e,t);if(this.el=D.createElement(d,i),w.currentNode=this.el.content,t===2||t===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(r=w.nextNode())!==null&&a.length<l;){if(r.nodeType===1){if(r.hasAttributes())for(const c of r.getAttributeNames())if(c.endsWith(ve)){const b=u[o++],v=r.getAttribute(c).split(y),q=/([.?@])?(.*)/.exec(b);a.push({type:1,index:n,name:q[2],strings:v,ctor:q[1]==="."?He:q[1]==="?"?je:q[1]==="@"?qe:J}),r.removeAttribute(c)}else c.startsWith(y)&&(a.push({type:6,index:n}),r.removeAttribute(c));if($e.test(r.tagName)){const c=r.textContent.split(y),b=c.length-1;if(b>0){r.textContent=W?W.emptyScript:"";for(let v=0;v<b;v++)r.append(c[v],z()),w.nextNode(),a.push({type:2,index:++n});r.append(c[b],z())}}}else if(r.nodeType===8)if(r.data===ye)a.push({type:2,index:n});else{let c=-1;for(;(c=r.data.indexOf(y,c+1))!==-1;)a.push({type:7,index:n}),c+=y.length-1}n++}}static createElement(e,t){const i=k.createElement("template");return i.innerHTML=e,i}}function P(s,e,t=s,i){var o,l;if(e===S)return e;let r=i!==void 0?(o=t._$Co)==null?void 0:o[i]:t._$Cl;const n=I(e)?void 0:e._$litDirective$;return(r==null?void 0:r.constructor)!==n&&((l=r==null?void 0:r._$AO)==null||l.call(r,!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,i)),i!==void 0?(t._$Co??(t._$Co=[]))[i]=r:t._$Cl=r),r!==void 0&&(e=P(s,r._$AS(s,e.values),r,i)),e}class Le{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=((e==null?void 0:e.creationScope)??k).importNode(t,!0);w.currentNode=r;let n=w.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let d;a.type===2?d=new L(n,n.nextSibling,this,e):a.type===1?d=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(d=new Be(n,this,e)),this._$AV.push(d),a=i[++l]}o!==(a==null?void 0:a.index)&&(n=w.nextNode(),o++)}return w.currentNode=k,r}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class L{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=(r==null?void 0:r.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),I(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ie(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){var n;const{values:t,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=D.createElement(xe(i.h,i.h[0]),this.options)),i);if(((n=this._$AH)==null?void 0:n._$AD)===r)this._$AH.p(t);else{const o=new Le(r,this),l=o.u(this.options);o.p(t),this.T(l),this._$AH=o}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new D(e)),t}k(e){se(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new L(this.O(z()),this.O(z()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,t);e!==this._$AB;){const r=ce(e).nextSibling;ce(e).remove(),e=r}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class J{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(e,t=this,i,r){const n=this.strings;let o=!1;if(n===void 0)e=P(this,e,t,0),o=!I(e)||e!==this._$AH&&e!==S,o&&(this._$AH=e);else{const l=e;let a,d;for(e=n[0],a=0;a<n.length-1;a++)d=P(this,l[i+a],t,a),d===S&&(d=this._$AH[a]),o||(o=!I(d)||d!==this._$AH[a]),d===p?e=p:e!==p&&(e+=(d??"")+n[a+1]),this._$AH[a]=d}o&&!r&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class He extends J{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class je extends J{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class qe extends J{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??p)===S)return;const i=this._$AH,r=e===p&&i!==p||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==p&&(i===p||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class Be{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}}const Q=N.litHtmlPolyfillSupport;Q==null||Q(D,L),(N.litHtmlVersions??(N.litHtmlVersions=[])).push("3.3.3");const Ge=(s,e,t)=>{const i=(t==null?void 0:t.renderBefore)??e;let r=i._$litPart$;if(r===void 0){const n=(t==null?void 0:t.renderBefore)??null;i._$litPart$=r=new L(e.insertBefore(z(),n),n,void 0,t??{})}return r._$AI(s),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const A=globalThis;let f=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ge(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return S}};var be;f._$litElement$=!0,f.finalized=!0,(be=A.litElementHydrateSupport)==null||be.call(A,{LitElement:f});const ee=A.litElementPolyfillSupport;ee==null||ee({LitElement:f});(A.litElementVersions??(A.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const H=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ve={attribute:!0,type:String,converter:V,reflect:!1,hasChanged:ie},We=(s=Ve,e,t)=>{const{kind:i,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(t.name,s),i==="accessor"){const{name:o}=t;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(o,a,s,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,s,l),l}}}if(i==="setter"){const{name:o}=t;return function(l){const a=this[o];e.call(this,l),this.requestUpdate(o,a,s,!0,l)}}throw Error("Unsupported decorator location: "+i)};function K(s){return(e,t)=>typeof t=="object"?We(s,e,t):((i,r,n)=>{const o=r.hasOwnProperty(n);return r.constructor.createProperty(n,i),o?Object.getOwnPropertyDescriptor(r,n):void 0})(s,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function g(s){return K({...s,state:!0,attribute:!1})}const _e="cocktail-pantry";function Fe(){try{const s=localStorage.getItem(_e);if(!s)return[];const e=JSON.parse(s);return Array.isArray(e)?e:[]}catch{return[]}}function B(s){localStorage.setItem(_e,JSON.stringify(s))}var Je=Object.defineProperty,Ke=Object.getOwnPropertyDescriptor,we=(s,e,t,i)=>{for(var r=i>1?void 0:i?Ke(e,t):e,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(e,t,r):o(r))||r);return i&&r&&Je(e,t,r),r};let F=class extends f{constructor(){super(...arguments),this.value=""}_submit(){const s=this.value.trim();s&&(this.dispatchEvent(new CustomEvent("ingredient-add",{bubbles:!0,composed:!0,detail:{name:s}})),this.value="")}_onKeydown(s){s.key==="Enter"&&(s.preventDefault(),this._submit())}render(){return h`
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
    `}};F.styles=R`
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
  `;we([g()],F.prototype,"value",2);F=we([H("ingredient-form")],F);var Ze=Object.defineProperty,Ye=Object.getOwnPropertyDescriptor,Z=(s,e,t,i)=>{for(var r=i>1?void 0:i?Ye(e,t):e,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(e,t,r):o(r))||r);return i&&r&&Ze(e,t,r),r};let O=class extends f{constructor(){super(...arguments),this.editing=!1,this.editValue=""}updated(s){var e;if(s.has("editing")&&this.editing){const t=(e=this.shadowRoot)==null?void 0:e.querySelector(".edit-input");t&&(t.focus(),t.select())}}_startEdit(){this.editValue=this.ingredient.name,this.editing=!0}_confirmEdit(){const s=this.editValue.trim();s&&s!==this.ingredient.name&&this.dispatchEvent(new CustomEvent("ingredient-update",{bubbles:!0,composed:!0,detail:{ingredient:{...this.ingredient,name:s}}})),this.editing=!1}_onEditKeydown(s){s.key==="Enter"?(s.preventDefault(),this._confirmEdit()):s.key==="Escape"&&(this.editing=!1)}_toggleStock(){this.dispatchEvent(new CustomEvent("ingredient-update",{bubbles:!0,composed:!0,detail:{ingredient:{...this.ingredient,inStock:!this.ingredient.inStock}}}))}_remove(){this.dispatchEvent(new CustomEvent("ingredient-remove",{bubbles:!0,composed:!0,detail:{id:this.ingredient.id}}))}render(){const{name:s,inStock:e}=this.ingredient;return h`
      <div class="item ${e?"in-stock":"out-of-stock"}">
        <button
          class="stock-pill ${e?"pill-in":"pill-out"}"
          @click=${this._toggleStock}
          title="Toggle stock status"
        >
          ${e?"In Stock":"Out of Stock"}
        </button>

        ${this.editing?h`
              <input
                class="edit-input"
                type="text"
                .value=${this.editValue}
                @input=${t=>{this.editValue=t.target.value}}
                @keydown=${this._onEditKeydown}
                @blur=${this._confirmEdit}
              />
            `:h`<span class="name">${s}</span>`}

        <div class="actions">
          <button class="icon-btn" title="Edit name" @click=${this._startEdit}>✎</button>
          <button class="icon-btn danger" title="Delete" @click=${this._remove}>✕</button>
        </div>
      </div>
    `}};O.styles=R`
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
  `;Z([K({type:Object})],O.prototype,"ingredient",2);Z([g()],O.prototype,"editing",2);Z([g()],O.prototype,"editValue",2);O=Z([H("ingredient-item")],O);var Xe=Object.defineProperty,Qe=Object.getOwnPropertyDescriptor,j=(s,e,t,i)=>{for(var r=i>1?void 0:i?Qe(e,t):e,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(e,t,r):o(r))||r);return i&&r&&Xe(e,t,r),r};let E=class extends f{constructor(){super(...arguments),this.ingredients=[],this.query="",this.sort="newest",this.stockFilter="all"}get _filtered(){let s=[...this.ingredients];this.stockFilter==="in-stock"?s=s.filter(t=>t.inStock):this.stockFilter==="out-of-stock"&&(s=s.filter(t=>!t.inStock));const e=this.query.trim().toLowerCase();switch(e&&(s=s.filter(t=>t.name.toLowerCase().includes(e))),this.sort){case"alpha-asc":s.sort((t,i)=>t.name.localeCompare(i.name));break;case"alpha-desc":s.sort((t,i)=>i.name.localeCompare(t.name));break;case"newest":s.sort((t,i)=>i.addedAt-t.addedAt);break;case"oldest":s.sort((t,i)=>t.addedAt-i.addedAt);break}return s}render(){const s=this._filtered,e=this.ingredients.length,t=this.ingredients.filter(r=>r.inStock).length,i={all:`All (${e})`,"in-stock":`In Stock (${t})`,"out-of-stock":`Out of Stock (${e-t})`};return h`
      <div class="section-header">
        <span class="section-label">Your Pantry</span>
        <span class="count-badge">
          ${e} ingredient${e!==1?"s":""} · ${t} in stock
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
                ${e===0?`Your pantry is empty.
Add an ingredient above.`:"No ingredients match your filters."}
              </p>
            `:s.map(r=>h`<ingredient-item .ingredient=${r}></ingredient-item>`)}
      </div>
    `}};E.styles=R`
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
 */const et={ATTRIBUTE:1},tt=s=>(...e)=>({_$litDirective$:s,values:e});let rt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ae="important",it=" !"+Ae,st=tt(class extends rt{constructor(s){var e;if(super(s),s.type!==et.ATTRIBUTE||s.name!=="style"||((e=s.strings)==null?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(s){return Object.keys(s).reduce((e,t)=>{const i=s[t];return i==null?e:e+`${t=t.includes("-")?t:t.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(s,[e]){const{style:t}=s.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(e)),this.render(e);for(const i of this.ft)e[i]==null&&(this.ft.delete(i),i.includes("-")?t.removeProperty(i):t[i]=null);for(const i in e){const r=e[i];if(r!=null){this.ft.add(i);const n=typeof r=="string"&&r.endsWith(it);i.includes("-")||n?t.setProperty(i,n?r.slice(0,-11):r,n?Ae:""):t[i]=r}}return S}});var nt=Object.defineProperty,ot=Object.getOwnPropertyDescriptor,x=(s,e,t,i)=>{for(var r=i>1?void 0:i?ot(e,t):e,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(e,t,r):o(r))||r);return i&&r&&nt(e,t,r),r};let m=class extends f{constructor(){super(...arguments),this.ingredients=[],this.query="",this.availability="checking",this.genStatus="idle",this.streamedText="",this.downloadPct=0,this.errorMsg="",this._controller=null}connectedCallback(){super.connectedCallback(),this._checkAvailability()}disconnectedCallback(){var s;super.disconnectedCallback(),(s=this._controller)==null||s.abort()}async _checkAvailability(){try{if(!("LanguageModel"in globalThis)){this.availability="unsupported";return}const s=await LanguageModel.availability();s==="unavailable"?this.availability="unsupported":s==="downloadable"||s==="downloading"?this.availability="downloadable":this.availability="available"}catch{this.availability="unsupported"}}async _generate(){const s=this.ingredients.filter(o=>o.inStock);if(s.length===0||this.genStatus==="loading"||this.genStatus==="streaming")return;this._controller=new AbortController;const e=this._controller.signal;this.genStatus="loading",this.streamedText="",this.errorMsg="",this.downloadPct=0;const i=`You are an expert cocktail mixologist. The user's home bar has these ingredients in stock: ${s.map(o=>o.name).join(", ")}. Basic pantry items like ice, water, sugar, salt, and soda water are also available. Suggest 3 to 5 cocktails they can make. For each cocktail provide: the cocktail name as a heading, a one-sentence description, ingredients with measurements, and numbered step-by-step instructions. Use plain text only, no markdown symbols like asterisks or hashes.`,r=this.query.trim()?`I want something ${this.query.trim()}. What cocktails can I make?`:"What cocktails can I make with my ingredients?";let n;try{n=await LanguageModel.create({signal:e,initialPrompts:[{role:"system",content:i}],monitor:l=>{l.addEventListener("downloadprogress",a=>{const d=a;this.downloadPct=Math.round(d.loaded*100)})}}),this.genStatus="streaming";const o=n.promptStreaming(r,{signal:e});for await(const l of o)this.streamedText+=l;this.genStatus="done"}catch(o){e.aborted?this.genStatus="done":(this.genStatus="error",this.errorMsg=o instanceof Error?o.message:"An unknown error occurred.")}finally{n==null||n.destroy(),this._controller=null}}_stop(){var s;(s=this._controller)==null||s.abort(),this.genStatus="done"}_clear(){var s;(s=this._controller)==null||s.abort(),this.genStatus="idle",this.streamedText="",this.errorMsg="",this.downloadPct=0}render(){const s=this.ingredients.filter(t=>t.inStock).length,e=this.genStatus==="loading"||this.genStatus==="streaming";return h`
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
                ?disabled=${e}
                @input=${t=>{this.query=t.target.value}}
                @keydown=${t=>{t.key==="Enter"&&!e&&this._generate()}}
              />
              ${e?h`
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
                        style=${st({width:`${this.downloadPct}%`})}
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
    `}};m.styles=R`
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
  `;x([K({type:Array})],m.prototype,"ingredients",2);x([g()],m.prototype,"query",2);x([g()],m.prototype,"availability",2);x([g()],m.prototype,"genStatus",2);x([g()],m.prototype,"streamedText",2);x([g()],m.prototype,"downloadPct",2);x([g()],m.prototype,"errorMsg",2);m=x([H("cocktail-ai")],m);var at=Object.defineProperty,lt=Object.getOwnPropertyDescriptor,ke=(s,e,t,i)=>{for(var r=i>1?void 0:i?lt(e,t):e,n=s.length-1,o;n>=0;n--)(o=s[n])&&(r=(i?o(e,t,r):o(r))||r);return i&&r&&at(e,t,r),r};let T=class extends f{constructor(){super(...arguments),this.ingredients=[]}connectedCallback(){super.connectedCallback(),this.ingredients=Fe()}_handleAdd(s){const{name:e}=s.detail,t={id:crypto.randomUUID(),name:e,addedAt:Date.now(),inStock:!0};this.ingredients=[t,...this.ingredients],B(this.ingredients)}_handleUpdate(s){const{ingredient:e}=s.detail;this.ingredients=this.ingredients.map(t=>t.id===e.id?e:t),B(this.ingredients)}_handleRemove(s){const{id:e}=s.detail;this.ingredients=this.ingredients.filter(t=>t.id!==e),B(this.ingredients)}_addExampleItems(){const s=new Set(this.ingredients.map(t=>t.name.toLowerCase())),e=T.EXAMPLE_ITEMS.filter(t=>!s.has(t.toLowerCase())).map(t=>({id:crypto.randomUUID(),name:t,addedAt:Date.now(),inStock:!0}));e.length!==0&&(this.ingredients=[...e,...this.ingredients],B(this.ingredients))}render(){return h`
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
          <div class="example-bar-row">
            <button class="btn-example" @click=${this._addExampleItems}>
              + Add example bar items
            </button>
          </div>
        </div>

        <div class="card">
          <ingredient-list .ingredients=${this.ingredients}></ingredient-list>
        </div>

        <div class="card">
          <cocktail-ai .ingredients=${this.ingredients}></cocktail-ai>
        </div>
      </div>
    `}};T.styles=R`
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

    .example-bar-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }

    .btn-example {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
      padding: 4px 0;
      transition: color 0.15s;
    }

    .btn-example:hover {
      color: var(--accent-light);
    }
  `;T.EXAMPLE_ITEMS=["Vodka","Gin","White Rum","Dark Rum","Tequila","Bourbon","Scotch Whisky","Brandy","Triple Sec","Amaretto","Kahlúa","Campari","Aperol","Peach Schnapps","Blue Curaçao","Club Soda","Tonic Water","Ginger Beer","Ginger Ale","Cola","Orange Juice","Cranberry Juice","Pineapple Juice","Grapefruit Juice","Fresh Lemon Juice","Fresh Lime Juice","Simple Syrup","Grenadine","Honey","Angostura Bitters","Orange Bitters","Maraschino Cherries","Olives","Mint"];ke([g()],T.prototype,"ingredients",2);T=ke([H("pantry-app")],T);
