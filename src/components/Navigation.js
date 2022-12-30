import React, {useState} from 'react';
import {Link} from "react-router-dom";

export default function(props) {
    
    return (
        <>
            <form action="http://139.177.207.245:5000/upload" method="post" encType="multipart/form-data">
            <input type="file" onChange={props.handleFileChange} name="pdf" accept="application/pdf"></input>
            <button type="submit">Upload PDF</button>
            </form>
            <Link to={'/AdminApp'}><button>Go To Admin Page</button></Link>
            <Link to={'/Leaderboard'}><button>Go To Leaderboard Page</button></Link>
            <br></br>
            <button onClick={props.getRandomPDF}>{props.rateButtonText}</button>
        </>
    )
}