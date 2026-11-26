// Original procedural studio environment. No remote images or new dependencies.
// All optical parameters are visual approximations, not measured machine specifications.
const PALETTES=Object.freeze({
  studio:{background:0x172940,ambient:0xe5f4ff,ground:0x3e4258,key:0xfff4e6,fill:0x83ceff,rim:0xbea0ff,warm:0xffca82,exposure:1.05},
  neutral:{background:0x34434e,ambient:0xffffff,ground:0x67717d,key:0xffffff,fill:0xf2f8ff,rim:0xd8e5ef,warm:0xffffff,exposure:1.0},
  evening:{background:0x191d3c,ambient:0xc4d6ff,ground:0x4b315e,key:0xe8e9ff,fill:0x55c7ff,rim:0xc492ff,warm:0xffad68,exposure:1.1}
});
export function studioPalette(name){
  if(!Object.hasOwn(PALETTES,name))throw RangeError("Invalid lighting");
  return {...PALETTES[name]};
}

export function createStudioEnvironment(T,renderer){
  const room=new T.Scene();
  room.background=new T.Color(0x263448);
  const geometry=new T.PlaneGeometry(1,1);
  const materials=[];
  const panels=[
    {position:[-4,3,4],size:[4,5],color:0xfff4e6,intensity:3.5},
    {position:[4,2,3],size:[2,5],color:0xb2deff,intensity:2.6},
    {position:[0,5,0],size:[7,2],color:0xffffff,intensity:4.1},
    {position:[-4,1,-3],size:[1,5],color:0x58cfff,intensity:2.4},
    {position:[4,1,-3],size:[1,5],color:0xb693ff,intensity:2.2},
    {position:[0,-4,0],size:[8,8],color:0x728797,intensity:.6}
  ];
  let generator;
  try{
    for(const panel of panels){
      const material=new T.MeshBasicMaterial({color:new T.Color(panel.color).multiplyScalar(panel.intensity),side:T.DoubleSide});
      materials.push(material);
      const mesh=new T.Mesh(geometry,material);
      mesh.position.set(...panel.position);
      mesh.scale.set(...panel.size,1);
      mesh.lookAt(0,0,0);
      room.add(mesh);
    }
    generator=new T.PMREMGenerator(renderer);
    return generator.fromScene(room,.045,.1,20,{size:128});
  }finally{
    generator?.dispose();
    geometry.dispose();
    for(const material of materials)material.dispose();
  }
}

export function createBrushedTexture(T){
  // Deterministic roughness variation: horizontal micro-stripes, not a color map.
  const w=128,h=128,bytes=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const value=Math.round(155+32*Math.sin(y*2.11)+9*Math.sin(x*.17+y*.7));
    const at=(y*w+x)*4;
    bytes[at]=bytes[at+1]=bytes[at+2]=value;
    bytes[at+3]=255;
  }
  const texture=new T.DataTexture(bytes,w,h,T.RGBAFormat);
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.repeat.set(2,4);
  texture.magFilter=T.LinearFilter;
  texture.minFilter=T.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;
  texture.needsUpdate=true;
  return texture;
}
