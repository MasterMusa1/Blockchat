import React from 'react';

const nftItemStyle = {
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    textAlign: 'center',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.2s, box-shadow 0.2s',
    aspectRatio: '1 / 1.4',
    position: 'relative',
};

const nftImageStyle = {
    width: '100%',
    height: '130px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
};

const nftNameStyle = {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: 'var(--text-color)',
    wordBreak: 'break-word',
    margin: '0 0 5px 0',
};

const nftDescStyle = {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    marginBottom: '10px'
};

const mintDateStyle = {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    marginBottom: '10px',
};

const actionsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
};

const actionButtonStyle = {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s',
};

const deleteButtonStyle = {
    ...actionButtonStyle,
    borderColor: 'var(--button-alert-color)',
    color: 'var(--button-alert-color)',
};

const listButtonStyle = {
    ...actionButtonStyle,
    borderColor: 'var(--accent-color)',
    color: 'var(--accent-color)',
    fontWeight: 'bold',
};


const NftGalleryItem = ({ nft, onDelete, onReport, onList }) => {

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(nft);
    };

    const handleReport = (e) => {
        e.stopPropagation();
        onReport(nft);
    };

    const handleList = (e) => {
        e.stopPropagation();
        onList(nft);
    };

    return (
        <div style={nftItemStyle}>
            <div>
                <img src={nft.image} alt={nft.name} style={nftImageStyle} />
                <h4 style={nftNameStyle}>{nft.name}</h4>
                <p style={nftDescStyle} title={nft.description}>{nft.description}</p>
                {nft.mintDate && (
                    <p style={mintDateStyle}>
                        Minted: {new Date(nft.mintDate).toLocaleDateString()}
                    </p>
                )}
                {nft.isListed && (
                    <p style={{...mintDateStyle, color: 'var(--accent-color)', fontWeight: 'bold'}}>Listed for Sale</p>
                )}
            </div>
            <div style={actionsContainerStyle}>
                {nft.isUserMinted && !nft.isListed && (
                    <button style={listButtonStyle} onClick={handleList}>List</button>
                )}
                 {nft.isUserMinted && (
                    <button style={deleteButtonStyle} onClick={handleDelete}>Delete</button>
                )}
                <button style={actionButtonStyle} onClick={handleReport}>Report</button>
            </div>
        </div>
    );
};

export default NftGalleryItem;