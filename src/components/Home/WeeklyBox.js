import React, { forwardRef, useState } from "react";
import { faCheck,faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import "./WeeklyBox.css";
import axios from "axios";
import DropDownMenu from "../common/DropDownMenu"

function onEnterKeyPressBlur(e) {
    if(e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
    }
}

function WeeklyBox({accessToken, userId, id, title, weeklyElmList, deleteWeeklyBoxOnScreen, refreshAfterBoxList}) {
    var config = {
        headers: { 'Content-Type': 'application/json', 'ACCESS_TOKEN': accessToken }
      };

    const [titleTxt, setTitleTxt] = useState(title === null ? "" : title);
    const [weeklyElms, setWeeklyElms] = useState(weeklyElmList);
    const [editingYn, setEditingYn] = useState(false);
    
    function changeTitleTxt(e) {
        e.preventDefault();
        setTitleTxt(e.target.value);
    }

    function changeElmTxt(e, id) {
        e.preventDefault();
        setWeeklyElms(weeklyElms.map(elm=>
            elm.id === id ? { ...elm, content: e.target.value } : elm));
    }

    const onUpdateWeeklyBoxTitle = async (e) => {
        await axios
            .put("/user/weeklyBox/" + id, 
                {
                    title: titleTxt
            }, config)
            .then((response) => {
                console.log(response.data);
                updateFwBoxTitle();
            })
            .catch((error) => {console.error(error);});
        console.log("타이틀이 수정되었습니다.");
    }

    const updateFwBoxTitle = async () => {
        await axios
            .put("/user/fwbox/" + id, 
                {
                    title: titleTxt
            }, config)
            .then((response) => {
                console.log(response.data);
                refreshAfterBoxList();
            })
            .catch((error) => {console.error(error);});
        console.log("fw 타이틀이 수정되었습니다.");
    }

    const onDeleteWeeklyBox = async () => {
        await axios
            .delete("/user/weeklyBox/" + id, config)
            .then((response) => {
                console.log(response.data);
                deleteWeeklyBoxOnScreen(id);
            })
            .catch((error) => {console.error(error);});

        console.log("WeeklyBox: " + id + " deleted.");
    }

    const onCreateWeeklyElmObj = async () => {
        await axios
            .post("/user/weeklyBox/" + id, {}, config)
            .then((response) => {
                console.log("weekly elm " + response.data['data'] + "가 생성되었습니다.");
                const elm = {
                    id: response.data['data'],
                    content: "",
                    completed: false
                };
                setWeeklyElms([...weeklyElms, elm]);
            })
            .catch((error) => {console.error(error);});
    }

    const onUpdateWeeklyElm = async (e, weeklyElmId, weeklyElmCompleted) => {
        await axios
            .put("/user/weeklyElm/" + weeklyElmId, 
            {
                content: e.target.value
            }, config)
            .then((response) => {
                console.log(response.data);
                if(weeklyElmCompleted)
                    updateFwElmContent(weeklyElmId, e.target.value);
            })
            .catch((error) => {console.error(error);});
        console.log("위클리내용이 수정되었습니다.");
    }

    const updateFwElmContent = async (weeklyElmId, contentTxt) => {
        // /user/fwbox/{weeklyBoxId}/fwelm/{weeklyElmId}
        await axios
            .put("/user/fwbox/" + id + "/fwelm/" + weeklyElmId, 
                {
                    content: contentTxt
            }, config)
            .then((response) => {
                console.log(response.data);
                refreshAfterBoxList();
            })
            .catch((error) => {console.error(error);});
        console.log("fw 내용이 수정되었습니다.");
    }

    const onDeleteWeeklyElm = async (weeklyElmId) => {
        if(editingYn){
            await axios
            .delete("/user/weeklyElm/" + weeklyElmId, config)
            .then((response) => {
                console.log(response.data['data']);
                setWeeklyElms(weeklyElms.filter((elm) => elm.id !== weeklyElmId));
            })
            .catch((error) => {console.error(error);});

        console.log("Weekly Element: " + weeklyElmId + " deleted.");
        }
    }

    const onClickCompleteBtn = async (completed, weeklyElmId) => {
        if(!completed)
            await axios
                .post("/user/" + userId + "/fwelm/" + weeklyElmId, {}, config)
                .then((response) => {
                    console.log(response.data);
                    refreshAfterBoxList();
                    setWeeklyElms(weeklyElms.map(elm=> elm.id === weeklyElmId ? { ...elm, completed: !elm.completed } : elm));
                })
                .catch((error) => {console.error(error);});
        else
        // /user/{userId}/fwbox/{weeklyBoxId}/fwelm/{weeklyElmId}
            await axios
                .put("/user/" + userId + "/fwbox/" + id +"/fwelm/" + weeklyElmId, {}, config)
                .then((response) => {
                    console.log(response.data);
                    refreshAfterBoxList();
                    setWeeklyElms(weeklyElms.map(elm=> elm.id === weeklyElmId ? { ...elm, completed: !elm.completed } : elm));
                })
                .catch((error) => {console.error(error);});
    }

    const enterEditMode = () => {
        setEditingYn(!editingYn);
    }

    return <div className="weeklyBox">
    <form>
        <div className="weeklyBox__title">
            <input type="text" value={ titleTxt } 
            onChange={changeTitleTxt} 
            onKeyPress={onEnterKeyPressBlur}
            onBlur={(e)=>onUpdateWeeklyBoxTitle(e)}
            placeholder = "제목을 입력해주세요."
            />   
            <div className="weeklyBox_menu">
                <DropDownMenu
                    addFunc = {onCreateWeeklyElmObj}
                    editFunc = {enterEditMode}
                    deleteFunc = {onDeleteWeeklyBox}/>
            </div>       
        </div>
        <ul className="weeklyBox__elm-list">
            {weeklyElms.map(elm => {
                if(elm.content == null) elm.content = "";
            
                return <li key={elm.id}>
                    {/* <button className={editingYn ? "circleBorderBtn editingCircleBorderBtn" : "circleBorderBtn"} type="button"></button> */}
                    <FontAwesomeIcon className={
                            editingYn
                             ? "faCheck invisible"
                             : elm.completed ? "faCheck completed" : "faCheck"
                        } icon={faCheck} onClick={()=>onClickCompleteBtn(elm.completed, elm.id)}/>
                    <FontAwesomeIcon className={editingYn ? "faMinus visible shaking" : "faMinus invisible"} icon={faMinus} 
                        onClick={()=>onDeleteWeeklyElm(elm.id)}/>

                    <input type="text" value = {elm.content} 
                        onChange={(e) => changeElmTxt(e, elm.id)} 
                        onKeyPress={onEnterKeyPressBlur}
                        onBlur={(e) => onUpdateWeeklyElm(e, elm.id, elm.completed)}
                        placeholder = "할일을 입력해주세요."/>

                    {/* { elm.completed
                        ? <input type="text" className="elmInputCompleted" value = {elm.content} readOnly placeholder = "할일을 입력해주세요."/> 
                        : <input type="text" value = {elm.content} 
                            onChange={(e) => changeElmTxt(e, elm.id)} 
                            onKeyPress={onEnterKeyPressBlur}
                            onBlur={(e) => onUpdateWeeklyElm(e, elm.id)}
                            placeholder = "할일을 입력해주세요."/> } */}
                </li>;
            })}
        </ul>
    </form>
</div>;
}

WeeklyBox.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string
};

export default WeeklyBox;