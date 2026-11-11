(()=>{var Ui=Object.create;var Ln=Object.defineProperty;var Ci=Object.getOwnPropertyDescriptor;var Di=Object.getOwnPropertyNames;var Bi=Object.getPrototypeOf,Fi=Object.prototype.hasOwnProperty;var Vi=(c,e)=>()=>(e||c((e={exports:{}}).exports,e),e.exports);var ki=(c,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Di(e))!Fi.call(c,i)&&i!==t&&Ln(c,i,{get:()=>e[i],enumerable:!(n=Ci(e,i))||n.enumerable});return c};var Ae=(c,e,t)=>(t=c!=null?Ui(Bi(c)):{},ki(e||!c||!c.__esModule?Ln(t,"default",{value:c,enumerable:!0}):t,c));var ae=Vi((po,bn)=>{bn.exports=window.THREE});var f=Ae(ae(),1);var O=Ae(ae(),1);function mt(c,e){if(e===O.TrianglesDrawMode)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),c;if(e===O.TriangleFanDrawMode||e===O.TriangleStripDrawMode){let t=c.getIndex();if(t===null){let o=[],a=c.getAttribute("position");if(a!==void 0){for(let s=0;s<a.count;s++)o.push(s);c.setIndex(o),t=c.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),c}let n=t.count-2,i=[];if(e===O.TriangleFanDrawMode)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=c.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),c}var ye=class extends f.Loader{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Rt(t)}),this.register(function(t){return new Lt(t)}),this.register(function(t){return new bt(t)}),this.register(function(t){return new It(t)}),this.register(function(t){return new Mt(t)}),this.register(function(t){return new At(t)}),this.register(function(t){return new yt(t)}),this.register(function(t){return new wt(t)}),this.register(function(t){return new Tt(t)}),this.register(function(t){return new St(t)}),this.register(function(t){return new xt(t)}),this.register(function(t){return new vt(t)}),this.register(function(t){return new Pt(t)}),this.register(function(t){return new Ht(t)})}load(e,t,n,i){let r=this,o;this.resourcePath!==""?o=this.resourcePath:this.path!==""?o=this.path:o=f.LoaderUtils.extractUrlBase(e),this.manager.itemStart(e);let a=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},s=new f.FileLoader(this.manager);s.setPath(this.path),s.setResponseType("arraybuffer"),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(l){try{r.parse(l,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r,o={},a={},s=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(s.decode(new Uint8Array(e,0,4))===Un){try{o[w.KHR_BINARY_GLTF]=new Nt(e)}catch(h){i&&i(h);return}r=JSON.parse(o[w.KHR_BINARY_GLTF].content)}else r=JSON.parse(s.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new Vt(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](l);a[h.name]=h,o[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],p=r.extensionsRequired||[];switch(h){case w.KHR_MATERIALS_UNLIT:o[h]=new Et;break;case w.KHR_DRACO_MESH_COMPRESSION:o[h]=new Ot(r,this.dracoLoader);break;case w.KHR_TEXTURE_TRANSFORM:o[h]=new Ut;break;case w.KHR_MESH_QUANTIZATION:o[h]=new Ct;break;default:p.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}};function Wi(){let c={};return{get:function(e){return c[e]},add:function(e,t){c[e]=t},remove:function(e){delete c[e]},removeAll:function(){c={}}}}var w={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},vt=class{constructor(e){this.parser=e,this.name=w.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let r=t.json,s=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,u=new f.Color(16777215);s.color!==void 0&&u.fromArray(s.color);let h=s.range!==void 0?s.range:0;switch(s.type){case"directional":l=new f.DirectionalLight(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new f.PointLight(u),l.distance=h;break;case"spot":l=new f.SpotLight(u),l.distance=h,s.spot=s.spot||{},s.spot.innerConeAngle=s.spot.innerConeAngle!==void 0?s.spot.innerConeAngle:0,s.spot.outerConeAngle=s.spot.outerConeAngle!==void 0?s.spot.outerConeAngle:Math.PI/4,l.angle=s.spot.outerConeAngle,l.penumbra=1-s.spot.innerConeAngle/s.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+s.type)}return l.position.set(0,0,0),l.decay=2,j(l,s),s.intensity!==void 0&&(l.intensity=s.intensity),l.name=t.createUniqueName(s.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(s){return n._getNodeRef(t.cache,a,s)})}},Et=class{constructor(){this.name=w.KHR_MATERIALS_UNLIT}getMaterialType(){return f.MeshBasicMaterial}extendParams(e,t,n){let i=[];e.color=new f.Color(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.fromArray(o),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,f.sRGBEncoding))}return Promise.all(i)}},Tt=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Rt=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:f.MeshPhysicalMaterial}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new f.Vector2(a,a)}return Promise.all(r)}},xt=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:f.MeshPhysicalMaterial}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},Mt=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:f.MeshPhysicalMaterial}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new f.Color(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=i.extensions[this.name];return o.sheenColorFactor!==void 0&&t.sheenColor.fromArray(o.sheenColorFactor),o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,f.sRGBEncoding)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},At=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:f.MeshPhysicalMaterial}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},yt=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:f.MeshPhysicalMaterial}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new f.Color(a[0],a[1],a[2]),Promise.all(r)}},wt=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:f.MeshPhysicalMaterial}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},St=class{constructor(e){this.parser=e,this.name=w.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:f.MeshPhysicalMaterial}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new f.Color(a[0],a[1],a[2]),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,f.sRGBEncoding)),Promise.all(r)}},Lt=class{constructor(e){this.parser=e,this.name=w.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},bt=class{constructor(e){this.parser=e,this.name=w.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],s=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(s=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,o.source,s);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},It=class{constructor(e){this.parser=e,this.name=w.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],s=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(s=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,o.source,s);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},Pt=class{constructor(e){this.name=w.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let s=i.byteOffset||0,l=i.byteLength||0,u=i.count,h=i.byteStride,p=new Uint8Array(a,s,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,p,i.mode,i.filter).then(function(m){return m.buffer}):o.ready.then(function(){let m=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(m),u,h,p,i.mode,i.filter),m})})}else return null}},Ht=class{constructor(e){this.name=w.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let l of i.primitives)if(l.mode!==C.TRIANGLES&&l.mode!==C.TRIANGLE_STRIP&&l.mode!==C.TRIANGLE_FAN&&l.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],s={};for(let l in o)a.push(this.parser.getDependency("accessor",o[l]).then(u=>(s[l]=u,s[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let u=l.pop(),h=u.isGroup?u.children:[u],p=l[0].count,m=[];for(let v of h){let g=new f.Matrix4,E=new f.Vector3,_=new f.Quaternion,x=new f.Vector3(1,1,1),R=new f.InstancedMesh(v.geometry,v.material,p);for(let T=0;T<p;T++)s.TRANSLATION&&E.fromBufferAttribute(s.TRANSLATION,T),s.ROTATION&&_.fromBufferAttribute(s.ROTATION,T),s.SCALE&&x.fromBufferAttribute(s.SCALE,T),R.setMatrixAt(T,g.compose(E,_,x));for(let T in s)T!=="TRANSLATION"&&T!=="ROTATION"&&T!=="SCALE"&&v.geometry.setAttribute(T,s[T]);f.Object3D.prototype.copy.call(R,v),this.parser.assignFinalMaterial(R),m.push(R)}return u.isGroup?(u.clear(),u.add(...m),u):m[0]}))}},Un="glTF",le=12,In={JSON:1313821514,BIN:5130562},Nt=class{constructor(e){this.name=w.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,le),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Un)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-le,r=new DataView(e,le),o=0;for(;o<i;){let a=r.getUint32(o,!0);o+=4;let s=r.getUint32(o,!0);if(o+=4,s===In.JSON){let l=new Uint8Array(e,le+o,a);this.content=n.decode(l)}else if(s===In.BIN){let l=le+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Ot=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=w.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},s={},l={};for(let u in o){let h=Bt[u]||u.toLowerCase();a[h]=o[u]}for(let u in e.attributes){let h=Bt[u]||u.toLowerCase();if(o[u]!==void 0){let p=n.accessors[e.attributes[u]],m=Z[p.componentType];l[h]=m.name,s[h]=p.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h){i.decodeDracoFile(u,function(p){for(let m in p.attributes){let v=p.attributes[m],g=s[m];g!==void 0&&(v.normalized=g)}h(p)},a,l)})})}},Ut=class{constructor(){this.name=w.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},Ct=class{constructor(){this.name=w.KHR_MESH_QUANTIZATION}},we=class extends f.Interpolant{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,s=a*2,l=a*3,u=i-t,h=(n-t)/u,p=h*h,m=p*h,v=e*l,g=v-l,E=-2*m+3*p,_=m-p,x=1-E,R=_-p+h;for(let T=0;T!==a;T++){let A=o[g+T+a],y=o[g+T+s]*u,M=o[v+T+a],b=o[v+T]*u;r[T]=x*A+R*y+E*M+_*b}return r}},ji=new f.Quaternion,Dt=class extends we{interpolate_(e,t,n,i){let r=super.interpolate_(e,t,n,i);return ji.fromArray(r).normalize().toArray(r),r}},C={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Z={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Pn={9728:f.NearestFilter,9729:f.LinearFilter,9984:f.NearestMipmapNearestFilter,9985:f.LinearMipmapNearestFilter,9986:f.NearestMipmapLinearFilter,9987:f.LinearMipmapLinearFilter},Hn={33071:f.ClampToEdgeWrapping,33648:f.MirroredRepeatWrapping,10497:f.RepeatWrapping},gt={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Bt={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv2",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},W={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},zi={CUBICSPLINE:void 0,LINEAR:f.InterpolateLinear,STEP:f.InterpolateDiscrete},_t={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Gi(c){return c.DefaultMaterial===void 0&&(c.DefaultMaterial=new f.MeshStandardMaterial({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:f.FrontSide})),c.DefaultMaterial}function ue(c,e,t){for(let n in t.extensions)c[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function j(c,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(c.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Xi(c,e,t){let n=!1,i=!1,r=!1;for(let l=0,u=e.length;l<u;l++){let h=e[l];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(i=!0),h.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(c);let o=[],a=[],s=[];for(let l=0,u=e.length;l<u;l++){let h=e[l];if(n){let p=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):c.attributes.position;o.push(p)}if(i){let p=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):c.attributes.normal;a.push(p)}if(r){let p=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):c.attributes.color;s.push(p)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(s)]).then(function(l){let u=l[0],h=l[1],p=l[2];return n&&(c.morphAttributes.position=u),i&&(c.morphAttributes.normal=h),r&&(c.morphAttributes.color=p),c.morphTargetsRelative=!0,c})}function qi(c,e){if(c.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)c.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(c.morphTargetInfluences.length===t.length){c.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)c.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Qi(c){let e=c.extensions&&c.extensions[w.KHR_DRACO_MESH_COMPRESSION],t;return e?t="draco:"+e.bufferView+":"+e.indices+":"+Nn(e.attributes):t=c.indices+":"+Nn(c.attributes)+":"+c.mode,t}function Nn(c){let e="",t=Object.keys(c).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+c[t[n]]+";";return e}function Ft(c){switch(c){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Yi(c){return c.search(/\.jpe?g($|\?)/i)>0||c.search(/^data\:image\/jpeg/)===0?"image/jpeg":c.search(/\.webp($|\?)/i)>0||c.search(/^data\:image\/webp/)===0?"image/webp":"image/png"}var $i=new f.Matrix4,Vt=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Wi,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=!1,r=-1;typeof navigator<"u"&&(n=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)===!0,i=navigator.userAgent.indexOf("Firefox")>-1,r=i?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),typeof createImageBitmap>"u"||n||i&&r<98?this.textureLoader=new f.TextureLoader(this.options.manager):this.textureLoader=new f.ImageBitmapLoader(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new f.FileLoader(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};ue(r,a,i),j(a,i),Promise.all(n._invokeAll(function(s){return s.afterRoot&&s.afterRoot(a)})).then(function(){e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){let o=t[i].joints;for(let a=0,s=o.length;a<s;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){let o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),r=(o,a)=>{let s=this.associations.get(o);s!=null&&this.associations.set(a,s);for(let[l,u]of o.children.entries())r(u,a.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[w.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(r,o){n.load(f.LoaderUtils.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let o=gt[i.type],a=Z[i.componentType],s=i.normalized===!0,l=new a(i.count*o);return Promise.resolve(new f.BufferAttribute(l,o,s))}let r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],s=gt[i.type],l=Z[i.componentType],u=l.BYTES_PER_ELEMENT,h=u*s,p=i.byteOffset||0,m=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,v=i.normalized===!0,g,E;if(m&&m!==h){let _=Math.floor(p/m),x="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+_+":"+i.count,R=t.cache.get(x);R||(g=new l(a,_*m,i.count*m/u),R=new f.InterleavedBuffer(g,m/u),t.cache.add(x,R)),E=new f.InterleavedBufferAttribute(R,s,p%m/u,v)}else a===null?g=new l(i.count*s):g=new l(a,p,i.count*s),E=new f.BufferAttribute(g,s,v);if(i.sparse!==void 0){let _=gt.SCALAR,x=Z[i.sparse.indices.componentType],R=i.sparse.indices.byteOffset||0,T=i.sparse.values.byteOffset||0,A=new x(o[1],R,i.sparse.count*_),y=new l(o[2],T,i.sparse.count*s);a!==null&&(E=new f.BufferAttribute(E.array.slice(),E.itemSize,E.normalized));for(let M=0,b=A.length;M<b;M++){let L=A[M];if(E.setX(L,y[M*s]),s>=2&&E.setY(L,y[M*s+1]),s>=3&&E.setZ(L,y[M*s+2]),s>=4&&E.setW(L,y[M*s+3]),s>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return E})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let s=n.manager.getHandler(o.uri);s!==null&&(a=s)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let i=this,r=this.json,o=r.textures[e],a=r.images[t],s=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[s])return this.textureCache[s];let l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let p=(r.samplers||{})[o.sampler]||{};return u.magFilter=Pn[p.magFilter]||f.LinearFilter,u.minFilter=Pn[p.minFilter]||f.LinearMipmapLinearFilter,u.wrapS=Hn[p.wrapS]||f.RepeatWrapping,u.wrapT=Hn[p.wrapT]||f.RepeatWrapping,i.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[s]=l,l}loadImageSource(e,t){let n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=i.images[e],a=self.URL||self.webkitURL,s=o.uri||"",l=!1;if(o.bufferView!==void 0)s=n.getDependency("bufferView",o.bufferView).then(function(h){l=!0;let p=new Blob([h],{type:o.mimeType});return s=a.createObjectURL(p),s});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(s).then(function(h){return new Promise(function(p,m){let v=p;t.isImageBitmapLoader===!0&&(v=function(g){let E=new f.Texture(g);E.needsUpdate=!0,p(E)}),t.load(f.LoaderUtils.resolveURL(h,r.path),v,void 0,m)})}).then(function(h){return l===!0&&a.revokeObjectURL(s),h.userData.mimeType=o.mimeType||Yi(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",s),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,i){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[w.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[w.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let s=r.associations.get(o);o=r.extensions[w.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,s)}}return i!==void 0&&(o.encoding=i),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,s=this.cache.get(a);s||(s=new f.PointsMaterial,f.Material.prototype.copy.call(s,n),s.color.copy(n.color),s.map=n.map,s.sizeAttenuation=!1,this.cache.add(a,s)),n=s}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,s=this.cache.get(a);s||(s=new f.LineBasicMaterial,f.Material.prototype.copy.call(s,n),s.color.copy(n.color),s.map=n.map,this.cache.add(a,s)),n=s}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let s=this.cache.get(a);s||(s=n.clone(),r&&(s.vertexColors=!0),o&&(s.flatShading=!0),i&&(s.normalScale&&(s.normalScale.y*=-1),s.clearcoatNormalScale&&(s.clearcoatNormalScale.y*=-1)),this.cache.add(a,s),this.associations.set(s,this.associations.get(n))),n=s}e.material=n}getMaterialType(){return f.MeshStandardMaterial}loadMaterial(e){let t=this,n=this.json,i=this.extensions,r=n.materials[e],o,a={},s=r.extensions||{},l=[];if(s[w.KHR_MATERIALS_UNLIT]){let h=i[w.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),l.push(h.extendParams(a,r,t))}else{let h=r.pbrMetallicRoughness||{};if(a.color=new f.Color(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let p=h.baseColorFactor;a.color.fromArray(p),a.opacity=p[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",h.baseColorTexture,f.sRGBEncoding)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(p){return p.getMaterialType&&p.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(p){return p.extendMaterialParams&&p.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=f.DoubleSide);let u=r.alphaMode||_t.OPAQUE;if(u===_t.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===_t.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==f.MeshBasicMaterial&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new f.Vector2(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;a.normalScale.set(h,h)}return r.occlusionTexture!==void 0&&o!==f.MeshBasicMaterial&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==f.MeshBasicMaterial&&(a.emissive=new f.Color().fromArray(r.emissiveFactor)),r.emissiveTexture!==void 0&&o!==f.MeshBasicMaterial&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,f.sRGBEncoding)),Promise.all(l).then(function(){let h=new o(a);return r.name&&(h.name=r.name),j(h,r),t.associations.set(h,{materials:e}),r.extensions&&ue(i,h,r),h})}createUniqueName(e){let t=f.PropertyBinding.sanitizeNodeName(e||""),n=t;for(let i=1;this.nodeNamesUsed[n];++i)n=t+"_"+i;return this.nodeNamesUsed[n]=!0,n}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[w.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(s){return On(s,a,t)})}let o=[];for(let a=0,s=e.length;a<s;a++){let l=e[a],u=Qi(l),h=i[u];if(h)o.push(h.promise);else{let p;l.extensions&&l.extensions[w.KHR_DRACO_MESH_COMPRESSION]?p=r(l):p=On(new f.BufferGeometry,l,t),i[u]={primitive:l,promise:p},o.push(p)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let s=0,l=o.length;s<l;s++){let u=o[s].material===void 0?Gi(this.cache):this.getDependency("material",o[s].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(s){let l=s.slice(0,s.length-1),u=s[s.length-1],h=[];for(let m=0,v=u.length;m<v;m++){let g=u[m],E=o[m],_,x=l[m];if(E.mode===C.TRIANGLES||E.mode===C.TRIANGLE_STRIP||E.mode===C.TRIANGLE_FAN||E.mode===void 0)_=r.isSkinnedMesh===!0?new f.SkinnedMesh(g,x):new f.Mesh(g,x),_.isSkinnedMesh===!0&&_.normalizeSkinWeights(),E.mode===C.TRIANGLE_STRIP?_.geometry=mt(_.geometry,f.TriangleStripDrawMode):E.mode===C.TRIANGLE_FAN&&(_.geometry=mt(_.geometry,f.TriangleFanDrawMode));else if(E.mode===C.LINES)_=new f.LineSegments(g,x);else if(E.mode===C.LINE_STRIP)_=new f.Line(g,x);else if(E.mode===C.LINE_LOOP)_=new f.LineLoop(g,x);else if(E.mode===C.POINTS)_=new f.Points(g,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+E.mode);Object.keys(_.geometry.morphAttributes).length>0&&qi(_,r),_.name=t.createUniqueName(r.name||"mesh_"+e),j(_,r),E.extensions&&ue(i,_,E),t.assignFinalMaterial(_),h.push(_)}for(let m=0,v=h.length;m<v;m++)t.associations.set(h[m],{meshes:e,primitives:m});if(h.length===1)return h[0];let p=new f.Group;t.associations.set(p,{meshes:e});for(let m=0,v=h.length;m<v;m++)p.add(h[m]);return p})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new f.PerspectiveCamera(f.MathUtils.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new f.OrthographicCamera(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),j(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){let r=i.pop(),o=i,a=[],s=[];for(let l=0,u=o.length;l<u;l++){let h=o[l];if(h){a.push(h);let p=new f.Matrix4;r!==null&&p.fromArray(r.array,l*16),s.push(p)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new f.Skeleton(a,s)})}loadAnimation(e){let n=this.json.animations[e],i=n.name?n.name:"animation_"+e,r=[],o=[],a=[],s=[],l=[];for(let u=0,h=n.channels.length;u<h;u++){let p=n.channels[u],m=n.samplers[p.sampler],v=p.target,g=v.node,E=n.parameters!==void 0?n.parameters[m.input]:m.input,_=n.parameters!==void 0?n.parameters[m.output]:m.output;v.node!==void 0&&(r.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",E)),a.push(this.getDependency("accessor",_)),s.push(m),l.push(v))}return Promise.all([Promise.all(r),Promise.all(o),Promise.all(a),Promise.all(s),Promise.all(l)]).then(function(u){let h=u[0],p=u[1],m=u[2],v=u[3],g=u[4],E=[];for(let _=0,x=h.length;_<x;_++){let R=h[_],T=p[_],A=m[_],y=v[_],M=g[_];if(R===void 0)continue;R.updateMatrix();let b;switch(W[M.path]){case W.weights:b=f.NumberKeyframeTrack;break;case W.rotation:b=f.QuaternionKeyframeTrack;break;case W.position:case W.scale:default:b=f.VectorKeyframeTrack;break}let L=R.name?R.name:R.uuid,I=y.interpolation!==void 0?zi[y.interpolation]:f.InterpolateLinear,P=[];W[M.path]===W.weights?R.traverse(function(H){H.morphTargetInfluences&&P.push(H.name?H.name:H.uuid)}):P.push(L);let N=A.array;if(A.normalized){let H=Ft(N.constructor),k=new Float32Array(N.length);for(let U=0,K=N.length;U<K;U++)k[U]=N[U]*H;N=k}for(let H=0,k=P.length;H<k;H++){let U=new b(P[H]+"."+W[M.path],T.array,N,I);y.interpolation==="CUBICSPLINE"&&(U.createInterpolant=function(oe){let se=this instanceof f.QuaternionKeyframeTrack?Dt:we;return new se(this.times,this.values,this.getValueSize()/3,oe)},U.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0),E.push(U)}}return new f.AnimationClip(i,void 0,E)})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let s=0,l=i.weights.length;s<l;s++)a.morphTargetInfluences[s]=i.weights[s]}),o})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let l=0,u=a.length;l<u;l++)o.push(n.getDependency("node",a[l]));let s=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),s]).then(function(l){let u=l[0],h=l[1],p=l[2];p!==null&&u.traverse(function(m){m.isSkinnedMesh&&m.bind(p,$i)});for(let m=0,v=h.length;m<v;m++)u.add(h[m]);return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],s=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return s&&a.push(s),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let u;if(r.isBone===!0?u=new f.Bone:l.length>1?u=new f.Group:l.length===1?u=l[0]:u=new f.Object3D,u!==l[0])for(let h=0,p=l.length;h<p;h++)u.add(l[h]);if(r.name&&(u.userData.name=r.name,u.name=o),j(u,r),r.extensions&&ue(n,u,r),r.matrix!==void 0){let h=new f.Matrix4;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);return i.associations.has(u)||i.associations.set(u,{}),i.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,r=new f.Group;n.name&&(r.name=i.createUniqueName(n.name)),j(r,n),n.extensions&&ue(t,r,n);let o=n.nodes||[],a=[];for(let s=0,l=o.length;s<l;s++)a.push(i.getDependency("node",o[s]));return Promise.all(a).then(function(s){for(let u=0,h=s.length;u<h;u++)r.add(s[u]);let l=u=>{let h=new Map;for(let[p,m]of i.associations)(p instanceof f.Material||p instanceof f.Texture)&&h.set(p,m);return u.traverse(p=>{let m=i.associations.get(p);m!=null&&h.set(p,m)}),h};return i.associations=l(r),r})}};function Ki(c,e,t){let n=e.attributes,i=new f.Box3;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],s=a.min,l=a.max;if(s!==void 0&&l!==void 0){if(i.set(new f.Vector3(s[0],s[1],s[2]),new f.Vector3(l[0],l[1],l[2])),a.normalized){let u=Ft(Z[a.componentType]);i.min.multiplyScalar(u),i.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new f.Vector3,s=new f.Vector3;for(let l=0,u=r.length;l<u;l++){let h=r[l];if(h.POSITION!==void 0){let p=t.json.accessors[h.POSITION],m=p.min,v=p.max;if(m!==void 0&&v!==void 0){if(s.setX(Math.max(Math.abs(m[0]),Math.abs(v[0]))),s.setY(Math.max(Math.abs(m[1]),Math.abs(v[1]))),s.setZ(Math.max(Math.abs(m[2]),Math.abs(v[2]))),p.normalized){let g=Ft(Z[p.componentType]);s.multiplyScalar(g)}a.max(s)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}c.boundingBox=i;let o=new f.Sphere;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,c.boundingSphere=o}function On(c,e,t){let n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(s){c.setAttribute(a,s)})}for(let o in n){let a=Bt[o]||o.toLowerCase();a in c.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!c.index){let o=t.getDependency("accessor",e.indices).then(function(a){c.setIndex(a)});i.push(o)}return j(c,e),Ki(c,e,t),Promise.all(i).then(function(){return e.targets!==void 0?Xi(c,e.targets,t):c})}var d=Ae(ae()),Pe=Ae(ae());var Ne=class extends d.Object3D{get overrideBlinkAmount(){return this.overrideBlink==="block"?0<this.weight?1:0:this.overrideBlink==="blend"?this.weight:0}get overrideLookAtAmount(){return this.overrideLookAt==="block"?0<this.weight?1:0:this.overrideLookAt==="blend"?this.weight:0}get overrideMouthAmount(){return this.overrideMouth==="block"?0<this.weight?1:0:this.overrideMouth==="blend"?this.weight:0}constructor(e){super(),this.weight=0,this.isBinary=!1,this.overrideBlink="none",this.overrideLookAt="none",this.overrideMouth="none",this._binds=[],this.name=`VRMExpression_${e}`,this.expressionName=e,this.type="VRMExpression",this.visible=!1}addBind(e){this._binds.push(e)}applyWeight(e){var t;let n=this.isBinary?this.weight<=.5?0:1:this.weight;n*=(t=e?.multiplier)!==null&&t!==void 0?t:1,this._binds.forEach(i=>i.applyWeight(n))}clearAppliedWeight(){this._binds.forEach(e=>e.clearAppliedWeight())}};function S(c,e,t,n){function i(r){return r instanceof t?r:new t(function(o){o(r)})}return new(t||(t=Promise))(function(r,o){function a(u){try{l(n.next(u))}catch(h){o(h)}}function s(u){try{l(n.throw(u))}catch(h){o(h)}}function l(u){u.done?r(u.value):i(u.value).then(a,s)}l((n=n.apply(c,e||[])).next())})}function ei(c,e,t){var n,i;let r=c.parser.json,o=(n=r.nodes)===null||n===void 0?void 0:n[e];if(o==null)return console.warn(`extractPrimitivesInternal: Attempt to use nodes[${e}] of glTF but the node doesn't exist`),null;let a=o.mesh;if(a==null)return null;let s=(i=r.meshes)===null||i===void 0?void 0:i[a];if(s==null)return console.warn(`extractPrimitivesInternal: Attempt to use meshes[${a}] of glTF but the mesh doesn't exist`),null;let l=s.primitives.length,u=[];return t.traverse(h=>{u.length<l&&h.isMesh&&u.push(h)}),u}function Cn(c,e){return S(this,void 0,void 0,function*(){let t=yield c.parser.getDependency("node",e);return ei(c,e,t)})}function Dn(c){return S(this,void 0,void 0,function*(){let e=yield c.parser.getDependencies("node"),t=new Map;return e.forEach((n,i)=>{let r=ei(c,i,n);r!=null&&t.set(i,r)}),t})}function Bn(c,e){var t,n;let i=parseInt(d.REVISION,10),r=null;if(i>=133)r=(n=(t=c.associations.get(e))===null||t===void 0?void 0:t.materials)!==null&&n!==void 0?n:null;else{let a=c.associations.get(e);a?.type==="materials"&&(r=a.index)}return r}var Qt={Aa:"aa",Ih:"ih",Ou:"ou",Ee:"ee",Oh:"oh",Blink:"blink",Happy:"happy",Angry:"angry",Sad:"sad",Relaxed:"relaxed",LookUp:"lookUp",Surprised:"surprised",LookDown:"lookDown",LookLeft:"lookLeft",LookRight:"lookRight",BlinkLeft:"blinkLeft",BlinkRight:"blinkRight",Neutral:"neutral"};function ti(c){return Math.max(Math.min(c,1),0)}var Oe=class c{get expressions(){return this._expressions.concat()}get expressionMap(){return Object.assign({},this._expressionMap)}get presetExpressionMap(){let e={},t=new Set(Object.values(Qt));return Object.entries(this._expressionMap).forEach(([n,i])=>{t.has(n)&&(e[n]=i)}),e}get customExpressionMap(){let e={},t=new Set(Object.values(Qt));return Object.entries(this._expressionMap).forEach(([n,i])=>{t.has(n)||(e[n]=i)}),e}constructor(){this.blinkExpressionNames=["blink","blinkLeft","blinkRight"],this.lookAtExpressionNames=["lookLeft","lookRight","lookUp","lookDown"],this.mouthExpressionNames=["aa","ee","ih","oh","ou"],this._expressions=[],this._expressionMap={}}copy(e){return this._expressions.concat().forEach(n=>{this.unregisterExpression(n)}),e._expressions.forEach(n=>{this.registerExpression(n)}),this.blinkExpressionNames=e.blinkExpressionNames.concat(),this.lookAtExpressionNames=e.lookAtExpressionNames.concat(),this.mouthExpressionNames=e.mouthExpressionNames.concat(),this}clone(){return new c().copy(this)}getExpression(e){var t;return(t=this._expressionMap[e])!==null&&t!==void 0?t:null}registerExpression(e){this._expressions.push(e),this._expressionMap[e.expressionName]=e}unregisterExpression(e){let t=this._expressions.indexOf(e);t===-1&&console.warn("VRMExpressionManager: The specified expressions is not registered"),this._expressions.splice(t,1),delete this._expressionMap[e.expressionName]}getValue(e){var t;let n=this.getExpression(e);return(t=n?.weight)!==null&&t!==void 0?t:null}setValue(e,t){let n=this.getExpression(e);n&&(n.weight=ti(t))}getExpressionTrackName(e){let t=this.getExpression(e);return t?`${t.name}.weight`:null}update(){let e=this._calculateWeightMultipliers();this._expressions.forEach(t=>{t.clearAppliedWeight()}),this._expressions.forEach(t=>{let n=1,i=t.expressionName;this.blinkExpressionNames.indexOf(i)!==-1&&(n*=e.blink),this.lookAtExpressionNames.indexOf(i)!==-1&&(n*=e.lookAt),this.mouthExpressionNames.indexOf(i)!==-1&&(n*=e.mouth),t.applyWeight({multiplier:n})})}_calculateWeightMultipliers(){let e=1,t=1,n=1;return this._expressions.forEach(i=>{e-=i.overrideBlinkAmount,t-=i.overrideLookAtAmount,n-=i.overrideMouthAmount}),e=Math.max(0,e),t=Math.max(0,t),n=Math.max(0,n),{blink:e,lookAt:t,mouth:n}}},ce={Color:"color",EmissionColor:"emissionColor",ShadeColor:"shadeColor",MatcapColor:"matcapColor",RimColor:"rimColor",OutlineColor:"outlineColor"},Zi={_Color:ce.Color,_EmissionColor:ce.EmissionColor,_ShadeColor:ce.ShadeColor,_RimColor:ce.RimColor,_OutlineColor:ce.OutlineColor},Ji=new d.Color,ge=class c{constructor({material:e,type:t,targetValue:n}){var i,r,o;this.material=e,this.type=t,this.targetValue=n;let a=(i=Object.entries(c._propertyNameMapMap).find(([l])=>e[l]===!0))===null||i===void 0?void 0:i[1],s=(r=a?.[t])!==null&&r!==void 0?r:null;if(s==null)console.warn(`Tried to add a material color bind to the material ${(o=e.name)!==null&&o!==void 0?o:"(no name)"}, the type ${t} but the material or the type is not supported.`),this._state=null;else{let u=e[s].clone(),h=new d.Color(n.r-u.r,n.g-u.g,n.b-u.b);this._state={propertyName:s,initialValue:u,deltaValue:h}}}applyWeight(e){if(this._state==null)return;let{propertyName:t,deltaValue:n}=this._state,i=this.material[t];i!==void 0&&(i.add(Ji.copy(n).multiplyScalar(e)),typeof this.material.shouldApplyUniforms=="boolean"&&(this.material.shouldApplyUniforms=!0))}clearAppliedWeight(){if(this._state==null)return;let{propertyName:e,initialValue:t}=this._state,n=this.material[e];n!==void 0&&(n.copy(t),typeof this.material.shouldApplyUniforms=="boolean"&&(this.material.shouldApplyUniforms=!0))}};ge._propertyNameMapMap={isMeshStandardMaterial:{color:"color",emissionColor:"emissive"},isMeshBasicMaterial:{color:"color"},isMToonMaterial:{color:"color",emissionColor:"emissive",outlineColor:"outlineColorFactor",matcapColor:"matcapFactor",rimColor:"parametricRimColorFactor",shadeColor:"shadeColorFactor"}};var Ue=class{constructor({primitives:e,index:t,weight:n}){this.primitives=e,this.index=t,this.weight=n}applyWeight(e){this.primitives.forEach(t=>{var n;((n=t.morphTargetInfluences)===null||n===void 0?void 0:n[this.index])!=null&&(t.morphTargetInfluences[this.index]+=this.weight*e)})}clearAppliedWeight(){this.primitives.forEach(e=>{var t;((t=e.morphTargetInfluences)===null||t===void 0?void 0:t[this.index])!=null&&(e.morphTargetInfluences[this.index]=0)})}},Fn=new d.Vector2,_e=class c{constructor({material:e,scale:t,offset:n}){var i,r;this.material=e,this.scale=t,this.offset=n;let o=(i=Object.entries(c._propertyNamesMap).find(([a])=>e[a]===!0))===null||i===void 0?void 0:i[1];o==null?(console.warn(`Tried to add a texture transform bind to the material ${(r=e.name)!==null&&r!==void 0?r:"(no name)"} but the material is not supported.`),this._properties=[]):(this._properties=[],o.forEach(a=>{var s;let l=(s=e[a])===null||s===void 0?void 0:s.clone();if(!l)return null;e[a]=l;let u=l.offset.clone(),h=l.repeat.clone(),p=n.clone().sub(u),m=t.clone().sub(h);this._properties.push({name:a,initialOffset:u,deltaOffset:p,initialScale:h,deltaScale:m})}))}applyWeight(e){this._properties.forEach(t=>{let n=this.material[t.name];n!==void 0&&(n.offset.add(Fn.copy(t.deltaOffset).multiplyScalar(e)),n.repeat.add(Fn.copy(t.deltaScale).multiplyScalar(e)),n.needsUpdate=!0)})}clearAppliedWeight(){this._properties.forEach(e=>{let t=this.material[e.name];t!==void 0&&(t.offset.copy(e.initialOffset),t.repeat.copy(e.initialScale),t.needsUpdate=!0)})}};_e._propertyNamesMap={isMeshStandardMaterial:["map","emissiveMap","bumpMap","normalMap","displacementMap","roughnessMap","metalnessMap","alphaMap"],isMeshBasicMaterial:["map","specularMap","alphaMap"],isMToonMaterial:["map","normalMap","emissiveMap","shadeMultiplyTexture","rimMultiplyTexture","outlineWidthMultiplyTexture","uvAnimationMaskTexture"]};var er=new Set(["1.0","1.0-beta"]),Ce=class c{get name(){return"VRMExpressionLoaderPlugin"}constructor(e){this.parser=e}afterRoot(e){return S(this,void 0,void 0,function*(){e.userData.vrmExpressionManager=yield this._import(e)})}_import(e){return S(this,void 0,void 0,function*(){let t=yield this._v1Import(e);if(t)return t;let n=yield this._v0Import(e);return n||null})}_v1Import(e){var t,n;return S(this,void 0,void 0,function*(){let i=this.parser.json;if(!(((t=i.extensionsUsed)===null||t===void 0?void 0:t.indexOf("VRMC_vrm"))!==-1))return null;let o=(n=i.extensions)===null||n===void 0?void 0:n.VRMC_vrm;if(!o)return null;let a=o.specVersion;if(!er.has(a))return console.warn(`VRMExpressionLoaderPlugin: Unknown VRMC_vrm specVersion "${a}"`),null;let s=o.expressions;if(!s)return null;let l=new Set(Object.values(Qt)),u=new Map;s.preset!=null&&Object.entries(s.preset).forEach(([p,m])=>{if(m!=null){if(!l.has(p)){console.warn(`VRMExpressionLoaderPlugin: Unknown preset name "${p}" detected. Ignoring the expression`);return}u.set(p,m)}}),s.custom!=null&&Object.entries(s.custom).forEach(([p,m])=>{if(l.has(p)){console.warn(`VRMExpressionLoaderPlugin: Custom expression cannot have preset name "${p}". Ignoring the expression`);return}u.set(p,m)});let h=new Oe;return yield Promise.all(Array.from(u.entries()).map(([p,m])=>S(this,void 0,void 0,function*(){var v,g,E,_,x,R,T;let A=new Ne(p);if(e.scene.add(A),A.isBinary=(v=m.isBinary)!==null&&v!==void 0?v:!1,A.overrideBlink=(g=m.overrideBlink)!==null&&g!==void 0?g:"none",A.overrideLookAt=(E=m.overrideLookAt)!==null&&E!==void 0?E:"none",A.overrideMouth=(_=m.overrideMouth)!==null&&_!==void 0?_:"none",(x=m.morphTargetBinds)===null||x===void 0||x.forEach(y=>S(this,void 0,void 0,function*(){var M;if(y.node===void 0||y.index===void 0)return;let b=yield Cn(e,y.node),L=y.index;if(!b.every(I=>Array.isArray(I.morphTargetInfluences)&&L<I.morphTargetInfluences.length)){console.warn(`VRMExpressionLoaderPlugin: ${m.name} attempts to index morph #${L} but not found.`);return}A.addBind(new Ue({primitives:b,index:L,weight:(M=y.weight)!==null&&M!==void 0?M:1}))})),m.materialColorBinds||m.textureTransformBinds){let y=[];e.scene.traverse(M=>{let b=M.material;b&&y.push(b)}),(R=m.materialColorBinds)===null||R===void 0||R.forEach(M=>S(this,void 0,void 0,function*(){y.filter(L=>{let I=Bn(this.parser,L);return M.material===I}).forEach(L=>{A.addBind(new ge({material:L,type:M.type,targetValue:new d.Color().fromArray(M.targetValue)}))})})),(T=m.textureTransformBinds)===null||T===void 0||T.forEach(M=>S(this,void 0,void 0,function*(){y.filter(L=>{let I=Bn(this.parser,L);return M.material===I}).forEach(L=>{var I,P;A.addBind(new _e({material:L,offset:new d.Vector2().fromArray((I=M.offset)!==null&&I!==void 0?I:[0,0]),scale:new d.Vector2().fromArray((P=M.scale)!==null&&P!==void 0?P:[1,1])}))})}))}h.registerExpression(A)}))),h})}_v0Import(e){var t;return S(this,void 0,void 0,function*(){let n=this.parser.json,i=(t=n.extensions)===null||t===void 0?void 0:t.VRM;if(!i)return null;let r=i.blendShapeMaster;if(!r)return null;let o=new Oe,a=r.blendShapeGroups;if(!a)return o;let s=new Set;return yield Promise.all(a.map(l=>S(this,void 0,void 0,function*(){var u;let h=l.presetName,p=h!=null&&c.v0v1PresetNameMap[h]||null,m=p??l.name;if(m==null){console.warn("VRMExpressionLoaderPlugin: One of custom expressions has no name. Ignoring the expression");return}if(s.has(m)){console.warn(`VRMExpressionLoaderPlugin: An expression preset ${h} has duplicated entries. Ignoring the expression`);return}s.add(m);let v=new Ne(m);e.scene.add(v),v.isBinary=(u=l.isBinary)!==null&&u!==void 0?u:!1,l.binds&&l.binds.forEach(E=>S(this,void 0,void 0,function*(){var _;if(E.mesh===void 0||E.index===void 0)return;let x=[];(_=n.nodes)===null||_===void 0||_.forEach((T,A)=>{T.mesh===E.mesh&&x.push(A)});let R=E.index;yield Promise.all(x.map(T=>S(this,void 0,void 0,function*(){var A;let y=yield Cn(e,T);if(!y.every(M=>Array.isArray(M.morphTargetInfluences)&&R<M.morphTargetInfluences.length)){console.warn(`VRMExpressionLoaderPlugin: ${l.name} attempts to index ${R}th morph but not found.`);return}v.addBind(new Ue({primitives:y,index:R,weight:.01*((A=E.weight)!==null&&A!==void 0?A:100)}))})))}));let g=l.materialValues;g&&g.length!==0&&g.forEach(E=>{if(E.materialName===void 0||E.propertyName===void 0||E.targetValue===void 0)return;let _=[];e.scene.traverse(R=>{if(R.material){let T=R.material;Array.isArray(T)?_.push(...T.filter(A=>(A.name===E.materialName||A.name===E.materialName+" (Outline)")&&_.indexOf(A)===-1)):T.name===E.materialName&&_.indexOf(T)===-1&&_.push(T)}});let x=E.propertyName;_.forEach(R=>{if(x==="_MainTex_ST"){let A=new d.Vector2(E.targetValue[0],E.targetValue[1]),y=new d.Vector2(E.targetValue[2],E.targetValue[3]);v.addBind(new _e({material:R,scale:A,offset:y}));return}let T=Zi[x];if(T){v.addBind(new ge({material:R,type:T,targetValue:new d.Color(...E.targetValue.slice(0,3))}));return}console.warn(x+" is not supported")})}),o.registerExpression(v)}))),o})}};Ce.v0v1PresetNameMap={a:"aa",e:"ee",i:"ih",o:"oh",u:"ou",blink:"blink",joy:"happy",angry:"angry",sorrow:"sad",fun:"relaxed",lookup:"lookUp",lookdown:"lookDown",lookleft:"lookLeft",lookright:"lookRight",blink_l:"blinkLeft",blink_r:"blinkRight",neutral:"neutral"};var re=class c{constructor(e,t){this._firstPersonOnlyLayer=c.DEFAULT_FIRSTPERSON_ONLY_LAYER,this._thirdPersonOnlyLayer=c.DEFAULT_THIRDPERSON_ONLY_LAYER,this._initializedLayers=!1,this.humanoid=e,this.meshAnnotations=t}copy(e){if(this.humanoid!==e.humanoid)throw new Error("VRMFirstPerson: humanoid must be same in order to copy");return this.meshAnnotations=e.meshAnnotations.map(t=>({meshes:t.meshes.concat(),type:t.type})),this}clone(){return new c(this.humanoid,this.meshAnnotations).copy(this)}get firstPersonOnlyLayer(){return this._firstPersonOnlyLayer}get thirdPersonOnlyLayer(){return this._thirdPersonOnlyLayer}setup({firstPersonOnlyLayer:e=c.DEFAULT_FIRSTPERSON_ONLY_LAYER,thirdPersonOnlyLayer:t=c.DEFAULT_THIRDPERSON_ONLY_LAYER}={}){this._initializedLayers||(this._firstPersonOnlyLayer=e,this._thirdPersonOnlyLayer=t,this.meshAnnotations.forEach(n=>{n.meshes.forEach(i=>{n.type==="firstPersonOnly"?(i.layers.set(this._firstPersonOnlyLayer),i.traverse(r=>r.layers.set(this._firstPersonOnlyLayer))):n.type==="thirdPersonOnly"?(i.layers.set(this._thirdPersonOnlyLayer),i.traverse(r=>r.layers.set(this._thirdPersonOnlyLayer))):n.type==="auto"&&this._createHeadlessModel(i)})}),this._initializedLayers=!0)}_excludeTriangles(e,t,n,i){let r=0;if(t!=null&&t.length>0)for(let o=0;o<e.length;o+=3){let a=e[o],s=e[o+1],l=e[o+2],u=t[a],h=n[a];if(u[0]>0&&i.includes(h[0])||u[1]>0&&i.includes(h[1])||u[2]>0&&i.includes(h[2])||u[3]>0&&i.includes(h[3]))continue;let p=t[s],m=n[s];if(p[0]>0&&i.includes(m[0])||p[1]>0&&i.includes(m[1])||p[2]>0&&i.includes(m[2])||p[3]>0&&i.includes(m[3]))continue;let v=t[l],g=n[l];v[0]>0&&i.includes(g[0])||v[1]>0&&i.includes(g[1])||v[2]>0&&i.includes(g[2])||v[3]>0&&i.includes(g[3])||(e[r++]=a,e[r++]=s,e[r++]=l)}return r}_createErasedMesh(e,t){let n=new d.SkinnedMesh(e.geometry.clone(),e.material);n.name=`${e.name}(erase)`,n.frustumCulled=e.frustumCulled,n.layers.set(this._firstPersonOnlyLayer);let i=n.geometry,r=i.getAttribute("skinIndex"),o=r instanceof d.GLBufferAttribute?[]:r.array,a=[];for(let g=0;g<o.length;g+=4)a.push([o[g],o[g+1],o[g+2],o[g+3]]);let s=i.getAttribute("skinWeight"),l=s instanceof d.GLBufferAttribute?[]:s.array,u=[];for(let g=0;g<l.length;g+=4)u.push([l[g],l[g+1],l[g+2],l[g+3]]);let h=i.getIndex();if(!h)throw new Error("The geometry doesn't have an index buffer");let p=Array.from(h.array),m=this._excludeTriangles(p,u,a,t),v=[];for(let g=0;g<m;g++)v[g]=p[g];return i.setIndex(v),e.onBeforeRender&&(n.onBeforeRender=e.onBeforeRender),n.bind(new d.Skeleton(e.skeleton.bones,e.skeleton.boneInverses),new d.Matrix4),n}_createHeadlessModelForSkinnedMesh(e,t){let n=[];if(t.skeleton.bones.forEach((r,o)=>{this._isEraseTarget(r)&&n.push(o)}),!n.length){t.layers.enable(this._thirdPersonOnlyLayer),t.layers.enable(this._firstPersonOnlyLayer);return}t.layers.set(this._thirdPersonOnlyLayer);let i=this._createErasedMesh(t,n);e.add(i)}_createHeadlessModel(e){if(e.type==="Group")if(e.layers.set(this._thirdPersonOnlyLayer),this._isEraseTarget(e))e.traverse(t=>t.layers.set(this._thirdPersonOnlyLayer));else{let t=new d.Group;t.name=`_headless_${e.name}`,t.layers.set(this._firstPersonOnlyLayer),e.parent.add(t),e.children.filter(n=>n.type==="SkinnedMesh").forEach(n=>{let i=n;this._createHeadlessModelForSkinnedMesh(t,i)})}else if(e.type==="SkinnedMesh"){let t=e;this._createHeadlessModelForSkinnedMesh(e.parent,t)}else this._isEraseTarget(e)&&(e.layers.set(this._thirdPersonOnlyLayer),e.traverse(t=>t.layers.set(this._thirdPersonOnlyLayer)))}_isEraseTarget(e){return e===this.humanoid.getRawBoneNode("head")?!0:e.parent?this._isEraseTarget(e.parent):!1}};re.DEFAULT_FIRSTPERSON_ONLY_LAYER=9;re.DEFAULT_THIRDPERSON_ONLY_LAYER=10;var tr=new Set(["1.0","1.0-beta"]),Yt=class{get name(){return"VRMFirstPersonLoaderPlugin"}constructor(e){this.parser=e}afterRoot(e){return S(this,void 0,void 0,function*(){let t=e.userData.vrmHumanoid;if(t!==null){if(t===void 0)throw new Error("VRMFirstPersonLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");e.userData.vrmFirstPerson=yield this._import(e,t)}})}_import(e,t){return S(this,void 0,void 0,function*(){if(t==null)return null;let n=yield this._v1Import(e,t);if(n)return n;let i=yield this._v0Import(e,t);return i||null})}_v1Import(e,t){var n,i;return S(this,void 0,void 0,function*(){let r=this.parser.json;if(!(((n=r.extensionsUsed)===null||n===void 0?void 0:n.indexOf("VRMC_vrm"))!==-1))return null;let a=(i=r.extensions)===null||i===void 0?void 0:i.VRMC_vrm;if(!a)return null;let s=a.specVersion;if(!tr.has(s))return console.warn(`VRMFirstPersonLoaderPlugin: Unknown VRMC_vrm specVersion "${s}"`),null;let l=a.firstPerson;if(!l)return null;let u=[],h=yield Dn(e);return Array.from(h.entries()).forEach(([p,m])=>{var v;let g=l.meshAnnotations?l.meshAnnotations.find(E=>E.node===p):void 0;u.push({meshes:m,type:(v=g?.type)!==null&&v!==void 0?v:"both"})}),new re(t,u)})}_v0Import(e,t){var n;return S(this,void 0,void 0,function*(){let i=this.parser.json,r=(n=i.extensions)===null||n===void 0?void 0:n.VRM;if(!r)return null;let o=r.firstPerson;if(!o)return null;let a=[],s=yield Dn(e);return Array.from(s.entries()).forEach(([l,u])=>{let h=i.nodes[l],p=o.meshAnnotations?o.meshAnnotations.find(m=>m.mesh===h.mesh):void 0;a.push({meshes:u,type:this._convertV0FlagToV1Type(p?.firstPersonFlag)})}),new re(t,a)})}_convertV0FlagToV1Type(e){return e==="FirstPersonOnly"?"firstPersonOnly":e==="ThirdPersonOnly"?"thirdPersonOnly":e==="Auto"?"auto":"both"}};var Vn=new d.Vector3,kn=new d.Vector3,nr=new d.Quaternion,De=class extends d.Group{constructor(e){super(),this.vrmHumanoid=e,this._boneAxesMap=new Map,Object.values(e.humanBones).forEach(t=>{let n=new d.AxesHelper(1);n.matrixAutoUpdate=!1,n.material.depthTest=!1,n.material.depthWrite=!1,this.add(n),this._boneAxesMap.set(t,n)})}dispose(){Array.from(this._boneAxesMap.values()).forEach(e=>{e.geometry.dispose(),e.material.dispose()})}updateMatrixWorld(e){Array.from(this._boneAxesMap.entries()).forEach(([t,n])=>{t.node.updateWorldMatrix(!0,!1),t.node.matrixWorld.decompose(Vn,nr,kn);let i=Vn.set(.1,.1,.1).divide(kn);n.matrix.copy(t.node.matrixWorld).scale(i)}),super.updateMatrixWorld(e)}},kt=["hips","spine","chest","upperChest","neck","head","leftEye","rightEye","jaw","leftUpperLeg","leftLowerLeg","leftFoot","leftToes","rightUpperLeg","rightLowerLeg","rightFoot","rightToes","leftShoulder","leftUpperArm","leftLowerArm","leftHand","rightShoulder","rightUpperArm","rightLowerArm","rightHand","leftThumbMetacarpal","leftThumbProximal","leftThumbDistal","leftIndexProximal","leftIndexIntermediate","leftIndexDistal","leftMiddleProximal","leftMiddleIntermediate","leftMiddleDistal","leftRingProximal","leftRingIntermediate","leftRingDistal","leftLittleProximal","leftLittleIntermediate","leftLittleDistal","rightThumbMetacarpal","rightThumbProximal","rightThumbDistal","rightIndexProximal","rightIndexIntermediate","rightIndexDistal","rightMiddleProximal","rightMiddleIntermediate","rightMiddleDistal","rightRingProximal","rightRingIntermediate","rightRingDistal","rightLittleProximal","rightLittleIntermediate","rightLittleDistal"];var ir={hips:null,spine:"hips",chest:"spine",upperChest:"chest",neck:"upperChest",head:"neck",leftEye:"head",rightEye:"head",jaw:"head",leftUpperLeg:"hips",leftLowerLeg:"leftUpperLeg",leftFoot:"leftLowerLeg",leftToes:"leftFoot",rightUpperLeg:"hips",rightLowerLeg:"rightUpperLeg",rightFoot:"rightLowerLeg",rightToes:"rightFoot",leftShoulder:"upperChest",leftUpperArm:"leftShoulder",leftLowerArm:"leftUpperArm",leftHand:"leftLowerArm",rightShoulder:"upperChest",rightUpperArm:"rightShoulder",rightLowerArm:"rightUpperArm",rightHand:"rightLowerArm",leftThumbMetacarpal:"leftHand",leftThumbProximal:"leftThumbMetacarpal",leftThumbDistal:"leftThumbProximal",leftIndexProximal:"leftHand",leftIndexIntermediate:"leftIndexProximal",leftIndexDistal:"leftIndexIntermediate",leftMiddleProximal:"leftHand",leftMiddleIntermediate:"leftMiddleProximal",leftMiddleDistal:"leftMiddleIntermediate",leftRingProximal:"leftHand",leftRingIntermediate:"leftRingProximal",leftRingDistal:"leftRingIntermediate",leftLittleProximal:"leftHand",leftLittleIntermediate:"leftLittleProximal",leftLittleDistal:"leftLittleIntermediate",rightThumbMetacarpal:"rightHand",rightThumbProximal:"rightThumbMetacarpal",rightThumbDistal:"rightThumbProximal",rightIndexProximal:"rightHand",rightIndexIntermediate:"rightIndexProximal",rightIndexDistal:"rightIndexIntermediate",rightMiddleProximal:"rightHand",rightMiddleIntermediate:"rightMiddleProximal",rightMiddleDistal:"rightMiddleIntermediate",rightRingProximal:"rightHand",rightRingIntermediate:"rightRingProximal",rightRingDistal:"rightRingIntermediate",rightLittleProximal:"rightHand",rightLittleIntermediate:"rightLittleProximal",rightLittleDistal:"rightLittleIntermediate"};function ni(c){return c.invert?c.invert():c.inverse(),c}var q=new d.Vector3,Q=new d.Quaternion,ve=class{constructor(e){this.humanBones=e,this.restPose=this.getAbsolutePose()}getAbsolutePose(){let e={};return Object.keys(this.humanBones).forEach(t=>{let n=t,i=this.getBoneNode(n);i&&(q.copy(i.position),Q.copy(i.quaternion),e[n]={position:q.toArray(),rotation:Q.toArray()})}),e}getPose(){let e={};return Object.keys(this.humanBones).forEach(t=>{let n=t,i=this.getBoneNode(n);if(!i)return;q.set(0,0,0),Q.identity();let r=this.restPose[n];r?.position&&q.fromArray(r.position).negate(),r?.rotation&&ni(Q.fromArray(r.rotation)),q.add(i.position),Q.premultiply(i.quaternion),e[n]={position:q.toArray(),rotation:Q.toArray()}}),e}setPose(e){Object.entries(e).forEach(([t,n])=>{let i=t,r=this.getBoneNode(i);if(!r)return;let o=this.restPose[i];o&&(n?.position&&(r.position.fromArray(n.position),o.position&&r.position.add(q.fromArray(o.position))),n?.rotation&&(r.quaternion.fromArray(n.rotation),o.rotation&&r.quaternion.multiply(Q.fromArray(o.rotation))))})}resetPose(){Object.entries(this.restPose).forEach(([e,t])=>{let n=this.getBoneNode(e);n&&(t?.position&&n.position.fromArray(t.position),t?.rotation&&n.quaternion.fromArray(t.rotation))})}getBone(e){var t;return(t=this.humanBones[e])!==null&&t!==void 0?t:void 0}getBoneNode(e){var t,n;return(n=(t=this.humanBones[e])===null||t===void 0?void 0:t.node)!==null&&n!==void 0?n:null}},rr=new d.Vector3,or=new d.Quaternion,sr=new d.Vector3,Be=class c extends ve{static _setupTransforms(e){let t=new d.Object3D;t.name="VRMHumanoidRig";let n={},i={},r={};kt.forEach(s=>{let l=e.getBoneNode(s);if(l){let u=new d.Vector3,h=new d.Quaternion;l.updateWorldMatrix(!0,!1),l.matrixWorld.decompose(u,h,rr),n[s]=u,i[s]=h,r[s]=l.quaternion.clone()}});let o={},a={};return kt.forEach(s=>{var l;let u=e.getBoneNode(s);if(u){let h=n[s],p=s,m,v;for(;m==null&&(p=ir[p],p!=null);)m=n[p],v=i[p];let g=new d.Object3D;g.name="Normalized_"+u.name,(p?(l=a[p])===null||l===void 0?void 0:l.node:t).add(g),g.position.copy(h),m&&g.position.sub(m),a[s]={node:g},o[s]=v??new d.Quaternion}}),{rigBones:a,root:t,parentWorldRotations:o,boneRotations:r}}constructor(e){let{rigBones:t,root:n,parentWorldRotations:i,boneRotations:r}=c._setupTransforms(e);super(t),this.original=e,this.root=n,this._parentWorldRotations=i,this._boneRotations=r}update(){kt.forEach(e=>{let t=this.original.getBoneNode(e);if(t!=null){let n=this.getBoneNode(e),i=this._parentWorldRotations[e],r=or.copy(i).invert(),o=this._boneRotations[e];if(t.quaternion.copy(n.quaternion).multiply(i).premultiply(r).multiply(o),e==="hips"){let a=n.getWorldPosition(sr);t.parent.updateWorldMatrix(!0,!1);let s=t.parent.matrixWorld,l=a.applyMatrix4(s.invert());t.position.copy(l)}}})}},Fe=class c{get restPose(){return console.warn("VRMHumanoid: restPose is deprecated. Use either rawRestPose or normalizedRestPose instead."),this.rawRestPose}get rawRestPose(){return this._rawHumanBones.restPose}get normalizedRestPose(){return this._normalizedHumanBones.restPose}get humanBones(){return this._rawHumanBones.humanBones}get rawHumanBones(){return this._rawHumanBones.humanBones}get normalizedHumanBones(){return this._normalizedHumanBones.humanBones}get normalizedHumanBonesRoot(){return this._normalizedHumanBones.root}constructor(e,t){var n;this.autoUpdateHumanBones=(n=t?.autoUpdateHumanBones)!==null&&n!==void 0?n:!0,this._rawHumanBones=new ve(e),this._normalizedHumanBones=new Be(this._rawHumanBones)}copy(e){return this.autoUpdateHumanBones=e.autoUpdateHumanBones,this._rawHumanBones=new ve(e.humanBones),this._normalizedHumanBones=new Be(this._rawHumanBones),this}clone(){return new c(this.humanBones,{autoUpdateHumanBones:this.autoUpdateHumanBones}).copy(this)}getAbsolutePose(){return console.warn("VRMHumanoid: getAbsolutePose() is deprecated. Use either getRawAbsolutePose() or getNormalizedAbsolutePose() instead."),this.getRawAbsolutePose()}getRawAbsolutePose(){return this._rawHumanBones.getAbsolutePose()}getNormalizedAbsolutePose(){return this._normalizedHumanBones.getAbsolutePose()}getPose(){return console.warn("VRMHumanoid: getPose() is deprecated. Use either getRawPose() or getNormalizedPose() instead."),this.getRawPose()}getRawPose(){return this._rawHumanBones.getPose()}getNormalizedPose(){return this._normalizedHumanBones.getPose()}setPose(e){return console.warn("VRMHumanoid: setPose() is deprecated. Use either setRawPose() or setNormalizedPose() instead."),this.setRawPose(e)}setRawPose(e){return this._rawHumanBones.setPose(e)}setNormalizedPose(e){return this._normalizedHumanBones.setPose(e)}resetPose(){return console.warn("VRMHumanoid: resetPose() is deprecated. Use either resetRawPose() or resetNormalizedPose() instead."),this.resetRawPose()}resetRawPose(){return this._rawHumanBones.resetPose()}resetNormalizedPose(){return this._normalizedHumanBones.resetPose()}getBone(e){return console.warn("VRMHumanoid: getBone() is deprecated. Use either getRawBone() or getNormalizedBone() instead."),this.getRawBone(e)}getRawBone(e){return this._rawHumanBones.getBone(e)}getNormalizedBone(e){return this._normalizedHumanBones.getBone(e)}getBoneNode(e){return console.warn("VRMHumanoid: getBoneNode() is deprecated. Use either getRawBoneNode() or getNormalizedBoneNode() instead."),this.getRawBoneNode(e)}getRawBoneNode(e){return this._rawHumanBones.getBoneNode(e)}getNormalizedBoneNode(e){return this._normalizedHumanBones.getBoneNode(e)}update(){this.autoUpdateHumanBones&&this._normalizedHumanBones.update()}},ar={Hips:"hips",Spine:"spine",Head:"head",LeftUpperLeg:"leftUpperLeg",LeftLowerLeg:"leftLowerLeg",LeftFoot:"leftFoot",RightUpperLeg:"rightUpperLeg",RightLowerLeg:"rightLowerLeg",RightFoot:"rightFoot",LeftUpperArm:"leftUpperArm",LeftLowerArm:"leftLowerArm",LeftHand:"leftHand",RightUpperArm:"rightUpperArm",RightLowerArm:"rightLowerArm",RightHand:"rightHand"},lr=new Set(["1.0","1.0-beta"]),Wn={leftThumbProximal:"leftThumbMetacarpal",leftThumbIntermediate:"leftThumbProximal",rightThumbProximal:"rightThumbMetacarpal",rightThumbIntermediate:"rightThumbProximal"},$t=class{get name(){return"VRMHumanoidLoaderPlugin"}constructor(e,t){this.parser=e,this.helperRoot=t?.helperRoot,this.autoUpdateHumanBones=t?.autoUpdateHumanBones}afterRoot(e){return S(this,void 0,void 0,function*(){e.userData.vrmHumanoid=yield this._import(e)})}_import(e){return S(this,void 0,void 0,function*(){let t=yield this._v1Import(e);if(t)return t;let n=yield this._v0Import(e);return n||null})}_v1Import(e){var t,n;return S(this,void 0,void 0,function*(){let i=this.parser.json;if(!(((t=i.extensionsUsed)===null||t===void 0?void 0:t.indexOf("VRMC_vrm"))!==-1))return null;let o=(n=i.extensions)===null||n===void 0?void 0:n.VRMC_vrm;if(!o)return null;let a=o.specVersion;if(!lr.has(a))return console.warn(`VRMHumanoidLoaderPlugin: Unknown VRMC_vrm specVersion "${a}"`),null;let s=o.humanoid;if(!s)return null;let l=s.humanBones.leftThumbIntermediate!=null||s.humanBones.rightThumbIntermediate!=null,u={};s.humanBones!=null&&(yield Promise.all(Object.entries(s.humanBones).map(([p,m])=>S(this,void 0,void 0,function*(){let v=p,g=m.node;if(l){let _=Wn[v];_!=null&&(v=_)}let E=yield this.parser.getDependency("node",g);if(E==null){console.warn(`A glTF node bound to the humanoid bone ${v} (index = ${g}) does not exist`);return}u[v]={node:E}}))));let h=new Fe(this._ensureRequiredBonesExist(u),{autoUpdateHumanBones:this.autoUpdateHumanBones});if(e.scene.add(h.normalizedHumanBonesRoot),this.helperRoot){let p=new De(h);this.helperRoot.add(p),p.renderOrder=this.helperRoot.renderOrder}return h})}_v0Import(e){var t;return S(this,void 0,void 0,function*(){let i=(t=this.parser.json.extensions)===null||t===void 0?void 0:t.VRM;if(!i)return null;let r=i.humanoid;if(!r)return null;let o={};r.humanBones!=null&&(yield Promise.all(r.humanBones.map(s=>S(this,void 0,void 0,function*(){let l=s.bone,u=s.node;if(l==null||u==null)return;let h=yield this.parser.getDependency("node",u);if(h==null){console.warn(`A glTF node bound to the humanoid bone ${l} (index = ${u}) does not exist`);return}let p=Wn[l],m=p??l;if(o[m]!=null){console.warn(`Multiple bone entries for ${m} detected (index = ${u}), ignoring duplicated entries.`);return}o[m]={node:h}}))));let a=new Fe(this._ensureRequiredBonesExist(o),{autoUpdateHumanBones:this.autoUpdateHumanBones});if(e.scene.add(a.normalizedHumanBonesRoot),this.helperRoot){let s=new De(a);this.helperRoot.add(s),s.renderOrder=this.helperRoot.renderOrder}return a})}_ensureRequiredBonesExist(e){let t=Object.values(ar).filter(n=>e[n]==null);if(t.length>0)throw new Error(`VRMHumanoidLoaderPlugin: These humanoid bones are required but not exist: ${t.join(", ")}`);return e}},Ve=class extends d.BufferGeometry{constructor(){super(),this._currentTheta=0,this._currentRadius=0,this.theta=0,this.radius=0,this._currentTheta=0,this._currentRadius=0,this._attrPos=new d.BufferAttribute(new Float32Array(65*3),3),this.setAttribute("position",this._attrPos),this._attrIndex=new d.BufferAttribute(new Uint16Array(3*63),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;this._currentTheta!==this.theta&&(this._currentTheta=this.theta,e=!0),this._currentRadius!==this.radius&&(this._currentRadius=this.radius,e=!0),e&&this._buildPosition()}_buildPosition(){this._attrPos.setXYZ(0,0,0,0);for(let e=0;e<64;e++){let t=e/63*this._currentTheta;this._attrPos.setXYZ(e+1,this._currentRadius*Math.sin(t),0,this._currentRadius*Math.cos(t))}this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<63;e++)this._attrIndex.setXYZ(e*3,0,e+1,e+2);this._attrIndex.needsUpdate=!0}},Kt=class extends d.BufferGeometry{constructor(){super(),this.radius=0,this._currentRadius=0,this.tail=new d.Vector3,this._currentTail=new d.Vector3,this._attrPos=new d.BufferAttribute(new Float32Array(294),3),this.setAttribute("position",this._attrPos),this._attrIndex=new d.BufferAttribute(new Uint16Array(194),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;this._currentRadius!==this.radius&&(this._currentRadius=this.radius,e=!0),this._currentTail.equals(this.tail)||(this._currentTail.copy(this.tail),e=!0),e&&this._buildPosition()}_buildPosition(){for(let e=0;e<32;e++){let t=e/16*Math.PI;this._attrPos.setXYZ(e,Math.cos(t),Math.sin(t),0),this._attrPos.setXYZ(32+e,0,Math.cos(t),Math.sin(t)),this._attrPos.setXYZ(64+e,Math.sin(t),0,Math.cos(t))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.setXYZ(96,0,0,0),this._attrPos.setXYZ(97,this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<32;e++){let t=(e+1)%32;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(64+e*2,32+e,32+t),this._attrIndex.setXY(128+e*2,64+e,64+t)}this._attrIndex.setXY(192,96,97),this._attrIndex.needsUpdate=!0}},Se=new d.Quaternion,jn=new d.Quaternion,de=new d.Vector3,zn=new d.Vector3,Gn=Math.sqrt(2)/2,ur=new d.Quaternion(0,0,-Gn,Gn),cr=new d.Vector3(0,1,0),Zt=class extends d.Group{constructor(e){super(),this.matrixAutoUpdate=!1,this.vrmLookAt=e;{let t=new Ve;t.radius=.5;let n=new d.MeshBasicMaterial({color:65280,transparent:!0,opacity:.5,side:d.DoubleSide,depthTest:!1,depthWrite:!1});this._meshPitch=new d.Mesh(t,n),this.add(this._meshPitch)}{let t=new Ve;t.radius=.5;let n=new d.MeshBasicMaterial({color:16711680,transparent:!0,opacity:.5,side:d.DoubleSide,depthTest:!1,depthWrite:!1});this._meshYaw=new d.Mesh(t,n),this.add(this._meshYaw)}{let t=new Kt;t.radius=.1;let n=new d.LineBasicMaterial({color:16777215,depthTest:!1,depthWrite:!1});this._lineTarget=new d.LineSegments(t,n),this._lineTarget.frustumCulled=!1,this.add(this._lineTarget)}}dispose(){this._meshYaw.geometry.dispose(),this._meshYaw.material.dispose(),this._meshPitch.geometry.dispose(),this._meshPitch.material.dispose(),this._lineTarget.geometry.dispose(),this._lineTarget.material.dispose()}updateMatrixWorld(e){let t=d.MathUtils.DEG2RAD*this.vrmLookAt.yaw;this._meshYaw.geometry.theta=t,this._meshYaw.geometry.update();let n=d.MathUtils.DEG2RAD*this.vrmLookAt.pitch;this._meshPitch.geometry.theta=n,this._meshPitch.geometry.update(),this.vrmLookAt.getLookAtWorldPosition(de),this.vrmLookAt.getLookAtWorldQuaternion(Se),Se.multiply(this.vrmLookAt.getFaceFrontQuaternion(jn)),this._meshYaw.position.copy(de),this._meshYaw.quaternion.copy(Se),this._meshPitch.position.copy(de),this._meshPitch.quaternion.copy(Se),this._meshPitch.quaternion.multiply(jn.setFromAxisAngle(cr,t)),this._meshPitch.quaternion.multiply(ur);let{target:i,autoUpdate:r}=this.vrmLookAt;i!=null&&r&&(i.getWorldPosition(zn).sub(de),this._lineTarget.geometry.tail.copy(zn),this._lineTarget.geometry.update(),this._lineTarget.position.copy(de)),super.updateMatrixWorld(e)}},dr=new d.Vector3,hr=new d.Vector3;function Jt(c,e){return c.matrixWorld.decompose(dr,e,hr),e}function He(c){return[Math.atan2(-c.z,c.x),Math.atan2(c.y,Math.sqrt(c.x*c.x+c.z*c.z))]}function Xn(c){let e=Math.round(c/2/Math.PI);return c-2*Math.PI*e}var qn=new d.Vector3(0,0,1),fr=new d.Vector3,pr=new d.Vector3,mr=new d.Vector3,gr=new d.Quaternion,Wt=new d.Quaternion,Qn=new d.Quaternion,_r=new d.Quaternion,jt=new d.Euler,ke=class c{get yaw(){return this._yaw}set yaw(e){this._yaw=e,this._needsUpdate=!0}get pitch(){return this._pitch}set pitch(e){this._pitch=e,this._needsUpdate=!0}get euler(){return console.warn("VRMLookAt: euler is deprecated. use getEuler() instead."),this.getEuler(new d.Euler)}constructor(e,t){this.offsetFromHeadBone=new d.Vector3,this.autoUpdate=!0,this.faceFront=new d.Vector3(0,0,1),this.humanoid=e,this.applier=t,this._yaw=0,this._pitch=0,this._needsUpdate=!0,this._restHeadWorldQuaternion=this.getLookAtWorldQuaternion(new d.Quaternion)}getEuler(e){return e.set(d.MathUtils.DEG2RAD*this._pitch,d.MathUtils.DEG2RAD*this._yaw,0,"YXZ")}copy(e){if(this.humanoid!==e.humanoid)throw new Error("VRMLookAt: humanoid must be same in order to copy");return this.offsetFromHeadBone.copy(e.offsetFromHeadBone),this.applier=e.applier,this.autoUpdate=e.autoUpdate,this.target=e.target,this.faceFront.copy(e.faceFront),this}clone(){return new c(this.humanoid,this.applier).copy(this)}reset(){this._yaw=0,this._pitch=0,this._needsUpdate=!0}getLookAtWorldPosition(e){let t=this.humanoid.getRawBoneNode("head");return e.copy(this.offsetFromHeadBone).applyMatrix4(t.matrixWorld)}getLookAtWorldQuaternion(e){let t=this.humanoid.getRawBoneNode("head");return Jt(t,e)}getFaceFrontQuaternion(e){if(this.faceFront.distanceToSquared(qn)<.01)return e.copy(this._restHeadWorldQuaternion).invert();let[t,n]=He(this.faceFront);return jt.set(0,.5*Math.PI+t,n,"YZX"),e.setFromEuler(jt).premultiply(_r.copy(this._restHeadWorldQuaternion).invert())}getLookAtWorldDirection(e){return this.getLookAtWorldQuaternion(Wt),this.getFaceFrontQuaternion(Qn),e.copy(qn).applyQuaternion(Wt).applyQuaternion(Qn).applyEuler(this.getEuler(jt))}lookAt(e){let t=gr.copy(this._restHeadWorldQuaternion).multiply(ni(this.getLookAtWorldQuaternion(Wt))),n=this.getLookAtWorldPosition(pr),i=mr.copy(e).sub(n).applyQuaternion(t).normalize(),[r,o]=He(this.faceFront),[a,s]=He(i),l=Xn(a-r),u=Xn(o-s);this._yaw=d.MathUtils.RAD2DEG*l,this._pitch=d.MathUtils.RAD2DEG*u,this._needsUpdate=!0}update(e){this.target!=null&&this.autoUpdate&&this.lookAt(this.target.getWorldPosition(fr)),this._needsUpdate&&(this._needsUpdate=!1,this.applier.applyYawPitch(this._yaw,this._pitch))}};ke.EULER_ORDER="YXZ";var vr=new d.Vector3(0,0,1),B=new d.Quaternion,J=new d.Quaternion,D=new d.Euler(0,0,0,"YXZ"),ie=class{constructor(e,t,n,i,r){this.humanoid=e,this.rangeMapHorizontalInner=t,this.rangeMapHorizontalOuter=n,this.rangeMapVerticalDown=i,this.rangeMapVerticalUp=r,this.faceFront=new d.Vector3(0,0,1),this._restQuatLeftEye=new d.Quaternion,this._restQuatRightEye=new d.Quaternion,this._restLeftEyeParentWorldQuat=new d.Quaternion,this._restRightEyeParentWorldQuat=new d.Quaternion;let o=this.humanoid.getRawBoneNode("leftEye"),a=this.humanoid.getRawBoneNode("rightEye");o&&(this._restQuatLeftEye.copy(o.quaternion),Jt(o.parent,this._restLeftEyeParentWorldQuat)),a&&(this._restQuatRightEye.copy(a.quaternion),Jt(a.parent,this._restRightEyeParentWorldQuat))}applyYawPitch(e,t){let n=this.humanoid.getRawBoneNode("leftEye"),i=this.humanoid.getRawBoneNode("rightEye"),r=this.humanoid.getNormalizedBoneNode("leftEye"),o=this.humanoid.getNormalizedBoneNode("rightEye");n&&(t<0?D.x=-d.MathUtils.DEG2RAD*this.rangeMapVerticalDown.map(-t):D.x=d.MathUtils.DEG2RAD*this.rangeMapVerticalUp.map(t),e<0?D.y=-d.MathUtils.DEG2RAD*this.rangeMapHorizontalInner.map(-e):D.y=d.MathUtils.DEG2RAD*this.rangeMapHorizontalOuter.map(e),B.setFromEuler(D),this._getWorldFaceFrontQuat(J),r.quaternion.copy(J).multiply(B).multiply(J.invert()),B.copy(this._restLeftEyeParentWorldQuat),n.quaternion.copy(r.quaternion).multiply(B).premultiply(B.invert()).multiply(this._restQuatLeftEye)),i&&(t<0?D.x=-d.MathUtils.DEG2RAD*this.rangeMapVerticalDown.map(-t):D.x=d.MathUtils.DEG2RAD*this.rangeMapVerticalUp.map(t),e<0?D.y=-d.MathUtils.DEG2RAD*this.rangeMapHorizontalOuter.map(-e):D.y=d.MathUtils.DEG2RAD*this.rangeMapHorizontalInner.map(e),B.setFromEuler(D),this._getWorldFaceFrontQuat(J),o.quaternion.copy(J).multiply(B).multiply(J.invert()),B.copy(this._restRightEyeParentWorldQuat),i.quaternion.copy(o.quaternion).multiply(B).premultiply(B.invert()).multiply(this._restQuatRightEye))}lookAt(e){console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");let t=d.MathUtils.RAD2DEG*e.y,n=d.MathUtils.RAD2DEG*e.x;this.applyYawPitch(t,n)}_getWorldFaceFrontQuat(e){if(this.faceFront.distanceToSquared(vr)<.01)return e.identity();let[t,n]=He(this.faceFront);return D.set(0,.5*Math.PI+t,n,"YZX"),e.setFromEuler(D)}};ie.type="bone";var Ee=class{constructor(e,t,n,i,r){this.expressions=e,this.rangeMapHorizontalInner=t,this.rangeMapHorizontalOuter=n,this.rangeMapVerticalDown=i,this.rangeMapVerticalUp=r}applyYawPitch(e,t){t<0?(this.expressions.setValue("lookDown",0),this.expressions.setValue("lookUp",this.rangeMapVerticalUp.map(-t))):(this.expressions.setValue("lookUp",0),this.expressions.setValue("lookDown",this.rangeMapVerticalDown.map(t))),e<0?(this.expressions.setValue("lookLeft",0),this.expressions.setValue("lookRight",this.rangeMapHorizontalOuter.map(-e))):(this.expressions.setValue("lookRight",0),this.expressions.setValue("lookLeft",this.rangeMapHorizontalOuter.map(e)))}lookAt(e){console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");let t=d.MathUtils.RAD2DEG*e.y,n=d.MathUtils.RAD2DEG*e.x;this.applyYawPitch(t,n)}};Ee.type="expression";var We=class{constructor(e,t){this.inputMaxValue=e,this.outputScale=t}map(e){return this.outputScale*ti(e/this.inputMaxValue)}},Er=new Set(["1.0","1.0-beta"]),Le=.01,en=class{get name(){return"VRMLookAtLoaderPlugin"}constructor(e,t){this.parser=e,this.helperRoot=t?.helperRoot}afterRoot(e){return S(this,void 0,void 0,function*(){let t=e.userData.vrmHumanoid;if(t===null)return;if(t===void 0)throw new Error("VRMLookAtLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");let n=e.userData.vrmExpressionManager;if(n!==null){if(n===void 0)throw new Error("VRMLookAtLoaderPlugin: vrmExpressionManager is undefined. VRMExpressionLoaderPlugin have to be used first");e.userData.vrmLookAt=yield this._import(e,t,n)}})}_import(e,t,n){return S(this,void 0,void 0,function*(){if(t==null||n==null)return null;let i=yield this._v1Import(e,t,n);if(i)return i;let r=yield this._v0Import(e,t,n);return r||null})}_v1Import(e,t,n){var i,r,o;return S(this,void 0,void 0,function*(){let a=this.parser.json;if(!(((i=a.extensionsUsed)===null||i===void 0?void 0:i.indexOf("VRMC_vrm"))!==-1))return null;let l=(r=a.extensions)===null||r===void 0?void 0:r.VRMC_vrm;if(!l)return null;let u=l.specVersion;if(!Er.has(u))return console.warn(`VRMLookAtLoaderPlugin: Unknown VRMC_vrm specVersion "${u}"`),null;let h=l.lookAt;if(!h)return null;let p=h.type==="expression"?1:10,m=this._v1ImportRangeMap(h.rangeMapHorizontalInner,p),v=this._v1ImportRangeMap(h.rangeMapHorizontalOuter,p),g=this._v1ImportRangeMap(h.rangeMapVerticalDown,p),E=this._v1ImportRangeMap(h.rangeMapVerticalUp,p),_;h.type==="expression"?_=new Ee(n,m,v,g,E):_=new ie(t,m,v,g,E);let x=this._importLookAt(t,_);return x.offsetFromHeadBone.fromArray((o=h.offsetFromHeadBone)!==null&&o!==void 0?o:[0,.06,0]),x})}_v1ImportRangeMap(e,t){var n,i;let r=(n=e?.inputMaxValue)!==null&&n!==void 0?n:90,o=(i=e?.outputScale)!==null&&i!==void 0?i:t;return r<Le&&(console.warn("VRMLookAtLoaderPlugin: inputMaxValue of a range map is too small. Consider reviewing the range map!"),r=Le),new We(r,o)}_v0Import(e,t,n){var i,r,o,a;return S(this,void 0,void 0,function*(){let l=(i=this.parser.json.extensions)===null||i===void 0?void 0:i.VRM;if(!l)return null;let u=l.firstPerson;if(!u)return null;let h=u.lookAtTypeName==="BlendShape"?1:10,p=this._v0ImportDegreeMap(u.lookAtHorizontalInner,h),m=this._v0ImportDegreeMap(u.lookAtHorizontalOuter,h),v=this._v0ImportDegreeMap(u.lookAtVerticalDown,h),g=this._v0ImportDegreeMap(u.lookAtVerticalUp,h),E;u.lookAtTypeName==="BlendShape"?E=new Ee(n,p,m,v,g):E=new ie(t,p,m,v,g);let _=this._importLookAt(t,E);return u.firstPersonBoneOffset?_.offsetFromHeadBone.set((r=u.firstPersonBoneOffset.x)!==null&&r!==void 0?r:0,(o=u.firstPersonBoneOffset.y)!==null&&o!==void 0?o:.06,-((a=u.firstPersonBoneOffset.z)!==null&&a!==void 0?a:0)):_.offsetFromHeadBone.set(0,.06,0),_.faceFront.set(0,0,-1),E instanceof ie&&E.faceFront.set(0,0,-1),_})}_v0ImportDegreeMap(e,t){var n,i;let r=e?.curve;JSON.stringify(r)!=="[0,0,0,1,1,1,1,0]"&&console.warn("Curves of LookAtDegreeMap defined in VRM 0.0 are not supported");let o=(n=e?.xRange)!==null&&n!==void 0?n:90,a=(i=e?.yRange)!==null&&i!==void 0?i:t;return o<Le&&(console.warn("VRMLookAtLoaderPlugin: xRange of a degree map is too small. Consider reviewing the degree map!"),o=Le),new We(o,a)}_importLookAt(e,t){let n=new ke(e,t);if(this.helperRoot){let i=new Zt(n);this.helperRoot.add(i),i.renderOrder=this.helperRoot.renderOrder}return n}};function Tr(c,e){return typeof c!="string"||c===""?"":(/^https?:\/\//i.test(e)&&/^\//.test(c)&&(e=e.replace(/(^https?:\/\/[^/]+).*/i,"$1")),/^(https?:)?\/\//i.test(c)||/^data:.*,.*$/i.test(c)||/^blob:.*$/i.test(c)?c:e+c)}var Rr=new Set(["1.0","1.0-beta"]),tn=class{get name(){return"VRMMetaLoaderPlugin"}constructor(e,t){var n,i,r;this.parser=e,this.needThumbnailImage=(n=t?.needThumbnailImage)!==null&&n!==void 0?n:!0,this.acceptLicenseUrls=(i=t?.acceptLicenseUrls)!==null&&i!==void 0?i:["https://vrm.dev/licenses/1.0/"],this.acceptV0Meta=(r=t?.acceptV0Meta)!==null&&r!==void 0?r:!0}afterRoot(e){return S(this,void 0,void 0,function*(){e.userData.vrmMeta=yield this._import(e)})}_import(e){return S(this,void 0,void 0,function*(){let t=yield this._v1Import(e);if(t!=null)return t;let n=yield this._v0Import(e);return n??null})}_v1Import(e){var t,n,i;return S(this,void 0,void 0,function*(){let r=this.parser.json;if(!(((t=r.extensionsUsed)===null||t===void 0?void 0:t.indexOf("VRMC_vrm"))!==-1))return null;let a=(n=r.extensions)===null||n===void 0?void 0:n.VRMC_vrm;if(a==null)return null;let s=a.specVersion;if(!Rr.has(s))return console.warn(`VRMMetaLoaderPlugin: Unknown VRMC_vrm specVersion "${s}"`),null;let l=a.meta;if(!l)return null;let u=l.licenseUrl;if(!new Set(this.acceptLicenseUrls).has(u))throw new Error(`VRMMetaLoaderPlugin: The license url "${u}" is not accepted`);let p;return this.needThumbnailImage&&l.thumbnailImage!=null&&(p=(i=yield this._extractGLTFImage(l.thumbnailImage))!==null&&i!==void 0?i:void 0),{metaVersion:"1",name:l.name,version:l.version,authors:l.authors,copyrightInformation:l.copyrightInformation,contactInformation:l.contactInformation,references:l.references,thirdPartyLicenses:l.thirdPartyLicenses,thumbnailImage:p,licenseUrl:l.licenseUrl,avatarPermission:l.avatarPermission,allowExcessivelyViolentUsage:l.allowExcessivelyViolentUsage,allowExcessivelySexualUsage:l.allowExcessivelySexualUsage,commercialUsage:l.commercialUsage,allowPoliticalOrReligiousUsage:l.allowPoliticalOrReligiousUsage,allowAntisocialOrHateUsage:l.allowAntisocialOrHateUsage,creditNotation:l.creditNotation,allowRedistribution:l.allowRedistribution,modification:l.modification,otherLicenseUrl:l.otherLicenseUrl}})}_v0Import(e){var t;return S(this,void 0,void 0,function*(){let i=(t=this.parser.json.extensions)===null||t===void 0?void 0:t.VRM;if(!i)return null;let r=i.meta;if(!r)return null;if(!this.acceptV0Meta)throw new Error("VRMMetaLoaderPlugin: Attempted to load VRM0.0 meta but acceptV0Meta is false");let o;return this.needThumbnailImage&&r.texture!=null&&r.texture!==-1&&(o=yield this.parser.getDependency("texture",r.texture)),{metaVersion:"0",allowedUserName:r.allowedUserName,author:r.author,commercialUssageName:r.commercialUssageName,contactInformation:r.contactInformation,licenseName:r.licenseName,otherLicenseUrl:r.otherLicenseUrl,otherPermissionUrl:r.otherPermissionUrl,reference:r.reference,sexualUssageName:r.sexualUssageName,texture:o??void 0,title:r.title,version:r.version,violentUssageName:r.violentUssageName}})}_extractGLTFImage(e){var t;return S(this,void 0,void 0,function*(){let i=(t=this.parser.json.images)===null||t===void 0?void 0:t[e];if(i==null)return console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${e}] of glTF as a thumbnail but the image doesn't exist`),null;let r=i.uri;if(i.bufferView!=null){let a=yield this.parser.getDependency("bufferView",i.bufferView),s=new Blob([a],{type:i.mimeType});r=URL.createObjectURL(s)}return r==null?(console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${e}] of glTF as a thumbnail but the image couldn't load properly`),null):yield new d.ImageLoader().loadAsync(Tr(r,this.parser.options.path)).catch(a=>(console.error(a),console.warn("VRMMetaLoaderPlugin: Failed to load a thumbnail image"),null))})}},nn=class{constructor(e){this.scene=e.scene,this.meta=e.meta,this.humanoid=e.humanoid,this.expressionManager=e.expressionManager,this.firstPerson=e.firstPerson,this.lookAt=e.lookAt}update(e){this.humanoid.update(),this.lookAt&&this.lookAt.update(e),this.expressionManager&&this.expressionManager.update()}};var rn=class extends nn{constructor(e){super(e),this.materials=e.materials,this.springBoneManager=e.springBoneManager,this.nodeConstraintManager=e.nodeConstraintManager}update(e){super.update(e),this.nodeConstraintManager&&this.nodeConstraintManager.update(),this.springBoneManager&&this.springBoneManager.update(e),this.materials&&this.materials.forEach(t=>{t.update&&t.update(e)})}};function be(c,e,t,n){function i(r){return r instanceof t?r:new t(function(o){o(r)})}return new(t||(t=Promise))(function(r,o){function a(u){try{l(n.next(u))}catch(h){o(h)}}function s(u){try{l(n.throw(u))}catch(h){o(h)}}function l(u){u.done?r(u.value):i(u.value).then(a,s)}l((n=n.apply(c,e||[])).next())})}function $(c,e,t,n){function i(r){return r instanceof t?r:new t(function(o){o(r)})}return new(t||(t=Promise))(function(r,o){function a(u){try{l(n.next(u))}catch(h){o(h)}}function s(u){try{l(n.throw(u))}catch(h){o(h)}}function l(u){u.done?r(u.value):i(u.value).then(a,s)}l((n=n.apply(c,e||[])).next())})}var xr=`// #define PHONG

varying vec3 vViewPosition;

#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif

#include <common>

// #include <uv_pars_vertex>
#ifdef MTOON_USE_UV
  varying vec2 vUv;

  // COMPAT: pre-r151 uses a common uvTransform
  #if THREE_VRM_THREE_REVISION < 151
    uniform mat3 uvTransform;
  #endif
#endif

// #include <uv2_pars_vertex>
// COMAPT: pre-r151 uses uv2 for lightMap and aoMap
#if THREE_VRM_THREE_REVISION < 151
  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    attribute vec2 uv2;
    varying vec2 vUv2;
    uniform mat3 uv2Transform;
  #endif
#endif

// #include <displacementmap_pars_vertex>
// #include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE
  uniform sampler2D outlineWidthMultiplyTexture;
  uniform mat3 outlineWidthMultiplyTextureUvTransform;
#endif

uniform float outlineWidthFactor;

void main() {

  // #include <uv_vertex>
  #ifdef MTOON_USE_UV
    // COMPAT: pre-r151 uses a common uvTransform
    #if THREE_VRM_THREE_REVISION >= 151
      vUv = uv;
    #else
      vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
    #endif
  #endif

  // #include <uv2_vertex>
  // COMAPT: pre-r151 uses uv2 for lightMap and aoMap
  #if THREE_VRM_THREE_REVISION < 151
    #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
      vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
    #endif
  #endif

  #include <color_vertex>

  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>

  // we need this to compute the outline properly
  objectNormal = normalize( objectNormal );

  #include <defaultnormal_vertex>

  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
    vNormal = normalize( transformedNormal );
  #endif

  #include <begin_vertex>

  #include <morphtarget_vertex>
  #include <skinning_vertex>
  // #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>

  vViewPosition = - mvPosition.xyz;

  float outlineTex = 1.0;

  #ifdef OUTLINE
    #ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE
      vec2 outlineWidthMultiplyTextureUv = ( outlineWidthMultiplyTextureUvTransform * vec3( vUv, 1 ) ).xy;
      outlineTex = texture2D( outlineWidthMultiplyTexture, outlineWidthMultiplyTextureUv ).g;
    #endif

    #ifdef OUTLINE_WIDTH_WORLD
      float worldNormalLength = length( transformedNormal );
      vec3 outlineOffset = outlineWidthFactor * outlineTex * worldNormalLength * objectNormal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( outlineOffset + transformed, 1.0 );
    #endif

    #ifdef OUTLINE_WIDTH_SCREEN
      vec3 clipNormal = ( projectionMatrix * modelViewMatrix * vec4( objectNormal, 0.0 ) ).xyz;
      vec2 projectedNormal = normalize( clipNormal.xy );
      projectedNormal.x *= projectionMatrix[ 0 ].x / projectionMatrix[ 1 ].y;
      gl_Position.xy += 2.0 * outlineWidthFactor * outlineTex * projectedNormal.xy;
    #endif

    gl_Position.z += 1E-6 * gl_Position.w; // anti-artifact magic
  #endif

  #include <worldpos_vertex>
  // #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>

}`,Mr=`// #define PHONG

uniform vec3 litFactor;

uniform float opacity;

uniform vec3 shadeColorFactor;
#ifdef USE_SHADEMULTIPLYTEXTURE
  uniform sampler2D shadeMultiplyTexture;
  uniform mat3 shadeMultiplyTextureUvTransform;
#endif

uniform float shadingShiftFactor;
uniform float shadingToonyFactor;

#ifdef USE_SHADINGSHIFTTEXTURE
  uniform sampler2D shadingShiftTexture;
  uniform mat3 shadingShiftTextureUvTransform;
  uniform float shadingShiftTextureScale;
#endif

uniform float giEqualizationFactor;

uniform vec3 parametricRimColorFactor;
#ifdef USE_RIMMULTIPLYTEXTURE
  uniform sampler2D rimMultiplyTexture;
  uniform mat3 rimMultiplyTextureUvTransform;
#endif
uniform float rimLightingMixFactor;
uniform float parametricRimFresnelPowerFactor;
uniform float parametricRimLiftFactor;

#ifdef USE_MATCAPTEXTURE
  uniform vec3 matcapFactor;
  uniform sampler2D matcapTexture;
  uniform mat3 matcapTextureUvTransform;
#endif

uniform vec3 emissive;
uniform float emissiveIntensity;

uniform vec3 outlineColorFactor;
uniform float outlineLightingMixFactor;

#ifdef USE_UVANIMATIONMASKTEXTURE
  uniform sampler2D uvAnimationMaskTexture;
  uniform mat3 uvAnimationMaskTextureUvTransform;
#endif

uniform float uvAnimationScrollXOffset;
uniform float uvAnimationScrollYOffset;
uniform float uvAnimationRotationPhase;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>

// #include <uv_pars_fragment>
#if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
  varying vec2 vUv;
#endif

// #include <uv2_pars_fragment>
// COMAPT: pre-r151 uses uv2 for lightMap and aoMap
#if THREE_VRM_THREE_REVISION < 151
  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    varying vec2 vUv2;
  #endif
#endif

#include <map_pars_fragment>

#ifdef USE_MAP
  uniform mat3 mapUvTransform;
#endif

// #include <alphamap_pars_fragment>

#if THREE_VRM_THREE_REVISION >= 132
  #include <alphatest_pars_fragment>
#endif

#include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>

#ifdef USE_EMISSIVEMAP
  uniform mat3 emissiveMapUvTransform;
#endif

// #include <envmap_common_pars_fragment>
// #include <envmap_pars_fragment>
// #include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>

// #include <bsdfs>
// COMPAT: pre-r151 doesn't have BRDF_Lambert in <common>
#if THREE_VRM_THREE_REVISION < 151
  vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
    return RECIPROCAL_PI * diffuseColor;
  }
#endif

#include <lights_pars_begin>

#if THREE_VRM_THREE_REVISION >= 132
  #include <normal_pars_fragment>
#endif

// #include <lights_phong_pars_fragment>
varying vec3 vViewPosition;

#if THREE_VRM_THREE_REVISION < 132
  #ifndef FLAT_SHADED
    varying vec3 vNormal;
  #endif
#endif

struct MToonMaterial {
  vec3 diffuseColor;
  vec3 shadeColor;
  float shadingShift;
};

float linearstep( float a, float b, float t ) {
  return clamp( ( t - a ) / ( b - a ), 0.0, 1.0 );
}

/**
 * Convert NdotL into toon shading factor using shadingShift and shadingToony
 */
float getShading(
  const in float dotNL,
  const in float shadow,
  const in float shadingShift
) {
  float shading = dotNL;
  shading = shading + shadingShift;
  shading = linearstep( -1.0 + shadingToonyFactor, 1.0 - shadingToonyFactor, shading );
  shading *= shadow;
  return shading;
}

/**
 * Mix diffuseColor and shadeColor using shading factor and light color
 */
vec3 getDiffuse(
  const in MToonMaterial material,
  const in float shading,
  in vec3 lightColor
) {
  #ifdef DEBUG_LITSHADERATE
    return vec3( BRDF_Lambert( shading * lightColor ) );
  #endif

  #if THREE_VRM_THREE_REVISION < 132
    #ifndef PHYSICALLY_CORRECT_LIGHTS
      lightColor *= PI;
    #endif
  #endif

  vec3 col = lightColor * BRDF_Lambert( mix( material.shadeColor, material.diffuseColor, shading ) );

  // The "comment out if you want to PBR absolutely" line
  #ifdef V0_COMPAT_SHADE
    col = min( col, material.diffuseColor );
  #endif

  return col;
}

void RE_Direct_MToon( const in IncidentLight directLight, const in GeometricContext geometry, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {
  float dotNL = clamp( dot( geometry.normal, directLight.direction ), -1.0, 1.0 );
  vec3 irradiance = directLight.color;

  #if THREE_VRM_THREE_REVISION < 132
    #ifndef PHYSICALLY_CORRECT_LIGHTS
      irradiance *= PI;
    #endif
  #endif

  // directSpecular will be used for rim lighting, not an actual specular
  reflectedLight.directSpecular += irradiance;

  irradiance *= dotNL;

  float shading = getShading( dotNL, shadow, material.shadingShift );

  // toon shaded diffuse
  reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );
}

void RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in GeometricContext geometry, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {
  // indirect diffuse will use diffuseColor, no shadeColor involved
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

  // directSpecular will be used for rim lighting, not an actual specular
  reflectedLight.directSpecular += irradiance;
}

#define RE_Direct RE_Direct_MToon
#define RE_IndirectDiffuse RE_IndirectDiffuse_MToon
#define Material_LightProbeLOD( material ) (0)

#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>

// #include <normalmap_pars_fragment>
#ifdef USE_NORMALMAP

  uniform sampler2D normalMap;
  uniform mat3 normalMapUvTransform;
  uniform vec2 normalScale;

#endif

// COMPAT: USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151
#if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )

  uniform mat3 normalMatrix;

#endif

// COMPAT: USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( TANGENTSPACE_NORMALMAP ) )

  // Per-Pixel Tangent Space Normal Mapping
  // http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html

  // three-vrm specific change: it requires \`uv\` as an input in order to support uv scrolls

  // Temporary compat against shader change @ Three.js r126, r151
  #if THREE_VRM_THREE_REVISION >= 151

    mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {

      vec3 q0 = dFdx( eye_pos.xyz );
      vec3 q1 = dFdy( eye_pos.xyz );
      vec2 st0 = dFdx( uv.st );
      vec2 st1 = dFdy( uv.st );

      vec3 N = surf_norm;

      vec3 q1perp = cross( q1, N );
      vec3 q0perp = cross( N, q0 );

      vec3 T = q1perp * st0.x + q0perp * st1.x;
      vec3 B = q1perp * st0.y + q0perp * st1.y;

      float det = max( dot( T, T ), dot( B, B ) );
      float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );

      return mat3( T * scale, B * scale, N );

    }

  #elif THREE_VRM_THREE_REVISION >= 126

    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {

      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
      vec2 st0 = dFdx( uv.st );
      vec2 st1 = dFdy( uv.st );

      vec3 N = normalize( surf_norm );

      vec3 q1perp = cross( q1, N );
      vec3 q0perp = cross( N, q0 );

      vec3 T = q1perp * st0.x + q0perp * st1.x;
      vec3 B = q1perp * st0.y + q0perp * st1.y;

      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0
      // TODO: Is this still required? Or shall I make a PR about it?
      if ( length( T ) == 0.0 || length( B ) == 0.0 ) {
        return surf_norm;
      }

      float det = max( dot( T, T ), dot( B, B ) );
      float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );

      return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );

    }

  #else

    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN ) {

      // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
      vec2 st0 = dFdx( uv.st );
      vec2 st1 = dFdy( uv.st );

      float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude

      vec3 S = ( q0 * st1.t - q1 * st0.t ) * scale;
      vec3 T = ( - q0 * st1.s + q1 * st0.s ) * scale;

      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0
      // TODO: Is this still required? Or shall I make a PR about it?

      if ( length( S ) == 0.0 || length( T ) == 0.0 ) {
        return surf_norm;
      }

      S = normalize( S );
      T = normalize( T );
      vec3 N = normalize( surf_norm );

      #ifdef DOUBLE_SIDED

        // Workaround for Adreno GPUs gl_FrontFacing bug. See #15850 and #10331

        bool frontFacing = dot( cross( S, T ), N ) > 0.0;

        mapN.xy *= ( float( frontFacing ) * 2.0 - 1.0 );

      #else

        mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );

      #endif

      mat3 tsn = mat3( S, T, N );
      return normalize( tsn * mapN );

    }

  #endif

#endif

// #include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

// == post correction ==========================================================
void postCorrection() {
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}

// == main procedure ===========================================================
void main() {
  #include <clipping_planes_fragment>

  vec2 uv = vec2(0.5, 0.5);

  #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
    uv = vUv;

    float uvAnimMask = 1.0;
    #ifdef USE_UVANIMATIONMASKTEXTURE
      vec2 uvAnimationMaskTextureUv = ( uvAnimationMaskTextureUvTransform * vec3( uv, 1 ) ).xy;
      uvAnimMask = texture2D( uvAnimationMaskTexture, uvAnimationMaskTextureUv ).b;
    #endif

    uv = uv + vec2( uvAnimationScrollXOffset, uvAnimationScrollYOffset ) * uvAnimMask;
    float uvRotCos = cos( uvAnimationRotationPhase * uvAnimMask );
    float uvRotSin = sin( uvAnimationRotationPhase * uvAnimMask );
    uv = mat2( uvRotCos, -uvRotSin, uvRotSin, uvRotCos ) * ( uv - 0.5 ) + 0.5;
  #endif

  #ifdef DEBUG_UV
    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
      gl_FragColor = vec4( uv, 0.0, 1.0 );
    #endif
    return;
  #endif

  vec4 diffuseColor = vec4( litFactor, opacity );
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive * emissiveIntensity;

  #include <logdepthbuf_fragment>

  // #include <map_fragment>
  #ifdef USE_MAP
    vec2 mapUv = ( mapUvTransform * vec3( uv, 1 ) ).xy;
    #if THREE_VRM_THREE_REVISION >= 137
      vec4 sampledDiffuseColor = texture2D( map, mapUv );
      #ifdef DECODE_VIDEO_TEXTURE
        sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
      #endif
      diffuseColor *= sampledDiffuseColor;
    #else
      // COMPAT: pre-r137
      vec4 texelColor = texture2D( map, mapUv );
      texelColor = mapTexelToLinear( texelColor );
      diffuseColor *= texelColor;
    #endif
  #endif

  // #include <color_fragment>
  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )
    diffuseColor.rgb *= vColor;
  #endif

  // #include <alphamap_fragment>

  #include <alphatest_fragment>

  // #include <specularmap_fragment>

  // #include <normal_fragment_begin>
  float faceDirection = gl_FrontFacing ? 1.0 : -1.0;

  #ifdef FLAT_SHADED

    vec3 fdx = dFdx( vViewPosition );
    vec3 fdy = dFdy( vViewPosition );
    vec3 normal = normalize( cross( fdx, fdy ) );

  #else

    vec3 normal = normalize( vNormal );

    #ifdef DOUBLE_SIDED

      normal *= faceDirection;

    #endif

  #endif

  #ifdef USE_NORMALMAP

    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;

  #endif

  #ifdef USE_NORMALMAP_TANGENTSPACE

    #ifdef USE_TANGENT

      mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

    #else

      mat3 tbn = getTangentFrame( - vViewPosition, normal, normalMapUv );

    #endif

    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

      tbn[0] *= faceDirection;
      tbn[1] *= faceDirection;

    #endif

  #endif

  #ifdef USE_CLEARCOAT_NORMALMAP

    #ifdef USE_TANGENT

      mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

    #else

      mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );

    #endif

    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

      tbn2[0] *= faceDirection;
      tbn2[1] *= faceDirection;

    #endif

  #endif

  // non perturbed normal for clearcoat among others

  vec3 geometryNormal = normal;

  #ifdef OUTLINE
    normal *= -1.0;
  #endif

  // #include <normal_fragment_maps>

  // COMPAT: USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151
  #if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )

    normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

    #ifdef FLIP_SIDED

      normal = - normal;

    #endif

    #ifdef DOUBLE_SIDED

      // Temporary compat against shader change @ Three.js r126
      // See: #21205, #21307, #21299
      #if THREE_VRM_THREE_REVISION >= 126

        normal = normal * faceDirection;

      #else

        normal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

      #endif

    #endif

    normal = normalize( normalMatrix * normal );

  // COMPAT: USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151
  #elif defined( USE_NORMALMAP_TANGENTSPACE ) || defined( TANGENTSPACE_NORMALMAP )

    vec3 mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0;
    mapN.xy *= normalScale;

    // COMPAT: pre-r151
    #if THREE_VRM_THREE_REVISION >= 151 || defined( USE_TANGENT )

      normal = normalize( tbn * mapN );

    #else

      // pre-r126
      #if THREE_VRM_THREE_REVISION >= 126

        normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN, faceDirection );

      #else

        normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN );

      #endif

    #endif

  #endif

  // #include <emissivemap_fragment>
  #ifdef USE_EMISSIVEMAP
    vec2 emissiveMapUv = ( emissiveMapUvTransform * vec3( uv, 1 ) ).xy;
    #if THREE_VRM_THREE_REVISION >= 137
      totalEmissiveRadiance *= texture2D( emissiveMap, emissiveMapUv ).rgb;
    #else
      // COMPAT: pre-r137
      totalEmissiveRadiance *= emissiveMapTexelToLinear( texture2D( emissiveMap, emissiveMapUv ) ).rgb;
    #endif
  #endif

  #ifdef DEBUG_NORMAL
    gl_FragColor = vec4( 0.5 + 0.5 * normal, 1.0 );
    return;
  #endif

  // -- MToon: lighting --------------------------------------------------------
  // accumulation
  // #include <lights_phong_fragment>
  MToonMaterial material;

  material.diffuseColor = diffuseColor.rgb;

  material.shadeColor = shadeColorFactor;
  #ifdef USE_SHADEMULTIPLYTEXTURE
    vec2 shadeMultiplyTextureUv = ( shadeMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;
    #if THREE_VRM_THREE_REVISION >= 137
      material.shadeColor *= texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv ).rgb;
    #else
      // COMPAT: pre-r137
      material.shadeColor *= shadeMultiplyTextureTexelToLinear( texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv) ).rgb;
    #endif
  #endif

  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )
    material.shadeColor.rgb *= vColor;
  #endif

  material.shadingShift = shadingShiftFactor;
  #ifdef USE_SHADINGSHIFTTEXTURE
    vec2 shadingShiftTextureUv = ( shadingShiftTextureUvTransform * vec3( uv, 1 ) ).xy;
    material.shadingShift += texture2D( shadingShiftTexture, shadingShiftTextureUv ).r * shadingShiftTextureScale;
  #endif

  // #include <lights_fragment_begin>

  // MToon Specific changes:
  // Since we want to take shadows into account of shading instead of irradiance,
  // we had to modify the codes that multiplies the results of shadowmap into color of direct lights.

  GeometricContext geometry;

  geometry.position = - vViewPosition;
  geometry.normal = normal;
  geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

  #ifdef CLEARCOAT

    geometry.clearcoatNormal = clearcoatNormal;

  #endif

  IncidentLight directLight;

  // since these variables will be used in unrolled loop, we have to define in prior
  float shadow;

  #if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

    PointLight pointLight;
    #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
    PointLightShadow pointLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

      pointLight = pointLights[ i ];

      #if THREE_VRM_THREE_REVISION >= 132
        getPointLightInfo( pointLight, geometry, directLight );
      #else
        getPointDirectLightIrradiance( pointLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
      pointLightShadow = pointLightShadows[ i ];
      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
      #endif

      RE_Direct( directLight, geometry, material, shadow, reflectedLight );

    }
    #pragma unroll_loop_end

  #endif

  #if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

    SpotLight spotLight;
    #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
    SpotLightShadow spotLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

      spotLight = spotLights[ i ];

      #if THREE_VRM_THREE_REVISION >= 132
        getSpotLightInfo( spotLight, geometry, directLight );
      #else
        getSpotDirectLightIrradiance( spotLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
      spotLightShadow = spotLightShadows[ i ];
      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
      #endif

      RE_Direct( directLight, geometry, material, shadow, reflectedLight );

    }
    #pragma unroll_loop_end

  #endif

  #if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

    DirectionalLight directionalLight;
    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
    DirectionalLightShadow directionalLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

      directionalLight = directionalLights[ i ];

      #if THREE_VRM_THREE_REVISION >= 132
        getDirectionalLightInfo( directionalLight, geometry, directLight );
      #else
        getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
      directionalLightShadow = directionalLightShadows[ i ];
      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
      #endif

      RE_Direct( directLight, geometry, material, shadow, reflectedLight );

    }
    #pragma unroll_loop_end

  #endif

  // #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

  //   RectAreaLight rectAreaLight;

  //   #pragma unroll_loop_start
  //   for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

  //     rectAreaLight = rectAreaLights[ i ];
  //     RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );

  //   }
  //   #pragma unroll_loop_end

  // #endif

  #if defined( RE_IndirectDiffuse )

    vec3 iblIrradiance = vec3( 0.0 );

    vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

    #if THREE_VRM_THREE_REVISION >= 133
      irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
    #else
      irradiance += getLightProbeIrradiance( lightProbe, geometry );
    #endif

    #if ( NUM_HEMI_LIGHTS > 0 )

      #pragma unroll_loop_start
      for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

        #if THREE_VRM_THREE_REVISION >= 133
          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
        #else
          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );
        #endif

      }
      #pragma unroll_loop_end

    #endif

  #endif

  // #if defined( RE_IndirectSpecular )

  //   vec3 radiance = vec3( 0.0 );
  //   vec3 clearcoatRadiance = vec3( 0.0 );

  // #endif

  #include <lights_fragment_maps>
  #include <lights_fragment_end>

  // modulation
  #include <aomap_fragment>

  vec3 col = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

  #ifdef DEBUG_LITSHADERATE
    gl_FragColor = vec4( col, diffuseColor.a );
    postCorrection();
    return;
  #endif

  // -- MToon: rim lighting -----------------------------------------
  vec3 viewDir = normalize( vViewPosition );

  #ifndef PHYSICALLY_CORRECT_LIGHTS
    reflectedLight.directSpecular /= PI;
  #endif
  vec3 rimMix = mix( vec3( 1.0 ), reflectedLight.directSpecular, 1.0 );

  vec3 rim = parametricRimColorFactor * pow( saturate( 1.0 - dot( viewDir, normal ) + parametricRimLiftFactor ), parametricRimFresnelPowerFactor );

  #ifdef USE_MATCAPTEXTURE
    {
      vec3 x = normalize( vec3( viewDir.z, 0.0, -viewDir.x ) );
      vec3 y = cross( viewDir, x ); // guaranteed to be normalized
      vec2 sphereUv = 0.5 + 0.5 * vec2( dot( x, normal ), -dot( y, normal ) );
      sphereUv = ( matcapTextureUvTransform * vec3( sphereUv, 1 ) ).xy;
      #if THREE_VRM_THREE_REVISION >= 137
        vec3 matcap = texture2D( matcapTexture, sphereUv ).rgb;
      #else
        // COMPAT: pre-r137
        vec3 matcap = matcapTextureTexelToLinear( texture2D( matcapTexture, sphereUv ) ).rgb;
      #endif
      rim += matcapFactor * matcap;
    }
  #endif

  #ifdef USE_RIMMULTIPLYTEXTURE
    vec2 rimMultiplyTextureUv = ( rimMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;
    #if THREE_VRM_THREE_REVISION >= 137
      rim *= texture2D( rimMultiplyTexture, rimMultiplyTextureUv ).rgb;
    #else
      // COMPAT: pre-r137
      rim *= rimMultiplyTextureTexelToLinear( texture2D( rimMultiplyTexture, rimMultiplyTextureUv ) ).rgb;
    #endif
  #endif

  col += rimMix * rim;

  // -- MToon: Emission --------------------------------------------------------
  col += totalEmissiveRadiance;

  // #include <envmap_fragment>

  // -- Almost done! -----------------------------------------------------------
  #if defined( OUTLINE )
    col = outlineColorFactor.rgb * mix( vec3( 1.0 ), col, outlineLightingMixFactor );
  #endif

  gl_FragColor = vec4( col, diffuseColor.a );
  postCorrection();
}
`,Ar={None:"none",Normal:"normal",LitShadeRate:"litShadeRate",UV:"uv"},zt={None:"none",WorldCoordinates:"worldCoordinates",ScreenCoordinates:"screenCoordinates"},yr=3002,wr=3004,Sr=3005,Lr=3006,br=3007,Ir=c=>{if(parseInt(d.REVISION,10)>=136)switch(c){case d.LinearEncoding:return["Linear","( value )"];case d.sRGBEncoding:return["sRGB","( value )"];default:return console.warn("THREE.WebGLProgram: Unsupported encoding:",c),["Linear","( value )"]}else switch(c){case d.LinearEncoding:return["Linear","( value )"];case d.sRGBEncoding:return["sRGB","( value )"];case yr:return["RGBE","( value )"];case wr:return["RGBM","( value, 7.0 )"];case Sr:return["RGBM","( value, 16.0 )"];case Lr:return["RGBD","( value, 256.0 )"];case br:return["Gamma","( value, float( GAMMA_FACTOR ) )"];default:throw new Error("unsupported encoding: "+c)}},Gt=(c,e)=>{let t=Ir(e);return"vec4 "+c+"( vec4 value ) { return "+t[0]+"ToLinear"+t[1]+"; }"};function Xt(c,e){let t;return c&&c.isTexture?t=c.encoding:t=d.LinearEncoding,parseInt(d.REVISION,10)>=133&&e&&c&&c.isTexture&&c.format===d.RGBAFormat&&c.type===d.UnsignedByteType&&c.encoding===d.sRGBEncoding&&(t=d.LinearEncoding),t}var pe=class extends d.ShaderMaterial{get color(){return this.uniforms.litFactor.value}set color(e){this.uniforms.litFactor.value=e}get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}get normalMap(){return this.uniforms.normalMap.value}set normalMap(e){this.uniforms.normalMap.value=e}get normalScale(){return this.uniforms.normalScale.value}set normalScale(e){this.uniforms.normalScale.value=e}get emissive(){return this.uniforms.emissive.value}set emissive(e){this.uniforms.emissive.value=e}get emissiveIntensity(){return this.uniforms.emissiveIntensity.value}set emissiveIntensity(e){this.uniforms.emissiveIntensity.value=e}get emissiveMap(){return this.uniforms.emissiveMap.value}set emissiveMap(e){this.uniforms.emissiveMap.value=e}get shadeColorFactor(){return this.uniforms.shadeColorFactor.value}set shadeColorFactor(e){this.uniforms.shadeColorFactor.value=e}get shadeMultiplyTexture(){return this.uniforms.shadeMultiplyTexture.value}set shadeMultiplyTexture(e){this.uniforms.shadeMultiplyTexture.value=e}get shadingShiftFactor(){return this.uniforms.shadingShiftFactor.value}set shadingShiftFactor(e){this.uniforms.shadingShiftFactor.value=e}get shadingShiftTexture(){return this.uniforms.shadingShiftTexture.value}set shadingShiftTexture(e){this.uniforms.shadingShiftTexture.value=e}get shadingShiftTextureScale(){return this.uniforms.shadingShiftTextureScale.value}set shadingShiftTextureScale(e){this.uniforms.shadingShiftTextureScale.value=e}get shadingToonyFactor(){return this.uniforms.shadingToonyFactor.value}set shadingToonyFactor(e){this.uniforms.shadingToonyFactor.value=e}get giEqualizationFactor(){return this.uniforms.giEqualizationFactor.value}set giEqualizationFactor(e){this.uniforms.giEqualizationFactor.value=e}get matcapFactor(){return this.uniforms.matcapFactor.value}set matcapFactor(e){this.uniforms.matcapFactor.value=e}get matcapTexture(){return this.uniforms.matcapTexture.value}set matcapTexture(e){this.uniforms.matcapTexture.value=e}get parametricRimColorFactor(){return this.uniforms.parametricRimColorFactor.value}set parametricRimColorFactor(e){this.uniforms.parametricRimColorFactor.value=e}get rimMultiplyTexture(){return this.uniforms.rimMultiplyTexture.value}set rimMultiplyTexture(e){this.uniforms.rimMultiplyTexture.value=e}get rimLightingMixFactor(){return this.uniforms.rimLightingMixFactor.value}set rimLightingMixFactor(e){this.uniforms.rimLightingMixFactor.value=e}get parametricRimFresnelPowerFactor(){return this.uniforms.parametricRimFresnelPowerFactor.value}set parametricRimFresnelPowerFactor(e){this.uniforms.parametricRimFresnelPowerFactor.value=e}get parametricRimLiftFactor(){return this.uniforms.parametricRimLiftFactor.value}set parametricRimLiftFactor(e){this.uniforms.parametricRimLiftFactor.value=e}get outlineWidthMultiplyTexture(){return this.uniforms.outlineWidthMultiplyTexture.value}set outlineWidthMultiplyTexture(e){this.uniforms.outlineWidthMultiplyTexture.value=e}get outlineWidthFactor(){return this.uniforms.outlineWidthFactor.value}set outlineWidthFactor(e){this.uniforms.outlineWidthFactor.value=e}get outlineColorFactor(){return this.uniforms.outlineColorFactor.value}set outlineColorFactor(e){this.uniforms.outlineColorFactor.value=e}get outlineLightingMixFactor(){return this.uniforms.outlineLightingMixFactor.value}set outlineLightingMixFactor(e){this.uniforms.outlineLightingMixFactor.value=e}get uvAnimationMaskTexture(){return this.uniforms.uvAnimationMaskTexture.value}set uvAnimationMaskTexture(e){this.uniforms.uvAnimationMaskTexture.value=e}get uvAnimationScrollXOffset(){return this.uniforms.uvAnimationScrollXOffset.value}set uvAnimationScrollXOffset(e){this.uniforms.uvAnimationScrollXOffset.value=e}get uvAnimationScrollYOffset(){return this.uniforms.uvAnimationScrollYOffset.value}set uvAnimationScrollYOffset(e){this.uniforms.uvAnimationScrollYOffset.value=e}get uvAnimationRotationPhase(){return this.uniforms.uvAnimationRotationPhase.value}set uvAnimationRotationPhase(e){this.uniforms.uvAnimationRotationPhase.value=e}get ignoreVertexColor(){return this._ignoreVertexColor}set ignoreVertexColor(e){this._ignoreVertexColor=e,this.needsUpdate=!0}get v0CompatShade(){return this._v0CompatShade}set v0CompatShade(e){this._v0CompatShade=e,this.needsUpdate=!0}get debugMode(){return this._debugMode}set debugMode(e){this._debugMode=e,this.needsUpdate=!0}get outlineWidthMode(){return this._outlineWidthMode}set outlineWidthMode(e){this._outlineWidthMode=e,this.needsUpdate=!0}get isOutline(){return this._isOutline}set isOutline(e){this._isOutline=e,this.needsUpdate=!0}get isMToonMaterial(){return!0}constructor(e={}){super({vertexShader:xr,fragmentShader:Mr}),this.uvAnimationScrollXSpeedFactor=0,this.uvAnimationScrollYSpeedFactor=0,this.uvAnimationRotationSpeedFactor=0,this.fog=!0,this.normalMapType=d.TangentSpaceNormalMap,this._ignoreVertexColor=!0,this._v0CompatShade=!1,this._debugMode=Ar.None,this._outlineWidthMode=zt.None,this._isOutline=!1,e.transparentWithZWrite&&(e.depthWrite=!0),delete e.transparentWithZWrite,e.fog=!0,e.lights=!0,e.clipping=!0,parseInt(d.REVISION,10)<129&&(e.skinning=e.skinning||!1),parseInt(d.REVISION,10)<131&&(e.morphTargets=e.morphTargets||!1,e.morphNormals=e.morphNormals||!1),this.uniforms=d.UniformsUtils.merge([d.UniformsLib.common,d.UniformsLib.normalmap,d.UniformsLib.emissivemap,d.UniformsLib.fog,d.UniformsLib.lights,{litFactor:{value:new d.Color(1,1,1)},mapUvTransform:{value:new d.Matrix3},colorAlpha:{value:1},normalMapUvTransform:{value:new d.Matrix3},shadeColorFactor:{value:new d.Color(.97,.81,.86)},shadeMultiplyTexture:{value:null},shadeMultiplyTextureUvTransform:{value:new d.Matrix3},shadingShiftFactor:{value:0},shadingShiftTexture:{value:null},shadingShiftTextureUvTransform:{value:new d.Matrix3},shadingShiftTextureScale:{value:null},shadingToonyFactor:{value:.9},giEqualizationFactor:{value:.9},matcapFactor:{value:new d.Color(0,0,0)},matcapTexture:{value:null},matcapTextureUvTransform:{value:new d.Matrix3},parametricRimColorFactor:{value:new d.Color(0,0,0)},rimMultiplyTexture:{value:null},rimMultiplyTextureUvTransform:{value:new d.Matrix3},rimLightingMixFactor:{value:0},parametricRimFresnelPowerFactor:{value:1},parametricRimLiftFactor:{value:0},emissive:{value:new d.Color(0,0,0)},emissiveIntensity:{value:1},emissiveMapUvTransform:{value:new d.Matrix3},outlineWidthMultiplyTexture:{value:null},outlineWidthMultiplyTextureUvTransform:{value:new d.Matrix3},outlineWidthFactor:{value:.5},outlineColorFactor:{value:new d.Color(0,0,0)},outlineLightingMixFactor:{value:1},uvAnimationMaskTexture:{value:null},uvAnimationMaskTextureUvTransform:{value:new d.Matrix3},uvAnimationScrollXOffset:{value:0},uvAnimationScrollYOffset:{value:0},uvAnimationRotationPhase:{value:0}},e.uniforms]),this.setValues(e),this._uploadUniformsWorkaround(),this.customProgramCacheKey=()=>[...Object.entries(this._generateDefines()).map(([t,n])=>`${t}:${n}`),this.matcapTexture?`matcapTextureEncoding:${this.matcapTexture.encoding}`:"",this.shadeMultiplyTexture?`shadeMultiplyTextureEncoding:${this.shadeMultiplyTexture.encoding}`:"",this.rimMultiplyTexture?`rimMultiplyTextureEncoding:${this.rimMultiplyTexture.encoding}`:""].join(","),this.onBeforeCompile=(t,n)=>{let i=n.capabilities.isWebGL2,r=parseInt(d.REVISION,10),o=Object.entries(Object.assign(Object.assign({},this._generateDefines()),this.defines)).filter(([s,l])=>!!l).map(([s,l])=>`#define ${s} ${l}`).join(`
`)+`
`,a="";parseInt(d.REVISION,10)<137&&(a=(this.matcapTexture!==null?Gt("matcapTextureTexelToLinear",Xt(this.matcapTexture,i))+`
`:"")+(this.shadeMultiplyTexture!==null?Gt("shadeMultiplyTextureTexelToLinear",Xt(this.shadeMultiplyTexture,i))+`
`:"")+(this.rimMultiplyTexture!==null?Gt("rimMultiplyTextureTexelToLinear",Xt(this.rimMultiplyTexture,i))+`
`:"")),t.vertexShader=o+t.vertexShader,t.fragmentShader=o+a+t.fragmentShader,r<132&&(t.fragmentShader=t.fragmentShader.replace("#include <normal_pars_fragment>",""),t.fragmentShader=t.fragmentShader.replace("#include <alphatest_pars_fragment>",""))}}update(e){this._uploadUniformsWorkaround(),this._updateUVAnimation(e)}copy(e){return super.copy(e),this.map=e.map,this.normalMap=e.normalMap,this.emissiveMap=e.emissiveMap,this.shadeMultiplyTexture=e.shadeMultiplyTexture,this.shadingShiftTexture=e.shadingShiftTexture,this.matcapTexture=e.matcapTexture,this.rimMultiplyTexture=e.rimMultiplyTexture,this.outlineWidthMultiplyTexture=e.outlineWidthMultiplyTexture,this.uvAnimationMaskTexture=e.uvAnimationMaskTexture,this.normalMapType=e.normalMapType,this.uvAnimationScrollXSpeedFactor=e.uvAnimationScrollXSpeedFactor,this.uvAnimationScrollYSpeedFactor=e.uvAnimationScrollYSpeedFactor,this.uvAnimationRotationSpeedFactor=e.uvAnimationRotationSpeedFactor,this.ignoreVertexColor=e.ignoreVertexColor,this.v0CompatShade=e.v0CompatShade,this.debugMode=e.debugMode,this.outlineWidthMode=e.outlineWidthMode,this.isOutline=e.isOutline,this.needsUpdate=!0,this}_updateUVAnimation(e){this.uniforms.uvAnimationScrollXOffset.value+=e*this.uvAnimationScrollXSpeedFactor,this.uniforms.uvAnimationScrollYOffset.value+=e*this.uvAnimationScrollYSpeedFactor,this.uniforms.uvAnimationRotationPhase.value+=e*this.uvAnimationRotationSpeedFactor,this.uniformsNeedUpdate=!0}_uploadUniformsWorkaround(){this.uniforms.opacity.value=this.opacity,this._updateTextureMatrix(this.uniforms.map,this.uniforms.mapUvTransform),this._updateTextureMatrix(this.uniforms.normalMap,this.uniforms.normalMapUvTransform),this._updateTextureMatrix(this.uniforms.emissiveMap,this.uniforms.emissiveMapUvTransform),this._updateTextureMatrix(this.uniforms.shadeMultiplyTexture,this.uniforms.shadeMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.shadingShiftTexture,this.uniforms.shadingShiftTextureUvTransform),this._updateTextureMatrix(this.uniforms.matcapTexture,this.uniforms.matcapTextureUvTransform),this._updateTextureMatrix(this.uniforms.rimMultiplyTexture,this.uniforms.rimMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.outlineWidthMultiplyTexture,this.uniforms.outlineWidthMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.uvAnimationMaskTexture,this.uniforms.uvAnimationMaskTextureUvTransform),parseInt(d.REVISION,10)>=132&&(this.uniforms.alphaTest.value=this.alphaTest),this.uniformsNeedUpdate=!0}_generateDefines(){let e=parseInt(d.REVISION,10),t=this.outlineWidthMultiplyTexture!==null,n=this.map!==null||this.emissiveMap!==null||this.shadeMultiplyTexture!==null||this.shadingShiftTexture!==null||this.rimMultiplyTexture!==null||this.uvAnimationMaskTexture!==null;return{THREE_VRM_THREE_REVISION:e,OUTLINE:this._isOutline,MTOON_USE_UV:t||n,MTOON_UVS_VERTEX_ONLY:t&&!n,V0_COMPAT_SHADE:this._v0CompatShade,USE_SHADEMULTIPLYTEXTURE:this.shadeMultiplyTexture!==null,USE_SHADINGSHIFTTEXTURE:this.shadingShiftTexture!==null,USE_MATCAPTEXTURE:this.matcapTexture!==null,USE_RIMMULTIPLYTEXTURE:this.rimMultiplyTexture!==null,USE_OUTLINEWIDTHMULTIPLYTEXTURE:this._isOutline&&this.outlineWidthMultiplyTexture!==null,USE_UVANIMATIONMASKTEXTURE:this.uvAnimationMaskTexture!==null,IGNORE_VERTEX_COLOR:this._ignoreVertexColor===!0,DEBUG_NORMAL:this._debugMode==="normal",DEBUG_LITSHADERATE:this._debugMode==="litShadeRate",DEBUG_UV:this._debugMode==="uv",OUTLINE_WIDTH_WORLD:this._isOutline&&this._outlineWidthMode===zt.WorldCoordinates,OUTLINE_WIDTH_SCREEN:this._isOutline&&this._outlineWidthMode===zt.ScreenCoordinates}}_updateTextureMatrix(e,t){e.value&&(e.value.matrixAutoUpdate&&e.value.updateMatrix(),t.value.copy(e.value.matrix))}},on=class{get pending(){return Promise.all(this._pendings)}constructor(e,t){this._parser=e,this._materialParams=t,this._pendings=[]}assignPrimitive(e,t){t!=null&&(this._materialParams[e]=t)}assignColor(e,t,n){t!=null&&(this._materialParams[e]=new d.Color().fromArray(t),n&&this._materialParams[e].convertSRGBToLinear())}assignTexture(e,t,n){return $(this,void 0,void 0,function*(){let i=$(this,void 0,void 0,function*(){t!=null&&(yield this._parser.assignTexture(this._materialParams,e,t),n&&(this._materialParams[e].encoding=d.sRGBEncoding))});return this._pendings.push(i),i})}assignTextureByIndex(e,t,n){return $(this,void 0,void 0,function*(){return this.assignTexture(e,t!=null?{index:t}:void 0,n)})}},Pr=new Set(["1.0","1.0-beta"]),je=class c{get name(){return c.EXTENSION_NAME}constructor(e,t={}){var n,i,r;this.parser=e,this.renderOrderOffset=(n=t.renderOrderOffset)!==null&&n!==void 0?n:0,this.v0CompatShade=(i=t.v0CompatShade)!==null&&i!==void 0?i:!1,this.debugMode=(r=t.debugMode)!==null&&r!==void 0?r:"none",this._mToonMaterialSet=new Set}beforeRoot(){return $(this,void 0,void 0,function*(){this._removeUnlitExtensionIfMToonExists()})}afterRoot(e){return $(this,void 0,void 0,function*(){e.userData.vrmMToonMaterials=Array.from(this._mToonMaterialSet)})}getMaterialType(e){return this._getMToonExtension(e)?pe:null}extendMaterialParams(e,t){let n=this._getMToonExtension(e);return n?this._extendMaterialParams(n,t):null}loadMesh(e){var t;return $(this,void 0,void 0,function*(){let n=this.parser,r=(t=n.json.meshes)===null||t===void 0?void 0:t[e];if(r==null)throw new Error(`MToonMaterialLoaderPlugin: Attempt to use meshes[${e}] of glTF but the mesh doesn't exist`);let o=r.primitives,a=yield n.loadMesh(e);if(o.length===1){let s=a,l=o[0].material;l!=null&&this._setupPrimitive(s,l)}else{let s=a;for(let l=0;l<o.length;l++){let u=s.children[l],h=o[l].material;h!=null&&this._setupPrimitive(u,h)}}return a})}_removeUnlitExtensionIfMToonExists(){let n=this.parser.json.materials;n?.map((i,r)=>{var o;this._getMToonExtension(r)&&(!((o=i.extensions)===null||o===void 0)&&o.KHR_materials_unlit)&&delete i.extensions.KHR_materials_unlit})}_getMToonExtension(e){var t,n;let o=(t=this.parser.json.materials)===null||t===void 0?void 0:t[e];if(o==null){console.warn(`MToonMaterialLoaderPlugin: Attempt to use materials[${e}] of glTF but the material doesn't exist`);return}let a=(n=o.extensions)===null||n===void 0?void 0:n[c.EXTENSION_NAME];if(a==null)return;let s=a.specVersion;if(!Pr.has(s)){console.warn(`MToonMaterialLoaderPlugin: Unknown ${c.EXTENSION_NAME} specVersion "${s}"`);return}return a}_extendMaterialParams(e,t){var n;return $(this,void 0,void 0,function*(){delete t.metalness,delete t.roughness;let i=new on(this.parser,t);i.assignPrimitive("transparentWithZWrite",e.transparentWithZWrite),i.assignColor("shadeColorFactor",e.shadeColorFactor),i.assignTexture("shadeMultiplyTexture",e.shadeMultiplyTexture,!0),i.assignPrimitive("shadingShiftFactor",e.shadingShiftFactor),i.assignTexture("shadingShiftTexture",e.shadingShiftTexture,!0),i.assignPrimitive("shadingShiftTextureScale",(n=e.shadingShiftTexture)===null||n===void 0?void 0:n.scale),i.assignPrimitive("shadingToonyFactor",e.shadingToonyFactor),i.assignPrimitive("giEqualizationFactor",e.giEqualizationFactor),i.assignColor("matcapFactor",e.matcapFactor),i.assignTexture("matcapTexture",e.matcapTexture,!0),i.assignColor("parametricRimColorFactor",e.parametricRimColorFactor),i.assignTexture("rimMultiplyTexture",e.rimMultiplyTexture,!0),i.assignPrimitive("rimLightingMixFactor",e.rimLightingMixFactor),i.assignPrimitive("parametricRimFresnelPowerFactor",e.parametricRimFresnelPowerFactor),i.assignPrimitive("parametricRimLiftFactor",e.parametricRimLiftFactor),i.assignPrimitive("outlineWidthMode",e.outlineWidthMode),i.assignPrimitive("outlineWidthFactor",e.outlineWidthFactor),i.assignTexture("outlineWidthMultiplyTexture",e.outlineWidthMultiplyTexture,!1),i.assignColor("outlineColorFactor",e.outlineColorFactor),i.assignPrimitive("outlineLightingMixFactor",e.outlineLightingMixFactor),i.assignTexture("uvAnimationMaskTexture",e.uvAnimationMaskTexture,!1),i.assignPrimitive("uvAnimationScrollXSpeedFactor",e.uvAnimationScrollXSpeedFactor),i.assignPrimitive("uvAnimationScrollYSpeedFactor",e.uvAnimationScrollYSpeedFactor),i.assignPrimitive("uvAnimationRotationSpeedFactor",e.uvAnimationRotationSpeedFactor),i.assignPrimitive("v0CompatShade",this.v0CompatShade),i.assignPrimitive("debugMode",this.debugMode),yield i.pending})}_setupPrimitive(e,t){let n=this._getMToonExtension(t);if(n){let i=this._parseRenderOrder(n);e.renderOrder=i+this.renderOrderOffset,this._generateOutline(e),this._addToMaterialSet(e);return}}_generateOutline(e){let t=e.material;if(!(t instanceof pe)||t.outlineWidthMode==="none"||t.outlineWidthFactor<=0)return;e.material=[t];let n=t.clone();n.name+=" (Outline)",n.isOutline=!0,n.side=d.BackSide,e.material.push(n);let i=e.geometry,r=i.index?i.index.count:i.attributes.position.count/3;i.addGroup(0,r,0),i.addGroup(0,r,1)}_addToMaterialSet(e){let t=e.material,n=new Set;Array.isArray(t)?t.forEach(i=>n.add(i)):n.add(t);for(let i of n)i instanceof pe&&this._mToonMaterialSet.add(i)}_parseRenderOrder(e){var t;return(e.transparentWithZWrite?0:19)+((t=e.renderQueueOffsetNumber)!==null&&t!==void 0?t:0)}};je.EXTENSION_NAME="VRMC_materials_mtoon";function Hr(c,e,t,n){function i(r){return r instanceof t?r:new t(function(o){o(r)})}return new(t||(t=Promise))(function(r,o){function a(u){try{l(n.next(u))}catch(h){o(h)}}function s(u){try{l(n.throw(u))}catch(h){o(h)}}function l(u){u.done?r(u.value):i(u.value).then(a,s)}l((n=n.apply(c,e||[])).next())})}var ze=class c{get name(){return c.EXTENSION_NAME}constructor(e){this.parser=e}extendMaterialParams(e,t){return Hr(this,void 0,void 0,function*(){let n=this._getHDREmissiveMultiplierExtension(e);if(n==null)return;console.warn("VRMMaterialsHDREmissiveMultiplierLoaderPlugin: `VRMC_materials_hdr_emissiveMultiplier` is archived. Use `KHR_materials_emissive_strength` instead.");let i=n.emissiveMultiplier;t.emissiveIntensity=i})}_getHDREmissiveMultiplierExtension(e){var t,n;let o=(t=this.parser.json.materials)===null||t===void 0?void 0:t[e];if(o==null){console.warn(`VRMMaterialsHDREmissiveMultiplierLoaderPlugin: Attempt to use materials[${e}] of glTF but the material doesn't exist`);return}let a=(n=o.extensions)===null||n===void 0?void 0:n[c.EXTENSION_NAME];if(a!=null)return a}};ze.EXTENSION_NAME="VRMC_materials_hdr_emissiveMultiplier";function Nr(c,e,t,n){function i(r){return r instanceof t?r:new t(function(o){o(r)})}return new(t||(t=Promise))(function(r,o){function a(u){try{l(n.next(u))}catch(h){o(h)}}function s(u){try{l(n.throw(u))}catch(h){o(h)}}function l(u){u.done?r(u.value):i(u.value).then(a,s)}l((n=n.apply(c,e||[])).next())})}function ee(c){return Math.pow(c,2.2)}var sn=class{get name(){return"VRMMaterialsV0CompatPlugin"}constructor(e){var t;this.parser=e,this._renderQueueMapTransparent=new Map,this._renderQueueMapTransparentZWrite=new Map;let n=this.parser.json;n.extensionsUsed=(t=n.extensionsUsed)!==null&&t!==void 0?t:[],n.extensionsUsed.indexOf("KHR_texture_transform")===-1&&n.extensionsUsed.push("KHR_texture_transform")}beforeRoot(){var e;return Nr(this,void 0,void 0,function*(){let t=this.parser.json,n=(e=t.extensions)===null||e===void 0?void 0:e.VRM,i=n?.materialProperties;i&&(this._populateRenderQueueMap(i),i.forEach((r,o)=>{var a,s;let l=(a=t.materials)===null||a===void 0?void 0:a[o];if(l==null){console.warn(`VRMMaterialsV0CompatPlugin: Attempt to use materials[${o}] of glTF but the material doesn't exist`);return}if(r.shader==="VRM/MToon"){let u=this._parseV0MToonProperties(r,l);t.materials[o]=u}else if(!((s=r.shader)===null||s===void 0)&&s.startsWith("VRM/Unlit")){let u=this._parseV0UnlitProperties(r,l);t.materials[o]=u}else r.shader==="VRM_USE_GLTFSHADER"||console.warn(`VRMMaterialsV0CompatPlugin: Unknown shader: ${r.shader}`)}))})}_parseV0MToonProperties(e,t){var n,i,r,o,a,s,l,u,h,p,m,v,g,E,_,x,R,T,A,y,M,b,L,I,P,N,H,k,U,K,oe,se,tt,nt,it,rt,ot,st,at,lt,ut,ct,dt,ht;let _n=(i=(n=e.keywordMap)===null||n===void 0?void 0:n._ALPHABLEND_ON)!==null&&i!==void 0?i:!1,oi=((r=e.floatProperties)===null||r===void 0?void 0:r._ZWrite)===1&&_n,si=this._v0ParseRenderQueue(e),vn=(a=(o=e.keywordMap)===null||o===void 0?void 0:o._ALPHATEST_ON)!==null&&a!==void 0?a:!1,ai=_n?"BLEND":vn?"MASK":"OPAQUE",li=vn?(s=e.floatProperties)===null||s===void 0?void 0:s._Cutoff:void 0,ui=((u=(l=e.floatProperties)===null||l===void 0?void 0:l._CullMode)!==null&&u!==void 0?u:2)===0,X=this._portTextureTransform(e),ci=(p=(h=e.vectorProperties)===null||h===void 0?void 0:h._Color)===null||p===void 0?void 0:p.map((Sn,Oi)=>Oi===3?Sn:ee(Sn)),En=(m=e.textureProperties)===null||m===void 0?void 0:m._MainTex,di=En!=null?{index:En,extensions:Object.assign({},X)}:void 0,hi=(v=e.floatProperties)===null||v===void 0?void 0:v._BumpScale,Tn=(g=e.textureProperties)===null||g===void 0?void 0:g._BumpMap,fi=Tn!=null?{index:Tn,scale:hi,extensions:Object.assign({},X)}:void 0,pi=(_=(E=e.vectorProperties)===null||E===void 0?void 0:E._EmissionColor)===null||_===void 0?void 0:_.map(ee),Rn=(x=e.textureProperties)===null||x===void 0?void 0:x._EmissionMap,mi=Rn!=null?{index:Rn,extensions:Object.assign({},X)}:void 0,gi=(T=(R=e.vectorProperties)===null||R===void 0?void 0:R._ShadeColor)===null||T===void 0?void 0:T.map(ee),xn=(A=e.textureProperties)===null||A===void 0?void 0:A._ShadeTexture,_i=xn!=null?{index:xn,extensions:Object.assign({},X)}:void 0,Re=(M=(y=e.floatProperties)===null||y===void 0?void 0:y._ShadeShift)!==null&&M!==void 0?M:0,xe=(L=(b=e.floatProperties)===null||b===void 0?void 0:b._ShadeToony)!==null&&L!==void 0?L:.9;xe=d.MathUtils.lerp(xe,1,.5+.5*Re),Re=-Re-(1-xe);let Mn=(I=e.floatProperties)===null||I===void 0?void 0:I._IndirectLightIntensity,vi=Mn?1-Mn:void 0,ft=(P=e.textureProperties)===null||P===void 0?void 0:P._SphereAdd,Ei=ft!=null?[1,1,1]:void 0,Ti=ft!=null?{index:ft}:void 0,Ri=(N=e.floatProperties)===null||N===void 0?void 0:N._RimLightingMix,An=(H=e.textureProperties)===null||H===void 0?void 0:H._RimTexture,xi=An!=null?{index:An,extensions:Object.assign({},X)}:void 0,Mi=(U=(k=e.vectorProperties)===null||k===void 0?void 0:k._RimColor)===null||U===void 0?void 0:U.map(ee),Ai=(K=e.floatProperties)===null||K===void 0?void 0:K._RimFresnelPower,yi=(oe=e.floatProperties)===null||oe===void 0?void 0:oe._RimLift,wi=["none","worldCoordinates","screenCoordinates"][(tt=(se=e.floatProperties)===null||se===void 0?void 0:se._OutlineWidthMode)!==null&&tt!==void 0?tt:0],pt=(it=(nt=e.floatProperties)===null||nt===void 0?void 0:nt._OutlineWidth)!==null&&it!==void 0?it:0;pt=.01*pt;let yn=(rt=e.textureProperties)===null||rt===void 0?void 0:rt._OutlineWidthTexture,Si=yn!=null?{index:yn,extensions:Object.assign({},X)}:void 0,Li=(st=(ot=e.vectorProperties)===null||ot===void 0?void 0:ot._OutlineColor)===null||st===void 0?void 0:st.map(ee),bi=((at=e.floatProperties)===null||at===void 0?void 0:at._OutlineColorMode)===1?(lt=e.floatProperties)===null||lt===void 0?void 0:lt._OutlineLightingMix:0,wn=(ut=e.textureProperties)===null||ut===void 0?void 0:ut._UvAnimMaskTexture,Ii=wn!=null?{index:wn,extensions:Object.assign({},X)}:void 0,Pi=(ct=e.floatProperties)===null||ct===void 0?void 0:ct._UvAnimScrollX,Me=(dt=e.floatProperties)===null||dt===void 0?void 0:dt._UvAnimScrollY;Me!=null&&(Me=-Me);let Hi=(ht=e.floatProperties)===null||ht===void 0?void 0:ht._UvAnimRotation,Ni={specVersion:"1.0",transparentWithZWrite:oi,renderQueueOffsetNumber:si,shadeColorFactor:gi,shadeMultiplyTexture:_i,shadingShiftFactor:Re,shadingToonyFactor:xe,giEqualizationFactor:vi,matcapFactor:Ei,matcapTexture:Ti,rimLightingMixFactor:Ri,rimMultiplyTexture:xi,parametricRimColorFactor:Mi,parametricRimFresnelPowerFactor:Ai,parametricRimLiftFactor:yi,outlineWidthMode:wi,outlineWidthFactor:pt,outlineWidthMultiplyTexture:Si,outlineColorFactor:Li,outlineLightingMixFactor:bi,uvAnimationMaskTexture:Ii,uvAnimationScrollXSpeedFactor:Pi,uvAnimationScrollYSpeedFactor:Me,uvAnimationRotationSpeedFactor:Hi};return Object.assign(Object.assign({},t),{pbrMetallicRoughness:{baseColorFactor:ci,baseColorTexture:di},normalTexture:fi,emissiveTexture:mi,emissiveFactor:pi,alphaMode:ai,alphaCutoff:li,doubleSided:ui,extensions:{VRMC_materials_mtoon:Ni}})}_parseV0UnlitProperties(e,t){var n,i,r,o;let a=e.shader==="VRM/UnlitTransparentZWrite",s=e.shader==="VRM/UnlitTransparent"||a,l=this._v0ParseRenderQueue(e),u=e.shader==="VRM/UnlitCutout",h=s?"BLEND":u?"MASK":"OPAQUE",p=u?(n=e.floatProperties)===null||n===void 0?void 0:n._Cutoff:void 0,m=this._portTextureTransform(e),v=(r=(i=e.vectorProperties)===null||i===void 0?void 0:i._Color)===null||r===void 0?void 0:r.map(ee),g=(o=e.textureProperties)===null||o===void 0?void 0:o._MainTex,E=g!=null?{index:g,extensions:Object.assign({},m)}:void 0,_={specVersion:"1.0",transparentWithZWrite:a,renderQueueOffsetNumber:l,shadeColorFactor:v,shadeMultiplyTexture:E};return Object.assign(Object.assign({},t),{pbrMetallicRoughness:{baseColorFactor:v,baseColorTexture:E},alphaMode:h,alphaCutoff:p,extensions:{VRMC_materials_mtoon:_}})}_portTextureTransform(e){var t,n,i,r,o;let a=(t=e.vectorProperties)===null||t===void 0?void 0:t._MainTex;if(a==null)return{};let s=[(n=a?.[0])!==null&&n!==void 0?n:0,(i=a?.[1])!==null&&i!==void 0?i:0],l=[(r=a?.[2])!==null&&r!==void 0?r:1,(o=a?.[3])!==null&&o!==void 0?o:1];return s[1]=l[1]*(1-s[1])%1,{KHR_texture_transform:{offset:s,scale:l}}}_v0ParseRenderQueue(e){var t,n,i;let r=(n=(t=e.keywordMap)===null||t===void 0?void 0:t._ALPHABLEND_ON)!==null&&n!==void 0?n:!1,o=((i=e.floatProperties)===null||i===void 0?void 0:i._ZWrite)===1,a=0;if(r){let s=e.renderQueue;s!=null&&(o?a=this._renderQueueMapTransparentZWrite.get(s):a=this._renderQueueMapTransparent.get(s))}return a}_populateRenderQueueMap(e){let t=new Set,n=new Set;e.forEach(i=>{var r,o,a;let s=(o=(r=i.keywordMap)===null||r===void 0?void 0:r._ALPHABLEND_ON)!==null&&o!==void 0?o:!1,l=((a=i.floatProperties)===null||a===void 0?void 0:a._ZWrite)===1;if(s){let u=i.renderQueue;u!=null&&(l?n.add(u):t.add(u))}}),t.size>10&&console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${t.size} render queues for Transparent materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`),n.size>10&&console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${n.size} render queues for TransparentZWrite materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`),Array.from(t).sort().forEach((i,r)=>{let o=Math.min(Math.max(r-t.size+1,-9),0);this._renderQueueMapTransparent.set(i,o)}),Array.from(n).sort().forEach((i,r)=>{let o=Math.min(Math.max(r,0),9);this._renderQueueMapTransparentZWrite.set(i,o)})}};var z=new d.Vector3,me=class extends d.Group{constructor(e){super(),this._attrPosition=new d.BufferAttribute(new Float32Array([0,0,0,0,0,0]),3),this._attrPosition.setUsage(d.DynamicDrawUsage);let t=new d.BufferGeometry;t.setAttribute("position",this._attrPosition);let n=new d.LineBasicMaterial({color:16711935,depthTest:!1,depthWrite:!1});this._line=new d.Line(t,n),this.add(this._line),this.constraint=e}updateMatrixWorld(e){z.setFromMatrixPosition(this.constraint.destination.matrixWorld),this._attrPosition.setXYZ(0,z.x,z.y,z.z),this.constraint.source&&z.setFromMatrixPosition(this.constraint.source.matrixWorld),this._attrPosition.setXYZ(1,z.x,z.y,z.z),this._attrPosition.needsUpdate=!0,super.updateMatrixWorld(e)}};function Yn(c,e){return e.set(c.elements[12],c.elements[13],c.elements[14])}var Or=new d.Vector3,Ur=new d.Vector3;function Cr(c,e){return c.decompose(Or,e,Ur),e}function Ge(c){return c.invert?c.invert():c.inverse(),c}var Te=class{constructor(e,t){this.destination=e,this.source=t,this.weight=1}},Dr=new d.Vector3,Br=new d.Vector3,Fr=new d.Vector3,Vr=new d.Quaternion,kr=new d.Quaternion,Wr=new d.Quaternion,an=class extends Te{get aimAxis(){return this._aimAxis}set aimAxis(e){this._aimAxis=e,this._v3AimAxis.set(e==="PositiveX"?1:e==="NegativeX"?-1:0,e==="PositiveY"?1:e==="NegativeY"?-1:0,e==="PositiveZ"?1:e==="NegativeZ"?-1:0)}get dependencies(){let e=new Set([this.source]);return this.destination.parent&&e.add(this.destination.parent),e}constructor(e,t){super(e,t),this._aimAxis="PositiveX",this._v3AimAxis=new d.Vector3(1,0,0),this._dstRestQuat=new d.Quaternion}setInitState(){this._dstRestQuat.copy(this.destination.quaternion)}update(){this.destination.updateWorldMatrix(!0,!1),this.source.updateWorldMatrix(!0,!1);let e=Vr.identity(),t=kr.identity();this.destination.parent&&(Cr(this.destination.parent.matrixWorld,e),Ge(t.copy(e)));let n=Dr.copy(this._v3AimAxis).applyQuaternion(this._dstRestQuat).applyQuaternion(e),i=Yn(this.source.matrixWorld,Br).sub(Yn(this.destination.matrixWorld,Fr)).normalize(),r=Wr.setFromUnitVectors(n,i).premultiply(t).multiply(e).multiply(this._dstRestQuat);this.destination.quaternion.copy(this._dstRestQuat).slerp(r,this.weight)}};function $n(c,e,t,n){function i(r){return r instanceof t?r:new t(function(o){o(r)})}return new(t||(t=Promise))(function(r,o){function a(u){try{l(n.next(u))}catch(h){o(h)}}function s(u){try{l(n.throw(u))}catch(h){o(h)}}function l(u){u.done?r(u.value):i(u.value).then(a,s)}l((n=n.apply(c,e||[])).next())})}function jr(c,e){let t=[c],n=c.parent;for(;n!==null;)t.unshift(n),n=n.parent;t.forEach(i=>{e(i)})}var ln=class{constructor(){this._constraints=new Set,this._objectConstraintsMap=new Map}get constraints(){return this._constraints}addConstraint(e){this._constraints.add(e);let t=this._objectConstraintsMap.get(e.destination);t==null&&(t=new Set,this._objectConstraintsMap.set(e.destination,t)),t.add(e)}deleteConstraint(e){this._constraints.delete(e),this._objectConstraintsMap.get(e.destination).delete(e)}setInitState(){let e=new Set,t=new Set;for(let n of this._constraints)this._processConstraint(n,e,t,i=>i.setInitState())}update(){let e=new Set,t=new Set;for(let n of this._constraints)this._processConstraint(n,e,t,i=>i.update())}_processConstraint(e,t,n,i){if(n.has(e))return;if(t.has(e))throw new Error("VRMNodeConstraintManager: Circular dependency detected while updating constraints");t.add(e);let r=e.dependencies;for(let o of r)jr(o,a=>{let s=this._objectConstraintsMap.get(a);if(s)for(let l of s)this._processConstraint(l,t,n,i)});i(e),n.add(e)}},zr=new d.Quaternion,Gr=new d.Quaternion,un=class extends Te{get dependencies(){return new Set([this.source])}constructor(e,t){super(e,t),this._dstRestQuat=new d.Quaternion,this._invSrcRestQuat=new d.Quaternion}setInitState(){this._dstRestQuat.copy(this.destination.quaternion),Ge(this._invSrcRestQuat.copy(this.source.quaternion))}update(){let e=zr.copy(this._invSrcRestQuat).multiply(this.source.quaternion),t=Gr.copy(this._dstRestQuat).multiply(e);this.destination.quaternion.copy(this._dstRestQuat).slerp(t,this.weight)}},Xr=new d.Vector3,qr=new d.Quaternion,Qr=new d.Quaternion,cn=class extends Te{get rollAxis(){return this._rollAxis}set rollAxis(e){this._rollAxis=e,this._v3RollAxis.set(e==="X"?1:0,e==="Y"?1:0,e==="Z"?1:0)}get dependencies(){return new Set([this.source])}constructor(e,t){super(e,t),this._rollAxis="X",this._v3RollAxis=new d.Vector3(1,0,0),this._dstRestQuat=new d.Quaternion,this._invDstRestQuat=new d.Quaternion,this._invSrcRestQuatMulDstRestQuat=new d.Quaternion}setInitState(){this._dstRestQuat.copy(this.destination.quaternion),Ge(this._invDstRestQuat.copy(this._dstRestQuat)),Ge(this._invSrcRestQuatMulDstRestQuat.copy(this.source.quaternion)).multiply(this._dstRestQuat)}update(){let e=qr.copy(this._invDstRestQuat).multiply(this.source.quaternion).multiply(this._invSrcRestQuatMulDstRestQuat),t=Xr.copy(this._v3RollAxis).applyQuaternion(e),i=Qr.setFromUnitVectors(t,this._v3RollAxis).premultiply(this._dstRestQuat).multiply(e);this.destination.quaternion.copy(this._dstRestQuat).slerp(i,this.weight)}},Yr=new Set(["1.0","1.0-beta"]),Xe=class c{get name(){return c.EXTENSION_NAME}constructor(e,t){this.parser=e,this.helperRoot=t?.helperRoot}afterRoot(e){return $n(this,void 0,void 0,function*(){e.userData.vrmNodeConstraintManager=yield this._import(e)})}_import(e){var t;return $n(this,void 0,void 0,function*(){let n=this.parser.json;if(!(((t=n.extensionsUsed)===null||t===void 0?void 0:t.indexOf(c.EXTENSION_NAME))!==-1))return null;let r=new ln,o=yield this.parser.getDependencies("node");return o.forEach((a,s)=>{var l;let u=n.nodes[s],h=(l=u?.extensions)===null||l===void 0?void 0:l[c.EXTENSION_NAME];if(h==null)return;let p=h.specVersion;if(!Yr.has(p)){console.warn(`VRMNodeConstraintLoaderPlugin: Unknown ${c.EXTENSION_NAME} specVersion "${p}"`);return}let m=h.constraint;if(m.roll!=null){let v=this._importRollConstraint(a,o,m.roll);r.addConstraint(v)}else if(m.aim!=null){let v=this._importAimConstraint(a,o,m.aim);r.addConstraint(v)}else if(m.rotation!=null){let v=this._importRotationConstraint(a,o,m.rotation);r.addConstraint(v)}}),e.scene.updateMatrixWorld(),r.setInitState(),r})}_importRollConstraint(e,t,n){let{source:i,rollAxis:r,weight:o}=n,a=t[i],s=new cn(e,a);if(r!=null&&(s.rollAxis=r),o!=null&&(s.weight=o),this.helperRoot){let l=new me(s);this.helperRoot.add(l)}return s}_importAimConstraint(e,t,n){let{source:i,aimAxis:r,weight:o}=n,a=t[i],s=new an(e,a);if(r!=null&&(s.aimAxis=r),o!=null&&(s.weight=o),this.helperRoot){let l=new me(s);this.helperRoot.add(l)}return s}_importRotationConstraint(e,t,n){let{source:i,weight:r}=n,o=t[i],a=new un(e,o);if(r!=null&&(a.weight=r),this.helperRoot){let s=new me(a);this.helperRoot.add(s)}return a}};Xe.EXTENSION_NAME="VRMC_node_constraint";var qe=class{},qt=new d.Vector3,Y=new d.Vector3,Qe=class extends qe{get type(){return"capsule"}constructor(e){var t,n,i;super(),this.offset=(t=e?.offset)!==null&&t!==void 0?t:new d.Vector3(0,0,0),this.tail=(n=e?.tail)!==null&&n!==void 0?n:new d.Vector3(0,0,0),this.radius=(i=e?.radius)!==null&&i!==void 0?i:0}calculateCollision(e,t,n,i){qt.copy(this.offset).applyMatrix4(e),Y.copy(this.tail).applyMatrix4(e),Y.sub(qt);let r=Y.lengthSq();i.copy(t).sub(qt);let o=Y.dot(i);o<=0||(r<=o||Y.multiplyScalar(o/r),i.sub(Y));let a=n+this.radius,s=i.length()-a;return i.normalize(),s}},Ye=class extends qe{get type(){return"sphere"}constructor(e){var t,n;super(),this.offset=(t=e?.offset)!==null&&t!==void 0?t:new d.Vector3(0,0,0),this.radius=(n=e?.radius)!==null&&n!==void 0?n:0}calculateCollision(e,t,n,i){i.copy(this.offset).applyMatrix4(e),i.negate().add(t);let r=n+this.radius,o=i.length()-r;return i.normalize(),o}},F=new d.Vector3,dn=class extends d.BufferGeometry{constructor(e){super(),this.worldScale=1,this._currentRadius=0,this._currentOffset=new d.Vector3,this._currentTail=new d.Vector3,this._shape=e,this._attrPos=new d.BufferAttribute(new Float32Array(396),3),this.setAttribute("position",this._attrPos),this._attrIndex=new d.BufferAttribute(new Uint16Array(264),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1,t=this._shape.radius/this.worldScale;this._currentRadius!==t&&(this._currentRadius=t,e=!0),this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),e=!0);let n=F.copy(this._shape.tail).divideScalar(this.worldScale);this._currentTail.distanceToSquared(n)>1e-10&&(this._currentTail.copy(n),e=!0),e&&this._buildPosition()}_buildPosition(){F.copy(this._currentTail).sub(this._currentOffset);let e=F.length()/this._currentRadius;for(let i=0;i<=16;i++){let r=i/16*Math.PI;this._attrPos.setXYZ(i,-Math.sin(r),-Math.cos(r),0),this._attrPos.setXYZ(17+i,e+Math.sin(r),Math.cos(r),0),this._attrPos.setXYZ(34+i,-Math.sin(r),0,-Math.cos(r)),this._attrPos.setXYZ(51+i,e+Math.sin(r),0,Math.cos(r))}for(let i=0;i<32;i++){let r=i/16*Math.PI;this._attrPos.setXYZ(68+i,0,Math.sin(r),Math.cos(r)),this._attrPos.setXYZ(100+i,e,Math.sin(r),Math.cos(r))}let t=Math.atan2(F.y,Math.sqrt(F.x*F.x+F.z*F.z)),n=-Math.atan2(F.z,F.x);this.rotateZ(t),this.rotateY(n),this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<34;e++){let t=(e+1)%34;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(68+e*2,34+e,34+t)}for(let e=0;e<32;e++){let t=(e+1)%32;this._attrIndex.setXY(136+e*2,68+e,68+t),this._attrIndex.setXY(200+e*2,100+e,100+t)}this._attrIndex.needsUpdate=!0}},hn=class extends d.BufferGeometry{constructor(e){super(),this.worldScale=1,this._currentRadius=0,this._currentOffset=new d.Vector3,this._shape=e,this._attrPos=new d.BufferAttribute(new Float32Array(32*3*3),3),this.setAttribute("position",this._attrPos),this._attrIndex=new d.BufferAttribute(new Uint16Array(64*3),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1,t=this._shape.radius/this.worldScale;this._currentRadius!==t&&(this._currentRadius=t,e=!0),this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),e=!0),e&&this._buildPosition()}_buildPosition(){for(let e=0;e<32;e++){let t=e/16*Math.PI;this._attrPos.setXYZ(e,Math.cos(t),Math.sin(t),0),this._attrPos.setXYZ(32+e,0,Math.cos(t),Math.sin(t)),this._attrPos.setXYZ(64+e,Math.sin(t),0,Math.cos(t))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<32;e++){let t=(e+1)%32;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(64+e*2,32+e,32+t),this._attrIndex.setXY(128+e*2,64+e,64+t)}this._attrIndex.needsUpdate=!0}},$r=new d.Vector3,$e=class extends d.Group{constructor(e){if(super(),this.matrixAutoUpdate=!1,this.collider=e,this.collider.shape instanceof Ye)this._geometry=new hn(this.collider.shape);else if(this.collider.shape instanceof Qe)this._geometry=new dn(this.collider.shape);else throw new Error("VRMSpringBoneColliderHelper: Unknown collider shape type detected");let t=new d.LineBasicMaterial({color:16711935,depthTest:!1,depthWrite:!1});this._line=new d.LineSegments(this._geometry,t),this.add(this._line)}dispose(){this._geometry.dispose()}updateMatrixWorld(e){this.collider.updateWorldMatrix(!0,!1),this.matrix.copy(this.collider.matrixWorld);let t=this.matrix.elements;this._geometry.worldScale=$r.set(t[0],t[1],t[2]).length(),this._geometry.update(),super.updateMatrixWorld(e)}},fn=class extends d.BufferGeometry{constructor(e){super(),this.worldScale=1,this._currentRadius=0,this._currentTail=new d.Vector3,this._springBone=e,this._attrPos=new d.BufferAttribute(new Float32Array(294),3),this.setAttribute("position",this._attrPos),this._attrIndex=new d.BufferAttribute(new Uint16Array(194),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1,t=this._springBone.settings.hitRadius/this.worldScale;this._currentRadius!==t&&(this._currentRadius=t,e=!0),this._currentTail.equals(this._springBone.initialLocalChildPosition)||(this._currentTail.copy(this._springBone.initialLocalChildPosition),e=!0),e&&this._buildPosition()}_buildPosition(){for(let e=0;e<32;e++){let t=e/16*Math.PI;this._attrPos.setXYZ(e,Math.cos(t),Math.sin(t),0),this._attrPos.setXYZ(32+e,0,Math.cos(t),Math.sin(t)),this._attrPos.setXYZ(64+e,Math.sin(t),0,Math.cos(t))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.setXYZ(96,0,0,0),this._attrPos.setXYZ(97,this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<32;e++){let t=(e+1)%32;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(64+e*2,32+e,32+t),this._attrIndex.setXY(128+e*2,64+e,64+t)}this._attrIndex.setXY(192,96,97),this._attrIndex.needsUpdate=!0}},Kr=new d.Vector3,pn=class extends d.Group{constructor(e){super(),this.matrixAutoUpdate=!1,this.springBone=e,this._geometry=new fn(this.springBone);let t=new d.LineBasicMaterial({color:16776960,depthTest:!1,depthWrite:!1});this._line=new d.LineSegments(this._geometry,t),this.add(this._line)}dispose(){this._geometry.dispose()}updateMatrixWorld(e){this.springBone.bone.updateWorldMatrix(!0,!1),this.matrix.copy(this.springBone.bone.matrixWorld);let t=this.matrix.elements;this._geometry.worldScale=Kr.set(t[0],t[1],t[2]).length(),this._geometry.update(),super.updateMatrixWorld(e)}},Ke=class extends d.Object3D{constructor(e){super(),this.shape=e}},Zr=new d.Matrix4;function ii(c){return c.invert?c.invert():c.getInverse(Zr.copy(c)),c}var mn=class{get inverse(){return this._shouldUpdateInverse&&(this._inverseCache.copy(this.matrix),ii(this._inverseCache),this._shouldUpdateInverse=!1),this._inverseCache}constructor(e){this._inverseCache=new d.Matrix4,this._shouldUpdateInverse=!0,this.matrix=e;let t={set:(n,i,r)=>(this._shouldUpdateInverse=!0,n[i]=r,!0)};this._originalElements=e.elements,e.elements=new Proxy(e.elements,t)}revert(){this.matrix.elements=this._originalElements}},Jr=new d.Matrix4,V=new d.Vector3,he=new d.Vector3,eo=new d.Vector3,te=new d.Vector3,Kn=new d.Vector3,fe=new d.Vector3,Zn=new d.Quaternion,ne=new d.Matrix4,to=new d.Matrix4,gn=class{get center(){return this._center}set center(e){var t;!((t=this._center)===null||t===void 0)&&t.userData.inverseCacheProxy&&(this._center.userData.inverseCacheProxy.revert(),delete this._center.userData.inverseCacheProxy),this._center=e,this._center&&(this._center.userData.inverseCacheProxy||(this._center.userData.inverseCacheProxy=new mn(this._center.matrixWorld)))}get initialLocalChildPosition(){return this._initialLocalChildPosition}get _parentMatrixWorld(){return this.bone.parent?this.bone.parent.matrixWorld:Jr}constructor(e,t,n={},i=[]){var r,o,a,s,l,u;this._currentTail=new d.Vector3,this._prevTail=new d.Vector3,this._boneAxis=new d.Vector3,this._worldSpaceBoneLength=0,this._center=null,this._initialLocalMatrix=new d.Matrix4,this._initialLocalRotation=new d.Quaternion,this._initialLocalChildPosition=new d.Vector3,this.bone=e,this.bone.matrixAutoUpdate=!1,this.child=t,this.settings={hitRadius:(r=n.hitRadius)!==null&&r!==void 0?r:0,stiffness:(o=n.stiffness)!==null&&o!==void 0?o:1,gravityPower:(a=n.gravityPower)!==null&&a!==void 0?a:0,gravityDir:(l=(s=n.gravityDir)===null||s===void 0?void 0:s.clone())!==null&&l!==void 0?l:new d.Vector3(0,-1,0),dragForce:(u=n.dragForce)!==null&&u!==void 0?u:.4},this.colliderGroups=i}setInitState(){this._initialLocalMatrix.copy(this.bone.matrix),this._initialLocalRotation.copy(this.bone.quaternion),this.child?this._initialLocalChildPosition.copy(this.child.position):this._initialLocalChildPosition.copy(this.bone.position).normalize().multiplyScalar(.07);let e=this._getMatrixWorldToCenter(ne);this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(e),this._prevTail.copy(this._currentTail),this._boneAxis.copy(this._initialLocalChildPosition).normalize()}reset(){this.bone.quaternion.copy(this._initialLocalRotation),this.bone.updateMatrix(),this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld,this.bone.matrix);let e=this._getMatrixWorldToCenter(ne);this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(e),this._prevTail.copy(this._currentTail)}update(e){if(e<=0)return;this._calcWorldSpaceBoneLength(),te.setFromMatrixPosition(this.bone.matrixWorld);let t=this._getMatrixWorldToCenter(ne);Kn.copy(te).applyMatrix4(t);let n=Zn.setFromRotationMatrix(t),i=to.copy(t).multiply(this._parentMatrixWorld),r=he.copy(this._boneAxis).applyMatrix4(this._initialLocalMatrix).applyMatrix4(i).sub(Kn).normalize(),o=eo.copy(this.settings.gravityDir).applyQuaternion(n).normalize(),a=this._getMatrixCenterToWorld(ne);fe.copy(this._currentTail).add(V.copy(this._currentTail).sub(this._prevTail).multiplyScalar(1-this.settings.dragForce)).add(V.copy(r).multiplyScalar(this.settings.stiffness*e)).add(V.copy(o).multiplyScalar(this.settings.gravityPower*e)).applyMatrix4(a),fe.sub(te).normalize().multiplyScalar(this._worldSpaceBoneLength).add(te),this._collision(fe),t=this._getMatrixWorldToCenter(ne),this._prevTail.copy(this._currentTail),this._currentTail.copy(V.copy(fe).applyMatrix4(t));let s=ii(ne.copy(this._parentMatrixWorld).multiply(this._initialLocalMatrix)),l=Zn.setFromUnitVectors(this._boneAxis,V.copy(fe).applyMatrix4(s).normalize());this.bone.quaternion.copy(this._initialLocalRotation).multiply(l),this.bone.updateMatrix(),this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld,this.bone.matrix)}_collision(e){this.colliderGroups.forEach(t=>{t.colliders.forEach(n=>{let i=n.shape.calculateCollision(n.matrixWorld,e,this.settings.hitRadius,V);i<0&&(e.add(V.multiplyScalar(-i)),e.sub(te).normalize().multiplyScalar(this._worldSpaceBoneLength).add(te))})})}_calcWorldSpaceBoneLength(){V.setFromMatrixPosition(this.bone.matrixWorld),this.child?he.setFromMatrixPosition(this.child.matrixWorld):(he.copy(this._initialLocalChildPosition),he.applyMatrix4(this.bone.matrixWorld)),this._worldSpaceBoneLength=V.sub(he).length()}_getMatrixCenterToWorld(e){return this._center?e.copy(this._center.matrixWorld):e.identity(),e}_getMatrixWorldToCenter(e){return this._center?e.copy(this._center.userData.inverseCacheProxy.inverse):e.identity(),e}};function Ie(c,e,t,n){function i(r){return r instanceof t?r:new t(function(o){o(r)})}return new(t||(t=Promise))(function(r,o){function a(u){try{l(n.next(u))}catch(h){o(h)}}function s(u){try{l(n.throw(u))}catch(h){o(h)}}function l(u){u.done?r(u.value):i(u.value).then(a,s)}l((n=n.apply(c,e||[])).next())})}function no(c,e){let t=[],n=c;for(;n!==null;)t.unshift(n),n=n.parent;t.forEach(i=>{e(i)})}function ri(c,e){c.children.forEach(t=>{e(t)||ri(t,e)})}var Ze=class{constructor(){this._joints=new Set,this._objectSpringBonesMap=new Map}get joints(){return this._joints}get springBones(){return console.warn("VRMSpringBoneManager: springBones is deprecated. use joints instead."),this._joints}get colliderGroups(){let e=new Set;return this._joints.forEach(t=>{t.colliderGroups.forEach(n=>{e.add(n)})}),Array.from(e)}get colliders(){let e=new Set;return this.colliderGroups.forEach(t=>{t.colliders.forEach(n=>{e.add(n)})}),Array.from(e)}addJoint(e){this._joints.add(e);let t=this._objectSpringBonesMap.get(e.bone);t==null&&(t=new Set,this._objectSpringBonesMap.set(e.bone,t)),t.add(e)}addSpringBone(e){console.warn("VRMSpringBoneManager: addSpringBone() is deprecated. use addJoint() instead."),this.addJoint(e)}deleteJoint(e){this._joints.delete(e),this._objectSpringBonesMap.get(e.bone).delete(e)}deleteSpringBone(e){console.warn("VRMSpringBoneManager: deleteSpringBone() is deprecated. use deleteJoint() instead."),this.deleteJoint(e)}setInitState(){let e=new Set,t=new Set,n=new Set;for(let i of this._joints)this._processSpringBone(i,e,t,n,r=>r.setInitState())}reset(){let e=new Set,t=new Set,n=new Set;for(let i of this._joints)this._processSpringBone(i,e,t,n,r=>r.reset())}update(e){let t=new Set,n=new Set,i=new Set;for(let r of this._joints)this._processSpringBone(r,t,n,i,o=>o.update(e)),ri(r.bone,o=>{var a,s;return((s=(a=this._objectSpringBonesMap.get(o))===null||a===void 0?void 0:a.size)!==null&&s!==void 0?s:0)>0?!0:(o.updateWorldMatrix(!1,!1),!1)})}_processSpringBone(e,t,n,i,r){if(n.has(e))return;if(t.has(e))throw new Error("VRMSpringBoneManager: Circular dependency detected while updating springbones");t.add(e);let o=this._getDependencies(e);for(let a of o)no(a,s=>{let l=this._objectSpringBonesMap.get(s);if(l)for(let u of l)this._processSpringBone(u,t,n,i,r);else i.has(s)||(s.updateWorldMatrix(!1,!1),i.add(s))});e.bone.updateMatrix(),e.bone.updateWorldMatrix(!1,!1),r(e),i.add(e.bone),n.add(e)}_getDependencies(e){let t=new Set,n=e.bone.parent;return n&&t.add(n),e.colliderGroups.forEach(i=>{i.colliders.forEach(r=>{t.add(r)})}),t}},io=new Set(["1.0","1.0-beta"]),Je=class c{get name(){return c.EXTENSION_NAME}constructor(e,t){this.parser=e,this.jointHelperRoot=t?.jointHelperRoot,this.colliderHelperRoot=t?.colliderHelperRoot}afterRoot(e){return Ie(this,void 0,void 0,function*(){e.userData.vrmSpringBoneManager=yield this._import(e)})}_import(e){return Ie(this,void 0,void 0,function*(){let t=yield this._v1Import(e);if(t!=null)return t;let n=yield this._v0Import(e);return n??null})}_v1Import(e){var t,n,i,r,o;return Ie(this,void 0,void 0,function*(){let a=e.parser.json;if(!(((t=a.extensionsUsed)===null||t===void 0?void 0:t.indexOf(c.EXTENSION_NAME))!==-1))return null;let l=new Ze,u=yield e.parser.getDependencies("node"),h=(n=a.extensions)===null||n===void 0?void 0:n[c.EXTENSION_NAME];if(!h)return null;let p=h.specVersion;if(!io.has(p))return console.warn(`VRMSpringBoneLoaderPlugin: Unknown ${c.EXTENSION_NAME} specVersion "${p}"`),null;let m=(i=h.colliders)===null||i===void 0?void 0:i.map((g,E)=>{var _,x,R,T,A;let y=u[g.node],M=g.shape;if(M.sphere)return this._importSphereCollider(y,{offset:new d.Vector3().fromArray((_=M.sphere.offset)!==null&&_!==void 0?_:[0,0,0]),radius:(x=M.sphere.radius)!==null&&x!==void 0?x:0});if(M.capsule)return this._importCapsuleCollider(y,{offset:new d.Vector3().fromArray((R=M.capsule.offset)!==null&&R!==void 0?R:[0,0,0]),radius:(T=M.capsule.radius)!==null&&T!==void 0?T:0,tail:new d.Vector3().fromArray((A=M.capsule.tail)!==null&&A!==void 0?A:[0,0,0])});throw new Error(`VRMSpringBoneLoaderPlugin: The collider #${E} has no valid shape`)}),v=(r=h.colliderGroups)===null||r===void 0?void 0:r.map((g,E)=>{var _;return{colliders:((_=g.colliders)!==null&&_!==void 0?_:[]).map(R=>{let T=m?.[R];if(T==null)throw new Error(`VRMSpringBoneLoaderPlugin: The colliderGroup #${E} attempted to use a collider #${R} but not found`);return T}),name:g.name}});return(o=h.springs)===null||o===void 0||o.forEach((g,E)=>{var _;let x=g.joints,R=(_=g.colliderGroups)===null||_===void 0?void 0:_.map(y=>{let M=v?.[y];if(M==null)throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${E} attempted to use a colliderGroup ${y} but not found`);return M}),T=g.center!=null?u[g.center]:void 0,A;x.forEach(y=>{if(A){let M=A.node,b=u[M],L=y.node,I=u[L],P={hitRadius:A.hitRadius,dragForce:A.dragForce,gravityPower:A.gravityPower,stiffness:A.stiffness,gravityDir:A.gravityDir!=null?new d.Vector3().fromArray(A.gravityDir):void 0},N=this._importJoint(b,I,P,R);T&&(N.center=T),l.addJoint(N)}A=y})}),l.setInitState(),l})}_v0Import(e){var t,n,i;return Ie(this,void 0,void 0,function*(){let r=e.parser.json;if(!(((t=r.extensionsUsed)===null||t===void 0?void 0:t.indexOf("VRM"))!==-1))return null;let a=(n=r.extensions)===null||n===void 0?void 0:n.VRM,s=a?.secondaryAnimation;if(!s)return null;let l=s?.boneGroups;if(!l)return null;let u=new Ze,h=yield e.parser.getDependencies("node"),p=(i=s.colliderGroups)===null||i===void 0?void 0:i.map(m=>{var v;let g=h[m.node];return{colliders:((v=m.colliders)!==null&&v!==void 0?v:[]).map((_,x)=>{var R,T,A;let y=new d.Vector3(0,0,0);return _.offset&&y.set((R=_.offset.x)!==null&&R!==void 0?R:0,(T=_.offset.y)!==null&&T!==void 0?T:0,_.offset.z?-_.offset.z:0),this._importSphereCollider(g,{offset:y,radius:(A=_.radius)!==null&&A!==void 0?A:0})})}});return l?.forEach((m,v)=>{let g=m.bones;g&&g.forEach(E=>{var _,x,R,T;let A=h[E],y=new d.Vector3;m.gravityDir?y.set((_=m.gravityDir.x)!==null&&_!==void 0?_:0,(x=m.gravityDir.y)!==null&&x!==void 0?x:0,(R=m.gravityDir.z)!==null&&R!==void 0?R:0):y.set(0,-1,0);let M=m.center!=null?h[m.center]:void 0,b={hitRadius:m.hitRadius,dragForce:m.dragForce,gravityPower:m.gravityPower,stiffness:m.stiffiness,gravityDir:y},L=(T=m.colliderGroups)===null||T===void 0?void 0:T.map(I=>{let P=p?.[I];if(P==null)throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${v} attempted to use a colliderGroup ${I} but not found`);return P});A.traverse(I=>{var P;let N=(P=I.children[0])!==null&&P!==void 0?P:null,H=this._importJoint(I,N,b,L);M&&(H.center=M),u.addJoint(H)})})}),e.scene.updateMatrixWorld(),u.setInitState(),u})}_importJoint(e,t,n,i){let r=new gn(e,t,n,i);if(this.jointHelperRoot){let o=new pn(r);this.jointHelperRoot.add(o),o.renderOrder=this.jointHelperRoot.renderOrder}return r}_importSphereCollider(e,t){let{offset:n,radius:i}=t,r=new Ye({offset:n,radius:i}),o=new Ke(r);if(e.add(o),this.colliderHelperRoot){let a=new $e(o);this.colliderHelperRoot.add(a),a.renderOrder=this.colliderHelperRoot.renderOrder}return o}_importCapsuleCollider(e,t){let{offset:n,radius:i,tail:r}=t,o=new Qe({offset:n,radius:i,tail:r}),a=new Ke(o);if(e.add(a),this.colliderHelperRoot){let s=new $e(a);this.colliderHelperRoot.add(s),s.renderOrder=this.colliderHelperRoot.renderOrder}return a}};Je.EXTENSION_NAME="VRMC_springBone";var et=class{get name(){return"VRMLoaderPlugin"}constructor(e,t){var n,i,r,o,a,s,l,u,h,p;this.parser=e;let m=t?.helperRoot,v=t?.autoUpdateHumanBones;this.expressionPlugin=(n=t?.expressionPlugin)!==null&&n!==void 0?n:new Ce(e),this.firstPersonPlugin=(i=t?.firstPersonPlugin)!==null&&i!==void 0?i:new Yt(e),this.humanoidPlugin=(r=t?.humanoidPlugin)!==null&&r!==void 0?r:new $t(e,{helperRoot:m,autoUpdateHumanBones:v}),this.lookAtPlugin=(o=t?.lookAtPlugin)!==null&&o!==void 0?o:new en(e,{helperRoot:m}),this.metaPlugin=(a=t?.metaPlugin)!==null&&a!==void 0?a:new tn(e),this.mtoonMaterialPlugin=(s=t?.mtoonMaterialPlugin)!==null&&s!==void 0?s:new je(e),this.materialsHDREmissiveMultiplierPlugin=(l=t?.materialsHDREmissiveMultiplierPlugin)!==null&&l!==void 0?l:new ze(e),this.materialsV0CompatPlugin=(u=t?.materialsV0CompatPlugin)!==null&&u!==void 0?u:new sn(e),this.springBonePlugin=(h=t?.springBonePlugin)!==null&&h!==void 0?h:new Je(e,{colliderHelperRoot:m,jointHelperRoot:m}),this.nodeConstraintPlugin=(p=t?.nodeConstraintPlugin)!==null&&p!==void 0?p:new Xe(e,{helperRoot:m})}beforeRoot(){return be(this,void 0,void 0,function*(){yield this.materialsV0CompatPlugin.beforeRoot(),yield this.mtoonMaterialPlugin.beforeRoot()})}loadMesh(e){return be(this,void 0,void 0,function*(){return yield this.mtoonMaterialPlugin.loadMesh(e)})}getMaterialType(e){let t=this.mtoonMaterialPlugin.getMaterialType(e);return t??null}extendMaterialParams(e,t){return be(this,void 0,void 0,function*(){yield this.materialsHDREmissiveMultiplierPlugin.extendMaterialParams(e,t),yield this.mtoonMaterialPlugin.extendMaterialParams(e,t)})}afterRoot(e){return be(this,void 0,void 0,function*(){yield this.metaPlugin.afterRoot(e),yield this.humanoidPlugin.afterRoot(e),yield this.expressionPlugin.afterRoot(e),yield this.lookAtPlugin.afterRoot(e),yield this.firstPersonPlugin.afterRoot(e),yield this.springBonePlugin.afterRoot(e),yield this.nodeConstraintPlugin.afterRoot(e),yield this.mtoonMaterialPlugin.afterRoot(e);let t=e.userData.vrmMeta,n=e.userData.vrmHumanoid;if(t&&n){let i=new rn({scene:e.scene,expressionManager:e.userData.vrmExpressionManager,firstPerson:e.userData.vrmFirstPerson,humanoid:n,lookAt:e.userData.vrmLookAt,meta:t,materials:e.userData.vrmMToonMaterials,springBoneManager:e.userData.vrmSpringBoneManager,nodeConstraintManager:e.userData.vrmNodeConstraintManager});e.userData.vrm=i}})}};function Jn(c){if(Object.values(c).forEach(e=>{e?.isTexture&&e.dispose()}),c.isShaderMaterial){let e=c.uniforms;e&&Object.values(e).forEach(t=>{let n=t.value;n?.isTexture&&n.dispose()})}c.dispose()}function ro(c){let e=c.geometry;e&&e.dispose();let t=c.skeleton;t&&t.dispose();let n=c.material;n&&(Array.isArray(n)?n.forEach(i=>Jn(i)):n&&Jn(n))}function oo(c){c.traverse(ro)}function so(c){let e=new Map;c.traverse(t=>{if(t.type!=="SkinnedMesh")return;let n=t,r=n.geometry.getAttribute("skinIndex"),o=e.get(r);if(!o){let a=[],s=[],l={},u=r.array;for(let h=0;h<u.length;h++){let p=u[h];l[p]===void 0&&(l[p]=a.length,a.push(n.skeleton.bones[p]),s.push(n.skeleton.boneInverses[p])),u[h]=l[p]}r.copyArray(u),r.needsUpdate=!0,o=new d.Skeleton(a,s),e.set(r,o)}n.bind(o,new d.Matrix4)})}function ao(c){let e=new Map;c.traverse(t=>{var n,i,r,o;if(!t.isMesh)return;let a=t,s=a.geometry,l=s.index;if(l==null)return;let u=e.get(s);if(u!=null){a.geometry=u;return}let h=new d.BufferGeometry;h.name=s.name,h.morphTargetsRelative=s.morphTargetsRelative,s.groups.forEach(g=>{h.addGroup(g.start,g.count,g.materialIndex)}),h.boundingBox=(i=(n=s.boundingBox)===null||n===void 0?void 0:n.clone())!==null&&i!==void 0?i:null,h.boundingSphere=(o=(r=s.boundingSphere)===null||r===void 0?void 0:r.clone())!==null&&o!==void 0?o:null,h.setDrawRange(s.drawRange.start,s.drawRange.count),h.userData=s.userData,e.set(s,h);let p=[],m=[];{let g=l.array,E=new g.constructor(g.length),_=0;for(let x=0;x<g.length;x++){let R=g[x],T=p[R];T==null&&(p[R]=_,m[_]=R,T=_,_++),E[x]=T}h.setIndex(new Pe.BufferAttribute(E,1,!1))}Object.keys(s.attributes).forEach(g=>{let E=s.attributes[g];if(E.isInterleavedBufferAttribute)throw new Error("removeUnnecessaryVertices: InterleavedBufferAttribute is not supported");let _=E.array,{itemSize:x,normalized:R}=E,T=new _.constructor(m.length*x);m.forEach((A,y)=>{for(let M=0;M<x;M++)T[y*x+M]=_[A*x+M]}),h.setAttribute(g,new Pe.BufferAttribute(T,x,R))});let v=!0;Object.keys(s.morphAttributes).forEach(g=>{h.morphAttributes[g]=[];let E=s.morphAttributes[g];for(let _=0;_<E.length;_++){let x=E[_];if(x.isInterleavedBufferAttribute)throw new Error("removeUnnecessaryVertices: InterleavedBufferAttribute is not supported");let R=x.array,{itemSize:T,normalized:A}=x,y=new R.constructor(m.length*T);m.forEach((M,b)=>{for(let L=0;L<T;L++)y[b*T+L]=R[M*T+L]}),v=v&&y.every(M=>M===0),h.morphAttributes[g][_]=new Pe.BufferAttribute(y,T,A)}}),v&&(h.morphAttributes={}),a.geometry=h}),Array.from(e.keys()).forEach(t=>{t.dispose()})}function lo(c){var e;((e=c.meta)===null||e===void 0?void 0:e.metaVersion)==="0"&&(c.scene.rotation.y=Math.PI)}var G=class{constructor(){}};G.deepDispose=oo;G.removeUnnecessaryJoints=so;G.removeUnnecessaryVertices=ao;G.rotateVRM0=lo;window.THREE_VRM={GLTFLoader:ye,VRMLoaderPlugin:et,VRMUtils:G};})();
/*! Bundled license information:

@pixiv/three-vrm/lib/three-vrm.module.js:
  (*!
   * @pixiv/three-vrm v1.0.10
   * VRM file loader for three.js.
   *
   * Copyright (c) 2019-2023 pixiv Inc.
   * @pixiv/three-vrm is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-core v1.0.10
   * The implementation of core features of VRM, for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-core is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)

@pixiv/three-vrm/lib/three-vrm.module.js:
  (*!
   * @pixiv/three-vrm-materials-mtoon v1.0.10
   * MToon (toon material) module for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-materials-mtoon is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-materials-hdr-emissive-multiplier v1.0.10
   * Support VRMC_hdr_emissiveMultiplier for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-materials-hdr-emissive-multiplier is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-materials-v0compat v1.0.10
   * VRM0.0 materials compatibility layer plugin for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-materials-v0compat is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-node-constraint v1.0.10
   * Node constraint module for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-node-constraint is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
  (*!
   * @pixiv/three-vrm-springbone v1.0.10
   * Spring bone module for @pixiv/three-vrm
   *
   * Copyright (c) 2020-2023 pixiv Inc.
   * @pixiv/three-vrm-springbone is distributed under MIT License
   * https://github.com/pixiv/three-vrm/blob/release/LICENSE
   *)
*/
