// Shared lazy dependency. No engine load on the default page.
const URL="https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/dist/rapier.mjs";
let pending;
export function loadRapier(){
  if(!pending){
    pending=import(URL).then(async module=>{
      const R=module.default??module;
      await R.init();
      return R;
    }).catch(error=>{pending=undefined;throw error;});
  }
  return pending;
}
