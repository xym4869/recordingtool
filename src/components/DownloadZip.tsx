import * as React from 'react';
import JSZip from "jszip";
import { saveAs } from 'file-saver';

interface Prop {
    list: any;
    disabled: boolean
}

function downAllRecord(data: any) {
    let zip = new JSZip();
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        if (obj.audio)
            zip.file(obj.index + ".webm", obj.blob);
    }
    zip.generateAsync({ type: "blob" }).then(function (content: Blob) {
        saveAs(content, "Sound.zip");
    });
}

export const DownloadZip = (props: Prop) => {
    return (
        <button
            disabled={props.disabled}
            onClick={() => downAllRecord(props.list)}>Expert .zip</ button>
    );

};