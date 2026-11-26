import {drawSum} from "./draw-sum.mjs";
export const ARCHIVE_KEY="fc3d-simulation-archive-v1", ARCHIVE_LIMIT=1000;
export function normalizeArchive(rows){
  if(!Array.isArray(rows)) throw new TypeError("Invalid archive");
  const unique=new Map();
  for(const row of rows){
    if(!row || typeof row.id!=="string" || !/^[a-f0-9]{32}$/.test(row.id) ||
       typeof row.at!=="string" || !Number.isFinite(Date.parse(row.at)) ||
       typeof row.number!=="string" || !/^[0-9]{3}$/.test(row.number)) throw new TypeError("Invalid record");
    unique.set(row.id,{id:row.id,at:new Date(row.at).toISOString(),number:row.number,sum:drawSum(row.number)});
  }
  return [...unique.values()].sort((a,b)=>b.at.localeCompare(a.at)||b.id.localeCompare(a.id)).slice(0,ARCHIVE_LIMIT);
}

export function readArchive(storage){
  const raw=storage.getItem(ARCHIVE_KEY);
  if(raw===null)return [];
  const parsed=JSON.parse(raw);
  if(parsed?.version!==1)throw new TypeError("Unknown archive version");
  return normalizeArchive(parsed.records);
}

export function saveArchive(storage,rows){
  const records=normalizeArchive([...readArchive(storage),...rows]);
  storage.setItem(ARCHIVE_KEY,JSON.stringify({version:1,records}));
  return records;
}
