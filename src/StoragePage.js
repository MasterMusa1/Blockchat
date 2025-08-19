import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import ContextMenu from './ContextMenu';
import RenameModal from './RenameModal';
import * as mockService from './services/mockService';

// Helper function to find a node in the file tree
const findNode = (node, path) => {
    let current = node;
    for (const id of path) {
        if (current && current.type === 'folder' && current.children) {
            current = current.children.find(child => child.id === id);
        } else {
            return null;
        }
    }
    return current;
};

// Helper to format bytes
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const StoragePage = () => {
    const { user, setUserData } = useOutletContext();
    const { publicKey } = useWallet();
    const [path, setPath] = useState([]); // Array of folder IDs
    const [contextMenu, setContextMenu] = useState(null);
    const [renameModalItem, setRenameModalItem] = useState(null);
    const fileInputRef = useRef(null);

    const { userFiles, storageCapacity, storageUsed } = user || {};

    const handleFileAction = async (action) => {
        if (!publicKey) return;
        try {
            const updatedUser = await mockService.performFileAction(publicKey.toBase58(), path, action);
            setUserData(updatedUser);
        } catch (error) {
            console.error("File action failed:", error);
            alert(`Error: ${error.message || 'Could not perform file action.'}`);
        }
    };

    const currentFolder = useMemo(() => {
        if (!userFiles) return null;
        if (path.length === 0) return userFiles;
        return findNode(userFiles, path);
    }, [userFiles, path]);

    const breadcrumbs = useMemo(() => {
        if (!userFiles) return [];
        const crumbs = [{ name: 'My Drive', newPath: [] }];
        let current = userFiles;
        path.forEach((folderId, index) => {
            current = current?.children.find(f => f.id === folderId);
            if(current) {
                crumbs.push({ name: current.name, newPath: path.slice(0, index + 1) });
            }
        });
        return crumbs;
    }, [path, userFiles]);

    const handleItemDoubleClick = (item) => {
        if (item.type === 'folder') {
            setPath(prev => [...prev, item.id]);
        } else {
            alert(`Simulating file preview for: ${item.name}`);
        }
    };

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    const closeContextMenu = () => setContextMenu(null);

    const handleContextMenuAction = useCallback((action, item) => {
        closeContextMenu();
        switch (action) {
            case 'delete':
                if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                    handleFileAction({ type: 'DELETE', payload: { id: item.id } });
                }
                break;
            case 'rename':
                setRenameModalItem(item);
                break;
            case 'share':
                alert(`Sharing for "${item.name}" is not implemented yet.`);
                break;
            case 'download':
                alert(`Download for "${item.name}" is not implemented yet.`);
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }, [path, handleFileAction]);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelected = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (storageUsed + file.size > storageCapacity) {
                alert("Not enough storage space for this file!");
                return;
            }
            handleFileAction({ type: 'UPLOAD', payload: { name: file.name, size: file.size, file: file }});
        }
        e.target.value = null; // Reset file input
    };

    const handleRename = (item, newName) => {
        if (newName && newName !== item.name) {
            handleFileAction({ type: 'RENAME', payload: { id: item.id, newName } });
        }
        setRenameModalItem(null);
    };

    const renderFileItem = (item) => (
        <tr 
            key={item.id} 
            className="file-item-row"
            onDoubleClick={() => handleItemDoubleClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
        >
            <td>
                <div className="file-name-cell">
                    <span>{item.type === 'folder' ? '📁' : '📄'}</span>
                    <span>{item.name}</span>
                </div>
            </td>
            <td>{item.lastModified}</td>
            <td>{item.type === 'file' ? formatBytes(item.size) : '--'}</td>
        </tr>
    );

    const sortedItems = useMemo(() => {
        if (!currentFolder || !currentFolder.children) return [];
        return [...currentFolder.children].sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }, [currentFolder]);
    
    if (!userFiles) {
        return <div>Loading storage...</div>;
    }

    return (
        <div className="storage-page" onClick={closeContextMenu}>
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} style={{ display: 'none' }} />
            <div className="storage-header">
                <h1>My Storage</h1>
                <button className="upload-btn" onClick={handleUploadClick}>
                    <span>☁️</span> Upload File
                </button>
            </div>

            <div className="breadcrumbs">
                {breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                        <span className="breadcrumb-link" onClick={() => setPath(crumb.newPath)}>{crumb.name}</span>
                        {index < breadcrumbs.length - 1 && ' / '}
                    </span>
                ))}
            </div>

            <div className="storage-usage">
                <div className="usage-bar-bg">
                    <div className="usage-bar-fg" style={{ width: `${(storageUsed / storageCapacity) * 100}%` }}></div>
                </div>
                <p className="usage-text">
                    {formatBytes(storageUsed)} of {formatBytes(storageCapacity)} used
                </p>
            </div>

            <div className="file-browser">
                <div className="file-browser-wrapper">
                    <table className="file-browser-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Last Modified</th>
                                <th>File Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedItems.length > 0 ? sortedItems.map(renderFileItem) : (
                                <tr>
                                    <td colSpan="3">
                                        <div className="empty-folder">
                                            This folder is empty.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    item={contextMenu.item}
                    onAction={handleContextMenuAction}
                    onClose={closeContextMenu}
                />
            )}

            {renameModalItem && (
                <RenameModal
                    item={renameModalItem}
                    onClose={() => setRenameModalItem(null)}
                    onRename={handleRename}
                />
            )}
        </div>
    );
};

export default StoragePage;