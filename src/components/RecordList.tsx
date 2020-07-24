import * as React from 'react';
import { textItem } from './RecordModel'

interface Props {
    list: any;
    selectSentence: (state : object) => void;
    deleteRecord: (state: object) => void;
}

const downloadAudio = (blob: Blob, index: number) => {
    saveAs(blob, index + ".webm")
}

export const RecordList = (props: Props) => {
    let audioList = props.list.map((listItem: textItem) =>
        <li key={listItem.id}>
            <p> {listItem.index + '.' + listItem.text} </p>
            {!listItem.audio ?
                <p>This voice is not recorded</p> :
                <audio controls src={listItem.src} />}
            <button onClick={() => props.selectSentence({
                fileId: listItem.fileId,
                id: listItem.id
            })}>select</button>
            <button onClick={() => props.deleteRecord({
                fileId: listItem.fileId,
                id: listItem.id
            })}>delete</button>
            {listItem.audio &&
                <button onClick={() => downloadAudio(listItem.blob, listItem.index)}>download</button>}
        </li>
    );
    return (
        <ul className="list-group">
            {audioList}
        </ul>
    );

};