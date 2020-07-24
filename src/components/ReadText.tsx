import { useState } from "react";
import * as React from 'react';
import { v1 as uuidv1 } from 'uuid';
import { textItem, fileItem } from './RecordModel'

interface Props {
    list: any;
    handleAddText: (state: Array<fileItem>) => void;
    handleDeleteText: (state: object) => void;
    handleSelectText: (item: object) => void;
}

export const ReadText = (props: Props) => {
    const [fileList, setFileList] = useState(props.list)

    const readFile = (e: any) => {
        const reader = new FileReader();
        let input = e.target.files[0];
        reader.readAsText(input);
        reader.onload = function (e: { target: { result: any; }; }) {
            let text = e.target.result;
            let arr = (text as string).split("\n");
            let newArr = arr.filter(i => i && i.trim())
            let itemList: textItem[] = []
            let fileId = uuidv1();
            newArr.forEach((newarr, index) => {
                let newItem = {
                    fileId: fileId,
                    id: uuidv1(),
                    index: index,
                    text: newarr,
                    src: "",
                    blob: new Blob,
                    audio: false
                }
                itemList.push(newItem)
            })
            let item = {
                uid: fileId,
                name: input.name,
                text: itemList
            }
            let list = [...fileList, item];
            setFileList(list)
            props.handleAddText(list)
        };
    };

    const selectFile = (uid: string) => {
        let list = fileList;
        list = list.filter((file: { uid: string; }) => file.uid === uid)
        let file = list[0];
        props.handleSelectText(file)
    };

    const deleteFile = (uid: string) => {
        let list = fileList;
        list = list.filter((file: { uid: string; }) => file.uid !== uid)
        setFileList(list)
        props.handleDeleteText({ uid, list })
    };

    let list = fileList.map((fItem: fileItem) => 
        <li key={fItem.uid}>
            <p>{fItem.name}</p>
            <button onClick={() => selectFile(fItem.uid)}>Select</button>
            <button onClick={() => deleteFile(fItem.uid)}>Delete</button>
        </li>
    );

    return (
        <div>
            <input type="file" accept='text/plain' onChange={readFile} />
            {fileList.length !== 0 &&
                <ul className="filelist-group">
                    {list}
                </ul>
            }
        </div>
    );
    

};