import React from 'react';
import styled from 'styled-components';
import MovieExplorerLogo from '../public/MovieExplorerLogo.png';

const BookmarkSection = styled.section`
  background-color: #000000;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), 
                    url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=');
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
`;

const Divider = styled.hr`
  width: 80%;
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  margin: 15px 0;
`;

const BookmarkLink = styled.a`
  color: white;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 1.2rem;
  padding: 12px 30px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  }

  &::after {
    content: '➔';
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;
const LogoContainer = styled.div`
  position: absolute;
  bottom: 20px;  // Increased from 0px for better spacing
  left: 50%;
  transform: translateX(-50%);
  width: 150px;  // Reduced from 1000px to reasonable size
  height: auto;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);  // Optional background
  border-radius: 8px;  // Optional rounded corners
`;

const LogoImage = styled.img`
  width: 100%;
  height: auto;
  filter: brightness(0) invert(1);
  opacity: 0.8;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.05);  // Added subtle hover effect
  }
`;

// In the Bookmark component, keep the same structure but with these refined styles

const Bookmark = () => {
  return (
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

      <LogoContainer>
        <LogoImage 
          src={MovieExplorerLogo} 
          alt="MovieExplorer Logo" 
        />
      </LogoContainer>
    </BookmarkSection>
  );
};

export default Bookmark;