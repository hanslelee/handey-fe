import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import WeeklyBox from "./WeeklyBox";
import "./WeeklyBoxList.css";

export const WeeklyContext = React.createContext();

function WeeklyBoxList({accessToken, userId, refreshAfterBoxList}) {
    var config = {
        headers: { 'Content-Type': 'application/json', 'ACCESS_TOKEN': accessToken }
      };

    const [weeklyBoxListData, setWeeklyBoxListData] = useState([]);

    useEffect(() => {
        getWeeklyBoxList();
    }, []);

    async function getWeeklyBoxList() {
        await axios
            .get("/user/" + userId + "/weeklyBoxList", config)
            .then((response) => {
                console.log(response.data['data']);
                setWeeklyBoxListData(response.data['data']);
            })
            .catch((error) => {
                console.error("ERROR: " + error);
            });
    };

    const createWeeklyBoxObj = async () => {
        await axios
        .post("/user/" + userId + "/weeklyBox", {}, config)
        .then((response) => {
            // response.data로 새로 생성된 weekly element의 id가 옴
            console.log("weekly box " + response.data['data'] + "가 생성되었습니다.");
            const box = {
                id: response.data['data']['id'],
                title: "",
                clear: false,
                weeklyElmList: response.data['data']['weeklyElmList']
            };

            setWeeklyBoxListData([...weeklyBoxListData, box]);
        })
        .catch((error) => {console.error(error);});
    }
    
    const deleteWeeklyBoxOnScreen = (weeklyBoxId) => {
        setWeeklyBoxListData(weeklyBoxListData.filter((weeklyBox)=> weeklyBox.id !== weeklyBoxId));
    }

    return <WeeklyContext.Provider value = {weeklyBoxListData}>
        <div className="weeklyList">        
            <div className="weeklyList_title">    
                <h1>Weekly</h1> 
                <FontAwesomeIcon className="fa faPlus createWeeklyBoxBtn" icon={faPlus} onClick={()=>{createWeeklyBoxObj();}}/>
            </div>
            <hr/>
            <div className="weeklyBoxList">  
            {          
                weeklyBoxListData.map(weeklyBox => {
                    return <WeeklyBox 
                        key = {weeklyBox.id}
                        accessToken = {accessToken}
                        userId = {userId}
                        id = {weeklyBox.id}
                        title = {weeklyBox.title}
                        clear = {weeklyBox.clear}
                        weeklyElmList = {weeklyBox.weeklyElmList}
                        deleteWeeklyBoxOnScreen = {deleteWeeklyBoxOnScreen}
                        refreshAfterBoxList = {refreshAfterBoxList}
                    />; 
                    
                })
            }</div>

        </div>
    </WeeklyContext.Provider>;
}

export default WeeklyBoxList;