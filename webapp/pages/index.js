import Layout from "../components/layout/layout";
import {useState} from "react";
import StepForm from "../components/step-form/step-form";

export default function Index() {
  
  return <div>
    <StepForm />
  </div>
}

Index.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}
