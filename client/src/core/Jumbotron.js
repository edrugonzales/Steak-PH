import React from "react";


const Jumbotron = ({title, description, className,bgImage}) => {
    return(
        <div className={`jumbotron ${className}`}>
            <div className="container">
                <h2>{title}</h2>
                <p className="lead">{description}</p>
            </div>
        </div> 
    )
}

export default Jumbotron;
