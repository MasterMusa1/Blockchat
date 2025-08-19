import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const pollContainerStyle = {
    padding: '15px',
    borderRadius: '12px',
    backgroundColor: 'var(--background-color)',
    border: '1px solid var(--border-color)',
    maxWidth: '450px',
    margin: '10px 0',
};
const questionStyle = { fontWeight: 'bold', marginBottom: '15px' };
const optionStyle = {
    padding: '10px', margin: '5px 0', borderRadius: '8px',
    border: '1px solid var(--border-color)', cursor: 'pointer',
    position: 'relative', overflow: 'hidden',
};
const optionVotedStyle = { ...optionStyle, cursor: 'default' };
const progressBarContainer = {
    position: 'absolute', top: 0, left: 0, height: '100%', width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)', zIndex: 0
};
const progressBar = {
    height: '100%', backgroundColor: 'var(--accent-color)', opacity: 0.3,
    transition: 'width 0.5s ease-in-out'
};
const optionContentStyle = { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between' };

const PollMessage = ({ message, onVote }) => {
    const { publicKey } = useWallet();
    const totalVotes = Object.values(message.poll.votes).reduce((sum, voters) => sum + voters.length, 0);
    const userVote = Object.entries(message.poll.votes).find(([_, voters]) => voters.includes(publicKey?.toBase58()));

    return (
        <div style={pollContainerStyle}>
            <p style={questionStyle}>{message.poll.question}</p>
            {message.poll.options.map((option, index) => {
                const votesForOption = message.poll.votes[option]?.length || 0;
                const percentage = totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0;
                return (
                    <div
                        key={index}
                        style={userVote ? optionVotedStyle : optionStyle}
                        onClick={() => !userVote && onVote(message.id, option)}
                    >
                        {userVote && (
                            <div style={progressBarContainer}>
                                <div style={{ ...progressBar, width: `${percentage}%` }}></div>
                            </div>
                        )}
                        <div style={optionContentStyle}>
                            <span>{option}</span>
                            {userVote && <span>{votesForOption} ({percentage.toFixed(0)}%)</span>}
                        </div>
                    </div>
                );
            })}
            <small style={{ color: 'var(--text-secondary)', marginTop: '10px', display: 'block' }}>
                {totalVotes} vote{totalVotes !== 1 && 's'}
                {userVote && ` • You voted for "${userVote[0]}"`}
            </small>
        </div>
    );
};

export default PollMessage;