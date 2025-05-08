import { useEffect, useRef, useState } from 'react';
import { SearchTMDB } from '../../wailsjs/go/main/App';
import { useDropTarget } from '@wailsapp/runtime';

const MEDIA_TYPES = {
  "movie": "Movie",
  "tv": "Series"
};

function saveToDB(directory, data) {

}

export default function DBManager(props) {
  const [searchResults, setSearchResults] = useState([]);
  const dropzone = useRef();

  // const preventDefaults = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // }

  const handleFolderDrop = (e) => {
  //   preventDefaults(e);

  //   const items = e.dataTransfer.items;

  //   // Loop through dropped items
  //   for (let i = 0; i < items.length; i++) {
  //     // Ensure item is a directory
  //     if (items[i].webkitGetAsEntry) {
  //       const entry = items[i].webkitGetAsEntry();
  //       if (entry && entry.isDirectory) {
  //         console.log(entry)
  //         SearchTMDB(entry.name).then(response => {
  //           const formattedResponse = JSON.parse(response)?.results;
  //           console.log(formattedResponse);
  //           if (formattedResponse) {
  //             setSearchResults(formattedResponse);
  //           }
  //         });
  //       } else {
  //         console.log("Not a folder");
  //       }
  //     }
  //   }
  };

  // useEffect(() => {
  //   if (dropzone && dropzone.current) {
  //     const targetEl = dropzone.current;
  //     targetEl.addEventListener("drop", handleFolderDrop, false);
  //     targetEl.addEventListener("dragover", preventDefaults, false);
  //     targetEl.addEventListener("dragleave", preventDefaults, false);
  //     console.log("dropzone init");
  //     return () => {
  //       targetEl.removeEventListener("drop", handleFolderDrop, false);
  //       targetEl.removeEventListener("dragover", preventDefaults, false);
  //       targetEl.removeEventListener("dragleave", preventDefaults, false);
  //     };
  //   }
  // }, []);

  // useDropTarget({
  //   onDrop: (files) => {
  //     console.log("Dropped files:", files);

  //     // Store the file path of the first dropped folder/file
  //     if (files.length > 0) {
  //       const file = files[0];
  //       setFolderPath(file.path);
        
  //       // Optionally, send the folder path to the backend for processing
  //       window.backend.App.HandleDroppedFolder(file.path)
  //         .then(response => {
  //           console.log(response);
  //         })
  //         .catch(error => {
  //           console.error("Error handling folder:", error);
  //         });
  //     }

  //     // Store all dropped files/folders in the state for display
  //     setDroppedFiles(files.map(file => file.path));
  //   },
  //   onDragEnter: () => {
  //     console.log("Drag enter");
  //   },
  //   onDragLeave: () => {
  //     console.log("Drag leave");
  //   }
  // });

  return (
    <div>
      {searchResults.length ? (
        <>
          <div>Choose an option:</div>
          {searchResults.map((entry, index) => <SearchResult key={index} data={entry} onSelect={() => saveToDB(entry)} />)}
        </>
      ) : (
        <div className="dropzone" ref={dropzone}>
          Drop folder here
        </div>
      )}
    </div>
  )
}

function SearchResult(props) {
  const { data } = props;
  console.log(data);
  return (
    <div style={{ display: "flex", flexDirection: "row", marginInline: "48px", marginBottom: "24px", cursor: "pointer" }}>
      <img src={`http://image.tmdb.org/t/p/w500/${data.poster_path}`} height="150px"></img>
      <div>
        <h4>{data.name || data.original_name || data.original_title} ({MEDIA_TYPES[data.media_type]}) - {data.vote_average}/10</h4>
        <hr></hr>
        <div>{data.overview}</div>
      </div>
    </div>
  );
}