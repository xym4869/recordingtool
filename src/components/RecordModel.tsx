import { useState } from "react";
import * as React from "react";
import { AddRecord } from "./AddRecord";
import { RecordList } from "./RecordList";
import { DownloadZip } from "./DownloadZip";
import { ReadText } from "./ReadText";
import { v1 as uuidv1 } from "uuid";

export interface textItem {
  fileId: string;
  id: string;
  index: number;
  text: string;
  src: string;
  audio: boolean;
}

export interface fileItem {
  uid: string;
  name: string;
  text: Array<textItem>;
}

const uidExample = uuidv1();
const exampleFile: fileItem[] = [
  {
    uid: uidExample,
    name: "hhh.txt",
    text: [
      {
        fileId: uidExample,
        id: uuidv1(),
        index: 0,
        text: "just an example",
        src: "",
        audio: false,
      },
      {
        fileId: uidExample,
        id: uuidv1(),
        index: 1,
        text: "just an another example",
        src: "",
        audio: false,
      },
    ],
  },
];

export const RecordModel = () => {
  const [fileList, setFileList] = useState(exampleFile);
  const [item, setItem] = useState({} as textItem);
  const [textList, setTextList] = useState([] as Array<textItem>);
  const [disabled, setDisabled] = useState(true);
  const [startAudio, setStartAudio] = useState(false);

  const selectSentence = (selectText: { fileId: string; id: string }) => {
    let tempList = textList;
    tempList = tempList.filter((sentence: { id: string }) => sentence.id === selectText.id);
    setItem(tempList[0]);
    setStartAudio(true);
  };

  const handleAddText = (file: Array<fileItem>) => {
    setFileList(file);
  };

  const handleDeleteText = (file: { uid: string; list: Array<fileItem> }) => {
    setFileList(file.list);
    if (textList.length !== 0) {
      if (file.uid === textList[0].fileId) {
        setTextList([] as Array<textItem>);
        setItem({} as textItem);
        setStartAudio(false);
        setDisabled(true);
      }
    }
  };

  const handleSelectText = (textList: fileItem) => {
    let textArray = textList.text;
    setTextList(textArray);
  };

  const handleDeleteRecord = (deleteRecord: { fileId: string; id: string }) => {
    let fileTempList = [...fileList];
    fileTempList.forEach(tempFile => {
      if (tempFile.uid === deleteRecord.fileId) {
        let text = tempFile.text;
        text = text.filter((record: { id: string }) => record.id != deleteRecord.id);
        tempFile.text = text;
      }
    });
    setFileList(fileTempList);

    let templist = [...textList];
    templist = templist.filter((record: { id: string }) => record.id !== deleteRecord.id);
    setTextList(templist);

    if (item.id === deleteRecord.id) {
      setItem({} as textItem);
      setStartAudio(false);
    }
    if (templist.length === 0) setDisabled(true);
    else {
      let tempDis = true;
      templist.forEach(textItem => {
        if (textItem.audio) {
          tempDis = false;
        }
      });
      setDisabled(tempDis);
    }
  };

  const handleAddAudio = (audio: { fileId: string; id: string; src: string; blob: Blob }) => {
    let fileTempList = [...fileList];
    fileTempList.forEach(tempFile => {
      if (tempFile.uid === audio.fileId) {
        let text = tempFile.text;
        text.forEach((changeText: textItem) => {
          if (changeText.id === audio.id) {
            changeText.src = audio.src;
          }
        });
        tempFile.text = text;
      }
    });
    setFileList(fileTempList);

    let templist = textList;
    templist.forEach((item: textItem) => {
      if (item.id === audio.id) {
        item.src = audio.src;
        item.audio = true;
      }
    });
    setTextList(templist);
    setDisabled(false);
  };

  return (
    <div className="container">
      <h1 className="text-center">Record Page</h1>
      <ReadText
        list={fileList}
        handleAddText={handleAddText}
        handleSelectText={handleSelectText}
        handleDeleteText={handleDeleteText}
      />
      <AddRecord startAudio={startAudio} sentence={item} handleAddAudio={handleAddAudio} />
      <DownloadZip list={textList} disabled={disabled} />
      <RecordList list={textList} selectSentence={selectSentence} deleteRecord={handleDeleteRecord} />
    </div>
  );
};
