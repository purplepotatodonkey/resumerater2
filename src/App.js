import './App.css';
import React,{useEffect, useState} from 'react';
import {Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import {Link} from "react-router-dom";
import Navigation from './components/Navigation';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {

  const [file, setFile] = useState(null);
  const [pdf1, setPdf1] = useState(null);
  const [pdf2, setPdf2] = useState(null);
  const [pdfstr1, setPdfstr1] = useState('');
  const [pdfstr2, setPdfstr2] = useState('');
  const [pdfrating1, setPdfrating1] = useState('');
  const [pdfrating2, setPdfrating2] = useState('');
  const [pdfdesc1, setPdfdesc1] = useState('');
  const [pdfdesc2, setPdfdesc2] = useState('');
  const [numPages1, setNumPages1] = useState(null);
  const [numPages2, setNumPages2] = useState(null);
  const [pageNumber1, setPageNumber1] = useState(1);
  const [pageNumber2, setPageNumber2] = useState(1);
  const [resAPI, setResAPI] = useState('');
  const [rateButtonText, setRateButtonText] = useState('Start Rating');
  const [descriptionChangeOn, setDescriptionChangeOn] = useState(false);
  const [descChangeText, setDescChangeText] = useState('');
  const [descChangeDirection, setDescChangeDirection] = useState('L');

  function onDocumentLoadSuccess1({ numPages }) {
    setNumPages1(numPages);
    setPageNumber1(1);
  }

  function onDocumentLoadSuccess2({ numPages }) {
    setNumPages2(numPages);
    setPageNumber2(1);
  }

  const getAllResumesFromDB = async() => {
    console.log("Getting all resumes from DB...")
    const response = await fetch('http://139.177.207.245:5000/db_get_all_resumes', {
      method: 'GET'
    })
    const data = await response.text();
    console.log(data)
    setResAPI(data)
  }
  const resetEntireDB = async() => {
    console.log(`Resetting the entire DB...`)
    const response = await fetch('http://139.177.207.245:5000/db_reset', {
      method: 'GET'
    })
    const data = await response.text();
    console.log(data)
    setResAPI(data)
  }
  const rateLeft = async() => {
    console.log(`Rating Left over Right`)
    const response = await fetch('http://139.177.207.245:5000/rate/'+pdfstr1.substring(36)+"/"+pdfstr2.substring(36), {
      method: 'GET'
    })
    const data = await response.text();
    console.log(data)
    setResAPI(data)
    setPdfrating1(parseInt(pdfrating1)+1)
    setPdfrating2(parseInt(pdfrating2)-1)
    setTimeout(() => {
      console.log("geting new pdfs...")
      getRandomPDF();
    },500)
  }
  const rateRight = async() => {
    console.log(`Rating Right over Left`)
    const response = await fetch('http://139.177.207.245:5000/rate/'+pdfstr2.substring(36)+"/"+pdfstr1.substring(36), {
      method: 'GET'
    })
    const data = await response.text();
    console.log(data)
    setResAPI(data)
    setPdfrating1(parseInt(pdfrating1)-1)
    setPdfrating2(parseInt(pdfrating2)+1)
    setTimeout(() => {
      console.log("geting new pdfs...")
      getRandomPDF();
    },500)
  }

  const getRandomPDF = async() => {
      console.log("Fetching 2 random pdfs from server...")
      const response = await fetch('http://139.177.207.245:5000/random', {
        method: 'GET'
      })
      const data = await response.text();
      console.log(data)
      const response2 = await fetch('http://139.177.207.245:5000/random', {
        method: 'GET'
      })
      const data2 = await response2.text();
      console.log(data2)
      const response3 = await fetch('http://139.177.207.245:5000/getrating/'+data, {
        method: 'GET'
      })
      const data3 = await response3.text();
      console.log(data3)
      const response4 = await fetch('http://139.177.207.245:5000/getrating/'+data2, {
        method: 'GET'
      })
      const data4 = await response4.text();
      console.log(data4)
      const response5 = await fetch('http://139.177.207.245:5000/getdesc/'+data, {
        method: 'GET'
      })
      const data5 = await response5.text();
      console.log(data5)
      const response6 = await fetch('http://139.177.207.245:5000/getdesc/'+data2, {
        method: 'GET'
      })
      const data6 = await response6.text();
      console.log(data6)
      setPdfstr1("http://139.177.207.245:5000/uploads/" + data);
      setPdfstr2("http://139.177.207.245:5000/uploads/" + data2);
      setPdfrating1(data3)
      setPdfrating2(data4)
      setPdfdesc1(data5)
      setPdfdesc2(data6)
      setRateButtonText("Rate Again?")
      setResAPI("Choose Which One you Like More")
  }

  const handleFileChangeData = (data) => {
    if (data) {
      console.log("Handling new data")
      setPdf1(data);
      setPdf2(data);
    } else {
      console.log("No data")
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setPdf1(e.target.files[0]);
      setPdf2(e.target.files[0]);
    }
  }

  const handleLeftDesc = (e) => {
    setDescriptionChangeOn(true)
    setDescChangeDirection('L')
    setDescChangeText(pdfdesc1)
  }
  const handleRightDesc = (e) => {
    setDescriptionChangeOn(true)
    setDescChangeDirection('R')
    setDescChangeText(pdfdesc2)
  }
  const handleDescChangeClose = (e) => {
    setDescriptionChangeOn(false)
  }
  const handleDescChangeSubmit = async(e) => {
    setDescriptionChangeOn(false)
    console.log('Submitting new description...')
    let idtoupdate = '';
    (descChangeDirection === 'L') ? (idtoupdate = pdfstr1.substring(36)) : (idtoupdate = pdfstr2.substring(36))
    console.log('ID to update: ' + idtoupdate)
    console.log('descChangeText: ' + descChangeText)
    const response = await fetch('http://139.177.207.245:5000/updatedesc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idtoupdate.substring(0,idtoupdate.length-1), desc: descChangeText })
    });
    const data = await response.json();
    // console.log(data.message)
    // let output = JSON.stringify(data.message);
    // console.log(output)
    (descChangeDirection === 'L') ? setPdfdesc1(descChangeText) : setPdfdesc2(descChangeText)
  }
  const handleDescChange = (e) => {
    setDescChangeText(e.target.value)
  }

  return (
    <div className="App">
      <div style={{marginTop:"30px"}}></div>
      <Navigation rateButtonText={rateButtonText} handleFileChange={handleFileChange} getRandomPDF={getRandomPDF}/>
      <br></br>
      <br></br>
      {pdfstr1 && <div style={{position:"fixed",top:"50px",left:"15%",width:"25%"}}>id: {pdfstr1.substring(36)}</div>}
      {pdfrating1 && <div style={{position:"fixed",top:"75px",left:"15%",width:"25%"}}>rating: {pdfrating1}</div>}
      {pdfdesc1 && <div style={{position:"fixed",top:"100px",left:"15%",width:"25%"}}>description: {pdfdesc1} <button onClick={handleLeftDesc}>➕</button></div>}
      <div>{resAPI}</div>
      {pdfstr1 && <div style={{position:"fixed",top:"130px",left:"5%",display:'inline', width:"40%"}}>
        {(pageNumber1<numPages1)&&<button onClick={(e) => setPageNumber1(pageNumber1+1)}>+</button>}
        {(pageNumber1>1)&&<button onClick={(e) => setPageNumber1(pageNumber1-1)}>-</button>}
        <Document className={"PDFDocument"} file={pdfstr1} onLoadSuccess={onDocumentLoadSuccess1}>
          <Page className={"PDFPage"} pageNumber={pageNumber1} renderTextLayer={false} renderInteractiveForms={false} size="C10"/>
        </Document>
        <p>
          Page {pageNumber1} of {numPages1}
        </p>
      </div>}
      {pdfstr2 && <div style={{position:"fixed",top:"50px",right:"15%",width:"25%"}}>id: {pdfstr2.substring(36)}</div>}
      {pdfrating2 && <div style={{position:"fixed",top:"75px",right:"15%",width:"25%"}}>rating: {pdfrating2}</div>}
      {pdfdesc2 && <div style={{position:"fixed",top:"100px",right:"15%",width:"25%"}}>description: {pdfdesc2} <button onClick={handleRightDesc}>➕</button></div>}
      {pdfstr2 && <div style={{position:"fixed",top:"130px",right:"5%", display:'inline', width:"40%"}}>
        {(pageNumber2<numPages2)&&<button onClick={(e) => setPageNumber2(pageNumber2+1)}>+</button>}
        {(pageNumber2>1)&&<button onClick={(e) => setPageNumber2(pageNumber2-1)}>-</button>}
        <Document className={"PDFDocument"} file={pdfstr2} onLoadSuccess={onDocumentLoadSuccess2}>
          <Page className={"PDFPage"} pageNumber={pageNumber2} renderTextLayer={false} renderInteractiveForms={false}/>
        </Document>
        <p>
          Page {pageNumber2} of {numPages2}
        </p>
      </div>}
      {descriptionChangeOn && <div style={{fontSize:"50px",backgroundColor:"cyan", zIndex: 2, position: "absolute", top: "300px", left: "50%", padding:"30px", transform: "translate(-50%, -50%)", borderRadius:"10%", border:"5px solid gray", opacity:"0.9"}}><div style={{top:"0px",bottom:"50%",left:"0px",right:"50px",display:"inline"}}>Change Description?</div><button onClick={handleDescChangeClose} style={{fontSize:"30px",marginLeft:"10px"}}>❌</button><br></br><textarea style={{width:"80%"}} value={descChangeText} onChange={handleDescChange} /><button style={{fontSize:"30px",marginLeft:"10px"}} onClick={handleDescChangeSubmit}>✅</button></div>}
      {pdfrating1 && <button className={"hoverbig"} style={{fontSize:"60px",backgroundColor:"red", zIndex: 1, position: "absolute", top: "500px", left: "40%", transform: "translate(-50%, -50%)"}} onClick={rateLeft}>💓</button>}
      {pdfrating2 && <button className={"hoverbig"} style={{fontSize:"60px",backgroundColor:"red", zIndex: 1, position: "absolute", top: "500px", right: "40%", transform: "translate(50%, -50%)"}} onClick={rateRight}>💓</button>}
    </div>
  );
}

export default App;