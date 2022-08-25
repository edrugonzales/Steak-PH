import React, { useState, useEffect } from "react";

const Dashboard = () => {

    return (
        <div
            className="container"
        >
            <a href="https://charts.mongodb.com/charts-production-bjtvy/public/dashboards/f14b077a-2492-4ed3-9bdd-fe0220170043">
                View Charts on Full screen    
            </a>
            <iframe style={{
                width: "100%",
                height: "1080px"
            }} src="https://charts.mongodb.com/charts-production-bjtvy/public/dashboards/f14b077a-2492-4ed3-9bdd-fe0220170043">

            </iframe>
            {/* <div className="row">
                <div className="mb-4 col-md-3">{userLinks()}</div>
                <div className="col-md-9">
                    {userInfo()}
                    {purchaseHistory()}
                </div>
            </div> */}
        </div>
    );
};

export default Dashboard;
