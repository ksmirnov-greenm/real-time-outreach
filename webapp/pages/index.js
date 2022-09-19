import Layout from "../components/layout/layout";
import {useEffect, useState} from "react";
import StepForm from "../components/step-form/step-form";
import helperService from "../services/helperService";
import datastoreService from "../services/datastoreService";
import surveyService from "../services/surveyService";
import ProgressOverlay from "../components/progress-overlay/progress-overlay";

export default function Index() {
  
  const [processing, setProcessing] = useState(false);
  
  const [patientListCollection, setPatientListCollection] = useState([]);
  const [selectedPatientListSid, setSelectedPatientListSid] = useState('');
  const [surveyCollection, setSurveyCollection] = useState([]);
  const [selectedSurveySid, setSelectedSurveySid] = useState('');
  const [launchIsScheduled, setLaunchIsScheduled] = useState(false);
  //TODO: create time picker
  //for now it is +16min, due to twilio limits 15min-7days,
  //TODO: ideally add limitation in pickers
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + (17 * 60 * 1000)));
  const [timeValue, setTimeValue] = useState(new Date());
  const [requestCount, setRequestCount] = useState(0);
  const [currentRequest, setCurrentRequest] = useState(0);
  
  const selectCurrentList = (sid) => {
    if (selectedPatientListSid === sid) {
      setSelectedPatientListSid('');
      setSelectedSurveySid('');
    } else {
      setSelectedPatientListSid(sid);
      console.log(selectedSurveySid);
    }
  }
  
  const selectCurrentSurvey = (sid) => {
    if (selectedSurveySid === sid) {
      setSelectedSurveySid('');
    } else {
      setSelectedSurveySid(sid);
    }
  }
  
  const uploadPatientList = (e) => {
    const file = Array.from(e.target.files);
    const reader = new FileReader();
    reader.readAsText(file[0]);
    reader.onload = async (event) => {
      const csv = event.target.result;
      const data = csv.split(/\r?\n/);
      const n = data.filter(r => r.length > 0).length - 1; // # of lines excluding empty line & header
      const jsonText = helperService.csv2json(csv);
      const jsonObj = JSON.parse(jsonText);
      
      const patientDocument = await datastoreService.addPatientList(jsonObj, file[0].name);
      
      if (patientListCollection.length === 0) {
        setSelectedPatientListSid(patientDocument.sid);
      }
      setPatientListCollection([...patientListCollection, patientDocument]);
    };
    reader.onerror = function () {
      alert('Unable to read ' + file.name);
    }
  }
  
  const uploadSurvey = (e) => {
    const file = Array.from(e.target.files);
    console.log(file);
    const reader = new FileReader();
    reader.readAsText(file[0]);
    reader.onload = async (event) => {
      const survey = JSON.parse(event.target.result);
      const surveyDocument = await datastoreService.addSurvey(survey, file[0].name);
      
      if (surveyCollection.length === 0) {
        setSelectedSurveySid(surveyDocument.sid);
      }
      setSurveyCollection([...surveyCollection, surveyDocument]);
    };
    reader.onerror = function () {
      alert('Unable to read ' + file.name);
    }
  }
  
  const submit = async () => {
    setProcessing(true);
    
    const [hours, minutes] = timeValue.split(':');
    
    const data = {
      patientListSid: selectedPatientListSid,
      surveySid: selectedSurveySid,
      scheduleDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hours, minutes)
    }
    
    //1. save queue to storage
    const queue = await surveyService.setSurveyPatientListQueue(data);
    setRequestCount(queue.length);
    //limit of twilio function is 10 sec, so we have to trigger studio flows here
    //2. if runs are not scheduled - trigger it
    const patientListDocument = patientListCollection.find(d => d.sid === selectedPatientListSid);
    const surveyDocument = surveyCollection.find(d => d.sid === selectedSurveySid);
    
    //async requests
    await runRequests(queue, patientListDocument, data, 0);
    
    setProcessing(false);
    setCurrentRequest(0);
    setRequestCount(0);
    console.log('submit data: ', data);
  }
  
  const runRequests = async (queue, patientListDocument, data, index) => {
    const run = queue[index];
    const nextRequestIndex = index + 1;
    await request(run, patientListDocument, data);
    if(queue.length > nextRequestIndex) {
      setCurrentRequest(nextRequestIndex);
      return await runRequests(queue, patientListDocument, data, nextRequestIndex);
    }
  }
  
  const request = async (run, patientListDocument, data) => {
    // const patient = patientListDocument.data.patientList.find(d => d.patientId === run.patientId);
    return await (launchIsScheduled) ?
      surveyService.scheduleMessage(run, data.scheduleDate) :
      surveyService.triggerStudioFlow(run);
  }
  
  
  useEffect(() => {
    datastoreService.fetchPatientLists()
      .then(res => {
        console.log(res);
        setPatientListCollection(res);
      });
    datastoreService.getSurveys()
      .then(res => {
        console.log(res);
        if (res.length === 1) {
          setSelectedSurveySid(res[0].sid);
        }
        setSurveyCollection(res);
      });
    
  }, [])
  
  return <>
    {processing && <ProgressOverlay
      requestCount={requestCount}
      current={currentRequest}
    />}
    <StepForm
      patientListCollection={patientListCollection}
      selectedPatientListSid={selectedPatientListSid}
      surveyCollection={surveyCollection}
      selectedSurveySid={selectedSurveySid}
      selectCurrentList={selectCurrentList}
      selectCurrentSurvey={selectCurrentSurvey}
      uploadPatientList={uploadPatientList}
      uploadSurvey={uploadSurvey}
      submit={submit}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      launchIsScheduled={launchIsScheduled}
      setLaunchIsScheduled={setLaunchIsScheduled}
      timeValue={timeValue}
      setTimeValue={setTimeValue}
      removePatientList={(patientSid) => {console.log('remove patient', patientSid);}}
      removeSurvey={(surveySid) => {console.log('remove survey', surveySid);}}
    />
  </>
}

Index.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}
