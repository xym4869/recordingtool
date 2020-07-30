import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { match, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { CrisTTSApi } from "../../api";
import { store } from "../../store";
import { ProjectType, ProjectSwitchAction } from "../../store/common/projectbase";
import { Subscription } from "../../store/subscriptions/subscription";
import { Page404 } from "../common/404-page";
import Colors from "../common/colors.scss";
import { Theme } from "../common/theme";
import { SubscriptionContext } from "../project";
import { EndpointDetailPageR } from "./deployment/endpoint-detail-page";
import { TTSProjectDetailPage } from "./project-detail-page";
import { TTSModelDetailPageR } from "./training/tts-model-detail-page";
import { TtsDataDetailPageR } from "./data/tts-data-detail-page";
import { FetchStatus, FetchStatusUtil } from "../../store/common/common";
import { TTSProjects, fetchTTSProjectAction, fetchTTSProjectLocalesAction } from "../../store/tts/project";
import { Spinner, SpinnerSize } from "office-ui-fabric-react";
import { fetchTTSDataUploadTypeSupportedLocales } from "../../store/tts/data";
import { fetchIsAllowedNeuralTtsUser } from "../../store/tts/model";
import { ActionType } from "../../store/actionType";
import { TTSRecordingPageR } from "./data/dataRecordingComponents/TTSRecordingPage";

interface Prop {
  match: match<any>;
  subscriptionKey: string;
  projectFetchStatus: FetchStatus;
  projects: TTSProjects;
  localeFetchStatus: FetchStatus;
  locales: string[];
}

// Theme for TTS pages
const theme: Theme = {
  ColorMain: Colors.Purple,
  ColorMainHover: Colors.PurpleHover,
  ColorHover: Colors.Purple_0_05,
  ColorChecked: Colors.Purple_0_13,
  ColorDisabled: Colors.Gray_0_7,
};

export const ApiContext = React.createContext(null);
export const ProjectContext = React.createContext(null);

export const TTSProjectRouter = (props: Prop) => {
  const subscription = useContext<Subscription>(SubscriptionContext);

  // Cris API wrapper
  const subscriptionKey = subscription ? subscription.key1 : "";
  const api = new CrisTTSApi(subscription.locale, subscription.id, subscriptionKey);

  // Here we have the project info
  const projectId = props.match.params.projectId;
  const project = props.projects[projectId];

  useEffect(() => {
    if (FetchStatusUtil.needFetch(props.projectFetchStatus)) {
      store.dispatch(fetchTTSProjectAction(api));
    }
    if (FetchStatusUtil.needFetch(props.localeFetchStatus)) {
      store.dispatch(fetchTTSProjectLocalesAction(api));
    }

    store.dispatch(fetchTTSDataUploadTypeSupportedLocales(api));
    store.dispatch(fetchIsAllowedNeuralTtsUser(api, subscription.id));

    if (project) {
      store.dispatch({
        type: ActionType.Project_Switch,
        projectType: project.projectType,
        projectId: project.id,
      } as ProjectSwitchAction);
    }
  }, [props.subscriptionKey, project]);

  // Here we will show loading icon until project info was fetched from server
  if (!FetchStatusUtil.isEnd(props.projectFetchStatus) || !FetchStatusUtil.isEnd(props.localeFetchStatus)) {
    return (
      <div className="tts">
        <div className="loading">
          <Spinner size={SpinnerSize.large} />
        </div>
      </div>
    );
  }

  if (!project) {
    return <Page404 />;
  }

  return (
    <ThemeProvider theme={theme}>
      <ProjectContext.Provider value={project}>
        <ApiContext.Provider value={api}>
          <Switch>
            <Route
              path={"/portal/:subscriptionId/" + ProjectType.CustomVoice + "/:projectId/data/:id"}
              component={TtsDataDetailPageR}
            />
            <Route
              path={"/portal/:subscriptionId/" + ProjectType.CustomVoice + "/:projectId/endpoint/:id"}
              component={EndpointDetailPageR}
            />
            <Route
              path={"/portal/:subscriptionId/" + ProjectType.CustomVoice + "/:projectId/deployment/:id"}
              component={EndpointDetailPageR}
            />
            <Route
              path={"/portal/:subscriptionId/" + ProjectType.CustomVoice + "/:projectId/training/:id"}
              component={TTSModelDetailPageR}
            />
            <Route
              path={"/portal/:subscriptionId/" + ProjectType.CustomVoice + "/:projectId/recording"}
              component={TTSRecordingPageR}
            />
            <Route
              path={"/portal/:subscriptionId/" + ProjectType.CustomVoice + "/:projectId/:tab"}
              component={TTSProjectDetailPage}
            />
            <Route
              path={"/portal/:subscriptionId/" + ProjectType.CustomVoice + "/:projectId"}
              component={TTSProjectDetailPage}
            />
          </Switch>
        </ApiContext.Provider>
      </ProjectContext.Provider>
    </ThemeProvider>
  );
};

const mapStateToProps = state => {
  return {
    subscriptionKey: state.tts.project.subscritionkey,
    projects: state.tts.project.projects,
    projectFetchStatus: state.tts.project.fetchStatus,
    locales: state.tts.project.locales,
    localeFetchStatus: state.tts.project.localeFetchStatus,
  };
};
export const TTSProjectRouterR = connect(mapStateToProps)(TTSProjectRouter);
