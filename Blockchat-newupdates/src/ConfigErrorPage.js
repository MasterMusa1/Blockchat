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
  fontFamily: 'monospace',
};

const logoStyle = {
  width: '150px',
  height: '150px',
  marginBottom: '40px',
  filter: 'grayscale(1)',
  opacity: 0.5,
};

const titleStyle = {
  color: 'var(--button-alert-color)',
  fontSize: '2rem',
  margin: '0 0 20px 0',
};

const contentStyle = {
  color: 'var(--text-color)',
  fontSize: '1.1rem',
  marginBottom: '30px',
  maxWidth: '800px',
  lineHeight: '1.8',
  backgroundColor: 'var(--surface-color)',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  textAlign: 'left',
};

const codeStyle = {
    backgroundColor: 'var(--background-color)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--primary-color)',
    fontWeight: 'bold'
};

const ConfigErrorPage = () => {
  return (
    <div style={pageStyle}>
      <img src="https://i.imgur.com/siB8l8m.png" alt="BlockChat Logo" style={logoStyle} />
      <h1 style={titleStyle}>Configuration Error</h1>
      <div style={contentStyle}>
        <p>
          It looks like your AWS Amplify configuration is missing or using placeholder values.
        </p>
        <p>
          Please open the <code style={codeStyle}>src/aws-exports.js</code> file and replace the placeholder values with the actual configuration from your AWS Amplify project console.
        </p>
        <p>
          You can find these values in your Amplify Console under:
          <br />
          <strong>Backend environments &gt; (select your environment) &gt; View app details</strong>.
        </p>
        <p>
          Once you have updated the file and saved it, the application should reload automatically.
        </p>
      </div>
    </div>
  );
};

export default ConfigErrorPage;