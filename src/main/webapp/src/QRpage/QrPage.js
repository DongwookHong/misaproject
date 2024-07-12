import React, { useState, useRef, useEffect, useMemo } from 'react';
import LocSearch from './LocSearch';
import AdvertiseQR from '../Fix/AdvertiseQR';

import DropDown from './Dropdown.js';
import MapLocation from './MapLocation';
import Guide from './Guide';
import Guide_demo from './Guide_demo';
import PinMove from './PinMove';
import MainFooter from '../Fix/MainFooter';
import jsonData from '../qrdata.json';

function QrPage() {
  const [dong, setDong] = useState('');
  const [cheung, setCheung] = useState('');

  // const filteredData = jsonData
  //   .filter(
  //     (item) =>
  //       `${item.building_name} ${item.building_dong}` === dong &&
  //       item.floor_number.toString() === cheung
  //   )
  //   .flatMap((item) => item.data); // => 기존
  // const filteredData = jsonData.flatMap((item) => {
  //   if (
  //     (!dong || `${item.building_name} ${item.building_dong}` === dong) &&
  //     (!cheung || item.floor_number.toString() === cheung)
  //   ) {
  //     return item.data;
  //   }
  //   return [];
  // });
  const filteredData = useMemo(() => {
    const allItems = jsonData.flatMap((item) => {
      if (
        (!dong || `${item.building_name} ${item.building_dong}` === dong) &&
        (!cheung || item.floor_number.toString() === cheung)
      ) {
        return item.data;
      }
      return [];
    });

    const stores = allItems.filter((item) => item.type === 'store');

    // 편의시설 중복 제거
    const facilitiesMap = new Map();
    allItems.forEach((item) => {
      if (item.type === 'facility') {
        if (!facilitiesMap.has(item.name)) {
          facilitiesMap.set(item.name, item);
        }
      }
    });
    const facilities = Array.from(facilitiesMap.values());

    return [...stores, ...facilities];
  }, [dong, cheung]);
  const handleIconClick = (item) => {
    console.log(`${item} 위치로 이동합니다.`);
  };

  useEffect(() => {
    console.log('동:', dong);
    console.log('층:', cheung);
    console.log('필터링된 데이터:', filteredData);
  }, [dong, cheung, filteredData]);

  return (
    <div>
      <LocSearch />
      <AdvertiseQR />
      <DropDown setDong={setDong} setCheung={setCheung} />
      {/* <Guide_demo data={filteredData} onIconClick={handleIconClick} /> */}
      <PinMove filteredData={filteredData} />
      <MainFooter />
    </div>
  );
}

export default QrPage;
