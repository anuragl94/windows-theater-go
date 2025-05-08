import { useEffect, useState } from 'react';
import { generateDatabaseFromDirectory } from '../lib/filescan';
import Player from './Player';

export default function Gallery(props) {
  const [selectedMedia, setSelectedMedia] = useState('');
  const [database, setDatabase] = useState({});
  const mediaList = Object.keys(database);

  useEffect(() => {
    generateDatabaseFromDirectory(props.defaultDir).then(setDatabase);
  }, [props.defaultDir]);

  return (
      <div>
          {selectedMedia ? <Player metadata={database[selectedMedia]} onClose={() => { setSelectedMedia('') }} /> : 
          <ul>
              {mediaList.map(title => <li key={title} onClick={() => setSelectedMedia(title)}>{title}</li>)}
          </ul>}
      </div>
  )
}
