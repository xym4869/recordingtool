import { Component } from "react";
import * as React from 'react';
import JSZip from "jszip";
import { saveAs } from 'file-saver';

class DownloadZip extends Component<any, any> {
    constructor(props: any) {
        super(props)
        this.downAllRecord = this.downAllRecord.bind(this)
    }

    downAllRecord(data: any) {
        let zip = new JSZip();
        for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            if(obj.audio)
                zip.file(obj.index + ".webm", obj.blob);
        }
        zip.generateAsync({ type: "blob" }).then(function (content: Blob) {
            saveAs(content, "Sound.zip");
        });
    }

    getBlob(url: string) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onload = function () {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                }
            };
            xhr.send();
        });
    }

    render() {
        const { list, disabled } = this.props;
        return (
            <button disabled={disabled} onClick={()=>this.downAllRecord(list)}>Expert .zip</ button>
            )
    }
}
export default DownloadZip;