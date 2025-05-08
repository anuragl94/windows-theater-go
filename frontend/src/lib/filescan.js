import { ListVideoFiles } from "../../wailsjs/go/main/App";
import { parse as parseTorrentName } from 'parse-torrent-title';

export async function generateDatabaseFromDirectory(directory) {
  const result = await ListVideoFiles(directory);
  const pathFixedFilesList = result.map(f => f.replaceAll("\\", "/"));
  const db = generateDatabaseFromFiles(pathFixedFilesList);
  return db;
}

function generateDatabaseFromFiles(files) {
  if (!files.length) {
    return;
  }
  const db = {};
  files.forEach(filePath => {
      const fileData = parseTorrentName(filePath.split("/").at(-1));
      fileData.title = fileData.title.replace(/\.$/, "");
      fileData.path = filePath;
      if (!db.hasOwnProperty(fileData.title)) {
          if ('episode' in fileData) {
              db[fileData.title] = {
                episodes: [fileData]
              }
          } else {
              db[fileData.title] = fileData;
          }
      } else {
          db[fileData.title].episodes.push(fileData);
      }
  });
  // Let's inefficiently sort the episodes into seasons as well
  for (const title in db) {
    if (db[title].episodes) {
      const seasonsCount = db[title].episodes.reduce((acc, cur) => Math.max(acc, cur.season), 1);
      db[title].seasons = Array(5).fill([]);
      for (const episodeData of db[title].episodes) {
        db[title].seasons[episodeData.season - 1].push(episodeData);
      }
      delete db[title].episodes;
    }
  }
  return db;
}