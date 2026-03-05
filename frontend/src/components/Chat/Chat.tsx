import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';

export function Chat() {
    const navigate = useNavigate();

    return (
        <div className={styles.chat}>
            <div className={styles.header}>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
            </div>
            <div className={styles.messages}>
                <div className={styles.empty}>
                    <span>Waiting for messages...</span>
                </div>
            </div>
        </div>
    );
}
