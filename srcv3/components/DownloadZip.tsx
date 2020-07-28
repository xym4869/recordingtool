import * as React from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { textItem } from "./RecordModel";

interface Prop {
  list: Array<textItem>;
  disabled: boolean;
}

async function downAllRecord(data: Array<textItem>) {
  let zip = new JSZip();
  for (let i = 0; i < data.length; i++) {
    const obj = data[i];
    if (obj.audio) zip.file(obj.index + 1 + ".webm", getBlob(obj.src));
  }
  zip.generateAsync({ type: "blob" }).then(function(content: Blob) {
    saveAs(content, "Sound.zip");
  });
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

export const DownloadZip = (props: Prop) => {
  return (
    <button disabled={props.disabled} onClick={() => downAllRecord(props.list)}>
      Expert .zip
    </button>
  );
};
