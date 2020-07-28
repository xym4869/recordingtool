import * as React from "react";
import { textItem } from "./RecordModel";

interface Props {
  list: Array<textItem>;
  selectSentence: (state: object) => void;
  deleteRecord: (state: object) => void;
}

async function downloadAudio(src: string, index: number) {
  const blob = await getBlob(src);
  saveAs(blob, index + 1 + ".webm");
}

function getBlob(url: string): Promise<Blob> {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    xhr.send();
  });
}

export const RecordList = (props: Props) => {
  let audioList = props.list.map((listItem: textItem) => (
    <li key={listItem.id}>
      <p> {listItem.index + 1 + "." + listItem.text} </p>
      {!listItem.audio ? <p>This voice is not recorded</p> : <audio controls src={listItem.src} />}
      <button
        onClick={() =>
          props.selectSentence({
            fileId: listItem.fileId,
            id: listItem.id,
          })
        }
      >
        select
      </button>
      <button
        onClick={() =>
          props.deleteRecord({
            fileId: listItem.fileId,
            id: listItem.id,
          })
        }
      >
        delete
      </button>
      {listItem.audio && <button onClick={() => downloadAudio(listItem.src, listItem.index)}>download</button>}
    </li>
  ));
  return <ul className="list-group">{audioList}</ul>;
};
