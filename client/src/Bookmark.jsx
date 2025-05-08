import React from 'react';
import styled, { keyframes } from 'styled-components';
import MovieExplorerLogo from './assets/MovieExplorerLogo.png'; 

import Navbar from './Navbar'; 

// Fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const BookmarkSection = styled.section`
  background-color: #000000;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), 
                    url(${MovieExplorerLogo});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Divider = styled.hr`
  width: 60%;
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  margin: 10px 0;
`;

const BookmarkLink = styled.a`
  color: white;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1.4rem;
  padding: 16px 36px;
  border-radius: 18px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(255, 255, 255, 0.15);
    cursor: pointer;
  }

  &::after {
    content: '➔';
    margin-left: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const Bookmark = () => {
  return (
    <>
      <Navbar className="navbar navbar-dark bg-black border-bottom border-secondary px-3">
        <a className="navbar-brand fw-bold fs-3 text-danger" href="#">
          🎬 MovieExplorer
        </a>
        <button
          className="btn btn-outline-light ms-auto"
          onClick={() => navigate("/search")}
        >
          🔍 Search
        </button>
      </Navbar>
      <BookmarkSection>
        <LinkContainer>
          <BookmarkLink href="/favourite">
            <span>❤️</span>
            My Favourites
          </BookmarkLink>

          <Divider />

          <BookmarkLink href="/watchlater">
            <span>⏳</span>
            Watch Later
          </BookmarkLink>
        </LinkContainer>
      </BookmarkSection>
    </>
  );
};

export default Bookmark;