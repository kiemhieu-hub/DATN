import React from "react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <div className="logo-wrapper">
      <Link 
        className="logo" 
        to="/" 
        style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
      >
        <svg
          className="logo-img"
          viewBox="0 0 250 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "48px", width: "auto" }}
        >
          {/* Icon kéo Barber chuẩn phong cách bản gốc */}
          <g fill="#ffffff">
            {/* Lưỡi kéo phía trên */}
            <path d="M 27 33 C 33 28 47 16 63 6 C 50 18 40 26 31 35 Z" />
            {/* Lưỡi kéo phía dưới */}
            <path d="M 27 34 C 34 33 49 26 67 19 C 52 27 41 33 30 38 Z" />

            {/* Chốt tán trục xoay */}
            <circle cx="28.5" cy="34.5" r="1.8" fill="#ffffff" />

            {/* Tay cầm và lỗ xỏ ngón trên */}
            <path
              d="M 26 33 C 23 33 19 32 15 32 C 10 32 6 35 6 39 C 6 43 10 46 15 45 C 19 44 22 41 24 38 Z M 15 42 C 12 42 9 41 9 39 C 9 37 12 35 15 35 C 18 35 20 37 20 39 C 20 41 18 42 15 42 Z"
              fillRule="evenodd"
            />

            {/* Tay cầm, lỗ xỏ ngón dưới và đuôi đỡ ngón (finger tang) */}
            <path
              d="M 27 37 C 27 42 27 46 27 50 C 27 56 23 60 18 60 C 13 60 10 56 10 51 C 10 47 13 43 18 43 C 21 43 23 44 25 46 L 25 38 Z M 18 57 C 21 57 24 54 24 51 C 24 48 21 46 18 46 C 15 46 13 48 13 51 C 13 54 15 57 18 57 Z"
              fillRule="evenodd"
            />
            {/* Mấu đỡ ngón kéo dài */}
            <path d="M 22 60 C 24 63 26 65 29 65 C 30 65 30 63 28 62 C 26 61 24 60 22 60 Z" />
          </g>

          {/* Tên thương hiệu THADS */}
          <text
            x="72"
            y="33"
            fill="#ffffff"
            fontFamily="'Montserrat', 'Arial Black', sans-serif"
            fontSize="24"
            fontWeight="900"
            letterSpacing="1.5"
          >
            THADS
          </text>

          {/* Chữ BARBER SHOP phía dưới */}
          <text
            x="73"
            y="49"
            fill="#ffffff"
            fontFamily="'Montserrat', sans-serif"
            fontSize="11.5"
            fontWeight="800"
            letterSpacing="2.8"
          >
            BARBER SHOP
          </text>
        </svg>
      </Link>
    </div>
  );
}