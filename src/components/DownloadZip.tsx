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
        let set = new Set();
        let flag = true;
        let zip = new JSZip();
        for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            if (set.has(obj.name)) {
                alert("There are recordings of same name. please change the name!");
                flag = false;
                break;
            }
            set.add(obj.name);
            zip.file(obj.name + ".webm", obj.blob);
        }
        if (flag) {
            zip.generateAsync({ type: "blob" }).then(function (content: string | Blob) {
                saveAs(content, "Sound.zip");
            });
        }
        
    }

    render() {
        const { list, disabled } = this.props;
        return (
            <button disabled={disabled} onClick={()=>this.downAllRecord(list)}>打包下载</ button>
            )
    }
}
export default DownloadZip;