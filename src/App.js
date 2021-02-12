/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
/*global fetch*/
/*global URLSearchParams*/
/*global AbortController*/
import React from "react";
import packageJson from "../package.json";
import CONSTANTS from "./constants";
/*eslint-disable no-unused-vars*/
import axios, { post } from "axios";
/*eslint-enable no-unused-vars*/
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
//mapbox imports
import MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js";
import mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import HomeButton from "./HomeButton.js";
import jsonp from "jsonp-promise";
import classyBrew from "classybrew";
import { getMaxNumberOfClasses, zoomToBounds } from "./Helpers.js";
//material-ui components and icons
import Popover from "material-ui/Popover";
import Menu from "material-ui/Menu";
import Snackbar from "material-ui/Snackbar";
import Properties from "material-ui/svg-icons/alert/error-outline";
import RemoveFromProject from "material-ui/svg-icons/content/remove";
import AddToMap from "material-ui/svg-icons/action/visibility";
import RemoveFromMap from "material-ui/svg-icons/action/visibility-off";
import ZoomIn from "material-ui/svg-icons/action/zoom-in";
import Preprocess from "material-ui/svg-icons/action/autorenew";
//project components
import AppBar from "./AppBar";
import LoadingDialog from "./LoadingDialog";
import LoginDialog from "./LoginDialog";
import RegisterDialog from "./RegisterDialog.js";
import ResendPasswordDialog from "./ResendPasswordDialog.js";
import Welcome from "./Welcome.js";
import ToolsMenu from "./ToolsMenu";
import UserMenu from "./UserMenu";
import HelpMenu from "./HelpMenu";
import UserSettingsDialog from "./UserSettingsDialog";
import ProfileDialog from "./ProfileDialog";
import UsersDialog from "./UsersDialog";
import AboutDialog from "./AboutDialog";
import MenuItemWithButton from "./MenuItemWithButton";
import InfoPanel from "./InfoPanel";
import ResultsPanel from "./ResultsPanel";
import FeatureInfoDialog from "./FeatureInfoDialog";
import ProjectsDialog from "./ProjectsDialog";
import NewProjectDialog from "./NewProjectDialog";
import NewProjectWizardDialog from "./NewProjectWizardDialog";
import ProjectsListDialog from "./ProjectsListDialog";
import PlanningGridDialog from "./PlanningGridDialog";
import PlanningGridsDialog from "./PlanningGridsDialog";
import NewPlanningGridDialog from "./NewPlanningGridDialog";
import ImportPlanningGridDialog from "./ImportPlanningGridDialog";
import FeatureDialog from "./FeatureDialog";
import FeaturesDialog from "./FeaturesDialog";
import NewFeatureDialog from "./NewFeatureDialog";
import ImportFeaturesDialog from "./ImportFeaturesDialog";
import ImportFromWebDialog from "./ImportFromWebDialog";
import CostsDialog from "./CostsDialog";
import ImportCostsDialog from "./ImportCostsDialog";
import RunSettingsDialog from "./RunSettingsDialog";
import ClassificationDialog from "./ClassificationDialog";
import ClumpingDialog from "./ClumpingDialog";
import ImportProjectDialog from "./ImportProjectDialog";
import ImportMXWDialog from "./ImportMXWDialog";
import RunLogDialog from "./RunLogDialog";
import ServerDetailsDialog from "./ServerDetailsDialog";
import AlertDialog from "./AlertDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";
import IdentifyPopup from "./IdentifyPopup";
import TargetDialog from "./TargetDialog";
import ShareableLinkDialog from "./ShareableLinkDialog";
import GapAnalysisDialog from "./GapAnalysisDialog";
import ResetDialog from "./ResetDialog";
import UpdateWDPADialog from "./UpdateWDPADialog";
import ImportGBIFDialog from "./ImportGBIFDialog";

//GLOBAL VARIABLES
let MARXAN_CLIENT_VERSION = packageJson.version;
let timers = []; //array of timers for seeing when asynchronous calls have finished

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registry: undefined,
      marxanServers: [],
      marxanServer: {},
      usersDialogOpen: false,
      alertDialogOpen: false,
      featureMenuOpen: false,
      profileDialogOpen: false,
      aboutDialogOpen: false,
      helpDialogOpen: false,
      importProjectDialogOpen: false,
      UserSettingsDialogOpen: false,
      welcomeDialogOpen: false,
      registerDialogOpen: false,
      clumpingDialogOpen: false,
      settingsDialogOpen: false,
      projectsDialogOpen: false,
      openInfoDialogOpen: false,
      importGBIFDialogOpen: false,
      newProjectDialogOpen: false,
      newProjectWizardDialogOpen: false,
      shareableLinkDialogOpen: false,
      classificationDialogOpen: false,
      resendPasswordDialogOpen: false,
      NewPlanningGridDialogOpen: false,
      importPlanningGridDialogOpen: false,
      ProjectsListDialogOpen: false,
      changePasswordDialogOpen: false,
      importFeaturesDialogOpen: false,
      importFromWebDialogOpen: false,
      serverDetailsDialogOpen: false,
      planningGridsDialogOpen: false,
      planningGridDialogOpen: false,
      updateWDPADialogOpen: false,
      NewFeatureDialogOpen: false,
      importMXWDialogOpen: false,
      featuresDialogOpen: false,
      gapAnalysisDialogOpen: false,
      featureDialogOpen: false,
      runLogDialogOpen: false,
      resetDialogOpen: false,
      costsDialogOpen: false,
      importCostsDialogOpen: false,
      infoPanelOpen: false,
      resultsPanelOpen: false,
      targetDialogOpen: false,
      notificationsOpen: false,
      guestUserEnabled: true,
      toolsMenuOpen: false,
      userMenuOpen: false,
      helpMenuOpen: false,
      addToProject: true,
      smallLinearGauge: true,
      users: [],
      user: "",
      password: "",
      project: "",
      projectList: [],
      owner: "", // the owner of the project - may be different to the user, e.g. if logged on as guest (user) and accessing someone elses project (owner)
      loggedIn: false,
      shareableLink: false,
      userData: { SHOWWELCOMESCREEN: true, REPORTUNITS: "Ha" },
      unauthorisedMethods: [],
      metadata: {},
      renderer: {},
      runParams: [],
      files: {},
      popup_point: { x: 0, y: 0 },
      snackbarOpen: false,
      snackbarMessage: "",
      tilesets: [],
      identifyPlanningUnits: {},
      identifyProtectedAreas: [],
      identifyFeatures: [],
      loading: false, //true when GET/POST requests are ongoing
      preprocessing: false, //true when a WebSocket is ongoing
      uploading: false, //true when an upload to Mapbox is ongoing
      identifyVisible: false,
      pa_layer_visible: false,
      currentFeature: {},
      featureDatasetFilename: "",
      dataBreaks: [],
      allFeatures: [], //all of the interest features in the metadata_interest_features table
      projectFeatures: [], //the features for the currently loaded project
      selectedFeatureIds: [],
      addingRemovingFeatures: false,
      costnames: [],
      selectedCosts: [],
      countries: [],
      planning_units: [],
      planning_unit_grids: [],
      planning_grid_metadata: {},
      feature_metadata: {},
      activeTab: "project",
      activeResultsTab: "legend",
      logMessages: [],
      map0_paintProperty: [],
      map1_paintProperty: [],
      map2_paintProperty: [],
      map3_paintProperty: [],
      map4_paintProperty: [],
      clumpingRunning: false,
      projectListDialogTitle: "",
      projectListDialogHeading: "",
      pid: 0,
      basemaps: [],
      basemap: "North Star",
      mapCentre: { lng: 0, lat: 0 },
      mapZoom: 12,
      runLogs: [],
      puEditing: false,
      wdpaAttribution: "",
      shareableLinkUrl: "",
      notifications: [],
      gapAnalysis: [],
      costsLoading: false,
      protected_area_intersections: [],
      visibleLayers: [],
    };
  }

  componentDidMount() {
    //get the query parameters
    var searchParams = new URLSearchParams(window.location.search);
    //if this is a shareable link, then dont show the login form
    if (searchParams.has("project"))
      this.setState({ loggedIn: true, shareableLink: true });
    //parse the application level variables from the Marxan Registry
    this.getGlobalVariables().then(() => {
      //automatically login if this is a shareable link
      if (searchParams.has("project")) this.openShareableLink(searchParams);
      //select a server if it is passed
      if (searchParams.has("server"))
        this._selectServer(searchParams.get("server"));
    });
    //instantiate the classybrew to get the color ramps for the renderers
    this.setState({ brew: new classyBrew() });
  }

  //gets various global variables from the marxan registry
  getGlobalVariables() {
    return new Promise((resolve, reject) => {
      fetch(CONSTANTS.MARXAN_REGISTRY).then((response) => {
        response.json().then((registryData) => {
          this.setState({ registry: registryData });
          mapboxgl.accessToken = registryData.MBAT_PUBLIC; //this is my public access token
          //initialise the basemaps
          this.setState({ basemaps: registryData.MAPBOX_BASEMAPS });
          //get all the information for the marxan servers by polling them
          this.initialiseServers(registryData.MARXAN_SERVERS).then(
            (response) => {
              resolve(response);
            }
          );
        });
      });
    });
  }

  //automatically logs in and loads a project as a guest user
  openShareableLink(searchParams) {
    try {
      if (
        searchParams.has("server") &&
        searchParams.has("user") &&
        searchParams.has("project")
      ) {
        //get the server data from the servers object
        let serverData = this.state.marxanServers.find(
          (server) => server.name === searchParams.get("server")
        );
        if (serverData === undefined)
          throw new Error("Invalid server parameter on shareable link");
        if (serverData && serverData.offline)
          throw new Error("Server is offline");
        if (serverData && !serverData.guestUserEnabled)
          throw new Error("Guest user is not enabled on the server");
        //set the server
        this.selectServer(serverData);
        //switch to the guest user
        this.switchToGuestUser().then(() => {
          //login
          this.validateUser().then((response) => {
            this.loadProject(
              searchParams.get("project"),
              searchParams.get("user")
            ).then(() => {
              //hide the loading dialog
              this.setState({ shareableLink: false });
            });
          });
        });
      } else {
        throw new Error("Invalid query parameters on shareable link");
      }
    } catch (err) {
      alert(err);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// REQUEST HELPERS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //makes a GET request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  _get(params, timeout = CONSTANTS.TIMEOUT) {
    return new Promise((resolve, reject) => {
      //set the global loading flag
      this.setState({ loading: true });
      jsonp(this.state.marxanServer.endpoint + params, {
        timeout: timeout,
      }).promise.then(
        (response) => {
          this.setState({ loading: false });
          if (!this.checkForErrors(response)) {
            resolve(response);
          } else {
            reject(response.error);
          }
        },
        (err) => {
          this.setState({ loading: false });
          this.setSnackBar(
            "Request timeout - See <a href='" +
              CONSTANTS.ERRORS_PAGE +
              "#request-timeout' target='blank'>here</a>"
          );
          reject(err);
        }
      );
    });
  }

  //makes a POST request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  _post(
    method,
    formData,
    timeout = CONSTANTS.TIMEOUT,
    withCredentials = CONSTANTS.SEND_CREDENTIALS
  ) {
    return new Promise((resolve, reject) => {
      //set the global loading flag
      this.setState({ loading: true });
      post(this.state.marxanServer.endpoint + method, formData, {
        withCredentials: withCredentials,
      }).then(
        (response) => {
          if (!this.checkForErrors(response.data)) {
            this.setState({ loading: false });
            resolve(response.data);
          } else {
            this.setState({ loading: false });
            reject(response.data.error);
          }
        },
        (err) => {
          //TODO - If the request is unauthorised it returns the Status Code of 200 with the error: "HTTP 403: Forbidden (The 'ReadOnly' role does not have permission to access the 'updateSpecFile' service)" - but for some reason this error handling is used
          this.setState({ loading: false });
          if (err.message !== "Network Error") this.setSnackBar(err.message);
          reject(err);
        }
      );
    });
  }

  //web socket requests
  _ws(params, msgCallback) {
    return new Promise((resolve, reject) => {
      let ws = new WebSocket(
        this.state.marxanServer.websocketEndpoint + params
      );
      //get the message and pass it to the msgCallback function
      ws.onmessage = (evt) => {
        let message = JSON.parse(evt.data);
        //check for errors
        if (!this.checkForErrors(message)) {
          if (message.status === "Finished") {
            //pass the message back to the callback
            msgCallback(message);
            //reset state
            this.setState({ preprocessing: false });
            //if the web socket has finished then resolve the promise
            resolve(message);
          } else {
            msgCallback(message);
          }
        } else {
          //pass the message back to the callback
          msgCallback(message);
          //reset state
          this.setState({ preprocessing: false });
          reject(message.error);
        }
      };
      ws.onopen = (evt) => {
        //do something if necessary
      };
      ws.onerror = (evt) => {
        //reset state
        this.setState({ preprocessing: false });
        reject(evt);
      };
      ws.onclose = (evt) => {
        //reset state
        this.setState({ preprocessing: false });
        if (!evt.wasClean) {
          msgCallback({ status: "SocketClosedUnexpectedly" });
        } else {
          reject(evt);
        }
      };
    });
  }

  //checks the reponse for errors
  checkForErrors(response, showSnackbar = true) {
    let networkError = this.responseIsTimeoutOrEmpty(response, showSnackbar);
    //check the response from the server for an error property - if it has one then show it in the snackbar
    let serverError = this.isServerError(response, showSnackbar);
    let isError = networkError || serverError;
    if (isError) {
      //write the full trace to the console if available
      let error = response.hasOwnProperty("trace")
        ? response.trace
        : response.hasOwnProperty("error")
        ? response.error
        : "No error message returned";
      console.error("Error message from server: " + error);
    }
    return isError;
  }

  //checks the response from a REST call for timeout errors or empty responses
  responseIsTimeoutOrEmpty(response, showSnackbar = true) {
    if (!response) {
      let msg = "No response received from server";
      if (showSnackbar) this.setSnackBar(msg);
      return true;
    } else {
      return false;
    }
  }

  //checks to see if the rest server raised an error and if it did then show in the snackbar
  isServerError(response, showSnackbar) {
    //errors may come from the marxan server or from the rest server which have slightly different json responses
    if (
      (response && response.error) ||
      (response &&
        response.hasOwnProperty("metadata") &&
        response.metadata.hasOwnProperty("error") &&
        response.metadata.error != null)
    ) {
      var err = response.error ? response.error : response.metadata.error;
      if (showSnackbar) this.setSnackBar(err);
      return true;
    } else {
      //some server responses are warnings and will not stop the function from running as normal
      if (response.warning) {
        if (showSnackbar) this.setSnackBar(response.warning);
      }
      return false;
    }
  }

  //called when any websocket message is received - this logic removes duplicate messages
  wsMessageCallback(message) {
    //dont log any clumping projects
    if (message.user === "_clumping") return;
    //log the message
    this.logMessage(message);
    switch (message.status) {
      case "Started": //from the open method of all MarxanWebSocketHandler subclasses
        //set the processing state when the websocket starts
        this.setState({ preprocessing: true });
        break;
      case "pid": //from marxan runs and preprocessing - the pid is an identifer and the pid, e.g. m1234 is a marxan run process with a pid of 1234
        this.setState({ pid: message.pid });
        break;
      case "FeatureCreated":
        //remove all preprocessing messages
        this.removeMessageFromLog("Preprocessing");
        this.newFeatureCreated(message.id);
        break;
      case "Finished": //from the close method of all MarxanWebSocketHandler subclasses
        //reset the pid
        this.resetPID();
        //remove all preprocessing messages
        this.removeMessageFromLog("Preprocessing");
        break;
      default:
        break;
    }
  }

  //resets the pid value
  resetPID() {
    this.setState({ pid: 0 });
  }
  //logs the message if necessary - this removes duplicates
  logMessage(message) {
    //log the message from the websocket
    if (message.status === "SocketClosedUnexpectedly") {
      //server closed WebSocket unexpectedly - uncaught server error, server crash or WebSocket timeout)
      this.log({
        method: message.method,
        status: "Finished",
        error: "The WebSocket connection closed unexpectedly",
      });
      //remove the Preprocessing messages which show the processing spinner
      this.removeMessageFromLog("Preprocessing");
      //reset the PID
      this.resetPID();
    } else {
      //see if the message has a pid and if it does then see if the status has changed since the last message - if it has then log the message - this does not apply to RunningMarxan messages as all of these need to be logged
      if (message.hasOwnProperty("pid") && message.status !== "RunningMarxan") {
        //get the existing status
        let _messages = this.state.logMessages.filter((_message) => {
          if (_message.hasOwnProperty("pid")) {
            return _message.pid === message.pid;
          } else {
            return false;
          }
        });
        //if there is already a message for that pid
        if (_messages.length > 0) {
          //compare with the latest status
          if (message.status !== _messages[_messages.length - 1].status) {
            //if the new status is different and the message status is finished, then remove the processing message
            if (message.status === "Finished")
              this.removeMessageFromLog("RunningQuery", message.pid);
            this.log(message);
          }
        } else {
          //log the first message for that pid
          this.log(message);
        }
      } else {
        //remove duplicate messages from the log (unless they are from the marxan run or have a status of started or finished)
        if (
          !(
            message.status === "RunningMarxan" ||
            message.status === "Started" ||
            message.status === "Finished"
          )
        )
          this.removeMessageFromLog(message.status);
        //log the message
        this.log(message);
      }
    }
  }

  //removes a message from the log by matching on the status and if it is passed, the pid
  removeMessageFromLog(status, pid) {
    let _messages = this.state.logMessages;
    //filter the messages to remove those that match on status (and pid)
    _messages = _messages.filter((_message) => {
      if (pid !== undefined) {
        if (_message.hasOwnProperty("pid")) {
          return !(_message.pid === pid && _message.status === status);
        } else {
          return true;
        }
      } else {
        //match just on the status
        return !(_message.status === status);
      }
    });
    this.setState({ logMessages: _messages });
  }

  //can be called from other components
  setSnackBar(message, silent = false) {
    if (!silent)
      this.setState({ snackbarOpen: true, snackbarMessage: message });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// MANAGING MARXAN SERVERS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //initialises the servers by requesting their capabilities and then filtering the list of available servers
  initialiseServers(marxanServers) {
    return new Promise((resolve, reject) => {
      //get a list of server hosts from the marxan.json registry
      let hosts = marxanServers.map((server) => {
        return server.host;
      });
      //add the current domain - this may be a local/local network install
      let name =
        window.location.hostname === "localhost"
          ? "localhost"
          : window.location.hostname;
      marxanServers.push({
        name: name,
        protocol: window.location.protocol,
        host: window.location.hostname,
        port: 80,
        description: "Local machine",
        type: "local",
      });
      //get all the server capabilities - when all the servers have responded, finalise the marxanServer array
      this.getAllServerCapabilities(marxanServers).then((server) => {
        //remove the current domain if either the marxan server is not installed, or it is already in the list of servers from the marxan registry
        marxanServers = marxanServers.filter((item) => {
          return (
            item.type === "remote" ||
            (item.type === "local" &&
              !item.offline &&
              hosts.indexOf(item.host) === -1) ||
            item.host === "localhost"
          );
        });
        //sort the servers by the name
        marxanServers.sort((a, b) => {
          if (a.name.toLowerCase() < b.name.toLowerCase() || a.type === "local")
            return -1;
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
          return 0;
        });
        this.setState({ marxanServers: marxanServers }, () => {
          resolve("ServerData retrieved");
        });
      });
    });
  }

  //gets the capabilities of all servers
  async getAllServerCapabilities(marxanServers) {
    let promises = await marxanServers.map(async (server) => {
      await this.getServerCapabilities(server);
    });
    await Promise.all(promises);
  }

  //gets the capabilities of the server by making a request to the getServerData method
  async getServerCapabilities(server) {
    //get the endpoint for all http/https requests
    let endpoint =
      server.protocol +
      "//" +
      server.host +
      ":" +
      server.port +
      CONSTANTS.TORNADO_PATH;
    //get the WebService endpoint
    let websocketEndpoint =
      server.protocol === "http:"
        ? "ws://" + server.host + ":" + server.port + CONSTANTS.TORNADO_PATH
        : "wss://" + server.host + ":" + server.port + CONSTANTS.TORNADO_PATH;
    //set the default properties for the server - by default the server is offline, has no guest access and CORS is not enabled
    server = Object.assign(server, {
      endpoint: endpoint,
      websocketEndpoint: websocketEndpoint,
      offline: true,
      guestUserEnabled: false,
      corsEnabled: false,
    });
    //poll the server to make sure tornado is running
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(endpoint + "getServerData", {
        credentials: "include",
        signal: signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw Error(
          "fetch returned a 404 or 500 error: " + response.statusText
        );
      }
      const json = await response.json();
      if (json.hasOwnProperty("info")) {
        //see if CORS is enabled from this domain - either the domain has been added as an allowable domain on the server, or the client and server are on the same machine
        let corsEnabled =
          json.serverData.PERMITTED_DOMAINS.indexOf(window.location.hostname) >
            -1 || server.host === window.location.hostname
            ? true
            : false;
        //set the flags for the server capabilities
        server = Object.assign(server, {
          guestUserEnabled: json.serverData.ENABLE_GUEST_USER,
          corsEnabled: corsEnabled,
          offline: false,
          machine: json.serverData.MACHINE,
          client_version: json.serverData.MARXAN_CLIENT_VERSION,
          server_version: json.serverData.MARXAN_SERVER_VERSION,
          node: json.serverData.NODE,
          processor: json.serverData.PROCESSOR,
          processor_count: json.serverData.PROCESSOR_COUNT,
          ram: json.serverData.RAM,
          release: json.serverData.RELEASE,
          system: json.serverData.SYSTEM,
          version: json.serverData.VERSION,
          wdpa_version: json.serverData.WDPA_VERSION,
          planning_grid_units_limit: Number(
            json.serverData.PLANNING_GRID_UNITS_LIMIT
          ),
          disk_space: json.serverData.DISK_FREE_SPACE,
          shutdowntime: json.serverData.SHUTDOWNTIME,
          enable_reset: json.serverData.ENABLE_RESET,
        });
        //if the server defines its own name then set it
        if (json.serverData.SERVER_NAME !== "") {
          server = Object.assign(server, { name: json.serverData.SERVER_NAME });
        }
        //if the server defines its own description then set it
        if (json.serverData.SERVER_DESCRIPTION !== "") {
          server = Object.assign(server, {
            description: json.serverData.SERVER_DESCRIPTION,
          });
        }
      }
    } catch (error) {
      console.log("fetch failed with: " + error);
    }
  }
  //programatically selects a server
  _selectServer(servername) {
    //remove the search part of the url
    window.history.replaceState({}, document.title, "/");
    //get the server object from the name
    let server = this.state.marxanServers.filter(
      (item) => item.name === servername
    );
    if (server.length) this.selectServer(server[0]);
  }

  //sets the layer name for the WDPA vector tiles based on the WDPA version
  setWDPAVectorTilesLayerName(wdpa_version) {
    //get the short version of the wdpa_version, e.g. August 2019 to aug_2019
    let version =
      wdpa_version.toLowerCase().substr(0, 3) + "_" + wdpa_version.substr(-4);
    //set the value of the vector_tile_layer based on which version of the wdpa the server has in the PostGIS database
    this.wdpa_vector_tile_layer = "wdpa_" + version + "_polygons";
  }
  //called when the user selects a server
  selectServer(value) {
    this.setState({ marxanServer: value });
    //see if there is a new version of the wdpa
    value.wdpa_version !== this.state.registry.WDPA.latest_version
      ? this.setState({ newWDPAVersion: true })
      : this.setState({ newWDPAVersion: false });
    //set the link to the WDPA vector tiles based on the version that is included in the server in the PostGIS database
    this.setWDPAVectorTilesLayerName(value.wdpa_version);
    //if the server is ready only then change the user/password to the guest user
    if (!value.offline && !value.corsEnabled && value.guestUserEnabled) {
      this.switchToGuestUser();
    }
  }

  closeSnackbar() {
    this.setState({ snackbarOpen: false });
  }

  startLogging(clearLog = false) {
    //switches the results pane to the log tab
    this.setActiveTab("log");
    //clear the log if needs be
    if (clearLog) this.clearLog();
  }

  //clears the log
  clearLog() {
    this.setState({ logMessages: [] });
  }

  //centralised logging method - all log messages are routed through this method (can be called from components to update the log)
  log(message) {
    //add a timestamp to the message
    Object.assign(message, { timestamp: new Date() });
    let _messages = this.state.logMessages;
    //add the message to the existing log
    _messages.push(message);
    //set the state
    this.setState({ logMessages: _messages });
  }

  //utiliy method for getting all puids from normalised data, e.g. from [["VI", [7, 8, 9]], ["IV", [0, 1, 2, 3, 4]], ["V", [5, 6]]]
  getPuidsFromNormalisedData(normalisedData) {
    let puids = [];
    normalisedData.forEach((item) => {
      puids = puids.concat(item[1]);
    });
    return puids;
  }

  changeUserName(user) {
    this.setState({ user: user });
  }

  changePassword(password) {
    this.setState({ password: password });
  }

  //checks the users credentials
  checkPassword(user, password) {
    return new Promise((resolve, reject) => {
      this._get("validateUser?user=" + user + "&password=" + password, 10000)
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  //validates the user and then logs in if successful
  validateUser() {
    return new Promise((resolve, reject) => {
      this.checkPassword(this.state.user, this.state.password)
        .then(() => {
          //user validated - log them in
          this.login().then((response) => {
            resolve("User validated");
          });
        })
        .catch((error) => {
          //
        });
    });
  }

  //the user is validated so login
  login() {
    return new Promise((resolve, reject) => {
      this._get("getUser?user=" + this.state.user)
        .then((response) => {
          this.setState(
            {
              userData: response.userData,
              unauthorisedMethods: response.unauthorisedMethods,
              project: response.userData.LASTPROJECT,
              dismissedNotifications: response.dismissedNotifications
                ? response.dismissedNotifications
                : [],
            },
            () => {
              //show the welcome dialog
              //   this.openWelcomeDialog();
            }
          );
          //set the basemap
          var basemap = this.state.basemaps.filter((item) => {
            return item.name === response.userData.BASEMAP;
          })[0];
          this.setBasemap(basemap).then(() => {
            //get all features
            this.getAllFeatures().then(() => {
              //get the users last project and load it
              this.loadProject(
                response.userData.LASTPROJECT,
                this.state.user
              ).then((response) => {
                resolve("Logged in");
              });
            });
            //get all planning grids
            this.getPlanningUnitGrids();
          });
        })
        .catch((error) => {
          //do something
        });
    });
  }

  //log out and reset some state
  logout() {
    this.hideUserMenu();
    this.setState({
      loggedIn: false,
      user: "",
      password: "",
      project: "",
      owner: "",
      runParams: [],
      files: {},
      metadata: {},
      renderer: {},
      planning_units: [],
      projectFeatures: [],
      infoPanelOpen: false,
      resultsPanelOpen: false,
      brew: new classyBrew(),
      notifications: [],
    });
    this.resetResults();
    //clear the currently set cookies
    this._get("logout").then((response) => {
      //do something
    });
  }

  switchToGuestUser() {
    return new Promise((resolve, reject) => {
      this.setState({ user: "guest", password: "password" }, () => {
        resolve("Switched to guest user");
      });
    });
  }

  changeEmail(value) {
    this.setState({ resendEmail: value });
  }

  resendPassword() {
    this._get("resendPassword?user=" + this.state.user)
      .then((response) => {
        //ui feedback
        this.setSnackBar(response.info);
        //close the resend password dialog
        this.updateState({ resendPasswordDialogOpen: false });
      })
      .catch((error) => {
        //do something
      });
  }

  //gets data for all users
  getUsers() {
    this._get("getUsers")
      .then((response) => {
        this.setState({ users: response.users });
      })
      .catch((error) => {
        this.setState({ users: [] });
      });
  }

  //deletes a user
  deleteUser(user) {
    this._get("deleteUser?user=" + user).then((response) => {
      this.setSnackBar("User deleted");
      //remove it from the users array
      let usersCopy = this.state.users;
      //remove the user
      usersCopy = usersCopy.filter((item) => {
        return item.user !== user;
      });
      //update the users state
      this.setState({ users: usersCopy });
      //see if the current project belongs to the deleted user
      if (this.state.owner === user) {
        this.setSnackBar(
          "Current project no longer exists. Loading next available."
        );
        //load the next available project
        this.state.projects.some((project) => {
          if (project.user !== user)
            this.loadProject(project.name, project.user);
          return project.name !== this.state.project;
        });
        //delete all the projects belonging to that user
        this.deleteProjectsForUser(user);
      }
    });
  }

  //deletes all of the projects belonging to the passed user from the state
  deleteProjectsForUser(user) {
    let projects = this.state.projects.map((project) => {
      return project.user !== user;
    });
    this.setState({ projects: projects });
  }

  //changes a users role
  changeRole(user, role) {
    this.updateUser({ ROLE: role }, user);
    //copy the users state
    let usersCopy = this.state.users;
    //change the users role
    usersCopy = usersCopy.map((item) => {
      if (item.user === user) {
        return Object.assign(item, { ROLE: role });
      } else {
        return item;
      }
    });
    //update the users state
    this.setState({ users: usersCopy });
  }

  //toggles if the guest user is enabled on the server or not
  toggleEnableGuestUser() {
    this._get("toggleEnableGuestUser").then((response) => {
      //if succesfull set the state
      let _marxanServer = this.state.marxanServer;
      _marxanServer = Object.assign(_marxanServer, {
        guestUserEnabled: response.enabled,
      });
      this.setState({ marxanServer: _marxanServer });
    });
  }

  //toggles the projects privacy
  toggleProjectPrivacy(newValue) {
    this.updateProjectParameter("PRIVATE", newValue).then((response) => {
      this.setState({
        metadata: Object.assign(this.state.metadata, {
          PRIVATE: newValue === "True",
        }),
      });
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// NOTIFICATIONS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //parse the notifications
  parseNotifications() {
    //see if there are any new notifications from the marxan-registry
    if (this.state.registry.NOTIFICATIONS.length > 0) {
      this.addNotifications(this.state.registry.NOTIFICATIONS);
    }
    //see if there is a new version of the wdpa data - this comes from the Marxan Registry WDPA object - if there is then show a notification to admin users
    if (this.state.newWDPAVersion)
      this.addNotifications([
        {
          id: "wdpa_update_" + this.state.registry.WDPA.latest_version,
          html:
            "A new version of the WDPA is available. Go to Help | Server Details for more information.",
          type: "Data Update",
          showForRoles: ["Admin"],
        },
      ]);
    //see if there is a new version of the marxan-client software
    if (MARXAN_CLIENT_VERSION !== this.state.registry.CLIENT_VERSION)
      this.addNotifications([
        {
          id: "marxan_client_update_" + this.state.registry.CLIENT_VERSION,
          html:
            "A new version of marxan-client is available (" +
            this.state.registry.CLIENT_VERSION +
            "). Go to Help | About for more information.",
          type: "Software Update",
          showForRoles: ["Admin"],
        },
      ]);
    //see if there is a new version of the marxan-server software
    if (
      this.state.marxanServer.server_version !==
      this.state.registry.SERVER_VERSION
    )
      this.addNotifications([
        {
          id: "marxan_server_update_" + this.state.registry.SERVER_VERSION,
          html:
            "A new version of marxan-server is available (" +
            this.state.registry.SERVER_VERSION +
            "). Go to Help | Server Details for more information.",
          type: "Software Update",
          showForRoles: ["Admin"],
        },
      ]);
    //check that there is enough disk space
    if (this.state.marxanServer.disk_space < 1000) {
      this.addNotifications([
        {
          id: "hardware_1000",
          html: "Disk space < 1Gb",
          type: "Hardware Issue",
          showForRoles: ["Admin"],
        },
      ]);
    } else {
      if (this.state.marxanServer.disk_space < 2000) {
        this.addNotifications([
          {
            id: "hardware_2000",
            html: "Disk space < 2Gb",
            type: "Hardware Issue",
            showForRoles: ["Admin"],
          },
        ]);
      } else {
        if (this.state.marxanServer.disk_space < 3000)
          this.addNotifications([
            {
              id: "hardware_3000",
              html: "Disk space < 3Gb",
              type: "Hardware Issue",
              showForRoles: ["Admin"],
            },
          ]);
      }
    }
  }

  //hides the notifications from the UI
  hideNotifications() {
    this.setState({ notificationsOpen: false });
  }

  //add the passed notifications to the notifications state
  addNotifications(notifications) {
    let _notifications = this.state.notifications;
    //set the visibility of the notifications based on the users role, whether they have already been dismissed or if it has expired
    notifications = notifications.map((item) => {
      let allowedForRole =
        item.showForRoles.indexOf(this.state.userData.ROLE) > -1;
      let notDismissed =
        this.state.dismissedNotifications.indexOf(String(item.id)) === -1;
      let notExpired = true;
      //if an expiry date is set, then get this as a Date
      if (
        item.hasOwnProperty("expires") &&
        item.hasOwnProperty("expires") &&
        item.expires !== ""
      ) {
        try {
          var d = Date.parse(item.expires);
          if (new Date() > d) notExpired = false;
        } catch (err) {
          //invalid date so not expiry date
        }
      }
      let visible = allowedForRole && notDismissed && notExpired;
      return Object.assign(item, { visible: visible });
    });
    _notifications.push.apply(_notifications, notifications);
    this.setState({ notifications: _notifications });
  }

  //removes a notification
  removeNotification(notification) {
    //remove the notification from the state
    let _notifications = this.state.notifications.filter(
      (_notification) => _notification.id !== notification.id
    );
    //remove it in the users notifications.dat file
    this.dismissNotification(notification);
    //set the state
    this.setState({ notifications: _notifications });
  }

  //dismisses a notification on the server
  dismissNotification(notification) {
    this._get(
      "dismissNotification?user=" +
        this.state.user +
        "&notificationid=" +
        notification.id
    );
  }

  //clears all of the dismissed notifications on the server
  resetNotifications() {
    this._get("resetNotifications?user=" + this.state.user).then(() => {
      this.setState({ notifications: [], dismissedNotifications: [] });
      this.parseNotifications();
    });
  }

  appendToFormData(formData, obj) {
    //iterate through the object and add each key/value pair to the formData to post to the server
    for (var key in obj) {
      //only add non-prototype objects
      if (obj.hasOwnProperty(key)) {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }

  //removes the keys from the object
  removeKeys(obj, keys) {
    keys.map((key) => {
      delete obj[key];
      return null;
    });
    return obj;
  }

  //updates all parameter in the user.dat file then updates the state (in userData)
  updateUser(parameters, user = this.state.user) {
    return new Promise((resolve, reject) => {
      //remove the keys that are not part of the users information
      parameters = this.removeKeys(parameters, ["updated", "validEmail"]);
      //initialise the form data
      let formData = new FormData();
      //add the current user
      formData.append("user", user);
      //append all the key/value pairs
      this.appendToFormData(formData, parameters);
      //post to the server
      this._post("updateUserParameters", formData)
        .then((response) => {
          // if succesfull write the state back to the userData key
          if (this.state.user === user)
            this.setState({ userData: this.newUserData });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
      //if we have updated the current user then save a local property so that if the changes are saved to the server then we can update the local state
      if (this.state.user === user)
        this.newUserData = Object.assign(this.state.userData, parameters);
    });
  }

  //saveOptions - the options are in the users data so we use the updateUser REST call to update them
  saveOptions(options) {
    this.updateUser(options);
  }
  //updates the project from the old version to the new version
  upgradeProject(project) {
    return this._get(
      "upgradeProject?user=" + this.state.user + "&project=" + project
    );
  }

  //updates the project parameters back to the server (i.e. the input.dat file)
  updateProjectParams(project, parameters) {
    //initialise the form data
    let formData = new FormData();
    //add the current user
    formData.append("user", this.state.owner);
    //add the current project
    formData.append("project", project);
    //append all the key/value pairs
    this.appendToFormData(formData, parameters);
    //post to the server and return a promise
    return this._post("updateProjectParameters", formData);
  }

  //updates a single parameter in the input.dat file directly
  updateProjectParameter(parameter, value) {
    let obj = {};
    obj[parameter] = value;
    //update the parameter and return a promise
    return this.updateProjectParams(this.state.project, obj);
  }

  //updates the run parameters for the current project
  updateRunParams(array) {
    //convert the run parameters array into an object
    let parameters = {};
    array.map((obj) => {
      parameters[obj.key] = obj.value;
      return null;
    });
    //update the project parameters
    this.updateProjectParams(this.state.project, parameters).then(
      (response) => {
        //if succesfull write the state back
        this.setState({ runParams: this.runParams });
      }
    );
    //save the local state to be able to update the state on callback
    this.runParams = array;
  }

  //gets the planning unit grids
  getPlanningUnitGrids() {
    this._get("getPlanningUnitGrids").then((response) => {
      this.setState({ planning_unit_grids: response.planning_unit_grids });
    });
  }

  //loads a project
  loadProject(project, user) {
    return new Promise((resolve, reject) => {
      //reset the results from any previous projects
      this.resetResults();
      this._get("getProject?user=" + user + "&project=" + project)
        .then((response) => {
          //set the state for the app based on the data that is returned from the server
          this.setState({
            loggedIn: true,
            project: response.project,
            owner: user,
            runParams: response.runParameters,
            files: Object.assign(response.files),
            metadata: response.metadata,
            renderer: response.renderer,
            planning_units: response.planning_units,
            costnames: response.costnames,
            infoPanelOpen: true,
            resultsPanelOpen: true,
          });
          //if there is a PLANNING_UNIT_NAME passed then change to this planning grid and load the results if there are any available
          if (response.metadata.PLANNING_UNIT_NAME) {
            this.changePlanningGrid(
              CONSTANTS.MAPBOX_USER + "." + response.metadata.PLANNING_UNIT_NAME
            ).then(() => {
              //poll the server to see if results are available for this project - if there are these will be loaded
              this.getResults(user, response.project).then((response) => {
                resolve("Project loaded");
              });
            });
          }
          //set a local variable for the feature preprocessing - this is because we dont need to track state with these variables as they are not bound to anything
          this.feature_preprocessing = response.feature_preprocessing;
          //set a local variable for the protected area intersections - this is because we dont need to track state with these variables as they are not bound to anything
          this.setState({
            protected_area_intersections: response.protected_area_intersections,
          });
          //set a local variable for the selected iucn category
          this.previousIucnCategory = response.metadata.IUCN_CATEGORY;
          //initialise all the interest features with the interest features for this project
          this.initialiseInterestFeatures(
            response.metadata.OLDVERSION,
            response.features
          );
          //preload the costs data instead of loading it when the user clicks on the Planning Units tab
          this.getPlanningUnitsCostData();
          //activate the project tab
          this.project_tab_active();
        })
        .catch((error) => {
          if (error.indexOf("Logged on as read-only guest user") > -1) {
            this.setState({ loggedIn: true });
            resolve("No project loaded - logged on as read-only guest user'");
          }
          if (error.indexOf("does not exist") > -1) {
            //probably the last loaded project has been deleted - send some feedback and load another project
            this.setSnackBar("Loading first available project");
            //passing an empty project to loadProject will load the first project
            this.loadProject("", this.state.user);
          }
        });
    });
  }

  //matches and returns an item in an object array with the passed id - this assumes the first item in the object is the id identifier
  getArrayItem(arr, id) {
    let tmpArr = arr.filter((item) => {
      return item[0] === id;
    });
    let returnValue = tmpArr.length > 0 ? tmpArr[0] : undefined;
    return returnValue;
  }

  //initialises the interest features based on the currently loading project
  initialiseInterestFeatures(oldVersion, projectFeatures) {
    //if the project is from an old version of marxan then the interest features can only come from the list of features in the current project
    let features = oldVersion
      ? JSON.parse(JSON.stringify(projectFeatures))
      : this.state.allFeatures; //make a copy of the projectFeatures
    //get a list of the ids for the features that are in this project
    var ids = projectFeatures.map((item) => {
      return item.id;
    });
    //iterate through features to add the required attributes to be used in the app and to populate them based on the current project features
    var outFeatures = features.map((item) => {
      //see if the feature is in the current project
      var projectFeature =
        ids.indexOf(item.id) > -1
          ? projectFeatures[ids.indexOf(item.id)]
          : null;
      //get the preprocessing for that feature from the feature_preprocessing.dat file
      let preprocessing = this.getArrayItem(
        this.feature_preprocessing,
        item.id
      );
      //add the required attributes to the features - these will be populated in the function calls preprocessFeature (pu_area, pu_count) and pollResults (protected_area, target_area)
      this.addFeatureAttributes(item, oldVersion);
      //if the interest feature is in the current project then populate the data from that feature
      if (projectFeature) {
        item["selected"] = true;
        item["preprocessed"] = preprocessing ? true : false;
        item["pu_area"] = preprocessing ? preprocessing[1] : -1;
        item["pu_count"] = preprocessing ? preprocessing[2] : -1;
        item["spf"] = projectFeature["spf"];
        item["target_value"] = projectFeature["target_value"];
        item["occurs_in_planning_grid"] = item["pu_count"] > 0;
      }
      return item;
    });
    //get the selected feature ids
    this.getSelectedFeatureIds();
    //set the state
    this.setState({
      allFeatures: outFeatures,
      projectFeatures: outFeatures.filter((item) => {
        return item.selected;
      }),
    });
  }

  //adds the required attributes for the features to work in the marxan web app - these are the default values
  addFeatureAttributes(item, oldVersion) {
    // the -1 flag indicates that the values are unknown
    item["selected"] = false; //if the feature is currently selected (i.e. in the current project)
    item["preprocessed"] = false; //has the feature already been intersected with the planning grid to populate the puvspr.dat file
    item["pu_area"] = -1; //the area of the feature within the planning grid
    item["pu_count"] = -1; //the number of planning units that the feature intersects with
    item["spf"] = 40; //species penalty factor
    item["target_value"] = 17; //the target value for the feature to protect as a percentage
    item["target_area"] = -1; //the area of the feature that must be protected to meet the targets percentage
    item["protected_area"] = -1; //the area of the feature that is protected
    item["feature_layer_loaded"] = false; //is the features distribution currently visible on the map
    item["feature_puid_layer_loaded"] = false; //are the planning units that intersect the feature currently visible on the map
    item["old_version"] = oldVersion; //true if the current project is an project imported from marxan for DOS
    item["occurs_in_planning_grid"] = false; //does the feature occur in the planning grid
    item["color"] = window.colors[item.id % window.colors.length]; //color for the map layer and analysis outputs
    item["in_filter"] = true; //true if the feature is currently visible in the features dialog
  }

  //resets various variables and state in between users
  resetResults() {
    //reset the run
    this.resetRun();
    //reset the cost data
    this.cost_data = undefined;
    //reset any feature layers that are shown
    this.hideFeatureLayer();
  }
  //resets state in between runs
  resetRun() {
    this.runMarxanResponse = {};
    this.setState({ solutions: [] });
  }
  //create a new user on the server
  createNewUser(user, password, name, email) {
    let formData = new FormData();
    formData.append("user", user);
    formData.append("password", password);
    formData.append("fullname", name);
    formData.append("email", email);
    this._post("createUser", formData).then((response) => {
      //ui feedback
      this.setSnackBar(response.info);
      //close the register dialog
      //enter the new users name in the username box and a blank password
      this.updateState({
        registerDialogOpen: false,
        user: user,
        password: "",
      });
    });
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// PROJECTS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //REST call to create a new project from the wizard
  createNewProject(project) {
    let formData = new FormData();
    formData.append("user", this.state.user);
    formData.append("project", project.name);
    formData.append("description", project.description);
    formData.append("planning_grid_name", project.planning_grid_name);
    var interest_features = [];
    var target_values = [];
    var spf_values = [];
    project.features.forEach((item) => {
      interest_features.push(item.id);
      target_values.push(17);
      spf_values.push(40);
    });
    //prepare the data that will populate the spec.dat file
    formData.append("interest_features", interest_features.join(","));
    formData.append("target_values", target_values.join(","));
    formData.append("spf_values", spf_values.join(","));
    this._post("createProject", formData).then((response) => {
      this.setSnackBar(response.info);
      this.setState({ projectsDialogOpen: false });
      this.loadProject(response.name, response.user);
    });
  }

  createNewNationalProject(params) {
    return new Promise((resolve, reject) => {
      //first create the planning grid
      this.createNewPlanningUnitGrid(
        params.iso3,
        params.domain,
        params.areakm2,
        params.shape
      )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
      //create the features from
      // world ecosystems
      // species from gbif
      // species from the red list
    });
  }

  //REST call to create a new import project from the wizard
  createImportProject(project) {
    let formData = new FormData();
    formData.append("user", this.state.user);
    formData.append("project", project);
    return this._post("createImportProject", formData);
  }

  //REST call to delete a specific project
  deleteProject(user, project, silent = false) {
    this._get("deleteProject?user=" + user + "&project=" + project).then(
      (response) => {
        //refresh the projects list
        this.getProjects();
        //ui feedback
        this.setSnackBar(response.info, silent); //we may not want to show the snackbar if we are deleting a project silently, e.g. on a rollback after an unsuccesful import
        //see if the user deleted the current project
        if (response.project === this.state.project) {
          //ui feedback
          this.setSnackBar("Current project deleted - loading first available");
          //load the next available project
          this.state.projects.some((project) => {
            if (project.name !== this.state.project)
              this.loadProject(project.name, this.state.user);
            return project.name !== this.state.project;
          });
        }
      }
    );
  }

  //exports the project on the server and returns the *.mxw file
  exportProject(user, project) {
    return new Promise((resolve, reject) => {
      //switches the results pane to the log tab
      this.setActiveTab("log");
      //call the websocket
      this._ws(
        "exportProject?user=" + user + "&project=" + project,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //websocket has finished
          resolve(
            this.state.marxanServer.endpoint + "exports/" + message.filename
          );
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  cloneProject(user, project) {
    this._get("cloneProject?user=" + user + "&project=" + project)
      .then((response) => {
        //refresh the projects list
        this.getProjects();
        //ui feedback
        this.setSnackBar(response.info);
      })
      .catch((error) => {
        //do something
      });
  }

  //rename a specific project on the server
  renameProject(newName) {
    return new Promise((resolve, reject) => {
      if (newName !== "" && newName !== this.state.project) {
        this._get(
          "renameProject?user=" +
            this.state.owner +
            "&project=" +
            this.state.project +
            "&newName=" +
            newName
        )
          .then((response) => {
            this.setState({ project: newName });
            this.setSnackBar(response.info);
            resolve("Project renamed");
          })
          .catch((error) => {
            //do something
          });
      }
    });
  }
  //rename the description for a specific project on the server
  renameDescription(newDesc) {
    return new Promise((resolve, reject) => {
      this.updateProjectParameter("DESCRIPTION", newDesc).then((response) => {
        this.setState({
          metadata: Object.assign(this.state.metadata, {
            DESCRIPTION: newDesc,
          }),
        });
        resolve("Description renamed");
      });
    });
  }

  getProjects() {
    this._get("getProjects?user=" + this.state.user).then((response) => {
      let projects = [];
      //filter the projects so that private ones arent shown
      response.projects.forEach((project) => {
        if (
          !(
            project.private &&
            project.user !== this.state.user &&
            this.state.userData.ROLE !== "Admin"
          )
        )
          projects.push(project);
      });
      this.setState({ projects: projects });
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////CODE TO PREPROCESS AND RUN MARXAN
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //run a marxan job on the server
  runMarxan(e) {
    //start the logging
    this.startLogging();
    //reset all of the protected and target areas for all features
    this.resetProtectedAreas();
    //reset the run results
    this.resetRun();
    //update the spec.dat file with any that have been added or removed or changed target or spf
    this.updateSpecFile()
      .then((value) => {
        //when the species file has been updated, update the planning unit file
        this.updatePuFile();
        //when the planning unit file has been updated, update the PuVSpr file - this does all the preprocessing using websockets
        this.updatePuvsprFile()
          .then((value) => {
            //start the marxan job
            this.startMarxanJob(this.state.owner, this.state.project)
              .then((response) => {
                //update the run log
                this.getRunLogs();
                if (!this.checkForErrors(response)) {
                  //run completed - get the results
                  this.getResults(response.user, response.project);
                  //switch to the features tab
                  this.features_tab_active();
                } else {
                  //set state with no solutions
                  this.runFinished([]);
                }
              })
              .catch((error) => {
                //reset the running state
                this.marxanStopped(error);
              }); //startMarxanJob
          })
          .catch((error) => {
            //updatePuvsprFile error
            console.error(error);
          });
      })
      .catch((error) => {
        //updateSpecFile error
        console.error(error);
      });
  }

  //stops a process running on the server
  stopProcess(pid) {
    this._get("stopProcess?pid=" + pid, 10000).catch((error) => {
      //if the pid no longer exists then the state needs to be reset anyway
      this.getRunLogs();
    });
  }

  //ui feedback when marxan is stopped by the user
  marxanStopped(error) {
    //update the run log
    this.getRunLogs();
  }

  resetProtectedAreas() {
    //reset all of the results for allFeatures to set their protected_area and target_area to -1
    this.state.allFeatures.forEach((feature) => {
      feature.protected_area = -1;
      feature.target_area = -1;
    });
  }

  //updates the species file with any target values that have changed
  updateSpecFile() {
    let formData = new FormData();
    formData.append("user", this.state.owner);
    formData.append("project", this.state.project);
    var interest_features = [];
    var target_values = [];
    var spf_values = [];
    this.state.projectFeatures.forEach((item) => {
      interest_features.push(item.id);
      target_values.push(item.target_value);
      spf_values.push(item.spf);
    });
    //prepare the data that will populate the spec.dat file
    formData.append("interest_features", interest_features.join(","));
    formData.append("target_values", target_values.join(","));
    formData.append("spf_values", spf_values.join(","));
    return this._post("updateSpecFile", formData);
  }

  //updates the planning unit file with any changes - not implemented yet
  updatePuFile() {}

  updatePuvsprFile() {
    //preprocess the features to create the puvspr.dat file on the server - this is done on demand when the project is run because the user may add/remove Conservation features willy nilly
    let promise = this.preprocessAllFeatures();
    return promise;
  }

  //preprocess a single feature
  async preprocessSingleFeature(feature) {
    this.closeFeatureMenu();
    this.startLogging();
    this.preprocessFeature(feature);
  }

  //preprocess synchronously, i.e. one after another
  async preprocessAllFeatures() {
    var feature;
    //iterate through the features and preprocess the ones that need preprocessing
    for (var i = 0; i < this.state.projectFeatures.length; ++i) {
      feature = this.state.projectFeatures[i];
      if (!feature.preprocessed) {
        await this.preprocessFeature(feature);
      } else {
        //
      }
    }
  }

  //preprocesses a feature using websockets - i.e. intersects it with the planning units grid and writes the intersection results into the puvspr.dat file ready for a marxan run - this will have no server timeout as its running using websockets
  preprocessFeature(feature) {
    return new Promise((resolve, reject) => {
      //switches the results pane to the log tab
      this.setActiveTab("log");
      //call the websocket
      this._ws(
        "preprocessFeature?user=" +
          this.state.owner +
          "&project=" +
          this.state.project +
          "&planning_grid_name=" +
          this.state.metadata.PLANNING_UNIT_NAME +
          "&feature_class_name=" +
          feature.feature_class_name +
          "&alias=" +
          feature.alias +
          "&id=" +
          feature.id,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //websocket has finished
          this.updateFeature(feature, {
            preprocessed: true,
            pu_count: Number(message.pu_count),
            pu_area: Number(message.pu_area),
            occurs_in_planning_grid: Number(message.pu_count) > 0,
          });
          resolve(message);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //calls the marxan executeable and runs it getting the output streamed through websockets
  startMarxanJob(user, project) {
    return new Promise((resolve, reject) => {
      //make the request to get the marxan data
      this._ws(
        "runMarxan?user=" + user + "&project=" + project,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          resolve(message);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //gets the results for a project
  getResults(user, project) {
    return new Promise((resolve, reject) => {
      this._get("getResults?user=" + user + "&project=" + project)
        .then((response) => {
          this.runCompleted(response);
          resolve("Results retrieved");
        })
        .catch((error) => {
          reject("Unable to get results");
        });
    });
  }

  //run completed
  runCompleted(response) {
    var solutions;
    //get the response and store it in this component
    this.runMarxanResponse = response;
    //if we have some data to map then set the state to reflect this
    if (
      this.runMarxanResponse.ssoln &&
      this.runMarxanResponse.ssoln.length > 0
    ) {
      this.setSnackBar(response.info);
      //render the sum solution map
      this.renderSolution(this.runMarxanResponse.ssoln, true);
      //create the array of solutions to pass to the InfoPanels table
      solutions = response.summary;
      //the array data are in the format "Run_Number","Score","Cost","Planning_Units" - so create an array of objects to pass to the outputs table
      solutions = solutions.map((item) => {
        return {
          Run_Number: item[0],
          Score: Number(item[1]).toFixed(1),
          Cost: Number(item[2]).toFixed(1),
          Planning_Units: item[3],
          Missing_Values: item[12],
        };
      });
      //add in the row for the summed solutions
      solutions.splice(0, 0, {
        Run_Number: "Sum",
        Score: "",
        Cost: "",
        Planning_Units: "",
        Missing_Values: "",
      });
      //select the first row in the solutions table

      //update the amount of each target that is protected in the current run from the output_mvbest.txt file
      this.updateProtectedAmount(this.runMarxanResponse.mvbest);
    } else {
      solutions = [];
    }
    //set state
    this.runFinished(solutions);
  }

  runFinished(solutions) {
    this.setState({ solutions: solutions });
  }

  //gets the protected area information in m2 from the marxan run and populates the interest features with the values
  updateProtectedAmount(mvData) {
    //copy the current project features state
    let features = this.state.allFeatures;
    //iterate through the features and set the protected amount
    features.forEach((feature) => {
      //get the matching item in the mvbest data
      let mvbestItemIndex = mvData.findIndex((item) => {
        return item[0] === feature.id;
      });
      if (mvbestItemIndex > -1) {
        //the mvbest file may not contain the data for the feature if the project has not been run since the feature was added
        //get the missing values item for the specific feature
        let mvItem = mvData[mvbestItemIndex];
        Object.assign(feature, {
          target_area: mvItem[2],
          protected_area: mvItem[3],
        });
      }
    });
    //update allFeatures and projectFeatures with the new value
    this.setFeaturesState(features);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////IMPORT PROJECT ROUTINES
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  importProject(project, description, zipFilename, files, planning_grid_name) {
    return new Promise((resolve, reject) => {
      let feature_class_name = "",
        uploadId;
      //start the logging
      this.startLogging();
      //set the spinner and lot states
      this.log({
        method: "importProject",
        status: "Importing",
        info: "Starting import..",
      });
      //create a new project
      //TODO: SORT OUT ROLLING BACK IF AN IMPORT FAILS - AND DONT PROVIDE REST CALLS TO DELETE PLANNING UNITS
      this.createImportProject(project)
        .then((response) => {
          this.log({
            method: "importProject",
            status: "Importing",
            info: "Project '" + project + "' created",
          });
          //create the planning unit file
          this.importZippedShapefileAsPu(
            zipFilename,
            planning_grid_name,
            "Imported with the project '" + project + "'"
          )
            .then((response) => {
              //get the planning unit feature_class_name
              feature_class_name = response.feature_class_name;
              //get the uploadid
              uploadId = response.uploadId;
              this.log({
                method: "importProject",
                status: "Importing",
                info: "Planning grid imported",
              });
              //upload all of the files from the local system
              this.uploadFiles(files, project)
                .then((response) => {
                  this.log({
                    method: "importProject",
                    status: "Importing",
                    info: "All files uploaded",
                  });
                  //upgrade the project to the new version of Marxan - this adds the necessary settings in the project file and calculates the statistics for species in the puvspr.dat and puts them in the feature_preprocessing.dat file
                  this.upgradeProject(project)
                    .then((response) => {
                      this.log({
                        method: "importProject",
                        status: "Importing",
                        info: "Project updated to new version",
                      });
                      //update the project file with the new settings - we also have to set the OUTPUTDIR to the standard 'output' as some imported projects may have set different output folders, e.g. output_BLMBEST
                      let d = new Date();
                      let formattedDate =
                        ("00" + d.getDate()).slice(-2) +
                        "/" +
                        ("00" + (d.getMonth() + 1)).slice(-2) +
                        "/" +
                        d.getFullYear().toString().slice(-2) +
                        " " +
                        ("00" + d.getHours()).slice(-2) +
                        ":" +
                        ("00" + d.getMinutes()).slice(-2) +
                        ":" +
                        ("00" + d.getSeconds()).slice(-2);
                      this.updateProjectParams(project, {
                        DESCRIPTION:
                          description +
                          " (imported from an existing Marxan project)",
                        CREATEDATE: formattedDate,
                        OLDVERSION: "True",
                        PLANNING_UNIT_NAME: feature_class_name,
                        OUTPUTDIR: "output",
                      })
                        .then((response) => {
                          // wait for the tileset to upload to mapbox
                          this.pollMapbox(uploadId).then((response) => {
                            //refresh the planning grids
                            this.getPlanningUnitGrids();
                            this.log({
                              method: "importProject",
                              status: "Finished",
                              info: "Import complete",
                            });
                            //now open the project
                            this.loadProject(project, this.state.user);
                            resolve("Import complete");
                          });
                        })
                        .catch((error) => {
                          //updateProjectParams error
                          reject(error);
                        });
                    })
                    .catch((error) => {
                      //upgradeProject error
                      reject(error);
                    });
                })
                .catch((error) => {
                  //uploadFiles error
                  reject(error);
                });
            })
            .catch((error) => {
              //importZippedShapefileAsPu error - delete the project
              this.deleteProject(this.state.user, project, true);
              reject(error);
            });
        })
        .catch((error) => {
          //createImportProject failed - the project already exists
          reject(error);
        });
    });
  }

  //uploads a list of files to the current project
  async uploadFiles(files, project) {
    var file, filepath;
    for (var i = 0; i < files.length; i++) {
      file = files.item(i);
      //see if it is a marxan data file
      if (file.name.slice(-4) === ".dat") {
        const formData = new FormData();
        formData.append("user", this.state.owner);
        formData.append("project", project);
        //the webkitRelativePath will include the folder itself so we have to remove this, e.g. 'Marxan project/input/puvspr.dat' -> '/input/puvspr.dat'
        filepath = file.webkitRelativePath.split("/").slice(1).join("/");
        formData.append("filename", filepath);
        formData.append("value", file);
        this.log({
          method: "uploadFiles",
          status: "Uploading",
          info: "Uploading: " + file.webkitRelativePath,
        });
        await this._post("uploadFile", formData);
      }
    }
  }

  //uploads a single file to the current projects input folder
  uploadFileToProject(value, filename, project) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("user", this.state.owner);
      formData.append("project", this.state.project);
      formData.append("filename", "input/" + filename);
      formData.append("value", value);
      this._post("uploadFile", formData).then(function (response) {
        resolve(response);
      });
    });
  }

  //uploads a single file to a specific folder - value is the filename
  uploadFileToFolder(value, filename, destFolder) {
    return new Promise((resolve, reject) => {
      this.setState({ loading: true });
      const formData = new FormData();
      //the binary data for the file
      formData.append("value", value);
      //the filename
      formData.append("filename", filename);
      //the folder to upload to
      formData.append("destFolder", destFolder);
      this._post("uploadFileToFolder", formData).then(function (response) {
        resolve(response);
      });
    });
  }

  //pads a number with zeros to a specific size, e.g. pad(9,5) => 00009
  pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  //imports a project from an mxd file
  importMXWProject(project, description, filename) {
    return new Promise((resolve, reject) => {
      this.startLogging();
      this._ws(
        "importProject?user=" +
          this.state.user +
          "&project=" +
          project +
          "&filename=" +
          filename +
          "&description=" +
          description,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //websocket has finished
          resolve(message);
          //refresh the project features as there may be new ones
          this.refreshFeatures();
          //load the project
          this.loadProject(project, this.state.user);
        })
        .catch((error) => {
          //do something
          reject(error);
        });
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// SOLUTIONS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //load a specific solution for the current project
  loadSolution(solution) {
    if (solution === "Sum") {
      this.updateProtectedAmount(this.runMarxanResponse.mvbest);
      //load the sum of solutions which will already be loaded
      this.renderSolution(this.runMarxanResponse.ssoln, true);
    } else {
      this.getSolution(this.state.owner, this.state.project, solution).then(
        (response) => {
          this.updateProtectedAmount(response.mv);
          this.renderSolution(response.solution, false);
        }
      );
    }
  }

  //load a solution from another project - used in the clumping dialog - when the solution is loaded the paint properties are set on the individual maps through state changes
  loadOtherSolution(user, project, solution) {
    this.getSolution(user, project, solution).then((response) => {
      var paintProperties = this.getPaintProperties(
        response.solution,
        false,
        false
      );
      //get the project that matches the project name from the this.projects property - this was set when the projectGroup was created
      if (this.projects) {
        var _projects = this.projects.filter((item) => {
          return item.projectName === project;
        });
        //get which clump it is
        var clump = _projects[0].clump;
        switch (clump) {
          case 0:
            this.setState({ map0_paintProperty: paintProperties });
            break;
          case 1:
            this.setState({ map1_paintProperty: paintProperties });
            break;
          case 2:
            this.setState({ map2_paintProperty: paintProperties });
            break;
          case 3:
            this.setState({ map3_paintProperty: paintProperties });
            break;
          case 4:
            this.setState({ map4_paintProperty: paintProperties });
            break;
          default:
            break;
        }
      }
    });
  }

  //gets a solution and returns a promise
  getSolution(user, project, solution) {
    return this._get(
      "getSolution?user=" +
        user +
        "&project=" +
        project +
        "&solution=" +
        solution
    );
  }

  //gets the total number of planning units in the ssoln and outputs the statistics of the distribution to state, e.g. 2 PUs with a value of 1, 3 with a value of 2 etc.
  getssolncount(data) {
    let total = 0;
    let summaryStats = [];
    data.map((item) => {
      summaryStats.push({ number: item[0], count: item[1].length });
      total += item[1].length;
      return null;
    });
    this.setState({ summaryStats: summaryStats });
    return total;
  }
  //gets a sample of the data to be able to do a classification, e.g. natural breaks, jenks etc.
  getssolnSample(data, sampleSize) {
    let sample = [],
      num = 0;
    let ssolnLength = this.getssolncount(data);
    data.map((item) => {
      //use the ceiling function to force outliers to be in the classification, i.e. those planning units that were only selected in 1 solution
      num = Math.ceil((item[1].length / ssolnLength) * sampleSize);
      sample.push(Array(num).fill(item[0]));
      return null;
    });
    return [].concat.apply([], sample);
  }

  //get all data from the ssoln arrays
  getSsolnData(data) {
    let arrays = data.map((item) => {
      return item[1];
    });
    return [].concat.apply([], arrays);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// CLASSIFICATION AND RENDERING
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //gets the classification and colorbrewer object for doing the rendering
  classifyData(data, numClasses, colorCode, classification) {
    //get a sample of the data to make the renderer classification
    let sample = this.getssolnSample(data, 1000); //samples dont work
    // let sample = this.getSsolnData(data); //get all the ssoln data
    //set the data
    this.state.brew.setSeries(sample);
    //if the colorCode is opacity then calculate the rgba values dynamically and add them to the color schemes
    if (colorCode === "opacity") {
      //see if we have already created a brew color scheme for opacity with NUMCLASSES
      if (
        this.state.brew.colorSchemes.opacity === undefined ||
        (this.state.brew.colorSchemes.opacity &&
          !this.state.brew.colorSchemes.opacity[this.state.renderer.NUMCLASSES])
      ) {
        //get a copy of the brew state
        let brewCopy = this.state.brew;
        let newBrewColorScheme = Array(Number(this.state.renderer.NUMCLASSES))
          .fill("rgba(255,0,136,")
          .map((item, index) => {
            return item + (1 / this) * (index + 1) + ")";
          }, this.state.renderer.NUMCLASSES);
        //add the new color scheme
        if (brewCopy.colorSchemes.opacity === undefined)
          brewCopy.colorSchemes.opacity = [];
        brewCopy.colorSchemes.opacity[
          this.state.renderer.NUMCLASSES
        ] = newBrewColorScheme;
        //set the state
        this.setState({ brew: brewCopy });
      }
    }
    //set the color code - see the color theory section on Joshua Tanners page here https://github.com/tannerjt/classybrew - for all the available colour codes
    this.state.brew.setColorCode(colorCode);
    //get the maximum number of colors in this scheme
    let colorSchemeLength = getMaxNumberOfClasses(this.state.brew, colorCode);
    //check the color scheme supports the passed number of classes
    if (numClasses > colorSchemeLength) {
      //set the numClasses to the max for the color scheme
      numClasses = colorSchemeLength;
      //reset the renderer
      this.setState({
        renderer: Object.assign(this.state.renderer, {
          NUMCLASSES: numClasses,
        }),
      });
    }
    //set the number of classes
    this.state.brew.setNumClasses(numClasses);
    //set the classification method - one of equal_interval, quantile, std_deviation, jenks (default)
    this.state.brew.classify(classification);
    this.setState({ dataBreaks: this.state.brew.getBreaks() });
  }

  //called when the renderer state has been updated - renders the solution and saves the renderer back to the server
  rendererStateUpdated(parameter, value) {
    this.renderSolution(this.runMarxanResponse.ssoln, true);
    if (this.state.userData.ROLE !== "ReadOnly")
      this.updateProjectParameter(parameter, value);
  }
  //change the renderer, e.g. jenks, natural_breaks etc.
  changeRenderer(renderer) {
    this.setState(
      {
        renderer: Object.assign(this.state.renderer, {
          CLASSIFICATION: renderer,
        }),
      },
      () => {
        this.rendererStateUpdated("CLASSIFICATION", renderer);
      }
    );
  }
  //change the number of classes of the renderer
  changeNumClasses(numClasses) {
    this.setState(
      {
        renderer: Object.assign(this.state.renderer, {
          NUMCLASSES: numClasses,
        }),
      },
      () => {
        this.rendererStateUpdated("NUMCLASSES", numClasses);
      }
    );
  }
  //change the color code of the renderer
  changeColorCode(colorCode) {
    //set the maximum number of classes that can be selected in the other select boxes
    if (this.state.renderer.NUMCLASSES > this.state.brew.getNumClasses()) {
      this.setState({
        renderer: Object.assign(this.state.renderer, {
          NUMCLASSES: this.state.brew.getNumClasses(),
        }),
      });
    }
    this.setState(
      {
        renderer: Object.assign(this.state.renderer, { COLORCODE: colorCode }),
      },
      () => {
        this.rendererStateUpdated("COLORCODE", colorCode);
      }
    );
  }
  //change how many of the top classes only to show
  changeShowTopClasses(numClasses) {
    this.setState(
      {
        renderer: Object.assign(this.state.renderer, {
          TOPCLASSES: numClasses,
        }),
      },
      () => {
        this.rendererStateUpdated("TOPCLASSES", numClasses);
      }
    );
  }
  //renders the solution - data is the REST response and sum is a flag to indicate if the data is the summed solution (true) or an individual solution (false)
  renderSolution(data, sum) {
    if (!data) return;
    var paintProperties = this.getPaintProperties(data, sum, true);
    //set the render paint property
    this.map.setPaintProperty(
      CONSTANTS.RESULTS_LAYER_NAME,
      "fill-color",
      paintProperties.fillColor
    );
    this.map.setPaintProperty(
      CONSTANTS.RESULTS_LAYER_NAME,
      "fill-outline-color",
      paintProperties.oulineColor
    );
  }

  //gets the various paint properties for the planning unit layer - if setRenderer is true then it will also update the renderer in the Legend panel
  getPaintProperties(data, sum, setRenderer) {
    //build an expression to get the matching puids with different numbers of 'numbers' in the marxan results
    var fill_color_expression = this.initialiseFillColorExpression("puid");
    var fill_outline_color_expression = this.initialiseFillColorExpression(
      "puid"
    );
    if (data.length > 0) {
      var color, visibleValue, value;
      //create the renderer using Joshua Tanners excellent library classybrew - available here https://github.com/tannerjt/classybrew
      if (setRenderer)
        this.classifyData(
          data,
          Number(this.state.renderer.NUMCLASSES),
          this.state.renderer.COLORCODE,
          this.state.renderer.CLASSIFICATION
        );
      //if only the top n classes will be rendered then get the visible value at the boundary
      if (this.state.renderer.TOPCLASSES < this.state.renderer.NUMCLASSES) {
        let breaks = this.state.brew.getBreaks();
        visibleValue =
          breaks[
            this.state.renderer.NUMCLASSES - this.state.renderer.TOPCLASSES + 1
          ];
      } else {
        visibleValue = 0;
      }
      // the rest service sends the data grouped by the 'number', e.g. [1,[23,34,36,43,98]],[2,[16,19]]
      data.forEach((row, index) => {
        if (sum) {
          //multi value rendering
          value = row[0];
          //for each row add the puids and the color to the expression, e.g. [35,36,37],"rgba(255, 0, 136,0.1)"
          color = this.state.brew.getColorInRange(value);
          //add the color to the expression - transparent if the value is less than the visible value
          if (value >= visibleValue) {
            fill_color_expression.push(row[1], color);
            fill_outline_color_expression.push(
              row[1],
              "rgba(150, 150, 150, 0.6)"
            ); //gray outline
          } else {
            fill_color_expression.push(row[1], "rgba(0, 0, 0, 0)");
            fill_outline_color_expression.push(row[1], "rgba(0, 0, 0, 0)");
          }
        } else {
          //single value rendering
          fill_color_expression.push(row[1], "rgba(255, 0, 136,1)");
          fill_outline_color_expression.push(
            row[1],
            "rgba(150, 150, 150, 0.6)"
          ); //gray outline
        }
      });
      // Last value is the default, used where there is no data
      fill_color_expression.push("rgba(0,0,0,0)");
      fill_outline_color_expression.push("rgba(0,0,0,0)");
    } else {
      fill_color_expression = "rgba(0, 0, 0, 0)";
      fill_outline_color_expression = "rgba(0, 0, 0, 0)";
    }
    return {
      fillColor: fill_color_expression,
      oulineColor: fill_outline_color_expression,
    };
  }

  //initialises the fill color expression for matching on attributes values
  initialiseFillColorExpression(attribute) {
    return ["match", ["get", attribute]];
  }

  //renders the planning units edit layer according to the type of layer and pu status
  renderPuEditLayer() {
    let expression;
    if (this.state.planning_units.length > 0) {
      //build an expression to get the matching puids with different statuses in the planning units data
      expression = ["match", ["get", "puid"]];
      // the rest service sends the data grouped by the status, e.g. [1,[23,34,36,43,98]],[2,[16,19]]
      this.state.planning_units.forEach((row, index) => {
        var color;
        //get the status
        switch (row[0]) {
          // case 1: //The PU will be included in the initial reserve system but may or may not be in the final solution.
          //   color = "rgba(63, 191, 63, 1)";
          //   break;
          case 2: //The PU is fixed in the reserve system (“locked in”). It starts in the initial reserve system and cannot be removed.
            color = "rgba(63, 63, 191, 1)";
            break;
          case 3: //The PU is fixed outside the reserve system (“locked out”). It is not included in the initial reserve system and cannot be added.
            color = "rgba(191, 63, 63, 1)";
            break;
          default:
            break;
        }
        //add the color to the expression
        expression.push(row[1], color);
      });
      // Last value is the default, used where there is no data - i.e. for all the planning units with a status of 0
      expression.push("rgba(150, 150, 150, 0)");
    } else {
      //there are no statuses apart from the default 0 status so have a single renderer
      expression = "rgba(150, 150, 150, 0)";
    }
    //set the render paint property
    this.map.setPaintProperty(
      CONSTANTS.STATUS_LAYER_NAME,
      "line-color",
      expression
    );
    this.map.setPaintProperty(
      CONSTANTS.STATUS_LAYER_NAME,
      "line-width",
      CONSTANTS.STATUS_LAYER_LINE_WIDTH
    );
  }

  //renders the planning units cost layer according to the cost for each planning unit
  renderPuCostLayer(cost_data) {
    return new Promise((resolve, reject) => {
      let expression;
      if (cost_data.data.length > 0) {
        //build an expression to get the matching puids with different costs
        expression = ["match", ["get", "puid"]];
        //iterate through the cost data and set the expressions
        cost_data.data.forEach((row, index) => {
          //get the branch labels, i.e. the puids for this histogram bin - they could be empty
          if (row[1].length > 0)
            expression.push(row[1], CONSTANTS.COST_COLORS[index]);
        });
        // Last value is the default
        expression.push("rgba(150, 150, 150, 0)");
      } else {
        //there are no costs apart from the default 0 status so have a single renderer
        expression = "rgba(150, 150, 150, 0.7)";
      }
      //set the render paint property
      this.map.setPaintProperty(
        CONSTANTS.COSTS_LAYER_NAME,
        "fill-color",
        expression
      );
      //set the min/max properties in the layer as metadata
      this.setLayerMetadata(CONSTANTS.COSTS_LAYER_NAME, {
        min: cost_data.min,
        max: cost_data.max,
      });
      //show the layer
      this.showLayer(CONSTANTS.COSTS_LAYER_NAME);
      resolve("Costs rendered");
    });
  }

  //convenience method to get the rendered features safely and not to show and error message if the layer doesnt exist in the map style
  getRenderedFeatures(pt, layers) {
    let features = [];
    if (this.map.getLayer(layers[0]))
      features = this.map.queryRenderedFeatures(pt, { layers: layers });
    return features;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// MAP INSTANTIATION, LAYERS ADDING/REMOVING AND INTERACTION
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //instantiates the mapboxgl map
  createMap(url) {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: url,
      center: [0, 0],
      zoom: 2,
    });
    //add event handlers for the load and error events
    this.map.on("load", this.mapLoaded.bind(this));
    this.map.on("error", this.mapError.bind(this));
    //click event
    this.map.on("click", this.mapClick.bind(this));
    //style change, this includes adding/removing layers and showing/hiding layers
    this.map.on("styledata", this.mapStyleChanged.bind(this));
  }

  mapLoaded(e) {
    // this.map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right'); // currently full screen hides the info panel and setting position:absolute and z-index: 10000000000 doesnt work properly
    this.map.addControl(new mapboxgl.ScaleControl());
    this.map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    this.map.addControl(new HomeButton());
    //create the draw controls for the map
    this.mapboxDrawControls = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
    });
    this.map.on("moveend", (evt) => {
      if (this.state.clumpingDialogOpen) this.updateMapCentreAndZoom(); //only update the state if the clumping dialog is open
    });
    this.map.on("draw.create", this.polygonDrawn.bind(this));
  }

  updateMapCentreAndZoom() {
    this.setState({
      mapCentre: this.map.getCenter(),
      mapZoom: this.map.getZoom(),
    });
  }

  //catch all event handler for map errors
  mapError(e) {
    var message = "";
    switch (e.error.message) {
      case "Not Found":
        message = "The tileset '" + e.source.url + "' was not found";
        break;
      case "Bad Request":
        message =
          "The tileset from source '" +
          e.sourceId +
          "' was not found. See <a href='" +
          CONSTANTS.ERRORS_PAGE +
          "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>";
        break;
      default:
        message = e.error.message;
        break;
    }
    if (message !== "http status 200 returned without content.") {
      this.setSnackBar("MapError: " + message);
      console.error(message);
    }
  }

  //
  mapClick(e) {
    //if the user is not editing planning units or creating a new feature then show the identify features for the clicked point
    if (!this.state.puEditing && !this.map.getSource("mapbox-gl-draw-cold")) {
      //get a list of the layers that we want to query for features
      var featureLayers = this.getLayers([
        CONSTANTS.LAYER_TYPE_PLANNING_UNITS,
        CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS,
        CONSTANTS.LAYER_TYPE_PROTECTED_AREAS,
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
      ]);
      //get the feature layer ids
      let featureLayerIds = featureLayers.map((item) => item.id);
      //get a list of all of the rendered features that were clicked on - these will be planning units, features and protected areas
      var clickedFeatures = this.getRenderedFeatures(e.point, featureLayerIds);
      //set the popup point
      this.setState({ popup_point: e.point });
      //get any planning unit features under the mouse
      let planningUnitFeatures = this.getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_pu_"
      );
      if (
        planningUnitFeatures.length &&
        planningUnitFeatures[0].properties.puid
      )
        this.getPUData(planningUnitFeatures[0].properties.puid);
      //get any conservation features under the mouse
      let identifyFeatures = this.getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_feature_layer_"
      );
      //there may be dupliate conservation features (e.g. with GBIF data) so get a unique list of sourceLayers
      let sourceLayers = identifyFeatures.map((item) => item.sourceLayer);
      let uniqueSourceLayers = Array.from(new Set(sourceLayers));
      //get the full features data from the state.projectFeatures array
      identifyFeatures = uniqueSourceLayers.map((item) => {
        let matchingItem = this.state.projectFeatures.filter((item2) => {
          return item2.feature_class_name === item; //the features feature_class_name is the name of the sourcelayer in the vector tile
        })[0];
        return matchingItem;
      });
      //get any protected area features under the mouse
      let identifyProtectedAreas = this.getFeaturesByLayerStartsWith(
        clickedFeatures,
        "marxan_wdpa_"
      );
      //set the state to populate the identify popup
      this.setState({
        identifyVisible: true,
        identifyFeatures: identifyFeatures,
        identifyProtectedAreas: identifyProtectedAreas,
      });
    }
  }

  //called when layers are added/removed or shown/hidden
  mapStyleChanged(e) {
    //update legend items
    this.updateLegend();
  }
  //after a layer has been added/removed/shown/hidden update the legend items
  updateLegend() {
    let layers = this.map.getStyle().layers;
    //get the visible marxan layers
    let visibleLayers = layers.filter((item) => {
      if (item.id.substr(0, 7) === "marxan_") {
        return item.layout.visibility === "visible";
      } else {
        return false;
      }
    });
    //set the state
    this.setState({ visibleLayers: visibleLayers });
  }
  //gets a set of features that have a layerid that starts with the passed text
  getFeaturesByLayerStartsWith(features, startsWith) {
    let matchedFeatures = features.filter((item) => {
      return item.layer.id.substr(0, startsWith.length) === startsWith;
    });
    return matchedFeatures;
  }

  //gets a list of features for the planning unit
  getPUData(puid) {
    this._get(
      "getPUData?user=" +
        this.state.owner +
        "&project=" +
        this.state.project +
        "&puid=" +
        puid
    ).then((response) => {
      if (response.data.features.length) {
        //if there are some features for the planning unit join the ids onto the full feature data from the state.projectFeatures array
        this.joinArrays(
          response.data.features,
          this.state.projectFeatures,
          "species",
          "id"
        );
      }
      //set the state to update the identify popup
      this.setState({
        identifyPlanningUnits: {
          puData: response.data.pu_data,
          features: response.data.features,
        },
      });
    });
  }

  //joins a set of data from one object array to another
  joinArrays(arr1, arr2, leftId, rightId) {
    let outputArr = [];
    arr1.forEach((item) => {
      //get the matching item in the second array
      let matchingItem = arr2.filter(
        (arr2item) => arr2item[rightId] === item[leftId]
      );
      if (matchingItem.length)
        outputArr.push(Object.assign(item, matchingItem[0]));
    });
    return outputArr;
  }

  //hides the identify popup
  hideIdentifyPopup(e) {
    this.setState({ identifyVisible: false, identifyPlanningUnits: {} });
  }

  //gets a Mapbox Style Specification JSON object from the passed ESRI style endpoint
  getESRIStyle(styleUrl) {
    return new Promise((resolve, reject) => {
      fetch(styleUrl) //fetch the style json
        .then((response) => {
          return response.json().then((style) => {
            // next fetch metadata for the raw tiles
            const TileJSON = style.sources.esri.url;
            fetch(TileJSON).then((response) => {
              return response.json().then((metadata) => {
                let tilesurl =
                  metadata.tiles[0].substr(0, 1) === "/"
                    ? TileJSON + metadata.tiles[0]
                    : TileJSON + "/" + metadata.tiles[0];
                style.sources.esri = {
                  type: "vector",
                  scheme: "xyz",
                  tilejson: metadata.tilejson || "2.0.0",
                  format:
                    (metadata.tileInfo && metadata.tileInfo.format) || "pbf",
                  /* mapbox-gl-js does not respect the indexing of esri tiles because we cache to different zoom levels depending on feature density, in rural areas 404s will still be encountered. more info: https://github.com/mapbox/mapbox-gl-js/pull/1377*/
                  // index: metadata.tileMap ? style.sources.esri.url + '/' + metadata.tileMap : null,
                  maxzoom: 15,
                  tiles: [tilesurl],
                  description: metadata.description,
                  name: metadata.name,
                };
                resolve(style);
              });
            });
          });
        });
    });
  }

  //sets the basemap either on project load, or if the user changes it
  setBasemap(basemap) {
    return new Promise((resolve, reject) => {
      //change the state
      this.setState({ basemap: basemap.name });
      //get a valid map style
      this.getValidStyle(basemap).then((style) => {
        //load the style
        this.loadMapStyle(style).then((evt) => {
          //add the WDPA layer
          this.addWDPASource();
          this.addWDPALayer();
          //add the planning unit layers (if a project has already been loaded)
          if (this.state.tileset) {
            this.addPlanningGridLayers(this.state.tileset);
            //get the results, if any
            if (this.state.owner)
              this.getResults(this.state.owner, this.state.project);
            //filter the wdpa vector tiles - NO LONGER USED
            // this.filterWdpaByIucnCategory(this.state.metadata.IUCN_CATEGORY);
            //turn on/off layers depending on which tab is selected
            if (this.state.activeTab === "planning_units") this.pu_tab_active();
            resolve();
          } else {
            resolve();
          }
        });
      });
    });
  }

  //gets the style JSON either as a valid TileJSON object or as a url to a valid TileJSON object
  getValidStyle(basemap) {
    return new Promise((resolve, reject) => {
      switch (basemap.provider) {
        case "esri":
          //the style json will be loaded dynamically from an esri endpoint and parsed to produce a valid TileJSON object
          this.getESRIStyle(basemap.id).then((styleJson) => {
            resolve(styleJson);
          });
          break;
        case "local":
          //blank background
          resolve({
            version: 8,
            name: "blank",
            sources: {
              openmaptiles: {
                type: "vector",
                url: "",
              },
            },
            layers: [
              {
                id: "background",
                type: "background",
                paint: {
                  "background-color": "#ffffff",
                },
              },
            ],
          });
          break;
        default:
          // the style is a url - just return the url - either mapbox or jrc provided
          resolve(CONSTANTS.MAPBOX_STYLE_PREFIX + basemap.id);
          break;
      }
    });
  }

  //loads the maps style using either a url to a Mapbox Style Specification file or a JSON object
  loadMapStyle(style) {
    return new Promise((resolve, reject) => {
      if (!this.map) {
        this.createMap(style);
      } else {
        //request the style
        this.map.setStyle(style, { diff: false });
      }
      this.map.on("style.load", (evt) => {
        resolve("Map style loaded");
      });
    });
  }

  //called when the planning grid layer has changed, i.e. the project has changed
  changePlanningGrid(tilesetid) {
    return new Promise((resolve, reject) => {
      //get the tileset metadata
      this.getMetadata(tilesetid)
        .then((tileset) => {
          //remove the results layer, planning unit layer etc.
          this.removePlanningGridLayers();
          //add the results layer, planning unit layer etc.
          this.addPlanningGridLayers(tileset);
          //zoom to the layers extent
          if (tileset.bounds != null) zoomToBounds(this.map, tileset.bounds);
          //set the state
          this.setState({ tileset: tileset });
          //filter the wdpa vector tiles as the map doesn't respond to state changes - NO LONGER USED
          // this.filterWdpaByIucnCategory(this.state.metadata.IUCN_CATEGORY);
          resolve();
        })
        .catch((error) => {
          this.setSnackBar(error);
          reject(error);
        });
    });
  }

  //gets all of the metadata for the tileset
  getMetadata(tilesetId) {
    return new Promise((resolve, reject) => {
      fetch(
        "https://api.mapbox.com/v4/" +
          tilesetId +
          ".json?secure&access_token=" +
          this.state.registry.MBAT_PUBLIC
      )
        .then((response) => response.json())
        .then((response2) => {
          if (
            response2.message != null &&
            response2.message.indexOf("does not exist") > 0
          ) {
            reject(
              "The tileset '" +
                tilesetId +
                "' was not found. See <a href='" +
                CONSTANTS.ERRORS_PAGE +
                "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>"
            );
          } else {
            resolve(response2);
          }
        });
    });
  }

  //adds the results, planning unit, planning unit edit etc layers to the map
  addPlanningGridLayers(tileset) {
    //add the source for the planning unit layers
    this.map.addSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME, {
      type: "vector",
      url: "mapbox://" + tileset.id,
    });
    //add the results layer
    this.addMapLayer({
      id: CONSTANTS.RESULTS_LAYER_NAME,
      metadata: {
        name: "Results",
        type: CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS,
      },
      type: "fill",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "visible",
      },
      "source-layer": tileset.name,
      paint: {
        "fill-color": "rgba(0, 0, 0, 0)",
        "fill-outline-color": "rgba(0, 0, 0, 0)",
        "fill-opacity": CONSTANTS.RESULTS_LAYER_OPACITY,
      },
    });
    //add the planning units costs layer
    this.addMapLayer({
      id: CONSTANTS.COSTS_LAYER_NAME,
      metadata: {
        name: "Planning Unit Cost",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST,
      },
      type: "fill",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "none",
      },
      "source-layer": tileset.name,
      paint: {
        "fill-color": "rgba(255, 0, 0, 0)",
        "fill-outline-color": "rgba(150, 150, 150, 0)",
        "fill-opacity": CONSTANTS.PU_COSTS_LAYER_OPACITY,
      },
    });
    //set the result layer in app state so that it can update the Legend component and its opacity control
    this.setState({
      resultsLayer: this.map.getLayer(CONSTANTS.RESULTS_LAYER_NAME),
    });
    //add the planning unit layer
    this.addMapLayer({
      id: CONSTANTS.PU_LAYER_NAME,
      metadata: {
        name: "Planning Unit",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS,
      },
      type: "fill",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "none",
      },
      "source-layer": tileset.name,
      paint: {
        "fill-color": "rgba(0, 0, 0, 0)",
        "fill-outline-color":
          "rgba(150, 150, 150, " + CONSTANTS.PU_LAYER_OPACITY + ")",
        "fill-opacity": CONSTANTS.PU_LAYER_OPACITY,
      },
    });
    //add the planning units manual edit layer - this layer shows which individual planning units have had their status changed
    this.addMapLayer({
      id: CONSTANTS.STATUS_LAYER_NAME,
      metadata: {
        name: "Planning Unit Status",
        type: CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS,
      },
      type: "line",
      source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
      layout: {
        visibility: "none",
      },
      "source-layer": tileset.name,
      paint: {
        "line-color": "rgba(150, 150, 150, 0)",
        "line-width": CONSTANTS.STATUS_LAYER_LINE_WIDTH,
      },
    });
  }

  removePlanningGridLayers() {
    let layers = this.map.getStyle().layers;
    //get the dynamically added layers
    let dynamicLayers = layers.filter((item) => {
      return item.source === CONSTANTS.PLANNING_UNIT_SOURCE_NAME;
    });
    //remove them from the map
    dynamicLayers.forEach((item) => {
      this.removeMapLayer(item.id);
    });
    //remove the sources if present
    if (this.map.getSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME) !== undefined)
      this.map.removeSource(CONSTANTS.PLANNING_UNIT_SOURCE_NAME);
  }

  //adds the WDPA vector tile layer source - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  addWDPASource() {
    //add the source for the wdpa
    let yr = this.state.marxanServer.wdpa_version.substr(-4); //get the year from the wdpa_version
    let attribution =
      "IUCN and UNEP-WCMC (" +
      yr +
      "), The World Database on Protected Areas (WDPA) " +
      this.state.marxanServer.wdpa_version +
      ", Cambridge, UK: UNEP-WCMC. Available at: <a href='http://www.protectedplanet.net'>www.protectedplanet.net</a>";
    let tiles = [
      this.state.registry.WDPA.tilesUrl +
        "layer=marxan:" +
        this.wdpa_vector_tile_layer +
        "&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}",
    ];
    this.setState({ wdpaAttribution: attribution });
    this.map.addSource(CONSTANTS.WDPA_SOURCE_NAME, {
      attribution: attribution,
      type: "vector",
      tiles: tiles,
    });
  }

  //adds the WDPA vector tile layer - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  addWDPALayer() {
    this.addMapLayer({
      id: CONSTANTS.WDPA_LAYER_NAME,
      metadata: {
        name: "Protected Areas",
        type: CONSTANTS.LAYER_TYPE_PROTECTED_AREAS,
      },
      type: "fill",
      source: CONSTANTS.WDPA_SOURCE_NAME,
      "source-layer": this.wdpa_vector_tile_layer,
      layout: {
        visibility: "visible",
      },
      // "filter": ["==", "wdpaid", -1],
      paint: {
        "fill-color": {
          type: "categorical",
          property: "marine",
          stops: [
            ["0", "rgb(99,148,69)"],
            ["1", "rgb(63,127,191)"],
            ["2", "rgb(63,127,191)"],
          ],
        },
        "fill-outline-color": {
          type: "categorical",
          property: "marine",
          stops: [
            ["0", "rgb(99,148,69)"],
            ["1", "rgb(63,127,191)"],
            ["2", "rgb(63,127,191)"],
          ],
        },
        "fill-opacity": CONSTANTS.WDPA_FILL_LAYER_OPACITY,
      },
    });
    //set the wdpa layer in app state so that it can update the Legend component and its opacity control
    this.setState({ wdpaLayer: this.map.getLayer(CONSTANTS.WDPA_LAYER_NAME) });
  }

  showLayer(id) {
    if (this.map && this.map.getLayer(id))
      this.map.setLayoutProperty(id, "visibility", "visible");
  }
  hideLayer(id) {
    if (this.map && this.map.getLayer(id))
      this.map.setLayoutProperty(id, "visibility", "none");
  }
  //centralised code to add a layer to the maps current style
  addMapLayer(mapLayer, beforeLayer) {
    //if a beforeLayer is not passed get the first symbol layer (i.e. label layer) and we will add all fill or line layers before this
    if (!beforeLayer) {
      var allLayers = this.map.getStyle().layers;
      //get the symbol layers
      let symbollayers = allLayers.filter((item) => item.type === "symbol");
      //get the first symbol layer if there are some, otherwise an empty string
      beforeLayer = symbollayers.length ? symbollayers[0].id : "";
    }
    //add the layer
    this.map.addLayer(mapLayer, beforeLayer);
  }
  //centralised code to remove a layer from the maps current style
  removeMapLayer(layerid) {
    this.map.removeLayer(layerid);
  }
  isLayerVisible(layername) {
    return (
      this.map &&
      this.map.getLayer(layername) &&
      this.map.getLayoutProperty(layername, "visibility") === "visible"
    );
  }

  //changes the layers opacity
  changeOpacity(layerId, opacity) {
    if (this.map) {
      let layer = this.map.getLayer(layerId);
      switch (layer.type) {
        case "circle":
          this.map.setPaintProperty(layerId, "circle-opacity", opacity);
          break;
        case "fill":
          this.map.setPaintProperty(layerId, "fill-opacity", opacity);
          break;
        case "line":
          this.map.setPaintProperty(layerId, "line-opacity", opacity);
          break;
        default:
        // code
      }
    }
  }

  //sets the metadata for the layer
  setLayerMetadata(layerId, metadata) {
    let layer = this.map.getLayer(layerId);
    //merge the metadata with the existing metadata
    if (layer) layer.metadata = Object.assign(layer.metadata, metadata);
  }

  //gets a particular set of layers based on the layer types (layerTypes is an array of layer types)
  getLayers(layerTypes) {
    //get the map layers
    var allLayers = this.map.getStyle().layers;
    //iterate through the layers to get the matching ones
    return allLayers.filter((layer) => {
      if (
        layer.hasOwnProperty("metadata") &&
        layer.metadata.hasOwnProperty("type")
      ) {
        return layerTypes.includes(layer.metadata.type);
      } else {
        return false;
      }
    });
  }

  //shows/hides layers of a particular type (layerTypes is an array of layer types)
  showHideLayerTypes(layerTypes, show) {
    //get the marxan layers
    let layers = this.getLayers(layerTypes);
    layers.forEach((layer) => {
      if (show) {
        this.showLayer(layer.id);
      } else {
        this.hideLayer(layer.id);
      }
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///ACTIVATION/DEACTIVATION OF TABS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //fired when the projects tab is selected
  project_tab_active() {
    this.setState({ activeTab: "project" });
    this.pu_tab_inactive();
  }

  //fired when the features tab is selected
  features_tab_active() {
    if (this.state.activeTab !== "features") {
      this.setState({ activeTab: "features" });
      //render the sum solution map
      // this.renderSolution(this.runMarxanResponse.ssoln, true);
      //hide the planning unit layers
      this.pu_tab_inactive();
    }
  }

  //fired when the planning unit tab is selected
  pu_tab_active() {
    this.setState({ activeTab: "planning_units" });
    //show the planning units layer
    this.showLayer(CONSTANTS.PU_LAYER_NAME);
    //show the planning units status layer
    this.showLayer(CONSTANTS.STATUS_LAYER_NAME);
    //show the planning units costs layer
    this.loadCostsLayer();
    //hide the results layer
    this.hideLayer(CONSTANTS.RESULTS_LAYER_NAME);
    //hide the feature layer and feature puid layers
    this.showHideLayerTypes(
      [
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ],
      false
    );
    //render the planning units status layer_edit layer
    this.renderPuEditLayer(CONSTANTS.STATUS_LAYER_NAME);
  }

  //fired whenever another tab is selected
  pu_tab_inactive() {
    //show the results layer
    this.showLayer(CONSTANTS.RESULTS_LAYER_NAME);
    //show the feature layer and feature puid layers
    this.showHideLayerTypes(
      [
        CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ],
      true
    );
    //hide the planning units layer
    this.hideLayer(CONSTANTS.PU_LAYER_NAME);
    //hide the planning units edit layer
    this.hideLayer(CONSTANTS.STATUS_LAYER_NAME);
    //hide the planning units cost layer
    this.hideLayer(CONSTANTS.COSTS_LAYER_NAME);
  }

  // fired when a new tab is selected
  setActiveTab(newValue) {
    this.setState({ activeResultsTab: newValue });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///PLANNING UNIT WORKFLOW AND FUNCTIONS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  startPuEditSession() {
    //set the state
    this.setState({ puEditing: true });
    //set the cursor to a crosshair
    this.map.getCanvas().style.cursor = "crosshair";
    //add the left mouse click event to the planning unit layer
    this.onClickRef = this.moveStatusUp.bind(this); //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("click", CONSTANTS.PU_LAYER_NAME, this.onClickRef);
    //add the mouse right click event to the planning unit layer
    this.onContextMenu = this.resetStatus.bind(this); //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("contextmenu", CONSTANTS.PU_LAYER_NAME, this.onContextMenu);
  }

  stopPuEditSession() {
    //set the state
    this.setState({ puEditing: false });
    //reset the cursor
    this.map.getCanvas().style.cursor = "pointer";
    //remove the mouse left click event
    this.map.off("click", CONSTANTS.PU_LAYER_NAME, this.onClickRef);
    //remove the mouse right click event
    this.map.off("contextmenu", CONSTANTS.PU_LAYER_NAME, this.onContextMenu);
    //update the pu.dat file
    this.updatePuDatFile();
  }

  //clears all of the manual edits from the pu edit layer (except the protected area units)
  clearManualEdits() {
    //clear all the planning unit statuses
    this.setState({ planning_units: [] }, () => {
      //get the puids for the current iucn category
      let puids = this.getPuidsFromIucnCategory(
        this.state.metadata.IUCN_CATEGORY
      );
      //update the planning units
      this.updatePlanningUnits([], puids);
    });
  }

  //sends a list of puids that should be excluded from the run to upddate the pu.dat file
  updatePuDatFile() {
    //initialise the form data
    let formData = new FormData();
    //add the current user
    formData.append("user", this.state.owner);
    //add the current project
    formData.append("project", this.state.project);
    //add the planning unit manual exceptions
    if (this.state.planning_units.length > 0) {
      this.state.planning_units.forEach((item) => {
        //get the name of the status parameter
        let param_name = "status" + item[0];
        //add the planning units
        formData.append(param_name, item[1]);
      });
    }
    //post to the server
    this._post("updatePUFile", formData).then((response) => {
      //do something
    });
  }

  //fired when the user left clicks on a planning unit to move its status up
  moveStatusUp(e) {
    this.changeStatus(e, "up");
  }

  //fired when the user left clicks on a planning unit to reset its status
  resetStatus(e) {
    this.changeStatus(e, "reset");
  }

  changeStatus(e, direction) {
    //get the feature that the user has clicked
    var features = this.getRenderedFeatures(e.point, [CONSTANTS.PU_LAYER_NAME]);
    //get the featureid
    if (features.length > 0) {
      //get the puid
      let puid = features[0].properties.puid;
      //get its current status
      let status = this.getStatusLevel(puid);
      //get the next status level
      let next_status = this.getNextStatusLevel(status, direction);
      //copy the current planning unit statuses
      let statuses = this.state.planning_units;
      //if the planning unit is not at level 0 (in which case it will not be in the planning_units state) - then remove it from the puids array for that status
      if (status !== 0) this.removePuidFromArray(statuses, status, puid);
      //add it to the new status array
      if (next_status !== 0) this.addPuidToArray(statuses, next_status, puid);
      //set the state
      this.setState({ planning_units: statuses });
      //re-render the planning unit edit layer
      this.renderPuEditLayer();
    }
  }

  getStatusLevel(puid) {
    //iterate through the planning unit statuses to see which status the clicked planning unit belongs to, i.e. 1, 2 or 3
    let status_level = 0; //default level as the getPlanningUnits REST call only returns the planning units with non-default values
    CONSTANTS.PLANNING_UNIT_STATUSES.forEach((item) => {
      let planning_units = this.getPlanningUnitsByStatus(item);
      if (planning_units.indexOf(puid) > -1) {
        status_level = item;
      }
    });
    return status_level;
  }

  //gets the array index position for the passed status in the planning_units state
  getStatusPosition(status) {
    let position = -1;
    this.state.planning_units.forEach((item, index) => {
      if (item[0] === status) position = index;
    });
    return position;
  }

  //returns the planning units with a particular status, e.g. 1,2,3
  getPlanningUnitsByStatus(status) {
    //get the position of the status items in the this.state.planning_units
    let position = this.getStatusPosition(status);
    //get the array of planning units
    let returnValue =
      position > -1 ? this.state.planning_units[position][1] : [];
    return returnValue;
  }

  //returns the next status level for a planning unit depending on the direction
  getNextStatusLevel(status, direction) {
    let nextStatus;
    switch (status) {
      case 0:
        nextStatus = direction === "up" ? 3 : 0;
        break;
      case 1: //no longer used
        nextStatus = direction === "up" ? 0 : 0;
        break;
      case 2:
        nextStatus = direction === "up" ? 0 : 0; //used to be 1 going down
        break;
      case 3:
        nextStatus = direction === "up" ? 2 : 0;
        break;
      default:
        break;
    }
    return nextStatus;
  }

  //removes in individual puid value from an array of puid statuses
  removePuidFromArray(statuses, status, puid) {
    return this.removePuidsFromArray(statuses, status, [puid]);
  }

  addPuidToArray(statuses, status, puid) {
    return this.appPuidsToPlanningUnits(statuses, status, [puid]);
  }

  //adds all the passed puids to the planning_units state
  appPuidsToPlanningUnits(statuses, status, puids) {
    //get the position of the status items in the this.state.planning_units, i.e. the index
    let position = this.getStatusPosition(status);
    if (position === -1) {
      //create a new status and empty puid array
      statuses.push([status, []]);
      position = statuses.length - 1;
    }
    //add the puids to the puid array ensuring that they are unique
    statuses[position][1] = Array.from(
      new Set(statuses[position][1].concat(puids))
    );
    return statuses;
  }

  //removes all the passed puids from the planning_units state
  removePuidsFromArray(statuses, status, puids) {
    //get the position of the status items in the this.state.planning_units
    let position = this.getStatusPosition(status);
    if (position > -1) {
      let puid_array = statuses[position][1];
      let new_array = puid_array.filter((item) => {
        return puids.indexOf(item) < 0;
      });
      statuses[position][1] = new_array;
      //if there are no more items in the puid array then remove it
      if (new_array.length === 0) statuses.splice(position, 1);
    }
    return statuses;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //ROUTINES FOR CREATING A NEW PROJECT AND PLANNING UNIT GRIDS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //previews the planning grid
  previewPlanningGrid(planning_grid_metadata) {
    this.setState({
      planning_grid_metadata: planning_grid_metadata,
      planningGridDialogOpen: true,
    });
  }

  //creates a new planning grid unit
  createNewPlanningUnitGrid(iso3, domain, areakm2, shape) {
    return new Promise((resolve, reject) => {
      this.startLogging();
      this._ws(
        "createPlanningUnitGrid?iso3=" +
          iso3 +
          "&domain=" +
          domain +
          "&areakm2=" +
          areakm2 +
          "&shape=" +
          shape,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          this.newPlanningGridCreated(message).then(() => {
            this.updateState({ NewPlanningGridDialogOpen: false });
            //websocket has finished
            resolve(message);
          });
        })
        .catch((error) => {
          //do something
          reject(error);
        });
    });
  }

  //imports a zipped shapefile as a new planning grid
  importPlanningUnitGrid(zipFilename, alias, description) {
    return new Promise((resolve, reject) => {
      this.startLogging();
      this.log({
        method: "importPlanningUnitGrid",
        status: "Started",
        info: "Importing planning grid..",
      });
      this.importZippedShapefileAsPu(zipFilename, alias, description)
        .then((response) => {
          this.log({
            method: "importPlanningUnitGrid",
            status: "Finished",
            info: response.info,
          });
          this.newPlanningGridCreated(response).then(() => {
            this.updateState({ importPlanningGridDialogOpen: false });
          });
        })
        .catch((error) => {
          //importZippedShapefileAsPu error
          this.deletePlanningUnitGrid(alias, true);
          this.log({
            method: "importPlanningUnitGrid",
            status: "Finished",
            error: error,
          });
          reject(error);
        });
    });
  }

  //called when a new planning grid has been created
  newPlanningGridCreated(response) {
    return new Promise((resolve, reject) => {
      //start polling to see when the upload is done
      this.pollMapbox(response.uploadId).then((response) => {
        //update the planning unit items
        this.getPlanningUnitGrids();
        resolve("Planning grid created");
      });
    });
  }

  //deletes a planning unit grid
  deletePlanningUnitGrid(feature_class_name, silent = false) {
    if (silent) {
      //used to roll back failed imports of planning grids
      this.deletePlanningGrid(feature_class_name, true);
    } else {
      //get a list of the projects for the planning grid
      this.getProjectsForPlanningGrid(feature_class_name).then((projects) => {
        //if the planning grid is not being used then delete it
        if (projects.length === 0) {
          this.deletePlanningGrid(feature_class_name, false);
        } else {
          //show the projects list dialog
          this.showProjectListDialog(
            projects,
            "Failed to delete planning grid",
            "The planning grid is used in the following projects"
          );
        }
      });
    }
  }

  //deletes a planning grid
  deletePlanningGrid(feature_class_name, silent) {
    this._get("deletePlanningUnitGrid?planning_grid_name=" + feature_class_name)
      .then((response) => {
        //update the planning unit grids
        this.getPlanningUnitGrids();
        this.setSnackBar(response.info, silent);
      })
      .catch((error) => {
        //additional stuff
      });
  }

  //exports a planning grid to a zipped shapefile
  exportPlanningGrid(feature_class_name) {
    return new Promise((resolve, reject) => {
      this._get("exportPlanningUnitGrid?name=" + feature_class_name)
        .then((response) => {
          resolve(
            this.state.marxanServer.endpoint + "exports/" + response.filename
          );
        })
        .catch((error) => {
          reject();
        });
    });
  }

  //gets a list of projects that use a particular planning grid
  getProjectsForPlanningGrid(feature_class_name) {
    return new Promise((resolve, reject) => {
      //get a list of the projects for the planning grid
      this._get(
        "listProjectsForPlanningGrid?feature_class_name=" + feature_class_name
      ).then((response) => {
        resolve(response.projects);
      });
    });
  }

  getCountries() {
    this._get("getCountries").then((response) => {
      this.setState({ countries: response.records });
    });
  }

  //uploads the named feature class to mapbox on the server
  uploadToMapBox(feature_class_name, mapbox_layer_name) {
    return new Promise((resolve, reject) => {
      this._get(
        "uploadTilesetToMapBox?feature_class_name=" +
          feature_class_name +
          "&mapbox_layer_name=" +
          mapbox_layer_name,
        300000
      )
        .then((response) => {
          this.setState({ loading: true });
          //poll mapbox to see when the upload has finished
          this.pollMapbox(response.uploadid).then((response2) => {
            resolve(response2);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //polls mapbox to see when an upload has finished - returns as promise
  pollMapbox(uploadid) {
    this.setState({ uploading: true });
    this.log({ info: "Uploading to Mapbox..", status: "Uploading" });
    return new Promise((resolve, reject) => {
      if (uploadid === "0") {
        this.log({
          info: "Tileset already exists on Mapbox",
          status: "UploadComplete",
        });
        //reset state
        this.setState({ uploading: false });
        resolve("Uploaded to Mapbox");
      } else {
        let timer = setInterval(() => {
          fetch(
            "https://api.mapbox.com/uploads/v1/" +
              CONSTANTS.MAPBOX_USER +
              "/" +
              uploadid +
              "?access_token=" +
              this.state.registry.MBAT
          )
            .then((response) => response.json())
            .then((response) => {
              if (response.complete) {
                resolve("Uploaded to Mapbox");
                this.log({ info: "Uploaded", status: "UploadComplete" });
                //clear the timer
                this.clearMapboxTimer(uploadid);
              }
              //if there is an error from mapbox then raise it
              if (response.error) {
                reject(response.error);
                let err =
                  "Mapbox upload error: " +
                  response.error +
                  ". See <a href='" +
                  CONSTANTS.ERRORS_PAGE +
                  "#mapbox-upload-error' target='blank'>here</a>";
                //log the error
                this.log({ error: err, status: "UploadFailed" });
                //set the snackbox
                this.setSnackBar(err);
                //clear the timer
                this.clearMapboxTimer(uploadid);
              }
            })
            .catch((error) => {
              this.setState({ uploading: false });
              reject(error);
            });
        }, 3000);
        timers.push({ uploadid: uploadid, timer: timer });
      }
    });
  }
  //resets a timer for a mapbox upload poll
  clearMapboxTimer(uploadid) {
    //clear the timer
    let _timer = timers.find((timer) => timer.uploadid === uploadid);
    clearInterval(_timer.timer);
    //remove the timer from the timers array
    timers = timers.filter((timer) => timer.uploadid !== uploadid);
    //reset state
    if (timers.length === 0) this.setState({ uploading: false });
  }

  openWelcomeDialog() {
    this.parseNotifications();
    this.setState({ welcomeDialogOpen: true });
  }
  openFeaturesDialog(showClearSelectAll) {
    //refresh the features list if we are using a hosted service (other users could have created/deleted items) and the project is not imported (only project features are shown)
    if (
      this.state.marxanServer.system !== "Windows" &&
      !this.state.metadata.OLDVERSION
    )
      this.refreshFeatures();
    this.setState({
      featuresDialogOpen: true,
      addingRemovingFeatures: showClearSelectAll,
    });
    if (showClearSelectAll) this.getSelectedFeatureIds();
  }

  updateState(state_obj) {
    this.setState(state_obj);
  }

  closeNewFeatureDialog() {
    this.setState({ NewFeatureDialogOpen: false });
    //finalise digitising
    this.finaliseDigitising();
  }
  openPlanningGridsDialog() {
    //refresh the planning grids if we are using a hosted service - other users could have created/deleted items
    if (this.state.marxanServer.system !== "Windows")
      this.getPlanningUnitGrids();
    this.setState({ planningGridsDialogOpen: true });
  }

  //used by the import wizard to import a users zipped shapefile as the planning units
  importZippedShapefileAsPu(zipname, alias, description) {
    //the zipped shapefile has been uploaded to the MARXAN folder - it will be imported to PostGIS and a record will be entered in the metadata_planning_units table
    return this._get(
      "importPlanningUnitGrid?filename=" +
        zipname +
        "&name=" +
        alias +
        "&description=" +
        description
    );
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // MANAGING INTEREST FEATURES SECTION
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //updates the properties of a feature and then updates the features state
  updateFeature(feature, newProps) {
    let features = this.state.allFeatures;
    //get the position of the feature
    var index = features.findIndex((element) => {
      return element.id === feature.id;
    });
    if (index !== -1) {
      Object.assign(features[index], newProps);
      //update allFeatures and projectFeatures with the new value
      this.setFeaturesState(features);
    }
  }

  //gets the ids of the selected features
  getSelectedFeatureIds() {
    let ids = [];
    this.state.allFeatures.forEach((feature) => {
      if (feature.selected) ids.push(feature.id);
    });
    this.setState({ selectedFeatureIds: ids });
  }

  //when a user clicks a feature in the FeaturesDialog
  clickFeature(feature) {
    let ids = this.state.selectedFeatureIds;
    if (ids.includes(feature.id)) {
      //remove the feature if it is already selected
      this.removeFeature(feature);
    } else {
      //add the feature to the selected feature array
      this.addFeature(feature);
    }
  }

  //removes a feature from the selectedFeatureIds array
  removeFeature(feature) {
    let ids = this.state.selectedFeatureIds;
    //remove the feature  - this requires a callback on setState otherwise the state is not updated before updateSelectedFeatures is called
    ids = ids.filter((value, index, arr) => {
      return value !== feature.id;
    });
    return new Promise((resolve, reject) => {
      this.setState({ selectedFeatureIds: ids }, () => {
        resolve("Feature removed");
      });
    });
  }

  //adds a feature to the selectedFeatureIds array
  addFeature(feature, callback) {
    let ids = this.state.selectedFeatureIds;
    //add the feautre to the selected feature array
    ids.push(feature.id);
    this.setState({ selectedFeatureIds: ids }, callback);
  }

  //starts a digitising session
  initialiseDigitising() {
    //show the digitising controls if they are not already present, mapbox-gl-draw-cold and mapbox-gl-draw-hot
    if (!this.map.getSource("mapbox-gl-draw-cold"))
      this.map.addControl(this.mapboxDrawControls);
  }

  //finalises the digitising
  finaliseDigitising() {
    //hide the drawing controls
    this.map.removeControl(this.mapboxDrawControls);
  }
  //called when the user has drawn a polygon on screen
  polygonDrawn(evt) {
    //open the new feature dialog for the metadata
    this.updateState({ NewFeatureDialogOpen: true });
    //save the feature in a local variable
    this.digitisedFeatures = evt.features;
  }

  //selects all the features
  selectAllFeatures() {
    let ids = [];
    this.state.allFeatures.forEach((feature) => {
      ids.push(feature.id);
    });
    this.updateState({ selectedFeatureIds: ids });
  }

  //updates the allFeatures to set the various properties based on which features have been selected in the FeaturesDialog or programmatically
  updateSelectedFeatures() {
    //delete the gap analysis as the features within the project have changed
    this.deleteGapAnalysis();
    let allFeatures = this.state.allFeatures;
    allFeatures.forEach((feature) => {
      if (this.state.selectedFeatureIds.includes(feature.id)) {
        Object.assign(feature, { selected: true });
      } else {
        if (this.state.metadata.OLDVERSION) {
          //for imported projects we cannot preprocess them any longer as we dont have access to the features spatial data - therefore dont set preprocessed to false or any of the other stats fields
          Object.assign(feature, { selected: false });
        } else {
          Object.assign(feature, {
            selected: false,
            preprocessed: false,
            protected_area: -1,
            pu_area: -1,
            pu_count: -1,
            target_area: -1,
            occurs_in_planning_grid: false,
          });
        }
        //remove the feature layer if it is loaded
        if (feature.feature_layer_loaded) this.toggleFeatureLayer(feature);
        //remove the planning unit layer if it is loaded
        if (feature.feature_puid_layer_loaded)
          this.toggleFeaturePUIDLayer(feature);
      }
    });
    //when the project features have been saved to state, update the spec.dat file
    this.setFeaturesState(allFeatures, () => {
      //persist the changes to the server
      if (this.state.userData.ROLE !== "ReadOnly") this.updateSpecFile();
      //close the dialog
      this.updateState({
        featuresDialogOpen: false,
        newFeaturePopoverOpen: false,
        importFeaturePopoverOpen: false,
      });
    });
  }

  //updates the target values for all features in the project to the passed value
  updateTargetValueForFeatures(target_value) {
    let allFeatures = this.state.allFeatures;
    //iterate through all features
    allFeatures.forEach((feature) => {
      Object.assign(feature, { target_value: target_value });
    });
    //set the features in app state
    this.setFeaturesState(allFeatures, () => {
      //persist the changes to the server
      if (this.state.userData.ROLE !== "ReadOnly") this.updateSpecFile();
    });
  }

  //the callback is optional and will be called when the state has updated
  setFeaturesState(newFeatures, callback) {
    //update allFeatures and projectFeatures with the new value
    this.setState(
      {
        allFeatures: newFeatures,
        projectFeatures: newFeatures.filter((item) => {
          return item.selected;
        }),
      },
      callback
    );
  }

  //unselects a single Conservation feature
  unselectItem(feature) {
    //remove it from the selectedFeatureIds array
    this.removeFeature(feature).then(() => {
      //refresh the selected features
      this.updateSelectedFeatures();
    });
  }

  //previews the feature
  previewFeature(feature_metadata) {
    this.setState({
      feature_metadata: feature_metadata,
      featureDialogOpen: true,
    });
  }

  //unzips a shapefile on the server
  unzipShapefile(filename) {
    return new Promise((resolve, reject) => {
      this._get("unzipShapefile?filename=" + filename)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //deletes a zip file and shapefile (with the *.shp extension)
  deleteShapefile(zipfile, shapefile) {
    return new Promise((resolve, reject) => {
      this._get(
        "deleteShapefile?zipfile=" + zipfile + "&shapefile=" + shapefile
      )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //gets a list of fieldnames from the passed shapefile - this must exist in the servers root directory
  getShapefileFieldnames(filename) {
    return new Promise((resolve, reject) => {
      this._get("getShapefileFieldnames?filename=" + filename)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //create new features from the already uploaded zipped shapefile
  importFeatures(zipfile, name, description, shapefile, spiltfield) {
    //start the logging
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      let url =
        name !== ""
          ? "importFeatures?zipfile=" +
            zipfile +
            "&shapefile=" +
            shapefile +
            "&name=" +
            name +
            "&description=" +
            description
          : "importFeatures?zipfile=" +
            zipfile +
            "&shapefile=" +
            shapefile +
            "&splitfield=" +
            spiltfield;
      this._ws(url, this.wsMessageCallback.bind(this))
        .then((message) => {
          //get the uploadIds
          let uploadIds = message.uploadIds;
          //get a promise array to see when all of the uploads are done
          let promiseArray = [];
          //iterate through the uploadIds to see when they are done
          for (var i = 0; i < uploadIds.length; ++i) {
            promiseArray.push(this.pollMapbox(uploadIds[i]));
          }
          //see when they're done
          Promise.all(promiseArray).then((response) => {
            resolve("All features uploaded");
          });
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  //imports features from a web resource
  importFeaturesFromWeb(name, description, endpoint, srs, featureType) {
    //start the logging
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      this._ws(
        "createFeaturesFromWFS?name=" +
          name +
          "&description=" +
          description +
          "&endpoint=" +
          endpoint +
          "&srs=" +
          srs +
          "&featuretype=" +
          featureType,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //get the uploadId
          let uploadId = message.uploadId;
          this.pollMapbox(uploadId).then((response) => {
            resolve(response);
          });
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  //import features from GBIF
  importGBIFData(item) {
    //start the logging
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      this._ws(
        "importGBIFData?taxonKey=" +
          item.key +
          "&scientificName=" +
          item.scientificName,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //get the uploadId
          let uploadId = message.uploadId;
          this.pollMapbox(uploadId).then((response) => {
            resolve(response);
          });
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  //requests matching species names in GBIF
  gbifSpeciesSuggest(q) {
    return new Promise((resolve, reject) => {
      this.setState({ loading: true });
      jsonp(
        "https://api.gbif.org/v1/species/suggest?q=" + q + "&rank=SPECIES"
      ).promise.then(
        (response) => {
          resolve(response);
          this.setState({ loading: false });
        },
        (err) => {
          reject(err);
          this.setState({ loading: false });
        }
      );
    });
  }

  //create the new feature from the feature that has been digitised on the map
  createNewFeature(name, description) {
    //start the logging
    this.startLogging();
    this.log({
      method: "createNewFeature",
      status: "Started",
      info: "Creating feature..",
    });
    //post the geometry to the server with the metadata
    let formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    //convert the coordinates into a linestring to create the polygon in postgis
    let coords = this.digitisedFeatures[0].geometry.coordinates[0]
      .map((coordinate) => {
        return coordinate[0] + " " + coordinate[1];
      })
      .join(",");
    formData.append("linestring", "Linestring(" + coords + ")");
    this._post("createFeatureFromLinestring", formData)
      .then((response) => {
        this.log({
          method: "createNewFeature",
          status: "Finished",
          info: response.info,
        });
        //start polling to see when the upload is done
        this.pollMapbox(response.uploadId).then(() => {
          this.newFeatureCreated(response.id);
          //close the dialog
          this.closeNewFeatureDialog();
        });
      })
      .catch((error) => {
        this.log({ status: "Finished", error: error });
      });
  }

  //gets the new feature information and updates the state
  newFeatureCreated(id) {
    //load the interest feature from the marxan web database
    this._get("getFeature?oid=" + id + "&format=json").then((response) => {
      let feature = response.data[0];
      //add the required attributes to use it in Marxan Web and update the allFeatures array
      this.initialiseNewFeature(feature);
      //if add to project is set then add the feature to the project, wait for the selectedFeatureIds state to be updated and then call updateSelectedFeatures
      if (this.state.addToProject)
        this.addFeature(feature, () => {
          this.updateSelectedFeatures();
        });
    });
  }

  //adds the required attributes to use it in Marxan Web and update the allFeatures array
  initialiseNewFeature(feature) {
    //add the required attributes
    this.addFeatureAttributes(feature);
    //update the allFeatures array
    this.addNewFeature(feature);
  }
  //adds a new feature to the allFeatures array
  addNewFeature(feature) {
    //update the allFeatures array
    var featuresCopy = this.state.allFeatures;
    featuresCopy.push(feature);
    //sort the features alphabetically
    featuresCopy.sort((a, b) => {
      if (a.alias.toLowerCase() < b.alias.toLowerCase()) return -1;
      if (a.alias.toLowerCase() > b.alias.toLowerCase()) return 1;
      return 0;
    });
    this.setState({ allFeatures: featuresCopy });
  }

  //attempts to delete a feature - if the feature is in use in a project then it will not be deleted and the list of projects will be shown
  deleteFeature(feature) {
    this.getProjectsForFeature(feature).then((projects) => {
      if (projects.length === 0) {
        this._deleteFeature(feature);
      } else {
        this.showProjectListDialog(
          projects,
          "Failed to delete planning feature",
          "The feature is used in the following projects"
        );
      }
    });
  }

  //deletes a feature
  _deleteFeature(feature) {
    this._get("deleteFeature?feature_name=" + feature.feature_class_name).then(
      (response) => {
        this.setSnackBar("Feature deleted");
        //remove it from the current project if necessary
        this.removeFeature(feature);
        //remove it from the allFeatures array
        this.removeFeatureFromAllFeatures(feature);
      }
    );
  }

  //removes a feature from the allFeatures array
  removeFeatureFromAllFeatures(feature) {
    let featuresCopy = this.state.allFeatures;
    //remove the feature
    featuresCopy = featuresCopy.filter((item) => {
      return item.id !== feature.id;
    });
    //update the allFeatures state
    this.setState({ allFeatures: featuresCopy });
  }

  //makes a call to get the features from the server and returns them
  getFeatures() {
    return new Promise((resolve, reject) => {
      this._get("getAllSpeciesData")
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          //do something
        });
    });
  }

  //gets all the features from the server and updates the state
  getAllFeatures() {
    return new Promise((resolve, reject) => {
      this.getFeatures()
        .then((response) => {
          //set the allfeatures state
          this.setState({ allFeatures: response.data }, () => {
            resolve("Features returned");
          });
        })
        .catch((error) => {
          //do something
        });
    });
  }

  //gets the feature ids as a set from the allFeatures array
  getFeatureIds(_features) {
    return new Set(
      _features.map((item) => {
        return item.id;
      })
    );
  }

  //refreshes the allFeatures state
  refreshFeatures() {
    //refresh all features
    this.getFeatures().then((response) => {
      //get the existing feature ids in the client
      let existingIds = this.getFeatureIds(this.state.allFeatures);
      //get the new feature ids in the server
      let newIds = this.getFeatureIds(response.data);
      //get the features that have been removed as a set
      let removedIds = new Set([...existingIds].filter((x) => !newIds.has(x)));
      removedIds.forEach((item) => {
        //remove it from the allFeatures array
        this.removeFeatureFromAllFeatures({ id: item });
      });
      //get the features that have been added as a set
      let addedIds = new Set([...newIds].filter((x) => !existingIds.has(x)));
      //iterate through the new features and initialise them
      let addedFeatures = response.data.filter((item) => addedIds.has(item.id));
      addedFeatures.forEach((item) => {
        this.initialiseNewFeature(item);
      });
    });
  }
  openFeatureMenu(evt, feature) {
    this.setState({
      featureMenuOpen: true,
      currentFeature: feature,
      menuAnchor: evt.currentTarget,
    });
  }
  closeFeatureMenu(evt) {
    this.setState({ featureMenuOpen: false });
  }

  //hides the feature layer
  hideFeatureLayer() {
    this.state.projectFeatures.forEach((feature) => {
      if (feature.feature_layer_loaded) this.toggleFeatureLayer(feature);
    });
  }

  //toggles the feature layer on the map
  toggleFeatureLayer(feature) {
    if (feature.tilesetid === "") {
      this.setSnackBar(
        "This feature does not have a tileset on Mapbox. See <a href='" +
          CONSTANTS.ERRORS_PAGE +
          "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>"
      );
      return;
    }
    // this.closeFeatureMenu();
    let layerName = feature.tilesetid.split(".")[1];
    let layerId = "marxan_feature_layer_" + layerName;
    if (this.map.getLayer(layerId)) {
      this.removeMapLayer(layerId);
      this.map.removeSource(layerId);
      this.updateFeature(feature, { feature_layer_loaded: false });
    } else {
      //if a planning units layer for a feature is visible then we need to add the feature layer before it - first get the feature puid layer
      var layers = this.getLayers([
        CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
      ]);
      //get the before layer
      let beforeLayer = layers.length > 0 ? layers[0].id : "";
      //get the paint property
      let paintProperty, typeProperty;
      if (feature.source !== "Imported shapefile (points)") {
        paintProperty = {
          "fill-color": feature.color,
          "fill-opacity": CONSTANTS.FEATURE_LAYER_OPACITY,
          "fill-outline-color": "rgba(0, 0, 0, 0.2)",
        };
        typeProperty = "fill";
      } else {
        paintProperty = {
          "circle-color": feature.color,
          "circle-opacity": CONSTANTS.FEATURE_LAYER_OPACITY,
          "circle-stroke-color": "rgba(0, 0, 0, 0.7)",
          "circle-radius": 3,
        };
        typeProperty = "circle";
      }
      this.addMapLayer(
        {
          id: layerId,
          metadata: {
            name: feature.alias,
            type: CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
          },
          type: typeProperty,
          source: {
            type: "vector",
            url: "mapbox://" + feature.tilesetid,
          },
          layout: {
            visibility: "visible",
          },
          "source-layer": layerName,
          paint: paintProperty,
        },
        beforeLayer
      ); //add it before the layer that shows the planning unit outlines for the feature
      this.updateFeature(feature, { feature_layer_loaded: true });
    }
  }

  //toggles the planning unit feature layer on the map
  toggleFeaturePUIDLayer(feature) {
    // this.closeFeatureMenu();
    let layerName = "marxan_puid_" + feature.id;
    if (this.map.getLayer(layerName)) {
      this.removeMapLayer(layerName);
      this.updateFeature(feature, { feature_puid_layer_loaded: false });
    } else {
      //get the planning units where the feature occurs
      this._get(
        "getFeaturePlanningUnits?user=" +
          this.state.owner +
          "&project=" +
          this.state.project +
          "&oid=" +
          feature.id
      ).then((response) => {
        //ids retrieved - add the layer
        this.addMapLayer({
          id: layerName,
          metadata: {
            name: feature.alias,
            type: CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER,
            lineColor: feature.color,
          },
          type: "line",
          source: CONSTANTS.PLANNING_UNIT_SOURCE_NAME,
          "source-layer": this.state.tileset.name,
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-opacity": CONSTANTS.FEATURE_PLANNING_GRID_LAYER_OPACITY,
          },
        });
        //update the paint property for the layer
        var line_color_expression = this.initialiseFillColorExpression("puid");
        response.data.forEach((puid) => {
          line_color_expression.push(puid, feature.color);
        });
        // Last value is the default, used where there is no data
        line_color_expression.push("rgba(0,0,0,0)");
        this.map.setPaintProperty(
          layerName,
          "line-color",
          line_color_expression
        );
        //show the layer
        this.showLayer(layerName);
      });
      this.updateFeature(feature, { feature_puid_layer_loaded: true });
    }
  }

  //removes the current feature from the project
  removeFromProject(feature) {
    this.closeFeatureMenu();
    this.unselectItem(feature);
  }

  //zooms to a features extent
  zoomToFeature(feature) {
    this.closeFeatureMenu();
    //transform from BOX(-174.173506487 -18.788241791,-173.86528589 -18.5190063499999) to [[-73.9876, 40.7661], [-73.9397, 40.8002]]
    let points = feature.extent
      .substr(4, feature.extent.length - 5)
      .replace(/ /g, ",")
      .split(",");
    //get the points as numbers
    let nums = points.map((item) => {
      return Number(item);
    });
    //zoom to the feature
    this.map.fitBounds(
      [
        [nums[0], nums[1]],
        [nums[2], nums[3]],
      ],
      { padding: 100 }
    );
  }

  //gets a list of projects for a feature
  getProjectsForFeature(feature) {
    return new Promise((resolve, reject) => {
      this._get("listProjectsForFeature?feature_class_id=" + feature.id).then(
        (response) => {
          resolve(response.projects);
        }
      );
    });
  }

  //gets a list of projects for either a feature or a planning grid
  getProjectList(obj, _type) {
    if (_type === "feature") {
      this.getProjectsForFeature(obj).then((projects) => {
        this.showProjectListDialog(
          projects,
          "Projects list",
          "The feature is used in the following projects:"
        );
      });
    } else {
      this.getProjectsForPlanningGrid(obj.feature_class_name).then(
        (projects) => {
          this.showProjectListDialog(
            projects,
            "Projects list",
            "The feature is used in the following projects:"
          );
        }
      );
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// DIALOG OPENING/CLOSING FUNCTIONS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  showUserMenu(e) {
    e.preventDefault();
    this.setState({ userMenuOpen: true, menuAnchor: e.currentTarget });
  }
  hideUserMenu(e) {
    this.setState({ userMenuOpen: false });
  }
  showHelpMenu(e) {
    e.preventDefault();
    this.setState({ helpMenuOpen: true, menuAnchor: e.currentTarget });
  }
  hideHelpMenu(e) {
    this.setState({ helpMenuOpen: false });
  }
  showToolsMenu(e) {
    e.preventDefault();
    this.setState({ toolsMenuOpen: true, menuAnchor: e.currentTarget });
  }
  hideToolsMenu(e) {
    this.setState({ toolsMenuOpen: false });
  }

  openProjectsDialog() {
    this.setState({ projectsDialogOpen: true });
    this.getProjects();
  }

  openNewProjectWizardDialog() {
    this.getCountries();
    this.setState({ newProjectWizardDialogOpen: true });
  }

  openNewPlanningGridDialog() {
    this.getCountries();
    this.setState({ NewPlanningGridDialogOpen: true });
  }

  openUserSettingsDialog() {
    this.setState({ UserSettingsDialogOpen: true });
    this.hideUserMenu();
  }

  openProfileDialog() {
    this.setState({ profileDialogOpen: true });
    this.hideUserMenu();
  }

  openAboutDialog() {
    this.setState({ aboutDialogOpen: true });
    this.hideHelpMenu();
  }

  openClassificationDialog() {
    this.setState({ classificationDialogOpen: true });
  }
  closeClassificationDialog() {
    this.setState({ classificationDialogOpen: false });
  }

  openUsersDialog() {
    this.getUsers();
    this.setState({ usersDialogOpen: true });
  }

  toggleInfoPanel() {
    this.setState({ infoPanelOpen: !this.state.infoPanelOpen });
  }
  toggleResultsPanel() {
    this.setState({ resultsPanelOpen: !this.state.resultsPanelOpen });
  }

  openRunLogDialog() {
    this.getRunLogs();
    this.startPollingRunLogs();
    this.setState({ runLogDialogOpen: true });
  }
  closeRunLogDialog() {
    this.stopPollingRunLogs();
    this.setState({ runLogDialogOpen: false });
  }
  openGapAnalysisDialog() {
    this.setState({ gapAnalysisDialogOpen: true, gapAnalysis: [] });
    this.runGapAnalysis();
  }
  closeGapAnalysisDialog() {
    this.setState({ gapAnalysisDialogOpen: false, gapAnalysis: [] });
  }
  openServerDetailsDialog() {
    this.setState({ serverDetailsDialogOpen: true });
    this.hideHelpMenu();
  }
  closeServerDetailsDialog() {
    this.setState({ serverDetailsDialogOpen: false });
  }
  openChangePasswordDialog() {
    this.hideUserMenu();
    this.setState({ changePasswordDialogOpen: true });
  }
  closeChangePasswordDialog() {
    this.setState({ changePasswordDialogOpen: false });
  }

  showProjectListDialog(
    projectList,
    projectListDialogTitle,
    projectListDialogHeading
  ) {
    this.setState(
      {
        projectList: projectList,
        projectListDialogTitle: projectListDialogTitle,
        projectListDialogHeading: projectListDialogHeading,
      },
      () => {
        this.updateState({ ProjectsListDialogOpen: true });
      }
    );
  }
  openTargetDialog() {
    this.setState({ targetDialogOpen: true });
  }
  closeTargetDialog() {
    this.setState({ targetDialogOpen: false });
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// PROTECTED AREAS LAYERS STUFF
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  changeIucnCategory(iucnCategory) {
    //update the state
    let _metadata = this.state.metadata;
    _metadata.IUCN_CATEGORY = iucnCategory;
    this.setState({ metadata: _metadata });
    //update the input.dat file
    this.updateProjectParameter("IUCN_CATEGORY", iucnCategory);
    //filter the wdpa vector tiles - NO LONGER USED
    // this.filterWdpaByIucnCategory(iucnCategory);
    //render the wdpa intersections on the grid
    this.renderPAGridIntersections(iucnCategory);
  }

  filterWdpaByIucnCategory(iucnCategory) {
    //get the individual iucn categories
    let iucnCategories = this.getIndividualIucnCategories(iucnCategory);
    //TODO FILTER THE WDPA CLIENT SIDE BY INTERSECTING IT WITH THE PLANNING GRID
    //filter the vector tiles for those iucn categories - and if the planning unit name has an iso3 country code - then use that as well. e.g. pu_ton_marine_hexagon_50 (has iso3 code) or pu_a4402723a92444ff829e9411f07e7 (no iso3 code)
    //let filterExpr = (this.state.metadata.PLANNING_UNIT_NAME.match(/_/g).length> 1) ? ['all', ['in', 'IUCN_CAT'].concat(iucnCategories), ['==', 'PARENT_ISO', this.state.metadata.PLANNING_UNIT_NAME.substr(3, 3).toUpperCase()]] : ['all', ['in', 'IUCN_CAT'].concat(iucnCategories)];
    let filterExpr = ["all", ["in", "iucn_cat"].concat(iucnCategories)]; // no longer filter by ISO code
    this.map.setFilter(CONSTANTS.WDPA_LAYER_NAME, filterExpr);
    //turn on/off the protected areas legend
    let layer = iucnCategory === "None" ? false : true;
    this.setState({ pa_layer_visible: layer });
  }

  getIndividualIucnCategories(iucnCategory) {
    let retValue = [];
    switch (iucnCategory) {
      case "None":
        retValue = [""];
        break;
      case "IUCN I-II":
        retValue = ["Ia", "Ib", "II"];
        break;
      case "IUCN I-IV":
        retValue = ["Ia", "Ib", "II", "III", "IV"];
        break;
      case "IUCN I-V":
        retValue = ["Ia", "Ib", "II", "III", "IV", "V"];
        break;
      case "IUCN I-VI":
        retValue = ["Ia", "Ib", "II", "III", "IV", "V", "VI"];
        break;
      case "All":
        retValue = [
          "Ia",
          "Ib",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "Not Reported",
          "Not Applicable",
          "Not Assigned",
        ];
        break;
      default:
    }
    return retValue;
  }

  //gets the puids for those protected areas that intersect the planning grid in the passed iucn category
  getPuidsFromIucnCategory(iucnCategory) {
    let intersections_by_category = this.getIntersections(iucnCategory);
    //get all the puids in this iucn category
    let puids = this.getPuidsFromNormalisedData(intersections_by_category);
    return puids;
  }

  //called when the iucn category changes - gets the puids that need to be added/removed, adds/removes them and updates the PuEdit layer
  async renderPAGridIntersections(iucnCategory) {
    await this.preprocessProtectedAreas(iucnCategory)
      .then((intersections) => {
        //get all the puids of the intersecting protected areas in this iucn category
        let puids = this.getPuidsFromIucnCategory(iucnCategory);
        //see if any of them will overwrite existing manually edited planning units - these will be in status 1 and 3
        let manuallyEditedPuids = this.getPlanningUnitsByStatus(1).concat(
          this.getPlanningUnitsByStatus(3)
        );
        let clashingPuids = manuallyEditedPuids.filter(
          (value) => -1 !== puids.indexOf(value)
        );
        if (clashingPuids.length > 0) {
          //remove them from the puids
          puids = puids.filter((item) => !clashingPuids.includes(item));
          this.setSnackBar(
            "Not all planning units have been added. See <a href='" +
              CONSTANTS.ERRORS_PAGE +
              "#not-all-planning-units-have-been-added' target='blank'>here</a>"
          );
        }
        //get all the puids for the existing iucn category - these will come from the previousPuids rather than getPuidsFromIucnCategory as there may have been some clashes and not all of the puids from getPuidsFromIucnCategory may actually be renderered
        //if the previousPuids are undefined then get them from the projects previousIucnCategory
        let previousPuids =
          this.previousPuids !== undefined
            ? this.previousPuids
            : this.getPuidsFromIucnCategory(this.previousIucnCategory);
        //set the previously selected puids
        this.previousPuids = puids;
        //and previousIucnCategory
        this.previousIucnCategory = iucnCategory;
        //rerender
        this.updatePlanningUnits(previousPuids, puids);
      })
      .catch((error) => {
        this.setSnackBar(error);
      });
  }

  //updates the planning units by reconciling the passed arrays of puids
  updatePlanningUnits(previousPuids, puids) {
    //copy the current planning units state
    let statuses = this.state.planning_units;
    //get the new puids that need to be added
    let newPuids = this.getNewPuids(previousPuids, puids);
    if (newPuids.length === 0) {
      //get the puids that need to be removed
      let oldPuids = this.getNewPuids(puids, previousPuids);
      this.removePuidsFromArray(statuses, 2, oldPuids);
    } else {
      //add all the new protected area intersections into the planning units as status 2
      this.appPuidsToPlanningUnits(statuses, 2, newPuids);
    }
    //update the state
    this.setState({ planning_units: statuses });
    //re-render the layer
    this.renderPuEditLayer();
    //update the pu.dat file
    this.updatePuDatFile();
  }

  getNewPuids(previousPuids, puids) {
    return puids.filter((i) => {
      return previousPuids.indexOf(i) === -1;
    });
  }

  preprocessProtectedAreas(iucnCategory) {
    //have the intersections already been calculated
    if (this.state.protected_area_intersections.length > 0) {
      return Promise.resolve(this.state.protected_area_intersections);
    } else {
      //do the intersection on the server
      return new Promise((resolve, reject) => {
        //start the logging
        this.startLogging();
        //call the websocket
        this._ws(
          "preprocessProtectedAreas?user=" +
            this.state.owner +
            "&project=" +
            this.state.project +
            "&planning_grid_name=" +
            this.state.metadata.PLANNING_UNIT_NAME,
          this.wsMessageCallback.bind(this)
        )
          .then((message) => {
            //set the state
            this.setState({
              protected_area_intersections: message.intersections,
            });
            //return a value to the then() call
            resolve(message);
          })
          .catch((error) => {
            reject(error);
          });
      }); //return
    }
  }

  getIntersections(iucnCategory) {
    //get the individual iucn categories
    let _iucn_categories = this.getIndividualIucnCategories(iucnCategory);
    //get the planning units that intersect the protected areas with the passed iucn category
    return this.state.protected_area_intersections.filter((item) => {
      return _iucn_categories.indexOf(item[0]) > -1;
    });
  }

  //downloads and updates the WDPA on the server
  updateWDPA() {
    //start the logging
    this.startLogging();
    //call the webservice
    return new Promise((resolve, reject) => {
      this._ws(
        "updateWDPA?downloadUrl=" +
          this.state.registry.WDPA.downloadUrl +
          "&wdpaVersion=" +
          this.state.registry.WDPA.latest_version,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          //websocket has finished - set the new version of the wdpa
          let obj = Object.assign(this.state.marxanServer, {
            wdpa_version: this.state.registry.WDPA.latest_version,
          });
          //update the state and when it is finished, re-add the wdpa source and layer
          this.setState({ newWDPAVersion: false, marxanServer: obj }, () => {
            //set the source for the WDPA layer to the new vector tiles
            this.setWDPAVectorTilesLayerName(
              this.state.registry.WDPA.latest_version
            );
            //remove the existing WDPA layer and source
            this.removeMapLayer(CONSTANTS.WDPA_LAYER_NAME);
            if (
              this.map &&
              this.map.getSource(CONSTANTS.WDPA_SOURCE_NAME) !== undefined
            )
              this.map.removeSource(CONSTANTS.WDPA_SOURCE_NAME);
            //re-add the WDPA source and layer
            this.addWDPASource();
            this.addWDPALayer();
            //reset the protected area intersections on the client
            this.setState({ protected_area_intersections: [] });
            //recalculate the protected area intersections and refilter the vector tiles
            this.changeIucnCategory(this.state.metadata.IUCN_CATEGORY);
            //close the dialog
            this.updateState({ updateWDPADialogOpen: false });
          });
          resolve(message);
        })
        .catch((error) => {
          reject(error);
        });
    }); //return
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// BOUNDARY LENGTH MODIFIER AND CLUMPING
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async preprocessBoundaryLengths(iucnCategory) {
    if (this.state.files.BOUNDNAME) {
      //if the bounds.dat file already exists
      return Promise.resolve();
    } else {
      //calculate the boundary lengths on the server
      return new Promise((resolve, reject) => {
        //start the logging
        this.startLogging();
        //call the websocket
        this._ws(
          "preprocessPlanningUnits?user=" +
            this.state.owner +
            "&project=" +
            this.state.project,
          this.wsMessageCallback.bind(this)
        )
          .then((message) => {
            //update the state
            var currentFiles = this.state.files;
            currentFiles.BOUNDNAME = "bounds.dat";
            this.setState({ files: currentFiles });
            //return a value to the then() call
            resolve(message);
          })
          .catch((error) => {
            reject(error);
          });
      }); //return
    }
  }

  showClumpingDialog() {
    //update the map centre and zoom state which is used by the maps in the clumping dialog
    this.updateMapCentreAndZoom();
    //when the boundary lengths have been calculated
    this.preprocessBoundaryLengths()
      .then((intersections) => {
        //update the spec.dat file with any that have been added or removed or changed target or spf
        this.updateSpecFile()
          .then((value) => {
            //when the species file has been updated, update the planning unit file
            this.updatePuFile();
            //when the planning unit file has been updated, update the PuVSpr file - this does all the preprocessing using web sockets
            this.updatePuvsprFile().then((value) => {
              //show the clumping dialog
              this.setState({
                clumpingDialogOpen: true,
                clumpingRunning: true,
              });
            });
          })
          .catch((error) => {
            //updateSpecFile error
          });
      })
      .catch((error) => {
        //preprocessBoundaryLengths error
        console.log(error);
      });
  }

  hideClumpingDialog() {
    //delete the project group
    this.deleteProjects();
    //reset the paint properties in the clumping dialog
    this.resetPaintProperties();
    //return state to normal
    this.setState({ clumpingDialogOpen: false });
  }

  //creates a group of 5 projects with UUIDs in the _clumping folder
  createProjectGroupAndRun(blmValues) {
    //clear any exists projects
    if (this.projects) this.deleteProjects();
    return new Promise((resolve, reject) => {
      this._get(
        "createProjectGroup?user=" +
          this.state.owner +
          "&project=" +
          this.state.project +
          "&copies=5&blmValues=" +
          blmValues.join(",")
      )
        .then((response) => {
          //set the local variable for the projects
          this.projects = response.data;
          //run the projects
          this.runProjects(response.data);
          resolve("Project group created");
        })
        .catch((error) => {
          //do something
          reject(error);
        });
    });
  }

  //deletes the projects from the _clumping folder
  deleteProjects() {
    if (this.projects) {
      var projectNames = this.projects.map((item) => {
        return item.projectName;
      });
      //clear the local variable
      this.projects = undefined;
      return new Promise((resolve, reject) => {
        this._get("deleteProjects?projectNames=" + projectNames.join(","))
          .then((response) => {
            resolve("Projects deleted");
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
  }

  runProjects(projects) {
    //reset the counter
    this.projectsRun = 0;
    //set the intitial state
    this.setState({ clumpingRunning: true });
    //run the projects
    projects.forEach((project) => {
      this.startMarxanJob("_clumping", project.projectName, false).then(
        (response) => {
          if (!this.checkForErrors(response, false)) {
            //run completed - get a single solution
            this.loadOtherSolution(response.user, response.project, 1);
          }
          //increment the project counter
          this.projectsRun = this.projectsRun + 1;
          //set the state
          if (this.projectsRun === 5) this.setState({ clumpingRunning: false });
        }
      );
    });
  }

  rerunProjects(blmChanged, blmValues) {
    //reset the paint properties in the clumping dialog
    this.resetPaintProperties();
    //if the blmValues have changed then recreate the project group and run
    if (blmChanged) {
      this.createProjectGroupAndRun(blmValues);
    } else {
      //rerun the projects
      this.runProjects(this.projects);
    }
  }

  setBlmValue(blmValue) {
    var newRunParams = [],
      value;
    //iterate through the run parameters and update the value for the blm
    this.state.runParams.forEach((item) => {
      value = item.key === "BLM" ? String(blmValue) : item.value;
      newRunParams.push({ key: item.key, value: value });
    });
    //update this run parameters
    this.updateRunParams(newRunParams);
  }

  resetPaintProperties() {
    //reset the paint properties
    this.setState({
      map0_paintProperty: [],
      map1_paintProperty: [],
      map2_paintProperty: [],
      map3_paintProperty: [],
      map4_paintProperty: [],
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// MANAGING RUNS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //called when the run log dialog opens and starts polling the run log
  startPollingRunLogs() {
    this.runlogTimer = setInterval(() => {
      this.getRunLogs();
    }, 5000);
  }

  //called when the run log dialog closes and stops polling the run log
  stopPollingRunLogs() {
    clearInterval(this.runlogTimer);
  }
  //returns the log of all of the runs from the server
  getRunLogs() {
    if (!this.state.unauthorisedMethods.includes("getRunLogs")) {
      this._get("getRunLogs").then((response) => {
        this.setState({ runLogs: response.data });
      });
    }
  }

  //clears the records from the run logs file
  clearRunLogs() {
    this._get("clearRunLogs").then((response) => {
      this.getRunLogs();
    });
  }

  getShareableLink() {
    this.updateState({ shareableLinkDialogOpen: true });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// GAP ANALYSIS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  runGapAnalysis() {
    return new Promise((resolve, reject) => {
      //switches the results pane to the log tab
      this.setActiveTab("log");
      //call the websocket
      this._ws(
        "runGapAnalysis?user=" +
          this.state.owner +
          "&project=" +
          this.state.project,
        this.wsMessageCallback.bind(this)
      )
        .then((message) => {
          this.setState({ gapAnalysis: message.data });
          resolve(message);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //deletes a stored gap analysis on the server
  deleteGapAnalysis() {
    this._get(
      "deleteGapAnalysis?user=" +
        this.state.owner +
        "&project=" +
        this.state.project
    ).then((response) => {
      console.log(response);
    });
  }

  setAddToProject(evt, isChecked) {
    this.setState({ addToProject: isChecked });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// COSTS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //changes the cost profile for a project
  changeCostname(costname) {
    return new Promise((resolve, reject) => {
      this._get(
        "updateCosts?user=" +
          this.state.owner +
          "&project=" +
          this.state.project +
          "&costname=" +
          costname
      )
        .then((response) => {
          //update the state
          this.setState({
            metadata: Object.assign(this.state.metadata, { COSTS: costname }),
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //loads the costs layer
  loadCostsLayer(forceReload = false) {
    this.setState({ costsLoading: true });
    this.getPlanningUnitsCostData(forceReload).then((cost_data) => {
      this.renderPuCostLayer(cost_data).then(() => {
        this.setState({ costsLoading: false });
        //do something
      });
    });
  }

  //gets the cost data either from cache (if it has already been loaded) or from the server
  getPlanningUnitsCostData(forceReload) {
    return new Promise((resolve, reject) => {
      //if the cost data has already been loaded
      if (this.cost_data && !forceReload) {
        resolve(this.cost_data);
      } else {
        this._get(
          "getPlanningUnitsCostData?user=" +
            this.state.owner +
            "&project=" +
            this.state.project
        )
          .then((response) => {
            //save the cost data to a local variable
            this.cost_data = response;
            resolve(response);
          })
          .catch((error) => {
            //do something
          });
      }
    });
  }

  //after clicking cancel in the ImportCostsDialog
  deleteCostFileThenClose(costname) {
    return new Promise((resolve, reject) => {
      if (costname) {
        //delete the cost file
        this.deleteCost(costname).then((_) => {
          //close the import costs dialog
          this.updateState({ importCostsDialogOpen: false });
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  //adds a cost in application state
  addCost(costname) {
    //update the state
    let _costnames = this.state.costnames;
    //add the cost profile
    _costnames.push(costname);
    this.setState({ costnames: _costnames });
  }
  //deletes a cost file on the server
  deleteCost(costname) {
    return new Promise((resolve, reject) => {
      this._get(
        "deleteCost?user=" +
          this.state.owner +
          "&project=" +
          this.state.project +
          "&costname=" +
          costname
      )
        .then((response) => {
          //update the state
          let _costnames = this.state.costnames;
          //remove the deleted cost profile
          _costnames = _costnames.filter((item) => item !== costname);
          this.setState({ costnames: _costnames });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  //restores the database back to its original state and runs a git reset on the file system
  resetServer() {
    return new Promise((resolve, reject) => {
      //switches the results pane to the log tab
      this.setActiveTab("log");
      //call the websocket
      this._ws("resetDatabase", this.wsMessageCallback.bind(this))
        .then((message) => {
          //websocket has finished
          resolve(message);
          this.updateState({ resetDialogOpen: false });
        })
        .catch((error) => {
          reject(error);
          this.updateState({ resetDialogOpen: false });
        });
    });
  }

  //cleans up the server - removes dissolved WDPA feature classes, deletes orphaned feature classes, scratch feature classes and clumping files
  cleanup() {
    return new Promise((resolve, reject) => {
      this._get("cleanup?")
        .then((response) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  render() {
    const message = (
      <span
        id="snackbar-message-id"
        dangerouslySetInnerHTML={{ __html: this.state.snackbarMessage }}
      />
    );
    return (
      <MuiThemeProvider>
        <React.Fragment>
          <div
            ref={(el) => (this.mapContainer = el)}
            className="absolute top right left bottom"
          />
          <LoadingDialog open={this.state.shareableLink} />
          <LoginDialog
            open={!this.state.loggedIn}
            onOk={this.validateUser.bind(this)}
            onCancel={() => this.updateState({ registerDialogOpen: true })}
            loading={this.state.loading}
            user={this.state.user}
            password={this.state.password}
            changeUserName={this.changeUserName.bind(this)}
            changePassword={this.changePassword.bind(this)}
            updateState={this.updateState.bind(this)}
            marxanServers={this.state.marxanServers}
            selectServer={this.selectServer.bind(this)}
            marxanServer={this.state.marxanServer}
            marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
          />
          <RegisterDialog
            open={this.state.registerDialogOpen}
            onOk={this.createNewUser.bind(this)}
            updateState={this.updateState.bind(this)}
            loading={this.state.loading}
          />
          <ResendPasswordDialog
            open={this.state.resendPasswordDialogOpen}
            onOk={this.resendPassword.bind(this)}
            onCancel={() =>
              this.updateState({ resendPasswordDialogOpen: false })
            }
            loading={this.state.loading}
            changeEmail={this.changeEmail.bind(this)}
            email={this.state.resendEmail}
          />
          <Welcome
            open={
              this.state.userData.SHOWWELCOMESCREEN &&
              this.state.welcomeDialogOpen
            }
            onOk={this.updateState.bind(this)}
            onCancel={() => this.updateState({ welcomeDialogOpen: false })}
            userData={this.state.userData}
            saveOptions={this.saveOptions.bind(this)}
            notifications={this.state.notifications}
            resetNotifications={this.resetNotifications.bind(this)}
            removeNotification={this.removeNotification.bind(this)}
            openNewProjectDialog={this.openNewProjectWizardDialog.bind(this)}
          />
          <ToolsMenu
            open={this.state.toolsMenuOpen}
            menuAnchor={this.state.menuAnchor}
            hideToolsMenu={this.hideToolsMenu.bind(this)}
            openUsersDialog={this.openUsersDialog.bind(this)}
            openRunLogDialog={this.openRunLogDialog.bind(this)}
            openGapAnalysisDialog={this.openGapAnalysisDialog.bind(this)}
            updateState={this.updateState.bind(this)}
            userRole={this.state.userData.ROLE}
            marxanServer={this.state.marxanServer}
            metadata={this.state.metadata}
            cleanup={this.cleanup.bind(this)}
          />
          <UserMenu
            open={this.state.userMenuOpen}
            menuAnchor={this.state.menuAnchor}
            user={this.state.user}
            userRole={this.state.userData.ROLE}
            hideUserMenu={this.hideUserMenu.bind(this)}
            openUserSettingsDialog={this.openUserSettingsDialog.bind(this)}
            openProfileDialog={this.openProfileDialog.bind(this)}
            logout={this.logout.bind(this)}
            marxanServer={this.state.marxanServer}
            openChangePasswordDialog={this.openChangePasswordDialog.bind(this)}
          />
          <HelpMenu
            open={this.state.helpMenuOpen}
            menuAnchor={this.state.menuAnchor}
            hideHelpMenu={this.hideHelpMenu.bind(this)}
            openAboutDialog={this.openAboutDialog.bind(this)}
          />
          <UserSettingsDialog
            open={this.state.UserSettingsDialogOpen}
            onOk={() => this.updateState({ UserSettingsDialogOpen: false })}
            onCancel={() => this.updateState({ UserSettingsDialogOpen: false })}
            loading={this.state.loading}
            userData={this.state.userData}
            saveOptions={this.saveOptions.bind(this)}
            changeBasemap={this.setBasemap.bind(this)}
            basemaps={this.state.basemaps}
            basemap={this.state.basemap}
          />
          <UsersDialog
            open={this.state.usersDialogOpen}
            onOk={() => this.updateState({ usersDialogOpen: false })}
            onCancel={() => this.updateState({ usersDialogOpen: false })}
            loading={this.state.loading}
            user={this.state.user}
            users={this.state.users}
            deleteUser={this.deleteUser.bind(this)}
            changeRole={this.changeRole.bind(this)}
            guestUserEnabled={this.state.marxanServer.guestUserEnabled}
            toggleEnableGuestUser={this.toggleEnableGuestUser.bind(this)}
          />
          <ProfileDialog
            open={this.state.profileDialogOpen}
            onOk={() => this.updateState({ profileDialogOpen: false })}
            onCancel={() => this.updateState({ profileDialogOpen: false })}
            loading={this.state.loading}
            userData={this.state.userData}
            updateUser={this.updateUser.bind(this)}
          />
          <AboutDialog
            open={this.state.aboutDialogOpen}
            onOk={() => this.updateState({ aboutDialogOpen: false })}
            marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
            wdpaAttribution={this.state.wdpaAttribution}
          />
          <InfoPanel
            open={this.state.infoPanelOpen}
            activeTab={this.state.activeTab}
            user={this.state.user}
            owner={this.state.owner}
            project={this.state.project}
            metadata={this.state.metadata}
            runMarxan={this.runMarxan.bind(this)}
            stopProcess={this.stopProcess.bind(this)}
            pid={this.state.pid}
            renameProject={this.renameProject.bind(this)}
            renameDescription={this.renameDescription.bind(this)}
            features={this.state.projectFeatures}
            project_tab_active={this.project_tab_active.bind(this)}
            features_tab_active={this.features_tab_active.bind(this)}
            pu_tab_active={this.pu_tab_active.bind(this)}
            startPuEditSession={this.startPuEditSession.bind(this)}
            stopPuEditSession={this.stopPuEditSession.bind(this)}
            puEditing={this.state.puEditing}
            clearManualEdits={this.clearManualEdits.bind(this)}
            openFeatureMenu={this.openFeatureMenu.bind(this)}
            preprocessing={this.state.preprocessing}
            openFeaturesDialog={this.openFeaturesDialog.bind(this)}
            changeIucnCategory={this.changeIucnCategory.bind(this)}
            updateFeature={this.updateFeature.bind(this)}
            userRole={this.state.userData.ROLE}
            toggleProjectPrivacy={this.toggleProjectPrivacy.bind(this)}
            openTargetDialog={this.openTargetDialog.bind(this)}
            getShareableLink={this.getShareableLink.bind(this)}
            marxanServer={this.state.marxanServer}
            toggleFeatureLayer={this.toggleFeatureLayer.bind(this)}
            toggleFeaturePUIDLayer={this.toggleFeaturePUIDLayer.bind(this)}
            useFeatureColors={this.state.userData.USEFEATURECOLORS}
            smallLinearGauge={this.state.smallLinearGauge}
            costname={this.state.metadata.COSTS}
            costnames={this.state.costnames}
            changeCostname={this.changeCostname.bind(this)}
            loadCostsLayer={this.loadCostsLayer.bind(this)}
            loading={this.state.loading}
            updateState={this.updateState.bind(this)}
            protected_area_intersections={
              this.state.protected_area_intersections
            }
          />
          <ResultsPanel
            open={this.state.resultsPanelOpen}
            preprocessing={this.state.preprocessing}
            solutions={this.state.solutions}
            loadSolution={this.loadSolution.bind(this)}
            openClassificationDialog={this.openClassificationDialog.bind(this)}
            brew={this.state.brew}
            messages={this.state.logMessages}
            activeResultsTab={this.state.activeResultsTab}
            setActiveTab={this.setActiveTab.bind(this)}
            clearLog={this.clearLog.bind(this)}
            owner={this.state.owner}
            resultsLayer={this.state.resultsLayer}
            wdpaLayer={this.state.wdpaLayer}
            pa_layer_visible={this.state.pa_layer_visible}
            changeOpacity={this.changeOpacity.bind(this)}
            userRole={this.state.userData.ROLE}
            visibleLayers={this.state.visibleLayers}
            metadata={this.state.metadata}
            costsLoading={this.state.costsLoading}
          />
          <FeatureInfoDialog
            open={this.state.openInfoDialogOpen}
            onOk={() => this.updateState({ openInfoDialogOpen: false })}
            onCancel={() => this.updateState({ openInfoDialogOpen: false })}
            loading={this.state.loading}
            feature={this.state.currentFeature}
            updateFeature={this.updateFeature.bind(this)}
            userRole={this.state.userData.ROLE}
            reportUnits={this.state.userData.REPORTUNITS}
          />
          <IdentifyPopup
            visible={this.state.identifyVisible}
            xy={this.state.popup_point}
            identifyPlanningUnits={this.state.identifyPlanningUnits}
            identifyProtectedAreas={this.state.identifyProtectedAreas}
            identifyFeatures={this.state.identifyFeatures}
            loading={this.state.loading}
            hideIdentifyPopup={this.hideIdentifyPopup.bind(this)}
            reportUnits={this.state.userData.REPORTUNITS}
            metadata={this.state.metadata}
          />
          <ProjectsDialog
            open={this.state.projectsDialogOpen}
            onCancel={() =>
              this.updateState({
                projectsDialogOpen: false,
                importProjectPopoverOpen: false,
              })
            }
            loading={this.state.loading}
            projects={this.state.projects}
            oldVersion={this.state.metadata.OLDVERSION}
            updateState={this.updateState.bind(this)}
            deleteProject={this.deleteProject.bind(this)}
            loadProject={this.loadProject.bind(this)}
            exportProject={this.exportProject.bind(this)}
            cloneProject={this.cloneProject.bind(this)}
            unauthorisedMethods={this.state.unauthorisedMethods}
            userRole={this.state.userData.ROLE}
            getAllFeatures={this.getAllFeatures.bind(this)}
            importProjectPopoverOpen={this.state.importProjectPopoverOpen}
            importMXWDialogOpen={this.state.importMXWDialogOpen}
          />
          <NewProjectDialog
            open={this.state.newProjectDialogOpen}
            registry={this.state.registry}
            loading={this.state.loading}
            getPlanningUnitGrids={this.getPlanningUnitGrids.bind(this)}
            planning_unit_grids={this.state.planning_unit_grids}
            openFeaturesDialog={this.openFeaturesDialog.bind(this)}
            features={this.state.allFeatures}
            updateState={this.updateState.bind(this)}
            selectedCosts={this.state.selectedCosts}
            createNewProject={this.createNewProject.bind(this)}
            previewFeature={this.previewFeature.bind(this)}
          />
          <NewProjectWizardDialog
            open={this.state.newProjectWizardDialogOpen}
            onOk={() => this.updateState({ newProjectWizardDialogOpen: false })}
            okDisabled={true}
            countries={this.state.countries}
            updateState={this.updateState.bind(this)}
            createNewNationalProject={this.createNewNationalProject.bind(this)}
          />
          <NewPlanningGridDialog
            open={this.state.NewPlanningGridDialogOpen}
            onCancel={() =>
              this.updateState({ NewPlanningGridDialogOpen: false })
            }
            loading={
              this.state.loading ||
              this.state.preprocessing ||
              this.state.uploading
            }
            createNewPlanningUnitGrid={this.createNewPlanningUnitGrid.bind(
              this
            )}
            countries={this.state.countries}
            setSnackBar={this.setSnackBar.bind(this)}
          />
          <ImportPlanningGridDialog
            open={this.state.importPlanningGridDialogOpen}
            onOk={this.importPlanningUnitGrid.bind(this)}
            onCancel={() =>
              this.updateState({ importPlanningGridDialogOpen: false })
            }
            loading={this.state.loading || this.state.uploading}
            fileUpload={this.uploadFileToFolder.bind(this)}
          />
          <FeaturesDialog
            open={this.state.featuresDialogOpen}
            onOk={this.updateSelectedFeatures.bind(this)}
            loading={this.state.loading || this.state.uploading}
            metadata={this.state.metadata}
            allFeatures={this.state.allFeatures}
            deleteFeature={this.deleteFeature.bind(this)}
            updateState={this.updateState.bind(this)}
            selectAllFeatures={this.selectAllFeatures.bind(this)}
            userRole={this.state.userData.ROLE}
            clickFeature={this.clickFeature.bind(this)}
            addingRemovingFeatures={this.state.addingRemovingFeatures}
            selectedFeatureIds={this.state.selectedFeatureIds}
            initialiseDigitising={this.initialiseDigitising.bind(this)}
            newFeaturePopoverOpen={this.state.newFeaturePopoverOpen}
            importFeaturePopoverOpen={this.state.importFeaturePopoverOpen}
            previewFeature={this.previewFeature.bind(this)}
            marxanServer={this.state.marxanServer}
            refreshFeatures={this.refreshFeatures.bind(this)}
          />
          <FeatureDialog
            open={this.state.featureDialogOpen}
            onOk={() => this.updateState({ featureDialogOpen: false })}
            loading={this.state.loading}
            feature_metadata={this.state.feature_metadata}
            getTilesetMetadata={this.getMetadata.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
            reportUnits={this.state.userData.REPORTUNITS}
            getProjectList={this.getProjectList.bind(this)}
          />
          <NewFeatureDialog
            open={this.state.NewFeatureDialogOpen}
            onOk={this.closeNewFeatureDialog.bind(this)}
            onCancel={this.closeNewFeatureDialog.bind(this)}
            loading={this.state.loading || this.state.uploading}
            createNewFeature={this.createNewFeature.bind(this)}
            addToProject={this.state.addToProject}
            setAddToProject={this.setAddToProject.bind(this)}
          />
          <ImportFeaturesDialog
            open={this.state.importFeaturesDialogOpen}
            importFeatures={this.importFeatures.bind(this)}
            loading={
              this.state.loading ||
              this.state.preprocessing ||
              this.state.uploading
            }
            updateState={this.updateState.bind(this)}
            filename={this.state.featureDatasetFilename}
            fileUpload={this.uploadFileToFolder.bind(this)}
            unzipShapefile={this.unzipShapefile.bind(this)}
            getShapefileFieldnames={this.getShapefileFieldnames.bind(this)}
            deleteShapefile={this.deleteShapefile.bind(this)}
            addToProject={this.state.addToProject}
            setAddToProject={this.setAddToProject.bind(this)}
          />
          <ImportFromWebDialog
            open={this.state.importFromWebDialogOpen}
            onCancel={this.updateState.bind(this)}
            loading={
              this.state.loading ||
              this.state.preprocessing ||
              this.state.uploading
            }
            importFeatures={this.importFeaturesFromWeb.bind(this)}
            addToProject={this.state.addToProject}
            setAddToProject={this.setAddToProject.bind(this)}
          />
          <ImportGBIFDialog
            open={this.state.importGBIFDialogOpen}
            updateState={this.updateState.bind(this)}
            loading={
              this.state.loading ||
              this.state.preprocessing ||
              this.state.uploading
            }
            importGBIFData={this.importGBIFData.bind(this)}
            gbifSpeciesSuggest={this.gbifSpeciesSuggest.bind(this)}
            addToProject={this.state.addToProject}
            setAddToProject={this.setAddToProject.bind(this)}
          />
          <PlanningGridsDialog
            open={this.state.planningGridsDialogOpen}
            updateState={this.updateState.bind(this)}
            loading={this.state.loading}
            getPlanningUnitGrids={this.getPlanningUnitGrids.bind(this)}
            unauthorisedMethods={this.state.unauthorisedMethods}
            planningGrids={this.state.planning_unit_grids}
            openNewPlanningGridDialog={this.openNewPlanningGridDialog.bind(
              this
            )}
            exportPlanningGrid={this.exportPlanningGrid.bind(this)}
            deletePlanningGrid={this.deletePlanningUnitGrid.bind(this)}
            previewPlanningGrid={this.previewPlanningGrid.bind(this)}
            marxanServer={this.state.marxanServer}
          />
          <PlanningGridDialog
            open={this.state.planningGridDialogOpen}
            onOk={() => this.updateState({ planningGridDialogOpen: false })}
            updateState={this.updateState.bind(this)}
            loading={this.state.loading}
            planning_grid_metadata={this.state.planning_grid_metadata}
            getTilesetMetadata={this.getMetadata.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
            getProjectList={this.getProjectList.bind(this)}
          />
          <ProjectsListDialog
            open={this.state.ProjectsListDialogOpen}
            projects={this.state.projectList}
            userRole={this.state.userData.ROLE}
            onOk={() => this.updateState({ ProjectsListDialogOpen: false })}
            title={this.state.projectListDialogTitle}
            heading={this.state.projectListDialogHeading}
          />
          <CostsDialog
            open={this.state.costsDialogOpen}
            onOk={() => this.updateState({ costsDialogOpen: false })}
            onCancel={() => this.updateState({ costsDialogOpen: false })}
            updateState={this.updateState.bind(this)}
            unauthorisedMethods={this.state.unauthorisedMethods}
            costname={this.state.metadata.COSTS}
            deleteCost={this.deleteCost.bind(this)}
            data={this.state.costnames}
          />
          <ImportCostsDialog
            open={this.state.importCostsDialogOpen}
            addCost={this.addCost.bind(this)}
            updateState={this.updateState.bind(this)}
            deleteCostFileThenClose={this.deleteCostFileThenClose.bind(this)}
            loading={this.state.loading}
            fileUpload={this.uploadFileToProject.bind(this)}
          />
          <RunSettingsDialog
            open={this.state.settingsDialogOpen}
            onOk={() => this.updateState({ settingsDialogOpen: false })}
            onCancel={() => this.updateState({ settingsDialogOpen: false })}
            loading={this.state.loading || this.state.preprocessing}
            updateRunParams={this.updateRunParams.bind(this)}
            runParams={this.state.runParams}
            showClumpingDialog={this.showClumpingDialog.bind(this)}
            userRole={this.state.userData.ROLE}
          />
          <ClassificationDialog
            open={this.state.classificationDialogOpen}
            onOk={this.closeClassificationDialog.bind(this)}
            onCancel={this.closeClassificationDialog.bind(this)}
            loading={this.state.loading}
            renderer={this.state.renderer}
            changeColorCode={this.changeColorCode.bind(this)}
            changeRenderer={this.changeRenderer.bind(this)}
            changeNumClasses={this.changeNumClasses.bind(this)}
            changeShowTopClasses={this.changeShowTopClasses.bind(this)}
            summaryStats={this.state.summaryStats}
            brew={this.state.brew}
            dataBreaks={this.state.dataBreaks}
          />
          <ClumpingDialog
            open={this.state.clumpingDialogOpen}
            onOk={this.hideClumpingDialog.bind(this)}
            onCancel={this.hideClumpingDialog.bind(this)}
            tileset={this.state.tileset}
            map0_paintProperty={this.state.map0_paintProperty}
            map1_paintProperty={this.state.map1_paintProperty}
            map2_paintProperty={this.state.map2_paintProperty}
            map3_paintProperty={this.state.map3_paintProperty}
            map4_paintProperty={this.state.map4_paintProperty}
            mapCentre={this.state.mapCentre}
            mapZoom={this.state.mapZoom}
            createProjectGroupAndRun={this.createProjectGroupAndRun.bind(this)}
            rerunProjects={this.rerunProjects.bind(this)}
            setBlmValue={this.setBlmValue.bind(this)}
            clumpingRunning={this.state.clumpingRunning}
          />
          <ImportProjectDialog
            open={this.state.importProjectDialogOpen}
            onOk={() => this.updateState({ importProjectDialogOpen: false })}
            loading={this.state.loading || this.state.uploading}
            importProject={this.importProject.bind(this)}
            fileUpload={this.uploadFileToFolder.bind(this)}
            log={this.log.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
          />
          <ImportMXWDialog
            open={this.state.importMXWDialogOpen}
            onOk={() => this.updateState({ importMXWDialogOpen: false })}
            loading={this.state.loading || this.state.preprocessing}
            importMXWProject={this.importMXWProject.bind(this)}
            fileUpload={this.uploadFileToFolder.bind(this)}
            log={this.log.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
          />
          <ResetDialog
            open={this.state.resetDialogOpen}
            onOk={this.resetServer.bind(this)}
            onCancel={() => this.updateState({ resetDialogOpen: false })}
            onRequestClose={() => this.updateState({ resetDialogOpen: false })}
            loading={this.state.loading}
          />
          <RunLogDialog
            open={this.state.runLogDialogOpen}
            onOk={this.closeRunLogDialog.bind(this)}
            onRequestClose={this.closeRunLogDialog.bind(this)}
            loading={this.state.loading}
            preprocessing={this.state.preprocessing}
            unauthorisedMethods={this.state.unauthorisedMethods}
            runLogs={this.state.runLogs}
            getRunLogs={this.getRunLogs.bind(this)}
            clearRunLogs={this.clearRunLogs.bind(this)}
            stopMarxan={this.stopProcess.bind(this)}
            userRole={this.state.userData.ROLE}
          />
          <ServerDetailsDialog
            open={this.state.serverDetailsDialogOpen}
            onOk={this.closeServerDetailsDialog.bind(this)}
            onCancel={this.closeServerDetailsDialog.bind(this)}
            onRequestClose={this.closeServerDetailsDialog.bind(this)}
            updateState={this.updateState.bind(this)}
            marxanServer={this.state.marxanServer}
            newWDPAVersion={this.state.newWDPAVersion}
            registry={this.state.registry}
          />
          <UpdateWDPADialog
            open={this.state.updateWDPADialogOpen}
            onOk={() => this.updateState({ updateWDPADialogOpen: false })}
            onCancel={() => this.updateState({ updateWDPADialogOpen: false })}
            newWDPAVersion={this.state.newWDPAVersion}
            updateWDPA={this.updateWDPA.bind(this)}
            loading={this.state.preprocessing}
            registry={this.state.registry}
          />
          <ChangePasswordDialog
            open={this.state.changePasswordDialogOpen}
            onOk={this.closeChangePasswordDialog.bind(this)}
            user={this.state.user}
            onRequestClose={this.closeChangePasswordDialog.bind(this)}
            checkPassword={this.checkPassword.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
            updateUser={this.updateUser.bind(this)}
          />
          <AlertDialog
            open={this.state.alertDialogOpen}
            onOk={() => this.updateState({ alertDialogOpen: false })}
          />
          <Snackbar
            open={this.state.snackbarOpen}
            message={message}
            onRequestClose={this.closeSnackbar.bind(this)}
            style={{ maxWidth: "800px !important" }}
            contentStyle={{ maxWidth: "800px !important" }}
            bodyStyle={{ maxWidth: "800px !important" }}
          />
          <Popover
            open={this.state.featureMenuOpen}
            anchorEl={this.state.menuAnchor}
            onRequestClose={this.closeFeatureMenu.bind(this)}
            style={{ width: "307px" }}
          >
            <Menu
              style={{ width: "207px" }}
              onMouseLeave={this.closeFeatureMenu.bind(this)}
            >
              <MenuItemWithButton
                leftIcon={<Properties style={{ margin: "1px" }} />}
                onClick={() =>
                  this.updateState({
                    openInfoDialogOpen: true,
                    featureMenuOpen: false,
                  })
                }
              >
                Properties
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={<RemoveFromProject style={{ margin: "1px" }} />}
                style={{
                  display:
                    this.state.currentFeature.old_version ||
                    this.state.userData.ROLE === "ReadOnly"
                      ? "none"
                      : "block",
                }}
                onClick={this.removeFromProject.bind(
                  this,
                  this.state.currentFeature
                )}
              >
                Remove from project
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={
                  this.state.currentFeature.feature_layer_loaded ? (
                    <RemoveFromMap style={{ margin: "1px" }} />
                  ) : (
                    <AddToMap style={{ margin: "1px" }} />
                  )
                }
                style={{
                  display: this.state.currentFeature.tilesetid
                    ? "block"
                    : "none",
                }}
                onClick={this.toggleFeatureLayer.bind(
                  this,
                  this.state.currentFeature
                )}
              >
                {this.state.currentFeature.feature_layer_loaded
                  ? "Remove from map"
                  : "Add to map"}
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={
                  this.state.currentFeature.feature_puid_layer_loaded ? (
                    <RemoveFromMap style={{ margin: "1px" }} />
                  ) : (
                    <AddToMap style={{ margin: "1px" }} />
                  )
                }
                onClick={this.toggleFeaturePUIDLayer.bind(
                  this,
                  this.state.currentFeature
                )}
                disabled={
                  !(
                    this.state.currentFeature.preprocessed &&
                    this.state.currentFeature.occurs_in_planning_grid
                  )
                }
              >
                {this.state.currentFeature.feature_puid_layer_loaded
                  ? "Remove planning unit outlines"
                  : "Outline planning units where the feature occurs"}
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={<ZoomIn style={{ margin: "1px" }} />}
                style={{
                  display: this.state.currentFeature.extent ? "block" : "none",
                }}
                onClick={this.zoomToFeature.bind(
                  this,
                  this.state.currentFeature
                )}
              >
                Zoom to feature extent
              </MenuItemWithButton>
              <MenuItemWithButton
                leftIcon={<Preprocess style={{ margin: "1px" }} />}
                style={{
                  display:
                    this.state.currentFeature.old_version ||
                    this.state.userData.ROLE === "ReadOnly"
                      ? "none"
                      : "block",
                }}
                onClick={this.preprocessSingleFeature.bind(
                  this,
                  this.state.currentFeature
                )}
                disabled={
                  this.state.currentFeature.preprocessed ||
                  this.state.preprocessing
                }
              >
                Pre-process
              </MenuItemWithButton>
            </Menu>
          </Popover>
          <TargetDialog
            open={this.state.targetDialogOpen}
            onOk={this.closeTargetDialog.bind(this)}
            showCancelButton={true}
            onCancel={this.closeTargetDialog.bind(this)}
            updateTargetValueForFeatures={this.updateTargetValueForFeatures.bind(
              this
            )}
          />
          <GapAnalysisDialog
            open={this.state.gapAnalysisDialogOpen}
            showCancelButton={true}
            onOk={this.closeGapAnalysisDialog.bind(this)}
            onCancel={this.closeGapAnalysisDialog.bind(this)}
            closeGapAnalysisDialog={this.closeGapAnalysisDialog.bind(this)}
            gapAnalysis={this.state.gapAnalysis}
            preprocessing={this.state.preprocessing}
            projectFeatures={this.state.projectFeatures}
            metadata={this.state.metadata}
            marxanServer={this.state.marxanServer}
            reportUnits={this.state.userData.REPORTUNITS}
          />
          <ShareableLinkDialog
            open={this.state.shareableLinkDialogOpen}
            onOk={() => this.updateState({ shareableLinkDialogOpen: false })}
            shareableLinkUrl={
              window.location +
              "?server=" +
              this.state.marxanServer.name +
              "&user=" +
              this.state.user +
              "&project=" +
              this.state.project
            }
          />
          <AppBar
            open={this.state.loggedIn}
            user={this.state.user}
            userRole={this.state.userData.ROLE}
            infoPanelOpen={this.state.infoPanelOpen}
            resultsPanelOpen={this.state.resultsPanelOpen}
            openProjectsDialog={this.openProjectsDialog.bind(this)}
            openFeaturesDialog={this.openFeaturesDialog.bind(this)}
            openPlanningGridsDialog={this.openPlanningGridsDialog.bind(this)}
            toggleInfoPanel={this.toggleInfoPanel.bind(this)}
            toggleResultsPanel={this.toggleResultsPanel.bind(this)}
            showToolsMenu={this.showToolsMenu.bind(this)}
            showUserMenu={this.showUserMenu.bind(this)}
            showHelpMenu={this.showHelpMenu.bind(this)}
            marxanServer={this.state.marxanServer.name}
            openServerDetailsDialog={this.openServerDetailsDialog.bind(this)}
          />
        </React.Fragment>
      </MuiThemeProvider>
    );
  }
}

export default App;
