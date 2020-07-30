import RecordModel from "./RecordModel";
import React from "react";
import { Link, match, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

interface Prop {
  match: match<any>;
}

const TTSRecordingPage = (props: Prop) => {
  return <RecordModel />;
};

const mapStateToProps = state => {
  return {
    projects: state.tts.project.projects,
  };
};

export const TTSRecordingPageR = connect(mapStateToProps)(TTSRecordingPage);
