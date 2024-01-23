import React, { useState } from "react";
import '../sources/css/position.css'
import Nav from "./../commons/Nav";
import Search from "./../commons/Search.js";
import axios from "axios";
import { Form, redirect, useNavigation } from "react-router-dom";
import { getAuthToken } from "../util/auth.js";


export default function Position() {
    const [rows, setRows] = useState([{ location_area: '', location_section_name: '', location_column: '', location_row: '', location_alias: '' }]);
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'registering...';

    const handleInputChange = (index, name, value) => {
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    const addRow = (event) => {
        event.preventDefault();
        setRows([...rows, { location_area: '', location_section_name: '', location_column: '', location_row: '', location_alias: '' }]);
    };

    const deleteRow = (event) => {
        event.preventDefault(); // 폼 전송 방지
        if (rows.length > 1) {
        const newRows = [...rows];
        newRows.pop(); // Remove the last row
        setRows(newRows);
        }
    };

    const handleRegisterLocation = (event) => {
        console.log('유효성 검사');
        for (const row of rows) {
            if (!row.location_area || !row.location_section_name) {
            console.warn('필수 정보를 입력하세요.');
            event.preventDefault(); // 폼 전송 방지
            return;
            }
            if (!/^[가-힣]+$/.test(row.location_area) || !/^[가-힣]+$/.test(row.location_section_name) ) {
            console.warn('입력 형식이 올바르지 않습니다.');
            event.preventDefault(); // 폼 전송 방지
            return;
            }
        }
        const locations = rows.map(row => {
            return {
                location_area: row.location_area,
                location_section_name: row.location_section_name,
                location_alias: row.location_alias,
            };
        });
        console.log("입력 사항 완료: ", locations);
    };

    return (
        <>
            <div style={{ height: "92vh" }} className="w-full my-auto overflow-scroll">
                <div style={{ margin: "2% auto", width: "70%" }}>
                    <Form method="POST">
                        <table>
                            <thead>
                                <tr className="flex items-center h-16 border-2 shadow-md rounded-sm">
                                    <th className="h-full w-full flex items-center justify-center px-5 text-lg" style={{ backgroundColor: "#f6f5efb3" }}>보관유형</th>
                                    <th className="h-full w-full flex items-center justify-center px-5 text-lg" style={{ backgroundColor: "#f6f5efb3" }}>보관장소</th>
                                    <th className="h-full w-full flex items-center justify-center px-5 text-lg" style={{ backgroundColor: "#f6f5efb3" }}>소분류</th>
                                </tr>
                            </thead>
                            <div className="w-full flex justify-center items-center">
                                <div className="btn m-2 text-bold" onClick={addRow}>
                                    <button className="text-lg" >+</button>
                                </div>
                                <div className="btn m-2 text-bold" onClick={deleteRow}>
                                    <button className="text-lg" >-</button>
                                </div>
                            </div>
                            <tbody id="text">
                                {rows.map((row, index) => (
                                    <div style={{ height: "20%" }}>
                                        <tr key={index} className="tbody">
                                            <div className="w-full flex justify-around items-center px-5">
                                                <td className="w-1/3 text-center text-lg">
                                                    <select className="table_select border text-center" name="location_area" value={row.location_area} onChange={(e) => handleInputChange(index, 'location_area', e.target.value)}>
                                                        <option value="구역">구역</option>
                                                        <option value="매장">매장</option>
                                                        <option value="창고">창고</option>
                                                    </select>
                                                </td>
                                                <td className="w-1/3 text-center">
                                                    <select className="table_select text-lg border text-center" name="location_section_name" value={row.location_section_name} onChange={(e) => handleInputChange(index, 'location_section_name', e.target.value)}>
                                                        <option value="보관장소">보관장소 </option>
                                                        <option value="상부장">상부장</option>
                                                        <option value="하부장">하부장</option>
                                                        <option value="냉장고">냉장고</option>
                                                        <option value="냉동고">냉동고</option>
                                                        <option value="쇼케이스">쇼케이스</option>
                                                        <option value="다용도랙">다용도랙</option>
                                                        <option value="진열대">진열대</option>
                                                        <option value="매대">매대</option>
                                                        <option value="기타">기타</option>
                                                    </select>
                                                </td>
                                                <td className="w-1/3 text-center text-lg">
                                                    <input className="table_input border text-center" type="text" name="location_alias" placeholder="소분류(명칭)" value={row.location_alias} onChange={(e) => handleInputChange(index, 'location_alias', e.target.value)}/>
                                                </td>
                                            </div>
                                        </tr>
                                    </div>
                                ))}
                            </tbody>
                            <div className="my-14 flex justify-end items-center">
                                <div><button className="btn_2 text-lg border-2" onClick={handleRegisterLocation} disabled={isSubmitting}>저장</button></div>
                                <div><button className="btn_3 text-lg border-2" type="reset" disabled={isSubmitting}>취소</button></div>
                                <h2>{isSubmitting ? '전송중...' : null}</h2>
                            </div>
                        </table>
                    </Form>
                </div>
            </div>
        </>
    )
}

export async function action({ request }) {
    console.log("RegisterLocationPage.action");

    const LOCATION_TYPES = {
        STORE: '매장',
        WAREHOUSE: '창고',
    };

    const LOCATION_SECTION_MAP = {
        "냉동고": "A",
        "냉장고": "B",
        "다용도렉": "C",
        "매대": "D",
        "상부장": "E",
        "진열대": "F",
        "서랍": "G",
        "수납장": "H",
        "하부장": "I",
        "기타": "J"
    };

    const getLocationArea = (area) => {
        return area === LOCATION_TYPES.STORE ? "FR" : area === LOCATION_TYPES.WAREHOUSE ? "BA" : area;
    };

    const getLocationSection = (sectionName) => {
        return LOCATION_SECTION_MAP[sectionName] || sectionName;
    };

    const token = getAuthToken();
    const branch_id = localStorage.getItem("branch_id");
    console.log("token:", token);
    console.log("branch_id:", branch_id);
    const data = await request.formData();

    const location_area = data.getAll("location_area");
    const location_section_name = data.getAll("location_section_name");
    const location_alias = data.getAll("location_alias");
    console.log(location_area, location_section_name, location_alias);

    const jsonDataArray = location_area.map((_, index) => ({
        location_area: getLocationArea(location_area[index]),
        location_section_name: location_section_name[index],
        location_section: getLocationSection(location_section_name[index]),
        location_alias: location_alias[index],
        branch_id: branch_id
    }));

    console.log("jsonDataArray>>", jsonDataArray);
    console.log("jsonDataToString", JSON.stringify(jsonDataArray));
    let resData = '';
    try {
        const response = await axios({
            method: "post",
            url: 'http://localhost:8000/api/v1/branch/location/new',
            headers: {
                'Content-Type': 'application/json',
                'jwtauthtoken': token,
            },
            params: {
                branch_id: branch_id
            },
            data: JSON.stringify(jsonDataArray),
        });

        console.log("response>>>>>>", response);
        resData = response.data;

    } catch (error) {
        console.log("error:", error);
        throw new Error("error 발생되었습니다");
    }

    return redirect('/main');
}