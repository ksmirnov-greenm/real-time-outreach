import { FhirModel, PatientsFhirBundle } from "../models/fhir.model";
import { Uris } from "./constants";
const assert = require('assert');

/*
 * --------------------------------------------------------------------------------------------------------------
 * convert csv data to json string
 * --------------------------------------------------------------------------------------------------------------
 */
function csv2json(csv) {
  const result = [];

  const lines = csv.split(/\r?\n/);
  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  const headers = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length === 0) continue; // skip empty row
    const obj = {};
    let currentline = lines[i].split(",");
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result; //JavaScript object
}

function text2json(text) {
  const objArray = <PatientsFhirBundle>JSON.parse(text);

  const result = [];
  objArray.entry.forEach(element => {
    const obj = {
      patientId: element.id,
      patientFirstName: element.name.find(x => x.use === 'official') ?.given.join(' '),
      patientLastName: element.name.find(x => x.use === 'official') ?.family,
      patientPhone: element.telecom.find(x => x.use === 'mobile') ?.value,
      birthday: element.birthDate,
      gender: element.gender
    }

    result.push(obj);
  });
  return result;
}

function surveyResults2fhir(surveyResults) {
  console.log(surveyResults);
  const entries = [];

  surveyResults ?.patients.forEach(p => {
    let status = '';
    //set actual fhir status, skip patients without answers
    if (p.status == 'partly passed') {
      status = 'in-progress';
    } else if (p.status == 'passed') {
      status = 'completed';
    } else {
      return;
    }
    
    const items = [];
    p.results.forEach(r => {
      if(r.answer) {
        const item = {
          linkId: r.linkId,
          text: r.text,
          answer: [
            r.type == 'boolean' ? {'valueBool': r.answer} : {'valueText': r.answer} 
          ]
        };
        items.push(item);
        }
    });

    const entry = {
      resourceType: "QuestionnaireResponse",
      id: p.surveyId,
      status: status,
      source: {
        reference: 'Patient/' + p.patientId
      },
      item: items
    };
    entries.push(entry);
  });

  const result = {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": surveyResults ?.patients.length,
    "entry": entries
  };
  console.log(result);
  return result;
}

export default {
  csv2json,
  text2json,
  surveyResults2fhir
};
