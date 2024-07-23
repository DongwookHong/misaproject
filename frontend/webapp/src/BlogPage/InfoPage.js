import React, { useState, useMemo, useEffect, useRef } from "react";
import { LuShare, LuChevronDown, LuChevronUp } from "react-icons/lu";
import qrLocpin from "../asset/tool/locpin.png";

const getManualBoundingRectFromPath = (pathElement) => {
  const pathLength = pathElement.getTotalLength();
  const points = [];
  for (let i = 0; i < pathLength; i += pathLength / 10) {
    const point = pathElement.getPointAtLength(i);
    points.push(point);
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
};

const drawLocpin = (svgDoc, ctx, blockId) => {
  const img = new Image();
  img.src = qrLocpin;

  const width = 60;
  const height = 60;

  img.onload = () => {
    if (!blockId) {
      console.log("BlockId is missing");
      return;
    }

    console.log("Drawing locpin for blockId:", blockId);

    const targetElement = svgDoc.getElementById(blockId);

    if (!targetElement) {
      console.log(`Element not found for blockId:`, blockId);
      return;
    }

    let cx, cy;

    if (targetElement.tagName.toLowerCase() === "path") {
      const rect = getManualBoundingRectFromPath(targetElement);
      cx = rect.x + rect.width / 2 - width / 2;
      cy = rect.y + rect.height / 2 - height / 2;
    } else {
      const x = parseFloat(targetElement.getAttribute("x")) || 0;
      const y = parseFloat(targetElement.getAttribute("y")) || 0;
      const elementWidth = parseFloat(targetElement.getAttribute("width"));
      const elementHeight = parseFloat(targetElement.getAttribute("height"));

      if (elementWidth === 0 || elementHeight === 0) {
        console.log(`Element has invalid dimensions:`, targetElement);
        return;
      }

      cx = x + elementWidth / 2 - width / 2;
      cy = y + elementHeight / 2 - height / 2;
    }

    const offsetY = height / 2;
    cy -= offsetY;

    ctx.drawImage(img, cx, cy, width, height);

    console.log(`Drawing locpin for element:`, targetElement);
    console.log(`Locpin position: (${cx}, ${cy}), size: ${width}x${height}`);
  };

  img.onerror = () => {
    console.error("Failed to load the image:", qrLocpin);
  };
};

function InfoPage({
  store_name,
  building_name,
  building_dong,
  floor_number,
  storeHours,
  store_number,
  insta_path,
  home_page_path,
  store_info,
  handleShare,
  floor_image,
  block_id,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchSvgContent = async () => {
      if (floor_image && isLocationExpanded) {
        try {
          const response = await fetch(floor_image);
          const svgText = await response.text();
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
          const svgElement = svgDoc.documentElement;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          const viewBox = svgElement.getAttribute("viewBox").split(" ");
          canvas.width = parseFloat(viewBox[2]);
          canvas.height = parseFloat(viewBox[3]);

          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);

            // Draw pin for the current store
            drawLocpin(svgDoc, ctx, block_id);
          };
          img.src = "data:image/svg+xml;base64," + btoa(svgText);
        } catch (error) {
          console.error("Error fetching SVG content:", error);
        }
      }
    };

    fetchSvgContent();
  }, [floor_image, isLocationExpanded, block_id]);

  const getFloorDisplay = (floorNum) => {
    const num = Number(floorNum);
    return num === 0 ? "B1F" : `${num}F`;
  };

  const formatTime = (time) => {
    return time === "00:00" ? "24:00" : time;
  };

  const daysOrder = ["일", "월", "화", "수", "목", "금", "토"];

  const sortedStoreHours = useMemo(() => {
    const today = new Date().getDay();
    return [...storeHours].sort((a, b) => {
      const aIndex = daysOrder.indexOf(a.dayOfWeek);
      const bIndex = daysOrder.indexOf(b.dayOfWeek);
      return ((aIndex - today + 7) % 7) - ((bIndex - today + 7) % 7);
    });
  }, [storeHours]);

  const renderBusinessHours = () => {
    const today = new Date().getDay();
    const todayKorean = daysOrder[today];

    return sortedStoreHours.map((day, index) => (
      <p
        key={day.dayOfWeek}
        className={`business-day-info ${
          day.dayOfWeek === todayKorean ? "today" : ""
        }`}
      >
        <span className="day-label">{day.dayOfWeek}</span>
        {day.isOpen ? (
          <span className="time-info">
            {formatTime(day.openTime)} - {formatTime(day.closeTime)}
          </span>
        ) : (
          <span className="time-info closed">휴무</span>
        )}
      </p>
    ));
  };

  const getCurrentBusinessStatus = () => {
    const now = new Date();
    const todayKorean = daysOrder[now.getDay()];
    const todayHours = storeHours.find((day) => day.dayOfWeek === todayKorean);

    if (!todayHours || !todayHours.isOpen) return "영업 종료";

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openTime =
      parseInt(todayHours.openTime.split(":")[0]) * 60 +
      parseInt(todayHours.openTime.split(":")[1]);
    const closeTime =
      parseInt(todayHours.closeTime.split(":")[0]) * 60 +
      parseInt(todayHours.closeTime.split(":")[1]);

    if (closeTime < openTime) {
      if (currentTime >= openTime || currentTime < closeTime) return "영업 중";
    } else {
      if (currentTime >= openTime && currentTime < closeTime) return "영업 중";
    }

    return "영업 종료";
  };

  const businessStatus = getCurrentBusinessStatus();

  const getModifiedBuildingDong = (dong) => {
    if (dong === "A") return "12BL";
    if (dong === "B") return "11BL";
    return dong;
  };

  return (
    <>
      <div className="info-page">
        <div className="header">
          <div className="title-section">
            <h1 className="main-title">{store_name}</h1>
          </div>
          <div className="title-subsection">
            <h6 className="info_floor">
              {building_name} {getModifiedBuildingDong(building_dong)}{" "}
              {getFloorDisplay(floor_number)}
            </h6>
            <div className="share-button" onClick={handleShare}>
              <LuShare />
            </div>
          </div>
        </div>
        <hr className="light-line-full" />
        <div className="info-section">
          <div className="business-hours-container">
            <div
              className="business-hours-header"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="label">영업시간</span>
              <span className="business-status">{businessStatus}</span>
              {isExpanded ? <LuChevronUp /> : <LuChevronDown />}
            </div>
            {isExpanded && (
              <div className="business-hours">{renderBusinessHours()}</div>
            )}
          </div>
          <p className="business-info">
            <span className="label">전화번호</span>
            <br />
            <a href={`tel:${store_number}`} className="info-text">
              {store_number}
            </a>
          </p>
          <p className="business-info">
            <a
              href={home_page_path || insta_path}
              className="homepage-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              홈페이지 바로가기
            </a>
          </p>
          <hr className="light-line-full" />
        </div>
        <div className="location-info-container">
          <div
            className="location-info-header"
            onClick={() => setIsLocationExpanded(!isLocationExpanded)}
          >
            <span className="location-label">위치 정보</span>
            <span className="location-toggle">
              {isExpanded ? <LuChevronUp /> : <LuChevronDown />}
            </span>
          </div>
          {isLocationExpanded && (
            <div className="location-info">
              <canvas
                ref={canvasRef}
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </div>
          )}
        </div>
        <hr className="light-line-full" />
        <div className="store-describe" style={{ whiteSpace: "pre-line" }}>
          {store_info}
        </div>
        <hr className="light-line-full" />
      </div>
    </>
  );
}

export default InfoPage;
