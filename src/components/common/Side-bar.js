import React from "react";
import { Link } from "react-router-dom";

class SideBar extends React.Component {
    
    render() {
        const currentUrl = window.location.pathname;
        console.log(currentUrl);

        return (currentUrl === "/home" || currentUrl === "/history") 
        ? <div className="sideBar">
            <ul>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/history">History</Link></li>
            </ul>
        </div>
        : null;
    }
}

export default SideBar;