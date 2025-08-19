import React from 'react';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: 'var(--background-color)',
  textAlign: 'center',
  padding: '20px',
};

const logoStyle = {
  width: '180px',
  height: '180px',
  marginBottom: '40px',
};

const titleStyle = {
  color: 'var(--text-color)',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const subtitleStyle = {
  color: 'var(--text-secondary)',
  fontSize: '1.2rem',
  marginBottom: '40px',
  maxWidth: '500px',
  lineHeight: '1.6',
};

const MaintenancePage = () => {
  return (
    <div style={pageStyle}>
      <img src="https://i.imgur.com/siB8l8m.png" alt="BlockChat Logo" style={logoStyle} />
      <h1 style={titleStyle}>Under Maintenance</h1>
      <p style={subtitleStyle}>
        BlockChat is currently undergoing some scheduled maintenance. 
        We are working hard to improve the platform and will be back online shortly. Thank you for your patience!
      </p>
    </div>
  );
};

export default MaintenancePage;