import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

import '../style/FindSpot/FindSpot.css';
import MainHeader from '../Fix/MainHeader.js';
import MainFooter from '../Fix/MainFooter.js';
import Banner from '../Fix/MenuOpen.js';
import Ad from '../Fix/Advertise.js';
import Blog from '../asset/logo/blog_transparent.png';
import { drawLocpin } from '../utils/cordi.js';

import CurToDest from './CurToDest.js';

const API_KEY = process.env.REACT_APP_API_KEY;

function FindSpot() {
  const canvasRef = useRef(null);
  const svgContainerRef = useRef(null);
  const { name } = useParams(); // URL 파라미터에서 상점 이름을 가져옴

  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(`/api/find-spot/${encodeURIComponent(name)}`, {
          headers: {
            'accept': '*/*',
            'x-api-key': API_KEY
          }
        });
        
        // Use response data directly
        const storeData = response.data;
        setStore(storeData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching or parsing store data:', error);
        setError('상점 데이터를 불러오거나 처리하는 데 실패했습니다.');
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [name]);

  useEffect(() => {
    if (store) {
      const svgPath = `/${store.floorImage}`;
      fetch(svgPath)
        .then((response) => response.text())
        .then((data) => {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(data, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;

          svgContainerRef.current.innerHTML = '';
          svgContainerRef.current.appendChild(svgElement);

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          const svgWidth = parseInt(svgElement.getAttribute('width')) || 400;
          const svgHeight = parseInt(svgElement.getAttribute('height')) || 400;
          canvas.width = svgWidth;
          canvas.height = svgHeight;

          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
            URL.revokeObjectURL(url);

            drawLocpin(svgElement, ctx);
          };

          img.onerror = () => {
            console.error('Failed to load the image.');
          };

          img.src = url;
        })
        .catch((error) => {
          console.error('Error fetching or parsing the SVG file:', error);
        });
    }
  }, [store]);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!store) return <div>상점 정보를 찾을 수 없습니다.</div>;

  return (
    <div>
      <MainHeader />
      <Ad />
      <div className="curtodest-wrapper">
        <CurToDest currentStore={store} />
      </div>
      <div className="ImageContainer" style={{ width: '100%', height: 'auto', position: 'relative' }}>
        <div ref={svgContainerRef} style={{ display: 'none' }}></div>
        <canvas ref={canvasRef} className="HomepageIcon" style={{ width: '100%', height: 'auto' }}></canvas>
      </div>
      <div className="BlogLink">
        <Link to={`/storeinfo/${store.storeName}`} className="HomepageLink">
          <img src={Blog} alt="Blog" className="HomepageIcon" />
          <span className="BlogText">
            <span className="find-name">{store.storeName}</span> 바로가기
          </span>
        </Link>
      </div>
      <MainFooter />
    </div>
  );
}

export default FindSpot;
