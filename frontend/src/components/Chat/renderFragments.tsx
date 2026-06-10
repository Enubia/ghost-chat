import type { MessageFragment } from '@/types/chat';

import styles from './ChatMessage.module.css';

export function renderFragments(fragments: MessageFragment[]) {
    return (
        <span>
            {fragments.map((frag, i) =>
                frag.type === 'emote' ? (
                    <img
                        key={i}
                        className={styles.emote}
                        src={frag.url}
                        alt={frag.text}
                        title={frag.text}
                    />
                ) : (
                    <span key={i}>{frag.text}</span>
                )
            )}
        </span>
    );
}
