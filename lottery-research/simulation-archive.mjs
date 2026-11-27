import {drawSum} from "./draw-sum.mjs";
export const ARCHIVE_KEY="fc3d-simulation-archive-v1", ARCHIVE_LIMIT=1000;
export function normalizeArchive(rows){
  if(!Array.isArray(rows)) throw new TypeError("Invalid archive");
  const unique=new Map();
  for(const row of rows){
    if(!row || typeof row.id!=="string" || !/^[a-f0-9]{32}$/.test(row.id) ||
       typeof row.at!=="string" || !Number.isFinite(Date.parse(row.at)) ||
       typeof row.number!=="string" || !/^[0-9]{3}$/.test(row.number)) throw new TypeError("Invalid record");
    if(row.sequence!==undefined && (!Number.isSafeInteger(row.sequence) || row.sequence<1)) throw new TypeError("Invalid record sequence");
    const normalized={id:row.id,at:new Date(row.at).toISOString(),number:row.number,sum:drawSum(row.number)};
    if(row.sequence!==undefined)normalized.sequence=row.sequence;
    unique.set(row.id,normalized);
  }
  // Several completed samples may share a millisecond. Keep their actual draw order
  // rather than sorting equal timestamps by random identifier.
  return [...unique.values()].sort((a,b)=>b.at.localeCompare(a.at)||(b.sequence||0)-(a.sequence||0)||b.id.localeCompare(a.id)).slice(0,ARCHIVE_LIMIT);
}

function decodeArchive(raw) {
  const parsed=JSON.parse(raw);
  if(parsed?.version!==1)throw new TypeError("Unknown archive version");
  if(!Array.isArray(parsed.records))throw new TypeError("Invalid archive");
  return parsed.records;
}

export function readArchive(storage){
  const raw=storage.getItem(ARCHIVE_KEY);
  return raw===null ? [] : normalizeArchive(decodeArchive(raw));
}

export function parseArchiveBackup(raw) {
  const rows = decodeArchive(raw);
  if (rows.length > ARCHIVE_LIMIT) throw new RangeError("Backup exceeds archive limit");
  return normalizeArchive(rows);
}

export function mergeArchiveBackup(storage, backup, pending = []) {
  const current = new Map(readArchive(storage).map(row => [row.id, row]));
  for (const row of pending) current.set(row.id, row);
  const before = current.size;
  for (const row of backup) {
    if (!current.has(row.id)) current.set(row.id, row);
  }
  if (current.size > ARCHIVE_LIMIT) throw new RangeError("Merged archive exceeds archive limit");
  const records = normalizeArchive([...current.values()]);
  const added = current.size - before;
  if (added || pending.length) storage.setItem(ARCHIVE_KEY, JSON.stringify({version: 1, records}));
  return {records, added};
}

export function saveArchive(storage,rows){
  const records=normalizeArchive([...readArchive(storage),...rows]);
  storage.setItem(ARCHIVE_KEY,JSON.stringify({version:1,records}));
  return records;
}
