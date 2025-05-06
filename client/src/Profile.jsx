import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import React from 'react';

// Base button style with premium enhancements
const ActionButton = styled.button`
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 12px;
  position: relative;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      rgba(255,255,255,0.1), 
      rgba(255,255,255,0.05));
    pointer-events: none;
  }
`;

const FavouriteButton = styled(ActionButton)`
  background: linear-gradient(45deg, #ff416c, #ff4b2b);
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(45deg, #ff4b2b 10%, #ff416c 90%);
    letter-spacing: 0.8px;
  }

  &::after {
    content: '❤️';
    margin-right: 8px;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
  }
`;

const GoWatchLaterButton = styled(ActionButton)`
  background: linear-gradient(45deg, #00b4d8, #0077b6);
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(45deg, #0077b6 10%, #00b4d8 90%);
    letter-spacing: 0.8px;
  }

  &::after {
    content: '⏳';
    margin-right: 8px;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
  }
`;

const Profile = () => {
    const navigate = useNavigate();
  
    return (
      <div className="profile-container" style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '32px',
        background: 'rgba(40, 40, 40, 0.85)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)', 
      }}>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.9)', // Light text for contrast
          textAlign: 'center',
          marginBottom: '32px',
          letterSpacing: '0.5px'
        }}>
          My Profile
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <FavouriteButton onClick={() => navigate("/favourite")}>
            My Favourites
          </FavouriteButton>
          <GoWatchLaterButton onClick={() => navigate("/watchlater")}>
            Watch Later
          </GoWatchLaterButton>
        </div>
      </div>
    );
  };

export default Profile;